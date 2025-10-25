package com.pradata.app.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotBlank; // Add validation imports
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Entity
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Size(max = 100, message = "Category too long")
    private String category;

    @Size(max = 50, message = "Difficulty level too long")
    private String difficultyLevel;

    @Size(max = 255, message = "Option too long")
    private String option1;
    @Size(max = 255, message = "Option too long")
    private String option2;
    @Size(max = 255, message = "Option too long")
    private String option3;
    @Size(max = 255, message = "Option too long")
    private String option4;

    @NotBlank(message = "Question title cannot be blank")
    @Size(max = 1000, message = "Question title too long")
    private String questionTitle;

    @NotBlank(message = "Right answer cannot be blank")
    @Size(max = 255, message = "Right answer too long")
    private String rightAnswer;
}