package com.pradata.app.service;

import com.pradata.app.config.JwtUtil;
import com.pradata.app.model.User;
import com.pradata.app.model.UserDto;
import com.pradata.app.repository.UserDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired private UserDao userDao;
    @Autowired private JwtUtil jwtUtil;

    private static final String FACULTY_INVITATION_CODE = "FACULTY2025";

    public boolean promoteToFaculty(String email, String invitationCode) {
        if (!FACULTY_INVITATION_CODE.equals(invitationCode)) return false;

//        if (email.endsWith("@student.nitw.ac.in")) {
//            return false; // Students cannot be promoted to Faculty.
//        }// this is logic to be implemented after testing

        return userDao.findByEmail(email).map(user -> {
            user.setRole("Faculty");
            userDao.save(user);
            return true;
        }).orElse(false);
    }

    public UserDto getUserByEmail(String email) {
        User user = userDao.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found: " + email));
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        return dto;
    }

    public String processOAuthPostLogin(String email, String name) {
        User user = userDao.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setName(name);
            newUser.setRole("Student"); // Default role
            return userDao.save(newUser);
        });
        return user.getRole();
    }
}