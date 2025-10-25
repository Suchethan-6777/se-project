package com.pradata.app.repository;

import com.pradata.app.model.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuizAttemptDao extends JpaRepository<QuizAttempt, Long> { // Use Long for ID type matching QuizAttempt entity

    // Finds all attempts associated with a specific quiz ID
    List<QuizAttempt> findByQuizId(Integer quizId);

    // Checks if a specific student already has a submitted attempt (submissionTime is not null) for a specific quiz
    boolean existsByQuizIdAndStudentIdAndSubmissionTimeIsNotNull(Integer quizId, Long studentId);

    // Consider adding methods for cascading deletes if needed by AdminService
    // void deleteByStudentId(Long studentId);
    // void deleteByQuizId(Integer quizId);
    @Modifying // Indicates this query modifies data (DELETE)
    @Query("DELETE FROM QuizAttempt qa WHERE qa.quiz.id = :quizId")
    void deleteByQuizId(@Param("quizId") Integer quizId);

     @Modifying
     @Query("DELETE FROM QuizAttempt qa WHERE qa.student.id = :studentId")
     void deleteByStudentId(@Param("studentId") Long studentId);
}