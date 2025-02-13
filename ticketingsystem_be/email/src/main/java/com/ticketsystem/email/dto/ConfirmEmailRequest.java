package com.ticketsystem.email.dto;

import lombok.Data;

@Data
public class ConfirmEmailRequest {
    private String to;
    private String subject;
    private String template;
    private ConfirmEmailRequestTemplateData templateData;
}
