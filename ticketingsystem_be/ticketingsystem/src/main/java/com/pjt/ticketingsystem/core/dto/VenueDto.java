package com.pjt.ticketingsystem.core.dto;

import lombok.Data;

import java.util.Set;

@Data
public class VenueDto {
    private Long id;
    private String name;
    private Set<Event2Dto> events;
}
