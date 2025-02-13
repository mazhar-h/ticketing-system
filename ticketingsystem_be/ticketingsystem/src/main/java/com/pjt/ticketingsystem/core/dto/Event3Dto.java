package com.pjt.ticketingsystem.core.dto;

import com.pjt.ticketingsystem.core.enums.EventStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

@Data
public class Event3Dto {
    private Long id;
    private String name;
    private EventStatus status;
    private LocalDateTime date;
    private LocalDateTime ticketExpiry;
    private Venue2Dto venue;
    private Set<TicketDto> tickets;
    private Set<PerformerDto> performers;
}
