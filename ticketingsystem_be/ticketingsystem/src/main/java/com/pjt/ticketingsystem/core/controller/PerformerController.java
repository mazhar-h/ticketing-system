package com.pjt.ticketingsystem.core.controller;

import com.pjt.ticketingsystem.core.dto.Event3Dto;
import com.pjt.ticketingsystem.core.dto.Performer2Dto;
import com.pjt.ticketingsystem.core.dto.PerformerDto;
import com.pjt.ticketingsystem.core.service.PerformerService;
import com.pjt.ticketingsystem.login.exception.UserExistsException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.management.relation.RoleNotFoundException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/ticketing")
public class PerformerController {

    private final PerformerService performerService;

    public PerformerController(PerformerService performerService) {
        this.performerService = performerService;
    }

    @PostMapping("/performers/register")
    public ResponseEntity<?> registerPerformer(@RequestBody Performer2Dto performer2Dto,
                                               @RequestHeader("origin") String origin) {
        try {
            performerService.registerPerformer(performer2Dto, origin);
        } catch (UserExistsException e) {
            return ResponseEntity.ok("Registered");
        } catch (RoleNotFoundException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
        return ResponseEntity.ok("Performer registered successfully");
    }

    @GetMapping("/performers/search")
    public ResponseEntity<List<PerformerDto>> searchEvents(@RequestParam String keyword) {
        List<PerformerDto> foundPerformers = performerService.searchPerformers(keyword);
        if (!foundPerformers.isEmpty()) {
            return ResponseEntity.ok(foundPerformers);
        } else {
            return ResponseEntity.noContent().build();
        }
    }
}
