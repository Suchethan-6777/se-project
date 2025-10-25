package com.pradata.app.controller;

import com.pradata.app.model.QuizAttempt;
import com.pradata.app.model.Response;
import com.pradata.app.service.QuizService;
import jakarta.validation.Valid; // Import jakarta validation
import jakarta.validation.constraints.NotEmpty; // Import validation constraint
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated; // Import for validating lists
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/student")
@Validated // Needed for validating List<Response>
public class StudentController {

    @Autowired
    private QuizService quizService;

    // Students use /api/quizzes/assigned-to-me to see available quizzes

    @PostMapping("/quizzes/{id}/attempt")
    public ResponseEntity<?> startQuizAttempt(@PathVariable int id, Authentication authentication) {
        return quizService.startQuiz(id, authentication.getName());
    }

    @PostMapping("/quizzes/attempt/{attemptId}/submit")
    public ResponseEntity<Integer> submitQuiz(@PathVariable Long attemptId,
                                              @RequestBody @NotEmpty List<@Valid Response> responses, // Add validation
                                              Authentication authentication) {
        return quizService.calculateResult(attemptId, responses, authentication.getName());
    }

    @GetMapping("/attempts/{attemptId}")
    public ResponseEntity<QuizAttempt> getMySubmission(@PathVariable Long attemptId, Authentication authentication) {
        return quizService.getStudentAttempt(attemptId, authentication.getName());
    }
}