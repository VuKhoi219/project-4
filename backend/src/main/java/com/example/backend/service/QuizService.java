package com.example.backend.service;

import com.example.backend.dto.generated.GeneratedAnswerDTO;
import com.example.backend.dto.generated.GeneratedQuestionDTO;
import com.example.backend.dto.generated.GeneratedQuestionsWrapper;
import com.example.backend.dto.generated.GeneratedQuizResponse;
import com.example.backend.dto.request.GenerateAIQuizRequest;
import com.example.backend.dto.helper.AnswerDTO;
import com.example.backend.dto.helper.QuestionWithAnswersDTO;
import com.example.backend.dto.request.QuizRequest;
import com.example.backend.dto.response.*;
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

    @Transactional
    public GeneratedQuizResponse generateQuizContent(GenerateAIQuizRequest request) {
        log.info("Start generating quiz content for topic: {}", request.getContent());

        // Gọi ChatGPT để sinh nội dung
        ChatResponse response = chatGPTService.generateQuestions(request.getContent(), request.getNumberOfQuestions(), request.getDifficulty());

        if (response == null || response.getChoices() == null || response.getChoices().isEmpty()) {
            throw new RuntimeException("Không nhận được phản hồi từ AI");
        }

        String aiResponse = response.getChoices().get(0).getMessage().getContent();

        // Parse JSON response từ AI trực tiếp vào GeneratedQuizResponse
        try {
            // Làm sạch response nếu có markdown wrapper
            if (aiResponse.startsWith("```json")) {
                aiResponse = aiResponse.replaceFirst("```json\\s*", "").replaceFirst("```\\s*$", "");
            }
            GeneratedQuizResponse quizResponse = objectMapper.readValue(aiResponse, GeneratedQuizResponse.class);
            return quizResponse;
        } catch (JsonProcessingException e) {
            log.error("Error parsing AI response: {}", aiResponse, e);
            throw new RuntimeException("Không thể xử lý phản hồi từ AI: " + e.getMessage());
        }
    }

    @Transactional
    public Quiz saveGeneratedQuiz(GenerateAIQuizRequest generatedQuiz, User user) {
        Quiz quiz = new Quiz();
        quiz.setTitle(generatedQuiz.getTitle());
        quiz.setDescription(generatedQuiz.getDescription());
        quiz.setSummary(generatedQuiz.getSummary());
        if (user != null) {
            quiz.setCreator(user);
        }
        quiz.setSource_type(SourceType.TEXT);

        Quiz savedQuiz = quizRepository.save(quiz);

        int questionOrder = 1;
        for (GeneratedQuestionDTO questionDTO : generatedQuiz.getQuestions()) {
            Question question = new Question();
            question.setQuiz(savedQuiz);
            question.setQuestionText(questionDTO.getQuestionText());
            question.setQuestionType(QuestionType.valueOf(questionDTO.getQuestionType())); // Use the actual question type
            question.setPoints(questionDTO.getPoints() != null ? questionDTO.getPoints() : 1);
            question.setTimeLimit(questionDTO.getTimeLimit()); // Set the time limit
            question.setOrderIndex(questionOrder++);

            Question savedQuestion = questionRepository.save(question);

            if (questionDTO.getAnswers() != null && !questionDTO.getAnswers().isEmpty()) {
                for (GeneratedAnswerDTO answerDTO : questionDTO.getAnswers()) {
                    Answer answer = new Answer();
                    answer.setQuestion(savedQuestion);
                    answer.setAnswerText(answerDTO.getAnswerText());
                    answer.setCorrect(answerDTO.getIsCorrect());
                    answer.setOrderIndex(answerDTO.getOrderIndex());

                    answerRepository.save(answer);
                }
            }
        }

        return loadQuizWithQuestionsAndAnswers(savedQuiz.getId());
    }
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

    Quiz quiz = new Quiz();
    quiz.setCreator(creator);
    quiz.setCategory(category);
    quiz.setTitle(createDTO.getTitle());
    quiz.setDescription(createDTO.getDescription());
    quiz.setSummary(createDTO.getSummary());
    quiz.setSource_type(createDTO.getSourceType());
    quiz.setQuestions(new ArrayList<>());

    if (createDTO.getSourceType() == SourceType.FILE) {
        // Quiz tự sinh, bắt buộc có file
        if (createDTO.getFileId() == null) {
            throw new RuntimeException("Quiz tự sinh phải có file_id");
        }
        UploadedFile file = uploadedFileRepository.findById(createDTO.getFileId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy file với ID: " + createDTO.getFileId()));
        if (!file.isReadyForEmbedding()) {
            throw new RuntimeException("File chưa được xử lý hoặc không có nội dung để tạo câu hỏi");
        }
        quiz.setFile(file);
    } else {
        // Quiz nhập tay, không cần file
        quiz.setFile(null);
    }

    Quiz savedQuiz = quizRepository.save(quiz);
    log.info("Đã tạo quiz với ID: {}", savedQuiz.getId());

    // Nếu là quiz tự sinh thì sinh câu hỏi tự động
    if (createDTO.getSourceType() == SourceType.FILE) {
        try {
            generateQuestionsFromAI(savedQuiz, savedQuiz.getFile().getProcessedContent(),
                    createDTO.getNumberOfQuestions(),
                    createDTO.getDifficulty());
            log.info("Đã tự động sinh {} câu hỏi cho quiz ID: {}",
                    createDTO.getNumberOfQuestions(), savedQuiz.getId());
            return loadQuizWithQuestionsAndAnswers(savedQuiz.getId());
        } catch (Exception e) {
            log.error("Lỗi khi sinh câu hỏi tự động cho quiz ID {}: ", savedQuiz.getId(), e);
            return savedQuiz;
        }
    }

    // Quiz nhập tay chỉ trả về quiz đã lưu
    return savedQuiz;
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
                question.setPoints(genQuestion.getPoints() != null ? genQuestion.getPoints() : 1);
                question.setOrderIndex(i + 1);
                question.setTimeLimit(genQuestion.getTimeLimit());

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

    public Quiz getQuizById(Long id) {
        return quizRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy quiz với ID: " + id));
    }

    @Transactional(readOnly = true)
    public Page<ListQuizzesResponse> getAllQuizzes(int page) {
        try {
            Pageable pageable  = PageRequest.of(page, 10);
            return quizRepository.findQuizzesAll(pageable);
        } catch (DataAccessException e) {
            throw new RuntimeException("Error retrieving quizzes", e);
        }
    }

    public List<QuestionWithAnswersDTO> getQuestionsWithAnswersByQuiz(long quizId) {
        List<Question> questions = questionRepository.getQuestionsWithAnswersByQuiz(quizId);

        return questions.stream()
                .map(question -> {
                    List<AnswerDTO> answerDTOs = question.getQuestionType() == QuestionType.SHORT_ANSWER
                            ? null
                            : question.getAnswers().stream()
                            .map(answer -> new AnswerDTO(
                                    answer.getId(),
                                    answer.getAnswerText()
                            )).collect(Collectors.toList());

                    return new QuestionWithAnswersDTO(
                            question.getId(),
                            question.getQuestionText(),
                            question.getQuestionType(),
                            question.getTimeLimit(),
                            answerDTOs
                    );
                })
                .collect(Collectors.toList());
    }

    public GeneratedQuizResponse getGeneratedQuizById(Long quizId) {
        // Lấy quiz và danh sách câu hỏi
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy quiz với ID: " + quizId));
                
        List<Question> questions = questionRepository.getQuestionsWithAnswersByQuiz(quizId);

        // Tạo response
        GeneratedQuizResponse response = new GeneratedQuizResponse();
        response.setTitle(quiz.getTitle());

        // Map questions
        List<GeneratedQuestionDTO> questionDTOs = questions.stream()
                .map(question -> {
                    GeneratedQuestionDTO questionDTO = new GeneratedQuestionDTO();
                    questionDTO.setQuestionText(question.getQuestionText());
                    questionDTO.setQuestionType(question.getQuestionType().toString());
                    questionDTO.setPoints(question.getPoints());
                    questionDTO.setTimeLimit(question.getTimeLimit());

                    // Xử lý answers tùy theo loại câu hỏi
                    if (question.getQuestionType() != QuestionType.SHORT_ANSWER) {
                        List<GeneratedAnswerDTO> answerDTOs = question.getAnswers().stream()
                                .map(answer -> {
                                    GeneratedAnswerDTO answerDTO = new GeneratedAnswerDTO();
                                    answerDTO.setAnswerText(answer.getAnswerText());
                                    answerDTO.setIsCorrect(answer.isCorrect());
                                    answerDTO.setOrderIndex(answer.getOrderIndex());
                                    return answerDTO;
                                })
                                .sorted(Comparator.comparing(GeneratedAnswerDTO::getOrderIndex))
                                .collect(Collectors.toList());
                        questionDTO.setAnswers(answerDTOs);
                    }

                    return questionDTO;
                })
                .collect(Collectors.toList());

        response.setQuestions(questionDTOs);
        return response;
    }

    public QuizDetailResponse getQuizDetailById(Long quizId) {
        if(quizId == null) {
            throw new RuntimeException("Quiz id is null");
        }
        QuizDetailResponse response = quizRepository.findQuizDetailById(quizId);
        return response;
    }
}