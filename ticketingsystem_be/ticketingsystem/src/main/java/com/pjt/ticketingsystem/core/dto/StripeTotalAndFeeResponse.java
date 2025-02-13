package com.pjt.ticketingsystem.core.dto;

import lombok.Data;

@Data
public class StripeTotalAndFeeResponse {
    private double total;
    private double platformFee;
}
