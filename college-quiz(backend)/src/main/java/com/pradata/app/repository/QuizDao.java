package com.pradata.app.repository;

import com.pradata.app.model.Quiz;
import com.pradata.app.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface QuizDao extends JpaRepository<Quiz, Integer> { // Use Integer for ID type matching Quiz entity

    // Finds quizzes that are published and currently active based on start/end times
    List<Quiz> findByStatusAndStartTimeBeforeAndEndTimeAfter(String status, LocalDateTime timeBefore, LocalDateTime timeAfter);

    // Find quizzes by status only. Service may further filter based on start/end times (handles nulls).
    List<Quiz> findByStatus(String status);
    
    // Find quizzes by status and creator (correct parameter order)
    List<Quiz> findByStatusAndCreatedBy(String status, User creator);

    // Finds all quizzes created by a specific user
    List<Quiz> findByCreatedBy(User creator);

    // Consider adding existsById if only checking existence is needed
    // boolean existsById(Integer id);
}