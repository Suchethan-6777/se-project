package com.pradata.app.controller;

import com.pradata.app.model.Quiz;
import com.pradata.app.model.QuizAttempt;
import com.pradata.app.model.Response;
import com.pradata.app.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/student")
public class StudentController {

    @Autowired
    private QuizService quizService;

    @GetMapping("/quizzes/available")
    public ResponseEntity<List<Quiz>> getAvailableQuizzes() {
        return quizService.getAvailableQuizzes();
    }

    @PostMapping("/quizzes/{id}/attempt")
    public ResponseEntity<?> startQuizAttempt(@PathVariable int id, Authentication authentication) {
        return quizService.startQuiz(id, authentication.getName());
    }

    @PostMapping("/quizzes/attempt/{attemptId}/submit")
    public ResponseEntity<Integer> submitQuiz(@PathVariable Long attemptId, @RequestBody List<Response> responses, Authentication authentication) {
        return quizService.calculateResult(attemptId, responses, authentication.getName());
    }

    @GetMapping("/attempts/{attemptId}")
    public ResponseEntity<QuizAttempt> getMySubmission(@PathVariable Long attemptId, Authentication authentication) {
        return quizService.getStudentAttempt(attemptId, authentication.getName());
    }
}