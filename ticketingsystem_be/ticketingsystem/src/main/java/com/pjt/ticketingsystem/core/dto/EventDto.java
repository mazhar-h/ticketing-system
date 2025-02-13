package com.pjt.ticketingsystem.core.dto;

import com.pjt.ticketingsystem.core.enums.EventStatus;
import com.pjt.ticketingsystem.core.model.Ticket;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

@Data
public class EventDto {
    private String name;
    private Long venueId;
    private EventStatus status;
    private LocalDateTime date;
    private LocalDateTime ticketExpiry;
    private Set<Ticket> tickets;
    private Set<Long> performerIds;
}
