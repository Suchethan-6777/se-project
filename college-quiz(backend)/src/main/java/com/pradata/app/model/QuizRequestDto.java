package com.pradata.app.model;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class QuizRequestDto {

    @NotBlank(message = "Title cannot be blank")
    @Size(max = 255)
    private String title;

    @Size(max = 1000)
    private String description;

    @Size(max = 100)
    private String subject;

    @NotNull
    @Min(value = 1)
    private Integer durationInMinutes;

    @NotNull
    @Min(value = 0)
    private Integer totalMarks;

    private LocalDateTime startTime;

    @FutureOrPresent
    private LocalDateTime endTime;

    private String status;

    @Size(max = 1000)
    private String assignmentCriteria;

    // *** Use List<Integer> to receive just the IDs ***
    private List<Integer> questionIds;

    // --- Add Getters and Setters for all fields ---
    // (or use Lombok @Data)


}
