package com.pjt.ticketingsystem.core.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.pjt.ticketingsystem.login.model.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Entity
@Getter
@Setter
public class Venue extends User {
    private String name;
    private String stripeAccountId;
    private String address;
    private String city;
    private String state;
    private String geoHash;
    @OneToMany(mappedBy = "venue", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JsonIgnoreProperties("venue")
    private Set<Event> events;
}
