package com.pjt.ticketingsystem.core.exception;

public class IllegalBookingException extends RuntimeException {
    private String message;

    public IllegalBookingException() {}

    public IllegalBookingException(String msg) {
        super(msg);
        this.message = msg;
    }
}
