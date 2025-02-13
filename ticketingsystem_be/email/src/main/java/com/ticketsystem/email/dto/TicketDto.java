package com.ticketsystem.email.dto;

import lombok.Data;

@Data
public class TicketDto {
    private String name;
    private double price;
    private String token;
}
