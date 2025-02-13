package com.pjt.ticketingsystem.core.exception;

public class BookingNotFoundException extends RuntimeException {
    private String message;

    public BookingNotFoundException() {}

    public BookingNotFoundException(String msg) {
        super(msg);
        this.message = msg;
    }
}
