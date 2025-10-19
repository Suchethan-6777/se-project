package com.pradata.app.controller;

import com.pradata.app.config.JwtUtil;
import com.pradata.app.model.AuthResponseDto;
import com.pradata.app.model.IdTokenRequestDto;
import com.pradata.app.model.QuizMasterRequestDto;
import com.pradata.app.model.UserDto;
import com.pradata.app.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.security.GeneralSecurityException;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;


//    public AuthResponseDto googleLogin(@RequestParam String email, @RequestParam String name) {
//        return userService.loginOrRegister(email, name);
//    }
    @PostMapping("/googlelogin")
    public AuthResponseDto googleLogin(@RequestBody IdTokenRequestDto idTokenDto) throws GeneralSecurityException, IOException {
        String idToken = idTokenDto.getIdToken();
        return userService.loginOrRegisterWithIdToken(idToken);
    }


    @GetMapping("/me")
    public UserDto getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String email = jwtUtil.extractEmail(token);
        return userService.getUserByEmail(email);
    }

    @PostMapping("/become-quizmaster")
    public String becomeQuizmaster(@RequestBody QuizMasterRequestDto masterRequest) {
        String email = masterRequest.getEmail();
         String invitationCode = masterRequest.getInvitationCode();
        boolean promoted = userService.promoteToQuizmaster(email, invitationCode);
        return promoted ? "Role updated to QUIZMASTER" : "Invalid invitation code or user not found";
    }
}
