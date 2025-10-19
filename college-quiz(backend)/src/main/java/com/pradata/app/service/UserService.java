package com.pradata.app.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.pradata.app.config.JwtUtil;
import com.pradata.app.model.AuthResponseDto;
import com.pradata.app.model.User;
import com.pradata.app.model.UserDto;
import com.pradata.app.repository.UserDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserDao userDao;

    @Autowired
    private JwtUtil jwtUtil;

    // Invitation code to promote participant to quizmaster
    private static final String QUIZMASTER_INVITATION_CODE = "QUIZMASTER2025";
    private static final String CLIENT_ID = "829627346667-ero0sd5b7g39pk5co93ma6du6a4f0lk0.apps.googleusercontent.com";

    // Login or register user with default role PARTICIPANT
    public AuthResponseDto loginOrRegister(String email, String name) {
        Optional<User> userOpt = userDao.findByEmail(email);

        User user;
        if (userOpt.isEmpty()) {
            user = new User();
            user.setEmail(email);
            user.setName(name);
            user.setRole("PARTICIPANT");
            //user.setRegisteredAt(LocalDateTime.now());
            userDao.save(user);
        } else {
            user = userOpt.get();
        }
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        return new AuthResponseDto(token, "Bearer");
    }

    // Promote user to QUIZMASTER upon valid invitation code
    public boolean promoteToQuizmaster(String email, String invitationCode) {
        if (!QUIZMASTER_INVITATION_CODE.equals(invitationCode)) {
            return false;
        }
        Optional<User> userOpt = userDao.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setRole("QUIZMASTER");
            userDao.save(user);
            return true;
        }
        return false;
    }

    public UserDto getUserByEmail(String email) {
        User user = userDao.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        return dto;
    }

    // Used after OAuth2 login success to upsert user and get role
    public String processOAuthPostLogin(String email, String name) {
        Optional<User> existingOpt = userDao.findByEmail(email);
        if (existingOpt.isEmpty()) {
            User user = new User();
            user.setEmail(email);
            user.setName(name);
            user.setRole("PARTICIPANT");
            //user.setRegisteredAt(LocalDateTime.now());
            userDao.save(user);
            return "PARTICIPANT";
        } else {
            return existingOpt.get().getRole();
        }
    }

    public AuthResponseDto loginOrRegisterWithIdToken(String idToken) throws GeneralSecurityException, IOException {
            GoogleIdToken.Payload payload = verifyGoogleIdToken(idToken);
            String email = payload.getEmail();
            String name = (String) payload.get("name");

        Optional<User> userOpt = userDao.findByEmail(email);

        User user;
        if (userOpt.isEmpty()) {
            user = new User();
            user.setEmail(email);
            user.setName(name);
            user.setRole("PARTICIPANT");
            //user.setRegisteredAt(LocalDateTime.now());
            userDao.save(user);
        } else {
            user = userOpt.get();
        }
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        return new AuthResponseDto(token, "Bearer");

    }

    private GoogleIdToken.Payload verifyGoogleIdToken(String idToken) throws GeneralSecurityException,IOException{
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                JacksonFactory.getDefaultInstance())
                .setAudience(Collections.singletonList(CLIENT_ID))
                .build();
        GoogleIdToken idTokenReal = verifier.verify(idToken);
        if (idTokenReal == null) {
            throw new IllegalArgumentException("Invalid Google ID token.");
        }
        return idTokenReal.getPayload();
    }


}
