package com.pjt.ticketingsystem.core.exception;

public class InvalidTicketException extends RuntimeException {
    private String message;

    public InvalidTicketException() {}

    public InvalidTicketException(String msg) {
        super(msg);
        this.message = msg;
    }
}
