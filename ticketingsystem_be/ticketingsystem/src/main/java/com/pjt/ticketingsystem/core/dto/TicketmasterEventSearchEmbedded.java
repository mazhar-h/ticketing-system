package com.pjt.ticketingsystem.core.dto;

import lombok.Data;

import java.util.List;

@Data
public class TicketmasterEventSearchEmbedded {
    private List<TicketmasterEvent> events;
}
