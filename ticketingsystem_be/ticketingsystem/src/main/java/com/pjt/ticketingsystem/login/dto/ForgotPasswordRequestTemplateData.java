package com.pjt.ticketingsystem.login.dto;

import lombok.Data;

@Data
public class ForgotPasswordRequestTemplateData {
    private String username;
    private String resetUrl;
}
