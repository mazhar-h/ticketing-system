package com.pjt.ticketingsystem.core.dto;

import lombok.Data;

import java.util.Set;

@Data
public class PaymentRequest {
    private Set<Long> ticketIds;
    private Long venueId;
}
