package com.pjt.ticketingsystem.core.dto;

import lombok.Data;

@Data
public class RegisteredUserTemplateData {
    private String verificationUrl;
    private String username;
    private String name;
}
