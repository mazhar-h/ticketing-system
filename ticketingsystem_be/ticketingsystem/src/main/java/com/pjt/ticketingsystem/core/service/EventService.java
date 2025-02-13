package com.pjt.ticketingsystem.core.service;

import ch.hsr.geohash.GeoHash;
import com.pjt.ticketingsystem.core.dto.*;
import com.pjt.ticketingsystem.core.enums.EventStatus;
import com.pjt.ticketingsystem.core.enums.TicketStatus;
import com.pjt.ticketingsystem.core.exception.ResourceNotFoundException;
import com.pjt.ticketingsystem.core.exception.UnauthorizedVenueException;
import com.pjt.ticketingsystem.core.model.*;
import com.pjt.ticketingsystem.core.repository.EventRepository;
import com.pjt.ticketingsystem.core.repository.PerformerRepository;
import com.pjt.ticketingsystem.core.repository.VenueRepository;
import com.pjt.ticketingsystem.login.dto.IPInfoGeoLocationResponse;
import com.pjt.ticketingsystem.login.service.EarthService;
import com.pjt.ticketingsystem.util.IpAddressUtil;
import com.stripe.exception.StripeException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final VenueRepository venueRepository;
    private final PerformerRepository performerRepository;
    private final BookingService bookingService;
    private final StripeService stripeService;
    private final RestTemplate restTemplate;
    private final EarthService earthService;

    @Value("${ticketmaster.consumer.key}")
    private String ticketmasterApiKey;
    private static final String TICKETMASTER_BASEURL = "https://app.ticketmaster.com/discovery/v2/";


    public EventService(EventRepository eventRepository, VenueRepository venueRepository,
                        PerformerRepository performerRepository, BookingService bookingService, StripeService stripeService, RestTemplate restTemplate, EarthService earthService) {
        this.eventRepository = eventRepository;
        this.venueRepository = venueRepository;
        this.performerRepository = performerRepository;
        this.bookingService = bookingService;
        this.stripeService = stripeService;
        this.restTemplate = restTemplate;
        this.earthService = earthService;
    }

    public Event3Dto getEvent(Long eventId) {
        Event event = eventRepository.findById(eventId).orElseThrow(ResourceNotFoundException::new);
        return eventToEvent3Dto(event);
    }

    public TicketmasterEvent getEvent(String eventId) {
        String url = TICKETMASTER_BASEURL + "events/" + eventId + ".json?" + "&apikey=" + ticketmasterApiKey;
        TicketmasterEvent tmEvent = restTemplate.getForObject(url, TicketmasterEvent.class);
        return tmEvent;
    }

    public AggregatedEventSearchResponse getEvents() {
        List<Event> events = eventRepository.findAll();
        String url = TICKETMASTER_BASEURL + "events.json?" + "&apikey=" + ticketmasterApiKey
                + "&classificationName=music" + "&keyword=";
        TicketmasterEventSearchResponse tmEventSearch = restTemplate.getForObject(url, TicketmasterEventSearchResponse.class);
        List<Event3Dto> events3Dto = new LinkedList<>();
        events.forEach(event -> {
            events3Dto.add(eventToEvent3Dto(event));
        });
        AggregatedEventSearchResponse response = new AggregatedEventSearchResponse();
        response.setOriginal(events3Dto);
        response.setTicketmaster(tmEventSearch);
        return response;
    }

    private Event3Dto eventToEvent3Dto(Event event) {
        Event3Dto event3Dto = new Event3Dto();
        event3Dto.setId(event.getId());
        event3Dto.setName(event.getName());
        event3Dto.setStatus(event.getStatus());
        event3Dto.setDate(event.getDate());
        event3Dto.setTicketExpiry(event.getTicketExpiry());
        Venue2Dto venue2Dto = new Venue2Dto();
        venue2Dto.setId(event.getVenue().getId());
        venue2Dto.setName(event.getVenue().getName());
        venue2Dto.setGeoHash(event.getVenue().getGeoHash());
        event3Dto.setVenue(venue2Dto);
        Set<TicketDto> ticketsDto = new HashSet<>();
        event.getTickets().forEach(ticket -> {
            TicketDto ticketDto = new TicketDto();
            ticketDto.setName(ticket.getName());
            ticketDto.setId(ticket.getId());
            ticketDto.setPrice(ticket.getPrice());
            ticketDto.setUsed(ticket.isUsed());
            ticketDto.setStatus(ticket.getStatus());
            ticketsDto.add(ticketDto);
        });
        event3Dto.setTickets(ticketsDto);
        Set<PerformerDto> performersDto = new HashSet<>();
        event.getPerformers().forEach(performer -> {
            PerformerDto performerDto = new PerformerDto();
            performerDto.setId(performer.getId());
            performerDto.setName(performer.getName());
            performersDto.add(performerDto);
        });
        event3Dto.setPerformers(performersDto);
        return event3Dto;
    }

    public void createEvent(EventDto eventDto) {
        Venue venue = venueRepository.findById(eventDto.getVenueId()).orElseThrow();

        Event event = new Event();
        event.setVenue(venue);
        event.setName(eventDto.getName());
        event.setDate(eventDto.getDate());
        event.setTicketExpiry(eventDto.getTicketExpiry());

        Set<Event> events = new HashSet<>();
        events.add(event);

        Set<Ticket> tickets = eventDto.getTickets();
        tickets.forEach(ticket -> ticket.setEvent(event));

        List<Performer> performers = performerRepository.findAllById(eventDto.getPerformerIds());
        performers.forEach(performer -> {
            Set<Event> eventSet = performer.getEvents();
            if (eventSet != null)
                eventSet.addAll(events);
            else
                performer.setEvents(events);
        });

        event.setTickets(tickets);
        event.setPerformers(new HashSet<>(performers));
        venue.setEvents(events);
        eventRepository.save(event);
    }

    public AggregatedEventSearchResponse searchEvents(String searchText, boolean original,
                                                      boolean location, String classificationId,
                                                      String size, String page, String sort,
                                                      String radius, String unit, HttpServletRequest request) {
        String geohash;
        List<Event> events = null;
        if (location) {
            String ipAddress = "2.56.191.250";//IpAddressUtil.getClientIp(request);
            IPInfoGeoLocationResponse geoLocation = earthService.getGeoLocationByIp(ipAddress);
            String[] latLongValues = geoLocation.getLoc().split(",");
            geohash = GeoHash.geoHashStringWithCharacterPrecision(Double.parseDouble(latLongValues[0]),
                    Double.parseDouble(latLongValues[1]), 9);
        } else {
            geohash = "";
        }
        if (original) {
            events = eventRepository.findEventsBySearchText(searchText);
            if (location) {
                events = events.stream().filter(event -> {
                    try {
                        String eventGeoHash = event.getVenue().getGeoHash();
                        GeoHash eventGeoHashObj = GeoHash.fromGeohashString(eventGeoHash);
                        double eventLatitude = eventGeoHashObj.getBoundingBoxCenter().getLatitude();
                        double eventLongitude = eventGeoHashObj.getBoundingBoxCenter().getLongitude();

                        GeoHash userGeoHashObj = GeoHash.fromGeohashString(geohash);
                        double userLatitude = userGeoHashObj.getBoundingBoxCenter().getLatitude();
                        double userLongitude = userGeoHashObj.getBoundingBoxCenter().getLongitude();

                        double distance = earthService.calculateDistanceInMiles(userLatitude, userLongitude, eventLatitude, eventLongitude);
                        if (distance <= Double.parseDouble(radius))
                            return true;
                        else
                            return false;
                    } catch (Exception e) {
                        return false;
                    }
                }).toList();
            }
        }
        String url = TICKETMASTER_BASEURL + "events.json";
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(url)
                .queryParam("apikey", ticketmasterApiKey)
                .queryParam("classificationName", "music")
                .queryParam("keyword", searchText)
                .queryParam("geoPoint", geohash)
                .queryParam("classificationId", classificationId)
                .queryParam("size", size)
                .queryParam("page", page)
                .queryParam("sort", sort)
                .queryParam("radius", radius)
                .queryParam("unit",unit);
        TicketmasterEventSearchResponse tmEventSearch = restTemplate.getForObject(
                builder.build(false).toUriString(),
                TicketmasterEventSearchResponse.class
        );
        List<Event3Dto> events3Dto = new LinkedList<>();
        if (events != null) {
            events.forEach(event -> {
                events3Dto.add(eventToEvent3Dto(event));
            });
        }
        AggregatedEventSearchResponse response = new AggregatedEventSearchResponse();
        response.setOriginal(events3Dto);
        response.setTicketmaster(tmEventSearch);
        return response;
    }

    public List<Event3Dto> getEventsByVenue(Long venueId) {
        List<Event> events = eventRepository.findByVenueId(venueId);
        List<Event3Dto> events3Dto = new LinkedList<>();
        events.forEach(event -> {
            events3Dto.add(eventToEvent3Dto(event));
        });
        return events3Dto;
    }

    public void updateEvent(Long eventId, Long venueId, EventDto eventDto) {
        Event event = eventRepository.findById(eventId).orElseThrow(ResourceNotFoundException::new);
        if (!event.getVenue().getId().equals(venueId))
            throw new UnauthorizedVenueException("Venue does not own event");
        event.setName(eventDto.getName());
        event.setDate(eventDto.getDate());
        event.setTicketExpiry(eventDto.getTicketExpiry());
        List<Performer> performers = performerRepository.findAllById(eventDto.getPerformerIds());
        event.setPerformers(new HashSet<>(performers));
        event.setStatus(eventDto.getStatus());
        if (event.getStatus().equals(EventStatus.OPEN))
        {
            event.getTickets().forEach(ticket -> {
                if (ticket.getStatus().equals(TicketStatus.UNAVAILABLE))
                    ticket.setStatus(TicketStatus.AVAILABLE);
            });
        }
        if (event.getStatus().equals(EventStatus.CLOSED))
        {
            event.getTickets().forEach(ticket -> {
                if (!ticket.getStatus().equals(TicketStatus.SOLD) && ! ticket.getStatus().equals(TicketStatus.REFUNDED))
                    ticket.setStatus(TicketStatus.UNAVAILABLE);
            });
        }
        if (event.getStatus().equals(EventStatus.CANCELED))
        {
            Set<Long> bookingIds = new HashSet<>();
            event.getTickets().forEach(ticket -> {
                TicketStatus ticketStatus = ticket.getStatus();
                if (ticketStatus.equals(TicketStatus.AVAILABLE) || ticketStatus.equals(TicketStatus.PENDING))
                    ticket.setStatus(TicketStatus.UNAVAILABLE);
                if (ticketStatus.equals(TicketStatus.SOLD)) {
                    ticket.setStatus(TicketStatus.REFUNDED);
                    Long bookingId = ticket.getBooking().getId();
                    if (!bookingIds.contains(bookingId)) {
                        String paymentIntentId = ticket.getBooking().getPaymentIntentId();
                        if (paymentIntentId != null) {
                            try {
                                stripeService.refundPayment(bookingId, paymentIntentId);
                                bookingIds.add(bookingId);
                            } catch (StripeException e) {
                                throw new RuntimeException(e);
                            }
                        }
                    }
                }
            });
        }
        eventDto.getTickets().forEach(ticket -> {
            event.getTickets().forEach(eventTicket -> {
                if (ticket.getId() != null && ticket.getId().equals(eventTicket.getId())
                        && eventTicket.getStatus().equals(TicketStatus.UNAVAILABLE)) {
                    eventTicket.setName(ticket.getName());
                    eventTicket.setPrice(ticket.getPrice());
                    eventTicket.setStatus(ticket.getStatus());
                }
            });
            if (ticket.getId() ==  null) {
                Ticket newTicket = new Ticket();
                newTicket.setName(ticket.getName());
                newTicket.setPrice(ticket.getPrice());
                newTicket.setStatus(ticket.getStatus());
                newTicket.setEvent(event);
                event.getTickets().add(newTicket);
            }
        });
        eventRepository.save(event);
    }

    public Set<Booking3Dto> getEventBookings(Long eventId) {
        Event event = eventRepository.findById(eventId).orElseThrow(ResourceNotFoundException::new);
        Set<Booking3Dto> bookings = new HashSet<>();
        event.getTickets().forEach(ticket -> {
            Booking3Dto booking = bookingService.bookingToBooking3Dto(ticket.getBooking());
            bookings.add(booking);
        });
        return bookings;
    }

    @Transactional
    public void closeExpiredEvents() {
        LocalDateTime now = LocalDateTime.now();
        List<Event> expiredEvents = eventRepository.findAllByTicketExpiryBeforeAndStatus(now, EventStatus.OPEN);

        for (Event event : expiredEvents) {
            event.setStatus(EventStatus.CLOSED);
            event.getTickets().forEach(ticket -> {
                if (!ticket.getStatus().equals(TicketStatus.SOLD) && !ticket.getStatus().equals(TicketStatus.REFUNDED))
                    ticket.setStatus(TicketStatus.UNAVAILABLE);
            });
            eventRepository.save(event);
        }
    }

    @Scheduled(fixedRate = 3600000)
    public void scheduleCloseExpiredEvents() {
        closeExpiredEvents();
    }
}
