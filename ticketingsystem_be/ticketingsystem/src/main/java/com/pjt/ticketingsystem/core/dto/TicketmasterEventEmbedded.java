package com.pjt.ticketingsystem.core.dto;

import lombok.Data;

import java.util.List;

@Data
public class TicketmasterEventEmbedded {
    private List<TicketmasterEventVenue> venues;
    private List<TicketmasterEventAttraction> attractions;
}
