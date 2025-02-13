package com.pjt.ticketingsystem.core.service;

import com.pjt.ticketingsystem.core.dto.*;
import com.pjt.ticketingsystem.core.enums.BookingStatus;
import com.pjt.ticketingsystem.core.enums.TicketStatus;
import com.pjt.ticketingsystem.core.exception.*;
import com.pjt.ticketingsystem.core.model.Booking;
import com.pjt.ticketingsystem.core.model.Ticket;
import com.pjt.ticketingsystem.core.repository.BookingRepository;
import com.pjt.ticketingsystem.core.repository.TicketRepository;
import com.pjt.ticketingsystem.login.dto.User2Dto;
import com.pjt.ticketingsystem.login.model.User;
import com.pjt.ticketingsystem.login.repository.UserRepository;
import com.pjt.ticketingsystem.util.AESUtil;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;
import java.util.concurrent.atomic.AtomicReference;

@Service
public class BookingService {
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;
    private final QRCodeService qrCodeService;
    private final RestTemplate restTemplate;

    public BookingService(UserRepository userRepository, BookingRepository bookingRepository,
                          TicketRepository ticketRepository, QRCodeService qrCodeService,
                          RestTemplate restTemplate) {
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.ticketRepository = ticketRepository;
        this.qrCodeService = qrCodeService;
        this.restTemplate = restTemplate;
    }

    public List<Booking3Dto> getBookingsByUserId(Long userId) {
        List<Booking> bookings = bookingRepository.findByUserId(userId);
        List<Booking3Dto> bookings3Dto = new LinkedList<>();
        bookings.forEach(booking -> {
            if (booking.getStatus().equals(BookingStatus.CONFIRMED))
                bookings3Dto.add(bookingToBooking3Dto(booking));
        });
        return bookings3Dto;
    }

    public void releaseBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (booking.getTickets().size() == 0)
            throw new IllegalBookingException();

        for (Ticket ticket : booking.getTickets()) {
            ticket.setStatus(TicketStatus.AVAILABLE);
            ticket.setBooking(null);
            ticket.setReservationExpiry(null);
            ticketRepository.save(ticket);
        }

