package com.pjt.ticketingsystem.core.dto;

import lombok.Data;

import java.util.Set;

@Data
public class Event2Dto {
    private Long id;
    private String name;
    private Set<TicketDto> tickets;
    private Set<PerformerDto> performers;
}
