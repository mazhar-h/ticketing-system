package com.pjt.ticketingsystem.core.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.pjt.ticketingsystem.core.enums.EventStatus;
import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Getter
@Setter
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private LocalDateTime date;
    private LocalDateTime ticketExpiry;
    private EventStatus status = EventStatus.OPEN;
    @ManyToOne
    @JoinColumn(name = "venue_id")
    @JsonIgnoreProperties("events")
    private Venue venue;
    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL)
    @JsonIgnoreProperties("events")
    private Set<Ticket> tickets;
    @ManyToMany
    @JoinTable(
            name = "event_performers",
            joinColumns = @JoinColumn(name = "event_id"),
            inverseJoinColumns = @JoinColumn(name = "performer_id")
    )
    @JsonIgnoreProperties("events")
    private Set<Performer> performers;
}
