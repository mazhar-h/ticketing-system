package com.pjt.ticketingsystem.core.dto;

import lombok.Data;

@Data
public class TicketmasterEventDate {
    private TicketmasterEventDateStart start;
    private TicketmasterEventDateEnd end;
    private TicketmasterEventStatus status;
}