        booking.setStatus(BookingStatus.EXPIRED);
        booking.setExpiryDate(LocalDateTime.now());
        bookingRepository.save(booking);
    }

    @Transactional
    public Booking2Dto reserveGuestTickets(String guestTokenId, Set<Long> ticketIds) {
        List<Ticket> tickets = ticketRepository.findAllById(ticketIds);
        if (tickets.size() == 0)
            throw new IllegalBookingException();
        Booking booking = new Booking();
        AtomicReference<Double> totalPrice = new AtomicReference<>((double) 0);
        tickets.forEach(ticket -> {
            if (!ticket.getStatus().equals(TicketStatus.AVAILABLE))
                throw new IllegalBookingException();
            ticket.setStatus(TicketStatus.PENDING);
            ticket.setReservationExpiry(LocalDateTime.now().plusMinutes(5));
            ticket.setBooking(booking);
            totalPrice.updateAndGet(v -> v + ticket.getPrice());
        });
        booking.setTotalPrice(totalPrice.get());
        booking.setGuestTokenId(guestTokenId);
        booking.setTickets(new HashSet<>(tickets));
        booking.setBookingDate(LocalDateTime.now());
        bookingRepository.save(booking);
        Booking2Dto booking2Dto = new Booking2Dto();
        booking2Dto.setId(booking.getId());
        return booking2Dto;
    }

    @Transactional
    public Booking2Dto reserveTickets(Long userId, Set<Long> ticketIds) {
        List<Ticket> tickets = ticketRepository.findAllById(ticketIds);
        if (tickets.size() == 0)
            throw new IllegalBookingException();
        Booking booking = new Booking();
        AtomicReference<Double> totalPrice = new AtomicReference<>((double) 0);
        tickets.forEach(ticket -> {
            if (!ticket.getStatus().equals(TicketStatus.AVAILABLE))
                throw new IllegalBookingException();
            ticket.setStatus(TicketStatus.PENDING);
            ticket.setReservationExpiry(LocalDateTime.now().plusMinutes(5));
            ticket.setBooking(booking);
            totalPrice.updateAndGet(v -> v + ticket.getPrice());
        });
        booking.setTotalPrice(totalPrice.get());
        booking.setUser(userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found")));
        booking.setTickets(new HashSet<>(tickets));
        booking.setBookingDate(LocalDateTime.now());
        bookingRepository.save(booking);
        Booking2Dto booking2Dto = new Booking2Dto();
        booking2Dto.setId(booking.getId());
        return booking2Dto;
    }

    public Booking3Dto validateAndCompleteGuestBooking(Long bookingId, String paymentIntentId, String guestTokenId,
                                                       String guestEmail) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(BookingNotFoundException::new);

        if (!booking.getGuestTokenId().equals(guestTokenId)) {
            throw new UnauthorizedBookingException();
        }
        if (booking.getTickets().size() == 0)
            throw new IllegalBookingException();

        for (Ticket ticket : booking.getTickets()) {
            if ((!ticket.getStatus().equals(TicketStatus.PENDING) && !ticket.getStatus().equals(TicketStatus.SOLD)
                    && !ticket.getStatus().equals(TicketStatus.UNAVAILABLE))
                    || ticket.getReservationExpiry().isBefore(LocalDateTime.now())) {
                throw new TicketReservationExpiredException();
            }
        }

        booking.setPaymentIntentId(paymentIntentId);
        booking.getTickets().forEach(ticket -> ticket.setStatus(TicketStatus.SOLD));
        booking.getTickets().forEach(ticket -> ticket.setReservationExpiry(null));
        booking.getTickets().forEach(ticket -> {
            try {
                ticket.setToken(qrCodeService.generateEncryptedQRCodeData(ticket, AESUtil.secretKey));
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        });

        booking.setGuestEmail(guestEmail);
        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        BookingConfirmationRequest request = new BookingConfirmationRequest();
        request.setTo(guestEmail);
        request.setSubject("Your Turnstile Tickets Order (" + bookingId + ")");
        request.setTemplate("guest-booking-confirmation");
        request.setTemplateData(bookingToBooking3Dto(booking));
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<BookingConfirmationRequest> requestEntity = new HttpEntity<>(request, headers);
        restTemplate.exchange("http://localhost:8081/email/guest-booking-confirmation", HttpMethod.POST, requestEntity,
                BookingConfirmationRequest.class);

        return bookingToBooking3Dto(booking);
    }

    public Booking3Dto validateAndCompleteBooking(Long bookingId, String paymentIntentId, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(BookingNotFoundException::new);

        if (!booking.getUser().getId().equals(userId)) {
            throw new UnauthorizedBookingException();
        }

        if (booking.getTickets().size() == 0)
            throw new IllegalBookingException();

        for (Ticket ticket : booking.getTickets()) {
            if ((!ticket.getStatus().equals(TicketStatus.PENDING) && !ticket.getStatus().equals(TicketStatus.SOLD)
                    && !ticket.getStatus().equals(TicketStatus.UNAVAILABLE))
                    || ticket.getReservationExpiry().isBefore(LocalDateTime.now())) {
                throw new TicketReservationExpiredException();
            }
        }

        booking.setPaymentIntentId(paymentIntentId);
        booking.getTickets().forEach(ticket -> ticket.setStatus(TicketStatus.SOLD));
        booking.getTickets().forEach(ticket -> ticket.setReservationExpiry(null));
        booking.getTickets().forEach(ticket -> {
            try {
                ticket.setToken(qrCodeService.generateEncryptedQRCodeData(ticket, AESUtil.secretKey));
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        });
        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        User user = userRepository.findById(userId).orElseThrow(ResourceNotFoundException::new);

        BookingConfirmationRequest request = new BookingConfirmationRequest();
        request.setTo(user.getEmail());
        request.setSubject("Your Turnstile Tickets Order (" + bookingId + ")");
        request.setTemplate("booking-confirmation");
        request.setTemplateData(bookingToBooking3Dto(booking));
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<BookingConfirmationRequest> requestEntity = new HttpEntity<>(request, headers);
        restTemplate.exchange("http://localhost:8081/email/booking-confirmation", HttpMethod.POST, requestEntity,
                BookingConfirmationRequest.class);

        return bookingToBooking3Dto(booking);
    }

    public Booking3Dto bookingToBooking3Dto(Booking booking) {
        Booking3Dto booking3Dto = new Booking3Dto();
        booking3Dto.setId(booking.getId());
        booking3Dto.setDate(booking.getBookingDate());
        booking3Dto.setStatus(booking.getStatus());
        booking3Dto.setTotalPrice(booking.getTotalPrice());
        if (booking.getUser() != null) {
            User2Dto user2Dto = new User2Dto();
            user2Dto.setId(booking.getUser().getId());
            user2Dto.setUsername(booking.getUser().getUsername());
            booking3Dto.setUser(user2Dto);
        }
        Set<TicketDto> ticketsDto = new HashSet<>();
        booking.getTickets().forEach(ticket -> {
            TicketDto ticketDto = new TicketDto();
            ticketDto.setName(ticket.getName());
            ticketDto.setId(ticket.getId());
            ticketDto.setUsed(ticket.isUsed());
            ticketDto.setStatus(ticket.getStatus());
            ticketDto.setPrice(ticket.getPrice());
            ticketDto.setToken(ticket.getToken());
            ticketsDto.add(ticketDto);
            Event5Dto event5Dto = new Event5Dto();
            event5Dto.setId(ticket.getEvent().getId());
            event5Dto.setName(ticket.getEvent().getName());
            event5Dto.setStatus(ticket.getEvent().getStatus());
            event5Dto.setDate(ticket.getEvent().getDate());
            booking3Dto.setEvent(event5Dto);
            Venue2Dto venue2Dto = new Venue2Dto();
            venue2Dto.setId(ticket.getEvent().getVenue().getId());
            venue2Dto.setName(ticket.getEvent().getVenue().getName());
            booking3Dto.setVenue(venue2Dto);
        });
        booking3Dto.setTickets(ticketsDto);
        return booking3Dto;
    }

    public List<Booking> findExpiredBookingsOlderThanDays(int days) {
        LocalDateTime thresholdDate = LocalDateTime.now().minusDays(days);
        return bookingRepository.findByStatusAndExpiryDateBefore(BookingStatus.EXPIRED, thresholdDate);
    }

    @Scheduled(fixedDelay = 60000)
    public void releaseExpiredReservations() {
        List<Ticket> expiredTickets = ticketRepository.findByReservationExpiryBefore(LocalDateTime.now());
        expiredTickets.forEach(ticket -> {
            if (ticket.getStatus().equals(TicketStatus.PENDING)) {
                ticket.setStatus(TicketStatus.AVAILABLE);
                ticket.setReservationExpiry(null);
                Booking booking = ticket.getBooking();
                booking.setExpiryDate(LocalDateTime.now());
                booking.setStatus(BookingStatus.EXPIRED);
                bookingRepository.save(booking);
                ticket.setBooking(null);
            }
        });
        ticketRepository.saveAll(expiredTickets);
    }

    @Scheduled(cron = "0 0 2 * * ?")
    public void cleanupExpiredBookings() {
        List<Booking> expiredBookings = findExpiredBookingsOlderThanDays(30);
        for (Booking expiredBooking : expiredBookings) {
            bookingRepository.delete(expiredBooking);
        }
    }
}
