package com.pradata.app.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import jakarta.annotation.PostConstruct;
import javax.crypto.SecretKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils; // Import StringUtils

import java.util.Base64;
import java.util.Date;

@Component
public class JwtUtil {

    private static final Logger log = LoggerFactory.getLogger(JwtUtil.class);

    @Value("${app.jwt.secret}")
    private String jwtSecretString;

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationInMs;

    private SecretKey key;

    @PostConstruct
    public void init() {
        if (!StringUtils.hasText(jwtSecretString)) {
            log.error("JWT secret key is not configured in application properties (app.jwt.secret)");
            throw new IllegalArgumentException("JWT secret key cannot be empty.");
        }
        try {
            byte[] keyBytes = Base64.getDecoder().decode(jwtSecretString);
            // Ensure key length is sufficient for HS256 (32 bytes / 256 bits)
            if (keyBytes.length < 32) {
                log.error("JWT secret key size is insufficient for HS256. Required: 256 bits (32 bytes). Found: {} bits.", keyBytes.length * 8);
                throw new IllegalArgumentException("JWT secret key size is insufficient for HS256.");
            }
            this.key = Keys.hmacShaKeyFor(keyBytes);
            log.info("JWT Secret Key initialized successfully.");
        } catch (IllegalArgumentException e) {
            log.error("Invalid Base64 encoding for JWT secret or key size insufficient!", e);
            throw new RuntimeException("Invalid JWT secret configuration.", e);
        }
    }

    public String generateToken(String email, String role) {
        if (!StringUtils.hasText(email) || !StringUtils.hasText(role)) {
            log.error("Email or role is blank, cannot generate token");
            throw new IllegalArgumentException("Email and Role must not be blank for token generation");
        }
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationInMs);

        log.debug("Generating JWT for user {} with role {}", email, role);
        return Jwts.builder()
                .setSubject(email)
                .claim("role", role)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS256) // Explicitly set algorithm
                .compact();
    }

    private Claims extractAllClaims(String token) throws ExpiredJwtException, UnsupportedJwtException, MalformedJwtException, SignatureException, IllegalArgumentException {
        // Centralized extraction, throws specific exceptions on failure
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String extractEmail(String token) {
        try {
            return extractAllClaims(token).getSubject();
        } catch (ExpiredJwtException e) {
            log.warn("Attempted to extract email from expired token.");
            return e.getClaims().getSubject(); // Can still get claims from expired token
        } catch (Exception e) {
            log.error("Could not extract email from token: {}", e.getMessage());
            return null;
        }
    }

    public String extractRole(String token) {
        try {
            return extractAllClaims(token).get("role", String.class);
        } catch (ExpiredJwtException e) {
            log.warn("Attempted to extract role from expired token.");
            return e.getClaims().get("role", String.class); // Can still get claims
        } catch (Exception e) {
            log.error("Could not extract role from token: {}", e.getMessage());
            return null;
        }
    }

    public Date extractExpiration(String token) {
        try {
            return extractAllClaims(token).getExpiration();
        } catch (ExpiredJwtException e) {
            return e.getClaims().getExpiration(); // Can still get claims
        } catch (Exception e) {
            log.error("Could not extract expiration from token: {}", e.getMessage());
            return null;
        }
    }

    // Validates signature, expiration, format etc.
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (SignatureException e) {
            log.error("Invalid JWT signature: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.warn("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty or token is null: {}", e.getMessage());
        }
        return false;
    }

    // Checks ONLY if the token is expired (assuming it's otherwise valid)
    public boolean isTokenExpired(String token) {
        try {
            final Date expiration = extractExpiration(token);
            return expiration != null && expiration.before(new Date());
        } catch (Exception e) {
            // If any error occurs during extraction (e.g., malformed token), treat as expired/invalid
            log.warn("Error checking token expiration, assuming expired: {}", e.getMessage());
            return true;
        }
    }
}