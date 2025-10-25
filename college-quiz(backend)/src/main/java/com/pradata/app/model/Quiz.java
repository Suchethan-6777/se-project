package com.pradata.app.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.FutureOrPresent; // Add validation imports
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
public class Quiz {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank(message = "Title cannot be blank")
    @Size(max = 255, message = "Title too long")
    private String title;

    @Size(max = 1000, message = "Description too long")
    private String description;

    @Size(max = 100, message = "Subject too long")
    private String subject;

    @NotNull(message = "Duration must be provided")
    @Min(value = 1, message = "Duration must be at least 1 minute")
    private Integer durationInMinutes;

    @NotNull(message = "Total marks must be provided")
    @Min(value = 0, message = "Total marks cannot be negative")
    private Integer totalMarks;

    // Consider adding @NotNull if start/end times are mandatory
    private LocalDateTime startTime;

    @FutureOrPresent(message = "End time must be in the present or future")
    private LocalDateTime endTime;

    // Consider Enum for status
    private String status; // DRAFT, PUBLISHED

    // Can be null or comma-separated roll# prefixes/emails
    @Size(max = 1000, message = "Assignment criteria too long")
    private String assignmentCriteria;

    @ManyToOne(fetch = FetchType.LAZY) // Use LAZY to avoid loading creator unless needed
    @JoinColumn(name = "created_by_user_id")
    private User createdBy;

    // Use EAGER fetch carefully; LAZY might be better for performance
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "quiz_question",
            joinColumns = @JoinColumn(name = "quiz_id"),
            inverseJoinColumns = @JoinColumn(name = "question_id"))
    private List<Question> questions;

    // Add validation: ensure endTime is after startTime if both are present
    // Can use @AssertTrue on a getter method or a custom validator
}