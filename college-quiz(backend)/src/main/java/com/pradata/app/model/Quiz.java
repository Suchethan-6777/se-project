package com.pradata.app.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
public class Quiz {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String title;
    private String description;
    private String subject;
    private Integer durationInMinutes;
    private Integer totalMarks;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status; // DRAFT, PUBLISHED

    @ManyToOne
    @JoinColumn(name = "created_by_user_id")
    private User createdBy;

    @ManyToMany(fetch = FetchType.EAGER)
    private List<Question> questions;
}