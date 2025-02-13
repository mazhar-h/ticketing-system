package com.pjt.ticketingsystem.core.dto;

import lombok.Data;

import java.util.List;

@Data
public class TicketmasterEvent {
    private String id;
    private String name;
    private String url;
    private TicketmasterEventDate dates;
    private TicketmasterEventEmbedded _embedded;
    private List<TicketmasterEventImage> images;
}
