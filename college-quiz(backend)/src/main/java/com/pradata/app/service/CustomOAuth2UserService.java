package com.pradata.app.service;

import com.pradata.app.model.User;
import com.pradata.app.repository.UserDao;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value; // Import Value
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private static final Logger logger = LoggerFactory.getLogger(CustomOAuth2UserService.class);

    @Autowired
    private UserDao userDao;

    // TODO: Move domain list to application.properties
    // @Value("${app.allowed-domains}")
    // private List<String> allowedDomains;
    private static final List<String> ALLOWED_DOMAINS = Arrays.asList("@student.nitw.ac.in", "@nitw.ac.in");

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        String email = oAuth2User.getAttribute("email");

        if (!StringUtils.hasText(email)) {
            logger.error("Email not found in OAuth2 provider details for user request from {}.",
                    userRequest.getClientRegistration().getRegistrationId());
            throw new OAuth2AuthenticationException("Email not found in OAuth2 provider account.");
        }
        logger.debug("Processing OAuth2 login for email: {}", email);

        Optional<User> userOpt = userDao.findByEmail(email);

        if (userOpt.isPresent()) {
            logger.debug("Existing user found: {}", email);
            // Existing user (Student, Faculty, or Admin), bypass domain check
            // Optional: Update user's name if it changed in Google?
            // User existingUser = userOpt.get();
            // String googleName = oAuth2User.getAttribute("name");
            // if (googleName != null && !googleName.equals(existingUser.getName())) {
            //    existingUser.setName(googleName);
            //    userDao.save(existingUser);
            // }
            return oAuth2User;
        } else {
            logger.debug("New user attempting registration: {}", email);

            // --- DOMAIN CHECK - COMMENTED OUT FOR TESTING ---
            /*
            if (ALLOWED_DOMAINS.stream().noneMatch(email::endsWith)) {
                 logger.warn("Registration denied for email {} due to invalid domain.", email);
                throw new OAuth2AuthenticationException("Access Denied: Only NITW members are allowed to register.");
            }
            */
            // --- END OF COMMENTED OUT BLOCK ---

            // Domain is valid (or check is skipped), create new user as Student
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setName(StringUtils.hasText(oAuth2User.getAttribute("name")) ? oAuth2User.getAttribute("name") : "New User");
            newUser.setRole("Student");
            try {
                userDao.save(newUser);
                logger.info("New user registered successfully: {}", email);
            } catch (Exception e) {
                logger.error("Failed to save new user {}: {}", email, e.getMessage(), e);
                //throw new OAuth2AuthenticationException("Failed to register new user.", e);
            }
            return oAuth2User;
        }
    }
}