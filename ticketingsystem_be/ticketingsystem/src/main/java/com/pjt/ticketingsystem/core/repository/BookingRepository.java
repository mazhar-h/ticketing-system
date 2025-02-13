package com.pjt.ticketingsystem.core.repository;

import com.pjt.ticketingsystem.core.enums.BookingStatus;
import com.pjt.ticketingsystem.core.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByStatusAndExpiryDateBefore(BookingStatus status, LocalDateTime expiryDate);;

    List<Booking> findByUserId(Long userId);

}
