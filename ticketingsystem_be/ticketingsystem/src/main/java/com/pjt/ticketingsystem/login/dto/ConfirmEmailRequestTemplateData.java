package com.pjt.ticketingsystem.login.dto;

import lombok.Data;

@Data
public class ConfirmEmailRequestTemplateData {
    private String username;
    private String confirmationUrl;
}
