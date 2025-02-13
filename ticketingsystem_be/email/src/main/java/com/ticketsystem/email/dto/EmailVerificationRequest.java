package com.ticketsystem.email.dto;

import lombok.Data;

@Data
public class EmailVerificationRequest {
    private String to;
    private String subject;
    private String template;
    private EmailVerificationRequestTemplateData templateData;
}
