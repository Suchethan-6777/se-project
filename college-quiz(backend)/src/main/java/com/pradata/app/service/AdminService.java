package com.pradata.app.service;

import com.pradata.app.model.Quiz;
import com.pradata.app.model.User;
import com.pradata.app.model.UserDto;
import com.pradata.app.repository.QuizAttemptDao;
import com.pradata.app.repository.QuizDao;
import com.pradata.app.repository.UserDao;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private static final Logger logger = LoggerFactory.getLogger(AdminService.class);

    @Autowired private UserDao userDao;
    @Autowired private QuizDao quizDao;
    @Autowired private QuizAttemptDao quizAttemptDao;

    // @Transactional(readOnly = true) // Use for read-only methods
    public ResponseEntity<List<UserDto>> getAllUsers() {
        try {
            List<User> users = userDao.findAll();
            List<UserDto> userDtos = users.stream().map(this::mapToUserDto).collect(Collectors.toList());
            return new ResponseEntity<>(userDtos, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error fetching all users", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // @Transactional(readOnly = true)
    public ResponseEntity<List<Quiz>> getAllQuizzes() {
        try {
            List<Quiz> quizzes = quizDao.findAll();
            // Handle lazy loading if necessary (e.g., if questions are LAZY)
            // quizzes.forEach(quiz -> quiz.getQuestions().size());
            return new ResponseEntity<>(quizzes, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error fetching all quizzes", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional
    public ResponseEntity<String> deleteUser(Long userId) {
        if (userId == null) return new ResponseEntity<>("User ID cannot be null", HttpStatus.BAD_REQUEST);

        Optional<User> userOpt = userDao.findById(userId);
        if (userOpt.isEmpty()) {
            return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
        }
        User userToDelete = userOpt.get();

        if ("Admin".equals(userToDelete.getRole())) {
            logger.warn("Admin attempt to delete Admin user {} blocked.", userId);
            return new ResponseEntity<>("Cannot delete Admin user", HttpStatus.FORBIDDEN);
        }

        try {
            // TODO: Implement robust deletion of related data (QuizAttempts, etc.)
             quizAttemptDao.deleteByStudentId(userId); // Example
            userDao.deleteById(userId);
            logger.info("Admin deleted user with ID: {}", userId);
            return new ResponseEntity<>("User deleted successfully", HttpStatus.OK);
        } catch (Exception e) {
            // Catch specific exceptions like DataIntegrityViolationException
            logger.error("Error deleting user with ID: {}", userId, e);
            return new ResponseEntity<>("Failed to delete user: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional
    public ResponseEntity<String> updateUserRole(Long userId, String newRole) {
        if (userId == null || !StringUtils.hasText(newRole)) {
            return new ResponseEntity<>("User ID and new role must be provided", HttpStatus.BAD_REQUEST);
        }

        Optional<User> userOpt = userDao.findById(userId);
        if (userOpt.isEmpty()) {
            return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
        }
        User user = userOpt.get();

        if ("Admin".equals(user.getRole())) {
            logger.warn("Admin attempt to change role of Admin user {} blocked.", userId);
            return new ResponseEntity<>("Cannot change Admin role via this method", HttpStatus.FORBIDDEN);
        }

        List<String> validRoles = Arrays.asList("Student", "Faculty");
        if (!validRoles.contains(newRole)) {
            logger.warn("Invalid role {} specified for user {}", newRole, userId);
            return new ResponseEntity<>("Invalid target role specified. Must be Student or Faculty.", HttpStatus.BAD_REQUEST);
        }

        if (user.getRole().equals(newRole)) {
            return new ResponseEntity<>("User already has the role " + newRole, HttpStatus.OK);
        }

        user.setRole(newRole);
        try {
            userDao.save(user);
            logger.info("Admin updated role for user {} to {}", userId, newRole);
            return new ResponseEntity<>("User role updated to " + newRole, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error updating role for user {}: {}", userId, e.getMessage(), e);
            return new ResponseEntity<>("Failed to update role: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional
    public ResponseEntity<String> deleteAnyQuiz(Integer quizId) {
        if (quizId == null) return new ResponseEntity<>("Quiz ID cannot be null", HttpStatus.BAD_REQUEST);

        if (!quizDao.existsById(quizId)) {
            return new ResponseEntity<>("Quiz not found", HttpStatus.NOT_FOUND);
        }
        try {
            // TODO: Delete related QuizAttempts first
            // quizAttemptDao.deleteByQuizId(quizId);
            quizAttemptDao.deleteByQuizId(quizId);
            quizDao.deleteById(quizId);
            logger.info("Admin deleted quiz with ID: {}", quizId);
            return new ResponseEntity<>("Quiz deleted successfully by Admin", HttpStatus.OK);
        } catch (Exception e) {
            // Catch specific exceptions (e.g., DataIntegrityViolationException)
            logger.error("Error deleting quiz with ID {}: {}", quizId, e.getMessage(), e);
            return new ResponseEntity<>("Failed to delete quiz: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Helper to map User entity to DTO
    private UserDto mapToUserDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        return dto;
    }
}