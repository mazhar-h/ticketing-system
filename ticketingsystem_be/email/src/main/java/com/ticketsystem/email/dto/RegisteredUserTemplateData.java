package com.ticketsystem.email.dto;

import lombok.Data;

@Data
public class RegisteredUserTemplateData {
    private String verificationUrl;
    private String username;
    private String name;
}
