package com.pradata.app.model;

import jakarta.validation.constraints.Min; // Add validation imports
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor // Generates constructor for final fields (none here)
// Consider adding @NoArgsConstructor and @AllArgsConstructor if needed by frameworks
public class Response {
    @NotNull(message = "Question ID must be provided in response")
    @Min(value = 1, message = "Invalid Question ID")
    private int id;

    // Allow null/empty response if student didn't answer? Validation depends on rules.
    private String response;
}