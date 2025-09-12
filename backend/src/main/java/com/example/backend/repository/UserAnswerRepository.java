package com.example.backend.repository;

import com.example.backend.dto.response.FlatResult;
import com.example.backend.dto.response.HistoryUserAnswerResponse;
import com.example.backend.entity.UserAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserAnswerRepository extends JpaRepository<UserAnswer, Long> {
    @Query(
            value = "SELECT \n" +
                    "    ua.room, \n" +
                    "    CASE \n" +
                    "        WHEN ROW_NUMBER() OVER (PARTITION BY ua.id ORDER BY a.id) = 1 \n" +
                    "        THEN ua.score \n" +
                    "        ELSE 0\n" +
                    "    END AS score,\n" +
                    "    q.id AS question_id,\n" +
                    "    q.question_text AS question_text,\n" +
                    "    qu.title AS title,\n" +
                    "    a.id AS answer_id,\n" +
                    "    a.answer_text AS answer_text,\n" +
                    "    CASE WHEN a.is_correct = 1 THEN 1 ELSE 0 END AS is_correct,\n" +   // ✅ ép kiểu
                    "    CASE \n" +
                    "        WHEN uad.answer_id IS NOT NULL THEN 1\n" +
                    "        ELSE 0\n" +
                    "    END AS user_choice\n" +
                    "FROM user_answer ua\n" +
                    "JOIN questions q ON ua.question_id = q.id\n" +
                    "JOIN quizzes qu ON qu.id = q.quiz_id\n" +
                    "JOIN answers a ON q.id = a.question_id\n" +
                    "LEFT JOIN user_answer_detail uad \n" +
                    "       ON a.id = uad.answer_id \n" +
                    "      AND uad.user_answer_id = ua.id\n" +
                    "WHERE ua.room = :room\n" +
                    "  AND ua.user_id = :userId\n" +
                    "ORDER BY q.id, a.id;\n",
            nativeQuery = true
    )
    List<FlatResult> findUserAnswerByRoomAndUserId(String room, long userId);

    // Lấy tất cả UserAnswer của user
    List<UserAnswer> findByRoom(String room);

    List<UserAnswer> findAllByRoom(String room);

}
