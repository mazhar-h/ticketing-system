package com.ticketsystem.email.dto;

import lombok.Data;

@Data
public class ConfirmEmailRequestTemplateData {
    private String username;
    private String confirmationUrl;
}
