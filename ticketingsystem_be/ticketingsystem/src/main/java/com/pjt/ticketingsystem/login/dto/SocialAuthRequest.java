package com.pjt.ticketingsystem.login.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SocialAuthRequest {
    @NotBlank(message = "Username is mandatory")
    private String username;
}
