package com.example.backend.service;

import com.example.backend.dto.generated.GeneratedAnswerDTO;
import com.example.backend.dto.generated.GeneratedQuestionDTO;
import com.example.backend.dto.generated.GeneratedQuestionsWrapper;
import com.example.backend.dto.request.QuizRequest;
import com.example.backend.dto.response.ChatResponse;
import com.example.backend.dto.response.ListQuizzesResponse;
import com.example.backend.dto.response.QuizResponse;
import com.example.backend.entity.*;
import com.example.backend.repository.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
@Slf4j
public class QuizService {
    private final QuizRepository quizRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final UploadedFileRepository uploadedFileRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final ChatGPTService chatGPTService;
    private final ObjectMapper objectMapper;


//    @Transactional
//    public Quiz createQuiz(QuizRequest createDTO, User user) {
//        User creator = userRepository.findById(user.getId())
//                .orElseThrow(() -> new RuntimeException("Không tìm thấy user với ID: " + user.getId()));
//
//        Category category = null;
//        if (createDTO.getCategoryId() != 0) {
//            category = categoryRepository.findById(createDTO.getCategoryId())
//                    .orElseThrow(() -> new RuntimeException("Không tìm thấy category với ID: " + createDTO.getCategoryId()));
//        }
//        UploadedFile file = uploadedFileRepository.findById(createDTO.getFileId()).orElseThrow(()-> new RuntimeException("không tìm thấy file yêu cầu với id " + createDTO.getFileId()));
//
//        Quiz quiz = new Quiz();
//        quiz.setCreator(creator);
//        quiz.setCategory(category);
//        quiz.setTitle(createDTO.getTitle());
//        quiz.setDescription(createDTO.getDescription());
//        quiz.setSummary(createDTO.getSummary());
//        quiz.setSource_type(createDTO.getSourceType());
//        quiz.setFile(file);
//        quiz.setShow_correct_answers(createDTO.isShowCorrectAnswers());
//        quiz.setShuffle_answers(createDTO.isShuffleAnswers());
//        quiz.setShareLink(generateUniqueShareLink());
//
//        Quiz savedQuiz = quizRepository.save(quiz);
//        return savedQuiz; // Trả về Quiz entity thay vì QuizResponse
//    }
//
//    public QuizResponse getQuizById(long id) {
//        Quiz quiz = quizRepository.findById(id)
//                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + id));
//        return convertToResponseDTO(quiz);
//    }
//
    @Transactional
    public Quiz createQuiz(QuizRequest createDTO, User user) {
        // Validate user
        User creator = userRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user với ID: " + user.getId()));

        // Validate category
        Category category = null;
        if (createDTO.getCategoryId() != 0) {
            category = categoryRepository.findById(createDTO.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy category với ID: " + createDTO.getCategoryId()));
        }

        // Validate file và kiểm tra xem đã được xử lý chưa
        UploadedFile file = uploadedFileRepository.findById(createDTO.getFileId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy file với ID: " + createDTO.getFileId()));

        if (!file.isReadyForEmbedding()) {
            throw new RuntimeException("File chưa được xử lý hoặc không có nội dung để tạo câu hỏi");
        }

        // Tạo quiz
        Quiz quiz = new Quiz();
        quiz.setCreator(creator);
        quiz.setCategory(category);
        quiz.setTitle(createDTO.getTitle());
        quiz.setDescription(createDTO.getDescription());
        quiz.setSummary(createDTO.getSummary());
        quiz.setSource_type(createDTO.getSourceType());
        quiz.setFile(file);
        quiz.setShow_correct_answers(createDTO.isShowCorrectAnswers());
        quiz.setShuffle_answers(createDTO.isShuffleAnswers());
        // QUAN TRỌNG: Khởi tạo questions list để tránh NullPointerException
        quiz.setQuestions(new ArrayList<>());

        Quiz savedQuiz = quizRepository.save(quiz);
        log.info("Đã tạo quiz với ID: {}", savedQuiz.getId());

        // Generate questions và track status
        String generationStatus = "SUCCESS";
        boolean questionsGenerated = true;

        try {
            generateQuestionsFromAI(savedQuiz, file.getProcessedContent(),
                    createDTO.getNumberOfQuestions(),
                    createDTO.getDifficulty());
            log.info("Đã tự động sinh {} câu hỏi cho quiz ID: {}",
                    createDTO.getNumberOfQuestions(), savedQuiz.getId());

            // Sau khi generate thành công, load lại quiz với questions
            return loadQuizWithQuestionsAndAnswers(savedQuiz.getId());

        } catch (Exception e) {
            log.error("Lỗi khi sinh câu hỏi tự động cho quiz ID {}: ", savedQuiz.getId(), e);
            generationStatus = "FAILED";
            questionsGenerated = false;

            return savedQuiz; // Quiz được tạo nhưng không có questions
        }
    }

    // Method helper để load quiz với questions và answers
    private Quiz loadQuizWithQuestionsAndAnswers(Long quizId) {
        // 1. Load quiz với questions (chưa có answers)
        Quiz quizWithQuestions = quizRepository.findQuizWithQuestions(quizId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy quiz với ID: " + quizId));

        // 2. Kiểm tra nếu questions list null thì khởi tạo
        if (quizWithQuestions.getQuestions() == null) {
            quizWithQuestions.setQuestions(new ArrayList<>());
            return quizWithQuestions;
        }

        // 3. Load thêm answers riêng nếu có questions
        if (!quizWithQuestions.getQuestions().isEmpty()) {
            List<Question> questionsWithAnswers = questionRepository.findQuestionsWithAnswers(quizId);

            // 4. Gán lại questions có answers vào quiz
            Map<Long, Question> questionMap = questionsWithAnswers.stream()
                    .collect(Collectors.toMap(Question::getId, q -> q));

            List<Question> updatedQuestions = quizWithQuestions.getQuestions().stream()
                    .map(q -> questionMap.getOrDefault(q.getId(), q))
                    .collect(Collectors.toList());

            quizWithQuestions.setQuestions(updatedQuestions);
        }

        return quizWithQuestions;
    }

    private void generateQuestionsFromAI(Quiz quiz, String content, Integer numberOfQuestions, String difficulty) {
        try {
            log.info("Bắt đầu tạo {} câu hỏi với độ khó {} cho quiz ID: {}",
                    numberOfQuestions, difficulty, quiz.getId());

            // Gọi ChatGPT API
            ChatResponse response = chatGPTService.generateQuestions(content, numberOfQuestions, difficulty);

            if (response == null || response.getChoices() == null || response.getChoices().isEmpty()) {
                throw new RuntimeException("Không nhận được phản hồi từ AI");
            }

            String aiResponse = response.getChoices().get(0).getMessage().getContent();
            log.debug("AI Response: {}", aiResponse);

            // Làm sạch response nếu có markdown wrapper
            if (aiResponse.startsWith("```json")) {
                aiResponse = aiResponse.replaceFirst("```json\\s*", "").replaceFirst("```\\s*$", "");
            }

            // Parse JSON response
            GeneratedQuestionsWrapper questionsWrapper;
            try {
                questionsWrapper = objectMapper.readValue(aiResponse, GeneratedQuestionsWrapper.class);
            } catch (JsonProcessingException e) {
                log.error("Lỗi parse JSON từ AI response: {}", aiResponse);
                throw new RuntimeException("AI trả về định dạng JSON không hợp lệ: " + e.getMessage());
            }

            if (questionsWrapper.getQuestions() == null || questionsWrapper.getQuestions().isEmpty()) {
                throw new RuntimeException("AI không tạo được câu hỏi");
            }

            log.info("AI đã tạo {} câu hỏi", questionsWrapper.getQuestions().size());

            // Lưu questions và answers vào database
            saveGeneratedQuestions(quiz, questionsWrapper.getQuestions());

            log.info("Đã lưu thành công {} câu hỏi vào database cho quiz ID: {}",
                    questionsWrapper.getQuestions().size(), quiz.getId());

        } catch (Exception e) {
            log.error("Lỗi khi xử lý phản hồi từ AI cho quiz ID {}: ", quiz.getId(), e);
            throw new RuntimeException("Không thể xử lý câu hỏi từ AI: " + e.getMessage());
        }
    }

    private void saveGeneratedQuestions(Quiz quiz, List<GeneratedQuestionDTO> generatedQuestions) {
        log.info("Bắt đầu lưu {} câu hỏi vào database", generatedQuestions.size());

        for (int i = 0; i < generatedQuestions.size(); i++) {
            GeneratedQuestionDTO genQuestion = generatedQuestions.get(i);

            try {
                // Tạo Question entity
                Question question = new Question();
                question.setQuiz(quiz);
                question.setQuestionText(genQuestion.getQuestionText());
                question.setQuestionType(QuestionType.valueOf(genQuestion.getQuestionType()));
                question.setExplanation(genQuestion.getExplanation());
                question.setPoints(genQuestion.getPoints() != null ? genQuestion.getPoints() : 1);
                question.setOrderIndex(i + 1);
                question.setTimeLimit(genQuestion.getTimeLimit());
                question.setRequired(true);

                Question savedQuestion = questionRepository.save(question);
                log.debug("Đã lưu câu hỏi {}: ID={}, Type={}",
                        i + 1, savedQuestion.getId(), savedQuestion.getQuestionType());

                // Tạo Answer entities (chỉ cho các loại câu hỏi có đáp án)
                if (genQuestion.getAnswers() != null && !genQuestion.getAnswers().isEmpty()) {
                    int answerCount = 0;
                    for (GeneratedAnswerDTO genAnswer : genQuestion.getAnswers()) {
                        Answer answer = new Answer();
                        answer.setQuestion(savedQuestion);
                        answer.setAnswerText(genAnswer.getAnswerText());
                        answer.setCorrect(genAnswer.getIsCorrect());
                        answer.setOrderIndex(genAnswer.getOrderIndex());

                        answerRepository.save(answer);
                        answerCount++;
                    }
                    log.debug("Đã lưu {} đáp án cho câu hỏi ID: {}", answerCount, savedQuestion.getId());
                } else {
                    log.debug("Câu hỏi ID: {} không có đáp án (có thể là SHORT_ANSWER hoặc ESSAY)",
                            savedQuestion.getId());
                }

            } catch (Exception e) {
                log.error("Lỗi khi lưu câu hỏi thứ {}: {}", i + 1, genQuestion.getQuestionText(), e);
                throw new RuntimeException("Lỗi khi lưu câu hỏi thứ " + (i + 1) + ": " + e.getMessage());
            }
        }

        log.info("Đã lưu thành công tất cả {} câu hỏi", generatedQuestions.size());
    }

    @Transactional(readOnly = true)
    public Page<ListQuizzesResponse> getAllQuizzes() {
        try {
            Pageable pageable  = PageRequest.of(0, 10);
            return quizRepository.findQuizzesAll(pageable);
        } catch (DataAccessException e) {
            throw new RuntimeException("Error retrieving quizzes", e);
        }
    }


}