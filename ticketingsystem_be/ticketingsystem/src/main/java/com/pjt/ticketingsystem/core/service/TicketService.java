package com.pjt.ticketingsystem.core.service;

import com.pjt.ticketingsystem.core.dto.Ticket2Dto;
import com.pjt.ticketingsystem.core.exception.EarlyTicketException;
import com.pjt.ticketingsystem.core.exception.ExpiredTicketException;
import com.pjt.ticketingsystem.core.exception.InvalidTicketException;
import com.pjt.ticketingsystem.core.model.Event;
import com.pjt.ticketingsystem.core.model.Ticket;
import com.pjt.ticketingsystem.core.repository.EventRepository;
import com.pjt.ticketingsystem.core.repository.TicketRepository;
import com.pjt.ticketingsystem.login.model.User;
import com.pjt.ticketingsystem.login.repository.UserRepository;
import com.pjt.ticketingsystem.util.AESUtil;
import org.springframework.cglib.core.Local;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class TicketService {
    private final EventRepository eventRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public TicketService(EventRepository eventRepository, TicketRepository ticketRepository,
                         UserRepository userRepository) {
        this.eventRepository = eventRepository;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    public void createTicket(Ticket2Dto ticket2Dto) {
        Ticket ticket = new Ticket();
        ticket.setName(ticket2Dto.getName());
        ticket.setPrice(ticket2Dto.getPrice());
        ticket.setStatus(ticket2Dto.getStatus());
        Event event = eventRepository.findById(ticket2Dto.getEvent().getId()).orElseThrow();
        event.getTickets().add(ticket);
        ticket.setEvent(event);
        ticketRepository.save(ticket);
    }

    public void validateTicket(String encryptedTicketData) throws Exception {
        String decryptedData = AESUtil.decrypt(encryptedTicketData, AESUtil.secretKey);

        String[] dataParts = decryptedData.split("@");
        String ticketId = dataParts[0];
        String eventId = dataParts[1];

        Optional<Ticket> ticket = ticketRepository.findById(Long.valueOf(ticketId));
        if (ticket.isEmpty() || ticket.get().isUsed())
            throw new InvalidTicketException();

        Optional<Event> event = eventRepository.findById(Long.valueOf(eventId));
        if (event.isEmpty())
            throw new InvalidTicketException();

        if (LocalDateTime.now().isBefore(event.get().getDate()))
            throw new EarlyTicketException();

        if (LocalDateTime.now().isAfter(event.get().getTicketExpiry()))
            throw new ExpiredTicketException();

        ticket.get().setUsed(true);
        ticketRepository.save(ticket.get());
    }
}
