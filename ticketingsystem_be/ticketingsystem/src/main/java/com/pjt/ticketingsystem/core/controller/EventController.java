package com.pjt.ticketingsystem.core.controller;

import com.pjt.ticketingsystem.core.dto.*;
import com.pjt.ticketingsystem.core.enums.EventSource;
import com.pjt.ticketingsystem.core.exception.ResourceNotFoundException;
import com.pjt.ticketingsystem.core.service.EventService;
import com.pjt.ticketingsystem.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/ticketing")
public class EventController {

    private final EventService eventService;
    private final JwtUtil jwtUtil;

    public EventController(EventService eventService, JwtUtil jwtUtil) {
        this.eventService = eventService;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping("/events/{eventId}")
    public ResponseEntity<?> getEvent(@PathVariable String eventId, @RequestParam String source) {
        try {
            if (source.equals(EventSource.o.toString())) {
                Event3Dto event = eventService.getEvent(Long.valueOf(eventId));
                return ResponseEntity.ok(event);
            } else if (source.equals(EventSource.tm.toString())) {
                TicketmasterEvent event = eventService.getEvent(eventId);
                return ResponseEntity.ok(event);
            }
            else
                throw new ResourceNotFoundException();
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/events")
    public ResponseEntity<?> getEvents() {
        return ResponseEntity.ok(eventService.getEvents());
    }

    @GetMapping("/events/venue")
    public ResponseEntity<?> getEventsByVenue(HttpServletRequest request) {
        String authorizationHeader = request.getHeader("Authorization");
        String token = authorizationHeader.substring(7);
        Long venueId = jwtUtil.extractUserId(token);
        return ResponseEntity.ok(eventService.getEventsByVenue(venueId));
    }

    @GetMapping("/events/{eventId}/bookings")
    public ResponseEntity<?> getEventBookings(@PathVariable Long eventId) {
        Set<Booking3Dto> bookings = eventService.getEventBookings(eventId);
        return ResponseEntity.ok(bookings);
    }

    @PutMapping("/events/{eventId}")
    public ResponseEntity<?> updateEvent(@PathVariable Long eventId, @RequestBody EventDto eventDto,
                                         HttpServletRequest request) {
        String authorizationHeader = request.getHeader("Authorization");
        String token = authorizationHeader.substring(7);
        Long venueId = jwtUtil.extractUserId(token);
        eventService.updateEvent(eventId, venueId, eventDto);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/events")
    public ResponseEntity<?> createEvent(@RequestBody EventDto eventDto) {
        eventService.createEvent(eventDto);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/events/search")
    public ResponseEntity<AggregatedEventSearchResponse> searchEvents(@RequestParam String keyword,
                                                                      @RequestParam boolean original,
                                                                      @RequestParam boolean location,
                                                                      @RequestParam String classificationId,
                                                                      @RequestParam String size,
                                                                      @RequestParam String page,
                                                                      @RequestParam String sort,
                                                                      @RequestParam String radius,
                                                                      @RequestParam String unit,
                                                                      HttpServletRequest request) {
        AggregatedEventSearchResponse foundEvents = eventService.searchEvents(keyword, original, location, classificationId,
                size, page, sort, radius, unit, request);
        if (!foundEvents.getOriginal().isEmpty() || (foundEvents.getTicketmaster().get_embedded() != null
                &&!foundEvents.getTicketmaster().get_embedded().getEvents().isEmpty())) {
            return ResponseEntity.ok(foundEvents);
        } else {
            return ResponseEntity.noContent().build();
        }
    }
}
