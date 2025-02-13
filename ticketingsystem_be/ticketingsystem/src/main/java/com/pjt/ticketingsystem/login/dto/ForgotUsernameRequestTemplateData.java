package com.pjt.ticketingsystem.login.dto;

import lombok.Data;

@Data
public class ForgotUsernameRequestTemplateData {
    private String username;
    private String loginUrl;
}
