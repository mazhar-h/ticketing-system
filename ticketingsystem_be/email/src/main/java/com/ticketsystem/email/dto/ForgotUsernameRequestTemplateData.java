package com.ticketsystem.email.dto;

import lombok.Data;

@Data
public class ForgotUsernameRequestTemplateData {
    private String username;
    private String loginUrl;
}
