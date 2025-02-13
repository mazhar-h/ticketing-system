package com.pjt.ticketingsystem.core.exception;

public class EarlyTicketException extends RuntimeException {
    private String message;

    public EarlyTicketException() {}

    public EarlyTicketException(String msg) {
        super(msg);
        this.message = msg;
    }
}
