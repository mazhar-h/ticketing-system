package com.pjt.ticketingsystem.core.exception;

public class ExpiredTicketException extends RuntimeException {
    private String message;

    public ExpiredTicketException() {}

    public ExpiredTicketException(String msg) {
        super(msg);
        this.message = msg;
    }
}
