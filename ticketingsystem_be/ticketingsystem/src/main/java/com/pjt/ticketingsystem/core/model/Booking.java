package com.pjt.ticketingsystem.core.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.pjt.ticketingsystem.core.enums.BookingStatus;
import com.pjt.ticketingsystem.core.enums.RefundStatus;
import com.pjt.ticketingsystem.login.model.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Getter
@Setter
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER, mappedBy = "booking")
    private Set<Ticket> tickets;
    private double totalPrice;
    private String paymentIntentId;
    private String guestEmail;
    private String guestTokenId;
    private RefundStatus refundStatus = RefundStatus.AVAILABLE;
    private BookingStatus status = BookingStatus.PENDING;
    private LocalDateTime bookingDate;
    private LocalDateTime expiryDate;
}
