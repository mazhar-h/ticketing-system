package com.pjt.ticketingsystem.core.dto;

import lombok.Data;

@Data
public class VenueUpdateAddressRequest {
    private String address;
    private String city;
    private String state;
}
