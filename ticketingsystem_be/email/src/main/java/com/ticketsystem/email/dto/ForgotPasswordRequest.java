package com.ticketsystem.email.dto;

import lombok.Data;

@Data
public class ForgotPasswordRequest {
    private String to;
    private String subject;
    private String template;
    private ForgotPasswordRequestTemplateData templateData;
}
