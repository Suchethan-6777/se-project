package com.pradata.app.model;

import lombok.Data;

@Data
public class QuizMasterRequestDto {
    private String email;
    private String invitationCode;
}
