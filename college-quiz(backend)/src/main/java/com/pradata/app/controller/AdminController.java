package com.pradata.app.controller;

import com.pradata.app.model.Quiz;
import com.pradata.app.model.UserDto;
import com.pradata.app.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('Admin')") // Secure all endpoints for Admins
public class AdminController {

    @Autowired
    private AdminService adminService;

    // --- User Management ---
    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return adminService.getAllUsers();
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<String> deleteUser(@PathVariable Long userId) {
        return adminService.deleteUser(userId);
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<String> updateUserRole(@PathVariable Long userId, @RequestParam String newRole) {
        return adminService.updateUserRole(userId, newRole);
    }

    // --- Quiz Management Overrides ---
    @GetMapping("/quizzes")
    public ResponseEntity<List<Quiz>> getAllQuizzes() {
        return adminService.getAllQuizzes();
    }

    @DeleteMapping("/quizzes/{quizId}")
    public ResponseEntity<String> deleteAnyQuiz(@PathVariable Integer quizId) {
        return adminService.deleteAnyQuiz(quizId);
    }
}