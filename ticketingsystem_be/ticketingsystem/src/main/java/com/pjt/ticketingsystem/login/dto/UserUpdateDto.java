package com.pjt.ticketingsystem.login.dto;

import lombok.Data;

@Data
public class UserUpdateDto {
    private String currentUsername;
    private String newUsername;
    private String newEmail;
    private String newRole;
}
