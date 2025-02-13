package com.pjt.ticketingsystem.core.dto;

import com.pjt.ticketingsystem.core.enums.EventStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Event5Dto {
    private Long id;
    private String name;
    private EventStatus status;
    private LocalDateTime date;
}
