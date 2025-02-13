package com.ticketsystem.email.dto;

import lombok.Data;

@Data
public class RegisteredUserRequest {
    private String to;
    private String subject;
    private String template;
    private RegisteredUserTemplateData templateData;
}
