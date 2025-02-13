package com.pjt.ticketingsystem.core.repository;

import com.pjt.ticketingsystem.core.model.Venue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VenueRepository extends JpaRepository<Venue, Long> {
    boolean existsByUsername(String username);
}
