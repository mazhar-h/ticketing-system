package com.pjt.ticketingsystem.core.dto;

import lombok.Data;

@Data
public class TicketmasterEventSearchResponse {
    private TicketmasterEventSearchEmbedded _embedded;
    private TicketmasterPage page;
}
