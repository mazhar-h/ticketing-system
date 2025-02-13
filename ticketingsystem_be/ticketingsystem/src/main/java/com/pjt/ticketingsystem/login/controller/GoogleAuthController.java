package com.pjt.ticketingsystem.login.controller;

import com.pjt.ticketingsystem.login.dto.AuthResponse;
import com.pjt.ticketingsystem.login.dto.GoogleAuthResponse;
import com.pjt.ticketingsystem.login.dto.GoogleLinkRequest;
import com.pjt.ticketingsystem.login.dto.SocialAuthRequest;
import com.pjt.ticketingsystem.login.exception.AccountLinkedException;
import com.pjt.ticketingsystem.login.exception.UserExistsException;
import com.pjt.ticketingsystem.login.exception.UsernameExistsException;
import com.pjt.ticketingsystem.login.service.GoogleAuthService;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.apache.http.auth.InvalidCredentialsException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.security.GeneralSecurityException;

@RestController
@RequestMapping("/api/v1/auth")
public class GoogleAuthController {

    private final GoogleAuthService googleAuthService;

    public GoogleAuthController(GoogleAuthService googleAuthService) {
        this.googleAuthService = googleAuthService;
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody String idTokenString, HttpServletResponse response) {
        try {
            GoogleAuthResponse googleAuthResponse = googleAuthService.verifyToken(idTokenString, response);
            return ResponseEntity.ok(googleAuthResponse);
        } catch (IllegalArgumentException | GeneralSecurityException | IOException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        } catch (UserExistsException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("User already exists");
        }
    }

    @PostMapping("/google/register")
    public ResponseEntity<?> googleRegister(@Valid @RequestBody SocialAuthRequest socialAuthRequest,
                                            HttpServletRequest request,
                                            HttpServletResponse response) {
        try {
           AuthResponse authResponse =  googleAuthService.register(socialAuthRequest.getUsername(),
                   request, response);
           return ResponseEntity.ok(authResponse);
        } catch (IllegalArgumentException | GeneralSecurityException | IOException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        } catch (UsernameExistsException | StripeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/google/user")
    public ResponseEntity<?> googleGetUser(HttpServletRequest request) {
        try {
            return ResponseEntity.ok(googleAuthService.getUser(request));
        } catch (IllegalArgumentException | GeneralSecurityException | IOException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        }
    }

    @PostMapping("/google/link")
    public ResponseEntity<?> googleLinkUser(@RequestBody GoogleLinkRequest googleLinkRequest,
                                            HttpServletRequest request,
                                            HttpServletResponse response) {
        try {
            return ResponseEntity.ok(googleAuthService.linkAccount(googleLinkRequest.getPassword(),
                    request, response));
        } catch (IllegalArgumentException | GeneralSecurityException | IOException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        } catch (InvalidCredentialsException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid credentials");
        } catch (AccountLinkedException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Account already linked");
        }
    }

}
