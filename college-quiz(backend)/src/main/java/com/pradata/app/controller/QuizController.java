package com.pradata.app.controller;

import com.pradata.app.model.Quiz;
import com.pradata.app.model.QuizRequestDto;
import com.pradata.app.model.SubmissionResultDto;
import com.pradata.app.service.QuizService;
import jakarta.validation.Valid; // Import jakarta validation
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {

    @Autowired
    private QuizService quizService;

    // --- Faculty/Admin Actions ---

    @PostMapping // Create new quiz
    public ResponseEntity<Quiz> createQuiz(@Valid @RequestBody QuizRequestDto quiz, Authentication authentication) { // Add @Valid

        return quizService.createOrUpdateQuiz(null,quiz, authentication.getName());
    }

    @PutMapping("/{id}") // Update existing quiz
    public ResponseEntity<Quiz> updateQuiz(@PathVariable Integer id, @Valid @RequestBody QuizRequestDto quiz, Authentication authentication) { // Add @Valid

        return quizService.createOrUpdateQuiz(id,quiz, authentication.getName());
    }

    @GetMapping // Get quizzes created by logged-in Faculty/Admin
    public ResponseEntity<List<Quiz>> getQuizzesForFaculty(Authentication authentication) {
        return quizService.getQuizzesByCreator(authentication.getName());
    }

    @DeleteMapping("/{id}") // Delete quiz (owner or Admin)
    public ResponseEntity<String> deleteQuiz(@PathVariable Integer id, Authentication authentication) {
        return quizService.deleteQuiz(id, authentication.getName());
    }

    @GetMapping("/{quizId}/submissions") // View submissions (owner or Admin)
    public ResponseEntity<List<SubmissionResultDto>> getSubmissionsForQuiz(@PathVariable Integer quizId, Authentication authentication) {
        return quizService.getSubmissionsForQuiz(quizId, authentication.getName());
    }

    // --- Endpoint for ALL Authenticated Users ---

    @GetMapping("/assigned-to-me") // View quizzes assigned to the logged-in user
    public ResponseEntity<List<Quiz>> getMyAssignedQuizzes(Authentication authentication) {
        return quizService.getAssignedQuizzesForUser(authentication.getName());
    }
}