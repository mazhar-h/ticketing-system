package com.ticketsystem.email.dto;

import lombok.Data;

@Data
public class ForgotUsernameRequest {
    private String to;
    private String subject;
    private String template;
    private ForgotUsernameRequestTemplateData templateData;
}
