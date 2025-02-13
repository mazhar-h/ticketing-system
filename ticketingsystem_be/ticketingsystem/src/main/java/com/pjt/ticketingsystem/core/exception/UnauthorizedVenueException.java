package com.pjt.ticketingsystem.core.exception;

public class UnauthorizedVenueException extends RuntimeException {
    private String message;

    public UnauthorizedVenueException() {}

    public UnauthorizedVenueException(String msg) {
        super(msg);
        this.message = msg;
    }
}
