package com.pjt.ticketingsystem.core.dto;

import com.pjt.ticketingsystem.core.enums.TicketStatus;
import lombok.Data;

@Data
public class TicketDto {
    private Long id;
    private String name;
    private double price;
    private String token;
    private boolean isUsed;
    private TicketStatus status = TicketStatus.AVAILABLE;
}
