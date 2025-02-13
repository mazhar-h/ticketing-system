package com.pjt.ticketingsystem.core.service;

import ch.hsr.geohash.GeoHash;
import com.pjt.ticketingsystem.core.dto.*;
import com.pjt.ticketingsystem.core.exception.ResourceNotFoundException;
import com.pjt.ticketingsystem.core.model.Venue;
import com.pjt.ticketingsystem.core.repository.VenueRepository;
import com.pjt.ticketingsystem.login.exception.UserExistsException;
import com.pjt.ticketingsystem.login.model.Role;
import com.pjt.ticketingsystem.login.model.VerificationToken;
import com.pjt.ticketingsystem.login.repository.RoleRepository;
import com.pjt.ticketingsystem.login.repository.VerificationTokenRepository;
import com.pjt.ticketingsystem.login.service.EarthService;
import com.stripe.exception.StripeException;
import com.stripe.model.Account;
import com.stripe.param.AccountCreateParams;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.management.relation.RoleNotFoundException;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class VenueService {
    private final VenueRepository venueRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final VerificationTokenRepository verificationTokenRepository;
    private final RestTemplate restTemplate;
    private final EarthService earthService;
    private static final String PATH_VERIFY_EMAIL = "/verify-email/";

    public VenueService(VenueRepository venueRepository, PasswordEncoder passwordEncoder,
                        RoleRepository roleRepository, VerificationTokenRepository verificationTokenRepository,
                        RestTemplate restTemplate, EarthService earthService) {
        this.venueRepository = venueRepository;
        this.passwordEncoder = passwordEncoder;
        this.roleRepository = roleRepository;
        this.verificationTokenRepository = verificationTokenRepository;
        this.restTemplate = restTemplate;
        this.earthService = earthService;
    }

    public VenueDto getVenue(Long venueId) {
        Venue venue = venueRepository.findById(venueId).orElseThrow(ResourceNotFoundException::new);
        return venueToVenueDto(venue);
    }

    public Set<VenueDto> getVenues() {
        List<Venue> venues = venueRepository.findAll();
        Set<VenueDto> venuesDto = new HashSet<>();
        venues.forEach(venue -> {
            venuesDto.add(venueToVenueDto(venue));
        });
        return venuesDto;
    }

    private VenueDto venueToVenueDto(Venue venue) {
        VenueDto venueDto = new VenueDto();
        venueDto.setId(venue.getId());
        venueDto.setName(venue.getName());
        Set<Event2Dto> events2Dto = new HashSet<>();
        venue.getEvents().forEach(event -> {
            Event2Dto event2Dto = new Event2Dto();
            event2Dto.setId(event.getId());
            event2Dto.setName(event.getName());
            Set<TicketDto> ticketsDto = new HashSet<>();
            event.getTickets().forEach(ticket -> {
                TicketDto ticketDto = new TicketDto();
                ticketDto.setId(ticket.getId());
                ticketDto.setName(ticket.getName());
                ticketDto.setUsed(ticket.isUsed());
                ticketDto.setPrice(ticket.getPrice());
                ticketDto.setStatus(ticket.getStatus());
                ticketsDto.add(ticketDto);
            });
            event2Dto.setTickets(ticketsDto);
            Set<PerformerDto> performersDto = new HashSet<>();
            event.getPerformers().forEach(performer -> {
                PerformerDto performerDto = new PerformerDto();
                performerDto.setName(performer.getName());
                performerDto.setId(performer.getId());
                performersDto.add(performerDto);
            });
            event2Dto.setPerformers(performersDto);
            events2Dto.add(event2Dto);
        });
        venueDto.setEvents(events2Dto);
        return venueDto;
    }

    public void registerVenue(Venue3Dto venue3Dto, String origin) throws RoleNotFoundException, StripeException {
        Venue venue = new Venue();
        if (venueRepository.existsByUsername(venue3Dto.getUsername())) {
            throw new UserExistsException("Username already exists");
        }
        venue.setUsername(venue3Dto.getUsername());
        venue.setName(venue3Dto.getName());
        venue.setEmail(venue3Dto.getEmail());
        venue.setPassword(passwordEncoder.encode(venue3Dto.getPassword()));
        Role userRole = roleRepository.findByName("ROLE_VENUE");

        if (userRole == null)
            throw new RoleNotFoundException("Role not found");

        venue.setRoles(Collections.singleton(userRole));

        AccountCreateParams params = AccountCreateParams.builder()
                .setController(
                        AccountCreateParams.Controller.builder()
                                .setStripeDashboard(
                                        AccountCreateParams.Controller.StripeDashboard.builder()
                                                .setType(AccountCreateParams.Controller.StripeDashboard.Type.EXPRESS)
                                                .build()
                                )
                                .setFees(
                                        AccountCreateParams.Controller.Fees.builder()
                                                .setPayer(AccountCreateParams.Controller.Fees.Payer.APPLICATION)
                                                .build()
                                )
                                .setLosses(
                                        AccountCreateParams.Controller.Losses.builder()
                                                .setPayments(AccountCreateParams.Controller.Losses.Payments.APPLICATION)
                                                .build()
                                )
                                .setRequirementCollection(
                                        AccountCreateParams.Controller.RequirementCollection.STRIPE
                                )
                                .build()
                )
                .setEmail(venue3Dto.getEmail())
                .setCapabilities(
                    AccountCreateParams.Capabilities.builder()
                        .setTransfers(
                                AccountCreateParams.Capabilities.Transfers.builder().setRequested(true).build()
                        )
                        .build()

                )
                .build();

        Account account = null;
        if (params != null) {
            account = Account.create(params);
        }
        String accountId = null;
        if (account != null) {
            accountId = account.getId();
        }
        venue.setStripeAccountId(accountId);
        venueRepository.save(venue);

        String token = UUID.randomUUID().toString();
        VerificationToken verificationToken = new VerificationToken();
        verificationToken.setToken(token);
        verificationToken.setUser(venue);
        verificationToken.setExpiryDate(LocalDateTime.now().plusDays(1)); // Token valid for 24 hours

        verificationTokenRepository.save(verificationToken);

        String verificationUrl = origin + PATH_VERIFY_EMAIL + token;
        RegisteredUserRequest request = new RegisteredUserRequest();
        RegisteredUserTemplateData templateData = new RegisteredUserTemplateData();
        request.setTo(venue.getEmail());
        request.setSubject("Welcome! - Email Verification");
        request.setTemplate("registered-venue");
        templateData.setName(venue.getName());
        templateData.setUsername(venue.getUsername());
        templateData.setVerificationUrl(verificationUrl);
        request.setTemplateData(templateData);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<RegisteredUserRequest> requestEntity = new HttpEntity<>(request, headers);
        restTemplate.exchange("http://localhost:8081/email/registered", HttpMethod.POST, requestEntity,
                RegisteredUserRequest.class);    }

    public VenueAddressResponse getAddress(Long venueId) {
        Venue venue = venueRepository.findById(venueId).orElseThrow(ResourceNotFoundException::new);
        String address = venue.getAddress();
        String city = venue.getCity();
        String state = venue.getState();
        VenueAddressResponse response = new VenueAddressResponse();
        response.setAddress(address + ", " + city + ", " + state);
        return response;
    }

    public void updateAddress(Long venueId, String address, String city, String state) {
        Venue venue = venueRepository.findById(venueId).orElseThrow(ResourceNotFoundException::new);
        venue.setAddress(address);
        venue.setCity(city);
        venue.setState(state);
        OSMGeoLocationResponse geolocation = earthService.getGeoLocationByAddress(address + ", " + city + ", " + state).get();
        String geohash = GeoHash.geoHashStringWithCharacterPrecision(Double.parseDouble(geolocation.getLat()),
                Double.parseDouble(geolocation.getLon()), 9);
        venue.setGeoHash(geohash);
        venueRepository.save(venue);
    }
}
