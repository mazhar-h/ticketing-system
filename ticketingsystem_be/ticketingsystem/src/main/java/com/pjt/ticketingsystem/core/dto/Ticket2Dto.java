package com.pjt.ticketingsystem.core.dto;

import com.pjt.ticketingsystem.core.enums.TicketStatus;
import lombok.Data;

@Data
public class Ticket2Dto {
    private String name;
    private double price;
    private TicketStatus status = TicketStatus.AVAILABLE;
    private Event4Dto event;
}
