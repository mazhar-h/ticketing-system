package com.pjt.ticketingsystem.core.dto;

import lombok.Data;

@Data
public class StripePaymentIntentResponse {
    private String paymentIntentId;
    private String clientSecret;
    private String customerSessionClientSecret;
}
