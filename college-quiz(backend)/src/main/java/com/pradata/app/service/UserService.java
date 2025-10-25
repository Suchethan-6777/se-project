package com.pradata.app.service;

import com.pradata.app.config.JwtUtil;
import com.pradata.app.exception.UserNotFoundException;
import com.pradata.app.model.User;
import com.pradata.app.model.UserDto;
import com.pradata.app.repository.UserDao;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Optional;

// Define custom exception in its own file or an exceptions package


@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired private UserDao userDao;
    @Autowired private JwtUtil jwtUtil;

    @Value("${app.faculty.invitation-code:FACULTY2025}") // Use @Value with default
    private String facultyInvitationCode;

    @Transactional
    public boolean promoteToFaculty(String email, String invitationCode) {
        if (!StringUtils.hasText(email) || !facultyInvitationCode.equals(invitationCode)) {
            logger.warn("Promotion attempt failed for email {}: Invalid code or blank email.", email);
            return false;
        }

        // --- STUDENT DOMAIN CHECK - COMMENTED OUT FOR TESTING ---
        /*
        if (email.endsWith("@student.nitw.ac.in")) {
            logger.warn("Promotion attempt failed for student email: {}", email);
           return false;
        }
        */
        // --- END OF COMMENTED OUT BLOCK ---

        Optional<User> userOpt = userDao.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if ("Admin".equals(user.getRole())) {
                logger.warn("Attempt to promote Admin user {} to Faculty blocked.", email);
                return false; // Cannot change Admin role this way
            }
            if ("Faculty".equals(user.getRole())) {
                logger.info("User {} is already Faculty.", email);
                return true; // Already faculty
            }
            user.setRole("Faculty");
            try {
                userDao.save(user);
                logger.info("User {} promoted to Faculty.", email);
                return true;
            } catch (Exception e) {
                logger.error("Error saving promotion for user {}: {}", email, e.getMessage(), e);
                return false;
            }

        } else {
            logger.warn("Promotion attempt failed: User not found for email {}", email);
            return false;
        }
    }

    // @Transactional(readOnly = true)
    public UserDto getUserByEmail(String email) {
        if (!StringUtils.hasText(email)) {
            logger.error("getUserByEmail called with blank email");
            throw new IllegalArgumentException("Email cannot be blank");
        }
        logger.debug("Fetching user details for email: {}", email);
        User user = userDao.findByEmail(email)
                .orElseThrow(() -> {
                    logger.warn("User not found with email: {}", email);
                    // Consider mapping this exception to a 404 response using @ControllerAdvice
                    return new UserNotFoundException("User not found with email: " + email);
                });
        return mapToUserDto(user);
    }

    @Transactional
    public String processOAuthPostLogin(String email, String name) {
        if (!StringUtils.hasText(email)) {
            logger.error("processOAuthPostLogin called with blank email");
            throw new IllegalArgumentException("Email cannot be blank during login processing");
        }
        // Find existing user or create a new one (domain validation happened earlier)
        User user = userDao.findByEmail(email).orElseGet(() -> {
            logger.info("Creating new user during OAuth login: {}", email);
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setName(StringUtils.hasText(name) ? name : "New User"); // Handle blank name
            newUser.setRole("Student"); // Default role
            try {
                return userDao.save(newUser);
            } catch (Exception e) {
                logger.error("Failed to save new user during OAuth login {}: {}", email, e.getMessage(), e);
                throw new RuntimeException("Failed to register new user during login.", e);
            }
        });
        logger.debug("Processed OAuth login for user {}, role: {}", email, user.getRole());
        return user.getRole();
    }

    private UserDto mapToUserDto(User user) {
        UserDto dto = new UserDto();
        if (user != null) {
            dto.setId(user.getId());
            dto.setName(user.getName());
            dto.setEmail(user.getEmail());
            dto.setRole(user.getRole());
        }
        return dto;
    }
}