package com.pjt.ticketingsystem.login.exception;

public class UserExistsException extends RuntimeException {
    private String message;

    public UserExistsException() {}

    public UserExistsException(String msg) {
        super(msg);
        this.message = msg;
    }
}
