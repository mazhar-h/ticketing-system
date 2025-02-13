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
public class Performer extends User {
    private String name;
    @ManyToMany(mappedBy = "performers")
    @JsonIgnoreProperties("performers")
    private Set<Event> events;
}
