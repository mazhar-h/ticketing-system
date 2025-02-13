package com.pjt.ticketingsystem.core.controller;

import com.pjt.ticketingsystem.core.dto.Venue3Dto;
import com.pjt.ticketingsystem.core.dto.VenueDto;
import com.pjt.ticketingsystem.core.dto.VenueUpdateAddressRequest;
import com.pjt.ticketingsystem.core.exception.ResourceNotFoundException;
import com.pjt.ticketingsystem.core.service.VenueService;
import com.pjt.ticketingsystem.login.exception.UserExistsException;
import com.pjt.ticketingsystem.util.JwtUtil;
import com.stripe.exception.StripeException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.management.relation.RoleNotFoundException;

@RestController
@RequestMapping("/api/v1/ticketing")
public class VenueController {

    private final VenueService venueService;
    private final JwtUtil jwtUtil;

    public VenueController(VenueService venueService, JwtUtil jwtUtil) {
        this.venueService = venueService;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping("/venues/{venueId}")
    public ResponseEntity<?> getVenue(@PathVariable Long venueId) {
        try {
            VenueDto venue = venueService.getVenue(venueId);
            return ResponseEntity.ok(venue);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/venues")
    public ResponseEntity<?> getVenues() {
        return ResponseEntity.ok(venueService.getVenues());
    }

    @PostMapping("/venues/register")
    public ResponseEntity<?> registerVenue(@RequestBody Venue3Dto venue3Dto, @RequestHeader("origin") String origin) {
        try {
            venueService.registerVenue(venue3Dto, origin);
        } catch (UserExistsException e) {
            return ResponseEntity.ok("Registered");
        } catch (RoleNotFoundException | StripeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
        return ResponseEntity.ok("Venue registered successfully");
    }

    @PostMapping("/venues/address")
    public ResponseEntity<?> updateAddress(@RequestBody VenueUpdateAddressRequest updateAddressRequest,
                                           HttpServletRequest request) {
        String authorizationHeader = request.getHeader("Authorization");
        String token = authorizationHeader.substring(7);
        Long venueId = jwtUtil.extractUserId(token);
        venueService.updateAddress(venueId, updateAddressRequest.getAddress(), updateAddressRequest.getCity(),
                updateAddressRequest.getState());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/venues/address")
    public ResponseEntity<?> getAddress(HttpServletRequest request) {
        String authorizationHeader = request.getHeader("Authorization");
        String token = authorizationHeader.substring(7);
        Long venueId = jwtUtil.extractUserId(token);
        return ResponseEntity.ok(venueService.getAddress(venueId));
    }
}
