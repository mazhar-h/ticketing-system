package com.pjt.ticketingsystem.login.dto;

import lombok.Getter;

@Getter
public class AuthResponse {
    private String accessToken;

    public AuthResponse(String accessToken) {
        this.accessToken = accessToken;
    }
}