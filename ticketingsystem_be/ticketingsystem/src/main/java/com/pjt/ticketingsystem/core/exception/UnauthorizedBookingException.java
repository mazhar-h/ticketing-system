package com.pjt.ticketingsystem.core.exception;

public class UnauthorizedBookingException extends RuntimeException {
    private String message;

    public UnauthorizedBookingException() {}

    public UnauthorizedBookingException(String msg) {
        super(msg);
        this.message = msg;
    }
}
