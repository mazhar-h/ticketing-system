package com.ticketsystem.email.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EventDto {
    private String name;
    private LocalDateTime date;
}
