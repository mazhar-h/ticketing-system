package com.pjt.ticketingsystem.core.repository;

import com.pjt.ticketingsystem.core.model.Performer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PerformerRepository extends JpaRepository<Performer, Long> {
    boolean existsByUsername(String username);

    @Query("SELECT e FROM Performer e " +
            "WHERE LOWER(e.name) LIKE LOWER(CONCAT('%', :keyword, '%')) ")
    List<Performer> findEventsBySearchText(@Param("keyword") String keyword);
}
