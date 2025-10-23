package com.pradata.app.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class SubmissionResultDto {
    private String studentName;
    private Integer score;
    private Integer totalMarks;
    private LocalDateTime submissionTime;
}
