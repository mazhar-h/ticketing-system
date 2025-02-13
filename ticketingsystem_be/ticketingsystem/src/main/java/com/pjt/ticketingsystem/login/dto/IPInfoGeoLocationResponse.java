package com.pjt.ticketingsystem.login.dto;

import lombok.Data;

@Data
public class IPInfoGeoLocationResponse {
    private String ip;
    private String city;
    private String region;
    private String country;
    private String loc;
}