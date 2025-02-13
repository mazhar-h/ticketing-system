package com.pjt.ticketingsystem.login.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.pjt.ticketingsystem.login.dto.AuthResponse;
import com.pjt.ticketingsystem.login.dto.GoogleAuthResponse;
import com.pjt.ticketingsystem.login.dto.UsernameDto;
import com.pjt.ticketingsystem.login.exception.AccountLinkedException;
import com.pjt.ticketingsystem.login.exception.UserExistsException;
import com.pjt.ticketingsystem.login.exception.UsernameExistsException;
import com.pjt.ticketingsystem.login.model.Role;
import com.pjt.ticketingsystem.login.model.User;
import com.pjt.ticketingsystem.login.repository.RoleRepository;
import com.pjt.ticketingsystem.login.repository.UserRepository;
import com.pjt.ticketingsystem.util.JwtUtil;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.param.CustomerCreateParams;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.http.auth.InvalidCredentialsException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;

@Service
public class GoogleAuthService {
    private final GoogleIdTokenVerifier verifier;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private static final int REFRESH_TOKEN_VALIDITY = 7 * 24 * 60 * 60; // 7 days

    public GoogleAuthService(UserRepository userRepository, JwtUtil jwtUtil,
                             UserDetailsService userDetailsService,
                             RoleRepository roleRepository, PasswordEncoder passwordEncoder,
                             @Value("${google.oauth.client-id}") String googleOauthClientId) {
        verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList(googleOauthClientId))
                .build();
        this. userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public GoogleAuthResponse verifyToken(String idTokenString,
                                          HttpServletResponse response) throws GeneralSecurityException, IOException {
        GoogleIdToken idToken = verifier.verify(idTokenString);

        if (idToken == null)
            throw new IllegalArgumentException("Invalid ID token.");

        GoogleIdToken.Payload payload = idToken.getPayload();
        String email = payload.getEmail();

        User user = userRepository.findByEmail(email);

        if (user == null) {
            return new GoogleAuthResponse(null);
        } else if (user.getGoogleId() == null){
            throw new UserExistsException("User already exists");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String jwtToken = jwtUtil.generateAccessToken(user.getId(), userDetails);
        String refreshToken = jwtUtil.generateRefreshToken(user.getId(), userDetails);
        createRefreshCookie(response, refreshToken);

        return new GoogleAuthResponse(jwtToken);
    }

    public AuthResponse register(String username, HttpServletRequest request,
                                 HttpServletResponse response) throws GeneralSecurityException, IOException, StripeException {
        final String authorizationHeader = request.getHeader("Authorization");
        String idTokenString = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer "))
            idTokenString = authorizationHeader.substring(7);

        GoogleIdToken idToken = verifier.verify(idTokenString);

        if (idToken == null)
            throw new IllegalArgumentException("Invalid ID token.");

        GoogleIdToken.Payload payload = idToken.getPayload();

        String userId = payload.getSubject();
        String email = payload.getEmail();

        if (userRepository.existsByUsername(username)) {
            throw new UsernameExistsException("Username already exists");
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setGoogleId(userId);
        user.setEnabled(true);
        Role userRole = roleRepository.findByName("ROLE_USER");

        if (userRole == null)
            throw new RuntimeException("Role not found");

        user.setRoles(Collections.singleton(userRole));
        CustomerCreateParams params =
                CustomerCreateParams.builder()
                        .setEmail(user.getEmail())
                        .build();
        Customer customer = Customer.create
                (params);
        user.setStripeCustomerId(customer.getId());
        userRepository.save(user);
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        user = userRepository.findByUsername(user.getUsername());
        String jwtToken = jwtUtil.generateAccessToken(user.getId(), userDetails);
        String refreshToken = jwtUtil.generateRefreshToken(user.getId(), userDetails);
        createRefreshCookie(response, refreshToken);

        return new AuthResponse(jwtToken);
    }

    public UsernameDto getUser(HttpServletRequest request) throws GeneralSecurityException, IOException {
        final String authorizationHeader = request.getHeader("Authorization");
        String idTokenString = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer "))
            idTokenString = authorizationHeader.substring(7);

        GoogleIdToken idToken = verifier.verify(idTokenString);

        if (idToken == null)
            throw new IllegalArgumentException("Invalid ID token.");

        GoogleIdToken.Payload payload = idToken.getPayload();

        String email = payload.getEmail();

        User user = userRepository.findByEmail(email);

        return new UsernameDto(user.getUsername());
    }

    public AuthResponse linkAccount(String password, HttpServletRequest request,
                                    HttpServletResponse response) throws GeneralSecurityException, IOException, InvalidCredentialsException {
        final String authorizationHeader = request.getHeader("Authorization");
        String idTokenString = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer "))
            idTokenString = authorizationHeader.substring(7);

        GoogleIdToken idToken = verifier.verify(idTokenString);

        if (idToken == null)
            throw new IllegalArgumentException("Invalid ID token.");

        GoogleIdToken.Payload payload = idToken.getPayload();

        String userId = payload.getSubject();
        String email = payload.getEmail();

        User user = userRepository.findByEmail(email);

        if (user.getGoogleId() != null && user.getGoogleId().equals(userId))
            throw new AccountLinkedException("Account already linked!");

        if (!passwordEncoder.matches(password, user.getPassword()))
            throw new InvalidCredentialsException("Invalid credentials");

        user.setGoogleId(userId);
        userRepository.save(user);
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String jwtToken = jwtUtil.generateAccessToken(user.getId(), userDetails);
        String refreshToken = jwtUtil.generateRefreshToken(user.getId(), userDetails);
        createRefreshCookie(response, refreshToken);
        return new AuthResponse(jwtToken);
    }

    private void createRefreshCookie(HttpServletResponse response, String refreshToken) {
        Cookie refreshTokenCookie = new Cookie("refreshToken", refreshToken);
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setSecure(true);
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge(REFRESH_TOKEN_VALIDITY);
        response.addCookie(refreshTokenCookie);
    }
}
