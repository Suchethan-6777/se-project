package com.pradata.app.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class QuizAttemptResultDto {
    private Long attemptId;
    private Integer score;
    private LocalDateTime startTime;
    private LocalDateTime submissionTime;
    private String quizTitle; // Get from associated Quiz
    private String quizSubject; // Get from associated Quiz
    private Integer quizDurationMinutes; // Get from associated Quiz
    private Integer quizTotalMarks;
}