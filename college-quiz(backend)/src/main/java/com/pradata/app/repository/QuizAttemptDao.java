package com.pradata.app.repository;

import com.pradata.app.model.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizAttemptDao extends JpaRepository<QuizAttempt, Long> {
    List<QuizAttempt> findByQuizId(Integer quizId);
}