package com.pradata.app.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.ArrayList; // Import ArrayList
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

    private LocalDateTime startTime;

    @FutureOrPresent(message = "End time must be in the present or future")
    private LocalDateTime endTime;

    private String status; // DRAFT, PUBLISHED

    @Size(max = 1000, message = "Assignment criteria too long")
    private String assignmentCriteria;

    @ManyToOne(fetch = FetchType.LAZY) // LAZY is good practice
    @JoinColumn(name = "created_by_user_id")
    @JsonIgnore // Keep ignoring creator for list views
    private User createdBy;

    // *** CHANGE FetchType to LAZY ***
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "quiz_question", // Ensure this matches your actual DB table name
            joinColumns = @JoinColumn(name = "quiz_id"),
            inverseJoinColumns = @JoinColumn(name = "question_id"))
    //@JsonIgnore // Keep ignoring questions for list views for now
    // Initialize the collection to prevent NullPointerExceptions
    private List<Question> questions = new ArrayList<>();

    // Lombok's @Data should generate toString, equals, hashCode.
    // Be cautious if EAGER fetch is used with bidirectional relationships,
    // as it can cause stack overflows in generated methods. LAZY avoids this.
}