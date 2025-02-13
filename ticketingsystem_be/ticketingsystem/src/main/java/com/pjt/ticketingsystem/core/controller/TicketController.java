package com.pjt.ticketingsystem.core.controller;

import com.pjt.ticketingsystem.core.dto.QRCodeScanData;
import com.pjt.ticketingsystem.core.dto.Ticket2Dto;
import com.pjt.ticketingsystem.core.exception.EarlyTicketException;
import com.pjt.ticketingsystem.core.exception.ExpiredTicketException;
import com.pjt.ticketingsystem.core.exception.InvalidTicketException;
import com.pjt.ticketingsystem.core.model.Ticket;
import com.pjt.ticketingsystem.core.service.TicketService;
import com.pjt.ticketingsystem.util.AESUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/ticketing")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping("/tickets")
    public ResponseEntity<?> createTicket(@RequestBody Ticket2Dto ticket2Dto) {
        ticketService.createTicket(ticket2Dto);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/tickets/validate")
    public ResponseEntity<String> validateTicket(@RequestBody QRCodeScanData scanData) {
        try {
            ticketService.validateTicket(scanData.getEncryptedTicketData());
            return ResponseEntity.ok("Ticket validated successfully");
        } catch (EarlyTicketException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Ticket not ready to be used");
        } catch (ExpiredTicketException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Ticket is expired");
        } catch (InvalidTicketException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid or already used ticket");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid QR code");
        }
    }
}
