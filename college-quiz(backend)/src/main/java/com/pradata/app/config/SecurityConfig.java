package com.pradata.app.config;

import com.pradata.app.service.CustomOAuth2UserService;
import com.pradata.app.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableMethodSecurity // Enable @PreAuthorize
public class SecurityConfig {

    @Autowired private JwtFilter jwtFilter;
    @Autowired private CustomOAuth2UserService customOAuth2UserService;
    @Autowired private UserService userService;
    @Autowired private JwtUtil jwtUtil;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(requests -> requests
                        .requestMatchers("/auth/**", "/login/**", "/oauth2/**").permitAll()
                        .requestMatchers("/api/admin/**").hasAuthority("Admin")
                        .requestMatchers(HttpMethod.POST, "/api/quizzes", "/api/questions/**").hasAnyAuthority("Faculty", "Admin")
                        .requestMatchers(HttpMethod.PUT, "/api/quizzes/**", "/api/questions/**").hasAnyAuthority("Faculty", "Admin")
                        .requestMatchers(HttpMethod.DELETE, "/api/quizzes/**", "/api/questions/**").hasAnyAuthority("Faculty", "Admin")
                        .requestMatchers(HttpMethod.GET, "/api/quizzes", "/api/quizzes/{quizId}/submissions").hasAnyAuthority("Faculty", "Admin")
                        .requestMatchers(HttpMethod.GET, "/api/questions/**").hasAnyAuthority("Faculty", "Admin")
                        .requestMatchers("/api/student/**").hasAuthority("Student")
                        .requestMatchers("/api/quizzes/assigned-to-me").authenticated()
                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().permitAll()
                )
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
                        .successHandler(oAuth2AuthenticationSuccessHandler())
                        .loginPage("/login") // Custom login page
                )
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, authException) -> {
                            // For API requests, return 401 instead of redirecting to OAuth
                            if (request.getRequestURI().startsWith("/api/")) {
                                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                                response.setContentType("application/json");
                                response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Authentication required\"}");
                            } else {
                                // For web requests, redirect to OAuth login
                                response.sendRedirect("/oauth2/authorization/google");
                            }
                        })
                );

        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        
        // Add some debugging
        System.out.println("Security configuration loaded successfully");
        
        return http.build();
    }

    private AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler() {
        return (request, response, authentication) -> {
            var oAuth2User = (org.springframework.security.oauth2.core.user.OAuth2User) authentication.getPrincipal();
            String email = oAuth2User.getAttribute("email");
            String name = oAuth2User.getAttribute("name");
            String role = userService.processOAuthPostLogin(email, name); // Handles potential errors
            String token = jwtUtil.generateToken(email, role);
            String redirectUrl = "http://localhost:3000/login/callback?token=" + token; // Frontend URL
            response.sendRedirect(redirectUrl);
        };
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:5173")); // Frontend URLs
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}