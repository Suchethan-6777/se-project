package com.pradata.app.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import io.jsonwebtoken.ExpiredJwtException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtFilter.class);
    private final JwtUtil jwtUtil;

    public JwtFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        System.out.println("JWT Filter: Processing request to " + request.getRequestURI());
        final String authHeader = request.getHeader("Authorization");
        final String token;
        final String userEmail;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.trace("No JWT token found in request to {}", request.getRequestURI());
            System.out.println("JWT Filter: No token found for " + request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }

        token = authHeader.substring(7);

        try {
            System.out.println("JWT Filter: Validating token for " + request.getRequestURI());
            // Attempt to validate and extract email first
            if (jwtUtil.validateToken(token)) {
                userEmail = jwtUtil.extractEmail(token);
                System.out.println("JWT Filter: Token valid, user email: " + userEmail);
                // Check if userEmail is not null and if user is not already authenticated
                if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    String role = jwtUtil.extractRole(token);
                    if (role != null) {
                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                userEmail,
                                null, // No credentials needed
                                Collections.singletonList(new SimpleGrantedAuthority(role))
                        );
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        System.out.println("JWT Filter: Authenticated user " + userEmail + " with role " + role);
                        log.debug("Authenticated user {} with role {} for request to {}", userEmail, role, request.getRequestURI());
                    } else {
                        System.out.println("JWT Filter: Role could not be extracted from token");
                        log.warn("Role could not be extracted from valid token for user {}", userEmail);
                    }
                }
            } else {
                System.out.println("JWT Filter: Token validation failed");
                // validateToken logs specific errors (expired, signature etc.)
                SecurityContextHolder.clearContext();
            }
        } catch (Exception e) {
            // Catch unexpected errors during validation/extraction
            log.error("Unexpected error during JWT Token validation for request URI {}: {}", request.getRequestURI(), e.getMessage());
            SecurityContextHolder.clearContext(); // Ensure context is clear on any error
        }

        filterChain.doFilter(request, response);
    }
}