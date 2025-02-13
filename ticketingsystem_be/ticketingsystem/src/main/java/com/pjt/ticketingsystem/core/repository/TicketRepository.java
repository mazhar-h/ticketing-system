package com.pjt.ticketingsystem.core.repository;

import com.pjt.ticketingsystem.core.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByReservationExpiryBefore(LocalDateTime now);
}
