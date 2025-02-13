package com.pjt.ticketingsystem.core.dto;

import com.pjt.ticketingsystem.core.enums.BookingStatus;
import com.pjt.ticketingsystem.login.dto.User2Dto;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

@Data
public class Booking3Dto {
    private Long id;
    private User2Dto user;
    private Venue2Dto venue;
    private Event5Dto event;
    private Set<TicketDto> tickets;
    private double totalPrice;
    private BookingStatus status;
    private LocalDateTime date;
}
