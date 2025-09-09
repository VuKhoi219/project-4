package com.example.backend.service;

import com.example.backend.dto.response.FlatResult;
import com.example.backend.dto.response.HistoryUserAnswerResponse;

import com.example.backend.dto.response.UserAnswerQuestionResponse;
import com.example.backend.dto.response.UserAnswerResponse;
import com.example.backend.entity.UserAnswer;
import com.example.backend.entity.UserAnswerDetail;
import com.example.backend.repository.UserAnswerDetailRepository;
import com.example.backend.repository.UserAnswerRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class UserAnswerService {
    private final UserAnswerRepository userAnswerRepository;
    private final UserAnswerDetailRepository userAnswerDetailRepository;
    public UserAnswerService(UserAnswerRepository userAnswerRepository, UserAnswerDetailRepository userAnswerDetailRepository) {
        this.userAnswerRepository = userAnswerRepository;
        this.userAnswerDetailRepository = userAnswerDetailRepository;
    }
    public UserAnswer save(UserAnswer userAnswer) {
        return userAnswerRepository.save(userAnswer);
    }

    public Optional<UserAnswer> findById(Long id) {
        return userAnswerRepository.findById(id);
    }

    public void saveDetails(List<UserAnswerDetail> details) {
        userAnswerDetailRepository.saveAll(details);
    }

    public HistoryUserAnswerResponse getHistory(String room, long userId) {
        List<FlatResult> results = userAnswerRepository.findUserAnswerByRoomAndUserId(room, userId);

        if (results.isEmpty()) {
            return null; // hoặc throw exception
        }

        HistoryUserAnswerResponse response = new HistoryUserAnswerResponse();
        response.setRoom(results.get(0).getRoom());
        response.setTitle(results.get(0).getTitle());

        Map<Long, UserAnswerQuestionResponse> questionMap = new LinkedHashMap<>();

        for (FlatResult r : results) {
            // group by question
            UserAnswerQuestionResponse question = questionMap.computeIfAbsent(
                    r.getQuestionId(),
                    qId -> {
                        UserAnswerQuestionResponse q = new UserAnswerQuestionResponse();
                        q.setQuestionId(r.getQuestionId());
                        q.setQuestionText(r.getQuestionText());
                        q.setScore(r.getScore());
                        q.setAnswers(new ArrayList<>());
                        return q;
                    }
            );

            // add answer
            UserAnswerResponse ans = new UserAnswerResponse();
            ans.setAnswerId(r.getAnswerId());
            ans.setAnswerText(r.getAnswerText());
            ans.setIsCorrect(r.getIsCorrect());
            ans.setUserChoice(r.getUserChoice());
            question.getAnswers().add(ans);
        }

        response.setQuestions(new ArrayList<>(questionMap.values()));
        return response;
    }

    public boolean saveUserIdForRoom(String roomId, Long userId) {
        try {
            // lấy tất cả bản ghi có roomId
            List<UserAnswer> list = userAnswerRepository.findAllByRoom(roomId);

            if (list.isEmpty()) {
                return false; // không tìm thấy roomId nào
            }

            boolean updated = false;
            for (UserAnswer ua : list) {
                if (ua.getUserId() == null) {   // ✅ chỉ cập nhật nếu userId đang null
                    ua.setUserId(userId);
                    updated = true;
                }
            }

            if (updated) {
                userAnswerRepository.saveAll(list);
            }

            return updated;

        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi lưu userId cho room: " + e.getMessage(), e);
        }
    }
}
