package com.pjt.ticketingsystem.login.repository;

import com.pjt.ticketingsystem.login.model.EmailToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmailTokenRepository extends JpaRepository<EmailToken, Long> {
    Optional<EmailToken> findByToken(String token);
    Optional<EmailToken> findByUserId(Long userId);
}
