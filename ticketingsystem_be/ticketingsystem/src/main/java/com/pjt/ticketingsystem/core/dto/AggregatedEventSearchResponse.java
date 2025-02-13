package com.pjt.ticketingsystem.core.dto;

import lombok.Data;

import java.util.List;

@Data
public class AggregatedEventSearchResponse {
    List<Event3Dto> original;
    TicketmasterEventSearchResponse ticketmaster;
}
