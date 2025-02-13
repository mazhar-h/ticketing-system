package com.pjt.ticketingsystem.core.repository;

import com.pjt.ticketingsystem.core.enums.EventStatus;
import com.pjt.ticketingsystem.core.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {
    @Query("SELECT e FROM Event e " +
            "LEFT JOIN e.venue v " +
            "LEFT JOIN e.performers p " +
            "WHERE LOWER(e.name) LIKE LOWER(CONCAT('%', :searchText, '%')) " +
            "OR LOWER(v.name) LIKE LOWER(CONCAT('%', :searchText, '%')) " +
            "OR LOWER(p.name) LIKE LOWER(CONCAT('%', :searchText, '%'))")
    List<Event> findEventsBySearchText(@Param("searchText") String searchText);
    List<Event> findByVenueId(Long userId);
    List<Event> findAllByTicketExpiryBeforeAndStatus(LocalDateTime now, EventStatus eventStatus);
}
