package com.pjt.ticketingsystem.core.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.pjt.ticketingsystem.core.enums.TicketStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private double price;
    private boolean isUsed = false;
    private TicketStatus status = TicketStatus.AVAILABLE;
    private LocalDateTime reservationExpiry;
    private String token;
    @ManyToOne
    @JoinColumn(name = "event_id")
    @JsonIgnoreProperties("tickets")
    private Event event;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "booking_id")
    private Booking booking;
}
