package com.pradata.app.controller;

import com.pradata.app.config.JwtUtil;
import com.pradata.app.model.AuthResponseDto;
import com.pradata.app.model.IdTokenRequestDto;
import com.pradata.app.model.QuizMasterRequestDto;
import com.pradata.app.model.UserDto;
import com.pradata.app.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/me")
    public UserDto getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String email = jwtUtil.extractEmail(token);
        return userService.getUserByEmail(email);
    }

    @PostMapping("/promote-to-faculty")
    public String becomeFaculty(@RequestBody QuizMasterRequestDto masterRequest) {
        String email = masterRequest.getEmail();
        String invitationCode = masterRequest.getInvitationCode();
        boolean promoted = userService.promoteToFaculty(email, invitationCode);
        return promoted ? "Role updated to Faculty" : "Invalid invitation code or user not found";
    }
}