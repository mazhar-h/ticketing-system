package com.ticketsystem.email.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

@Data
public class BookingConfirmationTemplateData {
    private Long id;
    private UserDto user;
    private VenueDto venue;
    private EventDto event;
    private Set<TicketDto> tickets;
    private double totalPrice;
    private LocalDateTime date;
}
