package com.pradata.app.service;

import com.pradata.app.model.User;
import com.pradata.app.repository.UserDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Autowired
    private UserDao userDao;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {

        OAuth2User oAuth2User = super.loadUser(userRequest);

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        if (email == null)
            throw new OAuth2AuthenticationException("Email not found in OAuth2 provider account.");

        Optional<User> existing = userDao.findByEmail(email);

        if (existing.isEmpty()) {
            User user = new User();
            user.setEmail(email);
            user.setName(name);
            user.setRole("PARTICIPANT"); // Default role
            //user.setRegisteredAt(LocalDateTime.now());
            userDao.save(user);
        }

        return oAuth2User;
    }
}
