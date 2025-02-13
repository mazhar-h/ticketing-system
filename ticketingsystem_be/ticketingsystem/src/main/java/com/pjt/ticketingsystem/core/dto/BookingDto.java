package com.pjt.ticketingsystem.core.dto;

import lombok.Data;

import java.util.Set;

@Data
public class BookingDto {
    private Set<Long> ticketIds;
}
