package com.pradata.app.repository;

import com.pradata.app.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Collection; // Import Collection
import java.util.List;

@Repository
public interface QuestionDao extends JpaRepository<Question, Integer> { // Use Integer for ID type matching Question entity

    // Finds all questions belonging to a specific category
    List<Question> findByCategory(String category);

    // Native query for selecting random questions by category (keep if needed, otherwise remove)
    @Query(value = "SELECT * FROM question q WHERE q.category = :category ORDER BY RANDOM() LIMIT :limit", nativeQuery = true)
    List<Question> findRandomQuestionsByCategory(String category, int limit);

    // Counts how many questions exist within a given list of IDs
    // Used by QuizService to validate question IDs when creating/updating a quiz
    long countByIdIn(Collection<Integer> ids);
}