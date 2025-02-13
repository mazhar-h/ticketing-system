package com.pjt.ticketingsystem.login.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class EmailToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    private String token;
    private String newEmail;
    private LocalDateTime expiryDate;

    public EmailToken(User user, String token, String newEmail) {
        this.user = user;
        this.token = token;
        this.newEmail = newEmail;
        this.expiryDate = LocalDateTime.now().plusHours(24);
    }
}
