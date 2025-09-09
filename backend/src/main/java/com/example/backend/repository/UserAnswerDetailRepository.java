package com.example.backend.repository;

import com.example.backend.entity.UserAnswer;
import com.example.backend.entity.UserAnswerDetail;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserAnswerDetailRepository extends JpaRepository<UserAnswerDetail, Long> {

}