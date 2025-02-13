package com.ticketsystem.email.dto;

import lombok.Data;

@Data
public class ForgotPasswordRequestTemplateData {
    private String username;
    private String resetUrl;
}
