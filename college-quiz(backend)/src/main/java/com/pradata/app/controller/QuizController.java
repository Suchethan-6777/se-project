package com.pradata.app.controller;

import com.pradata.app.model.Quiz;
import com.pradata.app.model.SubmissionResultDto;
import com.pradata.app.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {

    @Autowired
    private QuizService quizService;

    @PostMapping
    public ResponseEntity<Quiz> createOrUpdateQuiz(@RequestBody Quiz quiz, Authentication authentication) {
        return quizService.createOrUpdateQuiz(quiz, authentication.getName());
    }

    @GetMapping
    public ResponseEntity<List<Quiz>> getQuizzesForFaculty(Authentication authentication) {
        return quizService.getQuizzesByCreator(authentication.getName());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteQuiz(@PathVariable Integer id, Authentication authentication) {
        return quizService.deleteQuiz(id, authentication.getName());
    }

    @GetMapping("/{quizId}/submissions")
    public ResponseEntity<List<SubmissionResultDto>> getSubmissionsForQuiz(@PathVariable Integer quizId, Authentication authentication) {
        return quizService.getSubmissionsForQuiz(quizId, authentication.getName());
    }
}