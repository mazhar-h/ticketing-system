package com.pjt.ticketingsystem.login.dto;

import lombok.Data;

@Data
public class EmailVerificationRequestTemplateData {
    private String username;
    private String verificationUrl;
}
