package com.pradata.app.controller;

import com.pradata.app.config.JwtUtil;
import com.pradata.app.model.QuizMasterRequestDto; // Consider renaming DTO
import com.pradata.app.model.UserDto;
import com.pradata.app.exception.UserNotFoundException; // Import custom exception
import com.pradata.app.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus; // Import HttpStatus
import org.springframework.http.ResponseEntity; // Import ResponseEntity
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException; // Import ResponseStatusException
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String email = jwtUtil.extractEmail(token);
        if (email == null) {
            // If email extraction failed (e.g., token invalid/expired and filter didn't catch?)
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired token");
        }
        try {
            UserDto userDto = userService.getUserByEmail(email);
            return ResponseEntity.ok(userDto);
        } catch (UserNotFoundException e) {
            // Handle case where user exists in token but not DB
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        } catch (Exception e) {
            // Catch other potential errors
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error retrieving user details", e);
        }
    }

    @PostMapping("/promote-to-faculty")
    public ResponseEntity<String> becomeFaculty(@RequestBody QuizMasterRequestDto facultyRequest) {
        if (facultyRequest == null || facultyRequest.getEmail() == null || facultyRequest.getInvitationCode() == null) {
            return ResponseEntity.badRequest().body("Email and invitation code required.");
        }
        String email = facultyRequest.getEmail();
        String invitationCode = facultyRequest.getInvitationCode();
        boolean promoted = userService.promoteToFaculty(email, invitationCode);
        if (promoted) {
            return ResponseEntity.ok("Role updated to Faculty");
        } else {
            // Provide slightly more context on failure if possible, without revealing too much
            // Checking if user exists could be done here if UserService didn't return boolean
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Promotion failed: Invalid code, user not found, user is a student, or already faculty/admin.");
        }
    }
}