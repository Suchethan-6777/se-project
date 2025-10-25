package com.pradata.app.exception; // Create this package

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException; // For @Valid errors
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@ControllerAdvice // This annotation makes it a global exception handler
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<Object> handleUserNotFoundException(UserNotFoundException ex, WebRequest request) {
        logger.warn("UserNotFoundException caught: {}", ex.getMessage());
        return buildErrorResponse(ex, HttpStatus.NOT_FOUND, request);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Object> handleAccessDeniedException(AccessDeniedException ex, WebRequest request) {
        logger.warn("AccessDeniedException caught: {} for request {}", ex.getMessage(), request.getDescription(false));
        return buildErrorResponse(ex, HttpStatus.FORBIDDEN, request);
    }

    @ExceptionHandler({ JwtException.class, ExpiredJwtException.class }) // Catch specific JWT errors
    public ResponseEntity<Object> handleJwtException(JwtException ex, WebRequest request) {
        logger.warn("JWTException caught: {} for request {}", ex.getMessage(), request.getDescription(false));
        // Usually results in 401/403 handled by SecurityConfig/Filter, but this catches explicit throws if any
        return buildErrorResponse(ex, HttpStatus.UNAUTHORIZED, request);
    }


    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Object> handleDataIntegrityViolationException(DataIntegrityViolationException ex, WebRequest request) {
        logger.error("DataIntegrityViolationException caught: {}", ex.getMessage());
        // Provide a more user-friendly message for constraint violations
        String message = "Data conflict occurred. Please check your input.";
        if (ex.getCause() != null && ex.getCause().getMessage() != null) {
            // Try to extract a more specific cause if available (DB specific)
            // Example: Check for unique constraint violation keywords
            if (ex.getCause().getMessage().toLowerCase().contains("unique constraint")) {
                message = "Cannot perform operation due to a unique constraint violation (e.g., duplicate email or value).";
            } else if (ex.getCause().getMessage().toLowerCase().contains("foreign key constraint")) {
                message = "Cannot perform operation due to a related data dependency.";
            }
        }
        Map<String, Object> body = createErrorBody(HttpStatus.CONFLICT, message, request);
        return new ResponseEntity<>(body, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class) // Handles @Valid errors
    public ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException ex, WebRequest request) {
        logger.warn("Validation failed: {}", ex.getMessage());
        // Collect validation errors
        String errors = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));
        Map<String, Object> body = createErrorBody(HttpStatus.BAD_REQUEST, "Validation failed: " + errors, request);
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }


    @ExceptionHandler(IllegalArgumentException.class) // Catch common argument errors
    public ResponseEntity<Object> handleIllegalArgumentException(IllegalArgumentException ex, WebRequest request) {
        logger.warn("IllegalArgumentException caught: {}", ex.getMessage());
        return buildErrorResponse(ex, HttpStatus.BAD_REQUEST, request);
    }

    // Generic fallback handler for any other exceptions
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleGlobalException(Exception ex, WebRequest request) {
        logger.error("Unhandled Exception caught: {}", ex.getMessage(), ex); // Log the full stack trace
        return buildErrorResponse(ex, HttpStatus.INTERNAL_SERVER_ERROR, request);
    }

    // Helper to build consistent error response bodies
    private ResponseEntity<Object> buildErrorResponse(Exception ex, HttpStatus status, WebRequest request) {
        Map<String, Object> body = createErrorBody(status, ex.getMessage(), request);
        return new ResponseEntity<>(body, status);
    }

    private Map<String, Object> createErrorBody(HttpStatus status, String message, WebRequest request) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", message);
        body.put("path", request.getDescription(false).substring(4)); // Remove "uri=" prefix
        return body;
    }

}