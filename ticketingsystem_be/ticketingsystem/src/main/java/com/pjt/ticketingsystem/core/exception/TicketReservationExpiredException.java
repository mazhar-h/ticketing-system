package com.pjt.ticketingsystem.core.exception;

public class TicketReservationExpiredException extends RuntimeException {
    private String message;

    public TicketReservationExpiredException() {}

    public TicketReservationExpiredException(String msg) {
        super(msg);
        this.message = msg;
    }
}
