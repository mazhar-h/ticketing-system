package com.pjt.ticketingsystem.login.service;

import com.pjt.ticketingsystem.core.dto.RegisteredUserRequest;
import com.pjt.ticketingsystem.core.dto.RegisteredUserTemplateData;
import com.pjt.ticketingsystem.login.dto.*;
import com.pjt.ticketingsystem.login.exception.UserExistsException;
import com.pjt.ticketingsystem.login.model.*;
import com.pjt.ticketingsystem.login.repository.*;
import com.pjt.ticketingsystem.util.JwtUtil;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.param.CustomerCreateParams;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.management.relation.RoleNotFoundException;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RoleRepository roleRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final VerificationTokenRepository verificationTokenRepository;
    private final EmailTokenRepository emailTokenRepository;
    private final RestTemplate restTemplate;

    private static final String PATH_RESET_PASSWORD = "/reset-password/";
    private static final String PATH_VERIFY_EMAIL = "/verify-email/";

    public void registerUser(UserDto userDto, String origin) throws RoleNotFoundException, StripeException {
        User user = new User();
        if (userRepository.existsByUsername(userDto.getUsername())) {
            throw new UserExistsException("Username already exists");
        }
        user.setUsername(userDto.getUsername());
        user.setEmail(userDto.getEmail());
        user.setPassword(passwordEncoder.encode(userDto.getPassword()));
        Role userRole = roleRepository.findByName("ROLE_USER");

        if (userRole == null)
            throw new RoleNotFoundException("Role not found");

        user.setRoles(Collections.singleton(userRole));

        CustomerCreateParams params =
                CustomerCreateParams.builder()
                        .setEmail(user.getEmail())
                        .build();
        Customer customer = Customer.create
                (params);
        user.setStripeCustomerId(customer.getId());
        userRepository.save(user);

        String token = UUID.randomUUID().toString();
        VerificationToken verificationToken = new VerificationToken();
        verificationToken.setToken(token);
        verificationToken.setUser(user);
        verificationToken.setExpiryDate(LocalDateTime.now().plusDays(1)); // Token valid for 24 hours

        verificationTokenRepository.save(verificationToken);

        String verificationUrl = origin + PATH_VERIFY_EMAIL + token;

        RegisteredUserRequest request = new RegisteredUserRequest();
        RegisteredUserTemplateData templateData = new RegisteredUserTemplateData();
        request.setTo(user.getEmail());
        request.setSubject("Welcome! - Email Verification");
        request.setTemplate("registered-user");
        templateData.setUsername(user.getUsername());
        templateData.setVerificationUrl(verificationUrl);
        request.setTemplateData(templateData);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<RegisteredUserRequest> requestEntity = new HttpEntity<>(request, headers);
        restTemplate.exchange("http://localhost:8081/email/registered", HttpMethod.POST, requestEntity,
                RegisteredUserRequest.class);
    }

    public boolean isUserCredentialsValid(String username, String password) {
        User user = userRepository.findByUsername(username);

        if (user.getUsername().equals(username) && passwordEncoder.matches(password, user.getPassword()))
            return true;

        return false;
    }

    public String getUsername(HttpServletRequest request) {
        String token = jwtUtil.extractJwtFromRequest(request);
        return jwtUtil.extractUsername(token);
    }

    public List<UsernameEmailDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> new UsernameEmailDto(user.getUsername(), user.getEmail()))
                .collect(Collectors.toList());
    }

    public UserGetResponse getUser(String username) {
        User user = userRepository.findByUsername(username);
        return new UserGetResponse(user.getId(), user.getUsername(), user.isEnabled(),
                user.getRoles().stream().map(this::convertToDto).collect(Collectors.toSet()));
    }

    public UsernameEmailDto getEmailByToken(HttpServletRequest request) {
        String token = jwtUtil.extractJwtFromRequest(request);
        String username = jwtUtil.extractUsername(token);
        User user = userRepository.findByUsername(username);
        if (user == null)
            return null;
        return new UsernameEmailDto(username, user.getEmail());
    }

    public UserGetResponse getUserByToken(HttpServletRequest request) {
        String token = jwtUtil.extractJwtFromRequest(request);
        String username = jwtUtil.extractUsername(token);
        User user = userRepository.findByUsername(username);
        if (user == null)
            return null;
        return new UserGetResponse(user.getId(), user.getUsername(), user.isEnabled(),
                user.getRoles().stream().map(this::convertToDto).collect(Collectors.toSet()));
    }

    private RoleDto convertToDto(Role role) {
        return new RoleDto(role.getName());
    }

    public boolean createUser(UserCreateDto userCreateDto, String origin) {
        User user = userRepository.findByUsername(userCreateDto.getUsername());
        if (user != null)
            return false;

        user = userRepository.findByEmail(userCreateDto.getEmail());

        if (user != null)
            return false;

        User newUser = new User();

        newUser.setEnabled(true);

        newUser.setUsername(userCreateDto.getUsername());
        newUser.setEmail(userCreateDto.getEmail());

        Role userRole = roleRepository.findByName(userCreateDto.getRole());
        if (userRole != null)
            newUser.setRoles(Collections.singleton(userRole));
        else
            return false;

        userRepository.save(newUser);

        processForgotPassword(newUser.getEmail(), origin);

        return true;
    }

    public boolean updatePassword(String currentPassword, String newPassword, HttpServletRequest request) {
        String token = jwtUtil.extractJwtFromRequest(request);
        String username = jwtUtil.extractUsername(token);
        User user = userRepository.findByUsername(username);

        if (user == null)
            return false;

        if (!passwordEncoder.matches(currentPassword, user.getPassword()))
            return false;

        user.setPassword(passwordEncoder.encode(newPassword));

        userRepository.save(user);

        return true;
    }

    public boolean updateUser(String currentUsername, String newUsername, String newEmail, String newRole) {
        User user = userRepository.findByUsername(currentUsername);
        if (user == null)
            return false;

        if (newUsername != null && !userRepository.existsByUsername(newUsername))
            user.setUsername(newUsername);

        if (newEmail != null && !userRepository.existsByEmail(newEmail)) {
            user.setEmail(newEmail);
            user.setEnabled(true);
        }

        Role userRole = roleRepository.findByName(newRole);
        if (userRole != null) {
            user.getRoles().add(userRole);
            user.setRoles(user.getRoles());
        }

        userRepository.save(user);
        return true;
    }

    @Transactional
    public boolean deleteUserByUsername(String username) {
        if (userRepository.existsByUsername(username) && !username.equalsIgnoreCase("bob")) {
            userRepository.deleteByUsername(username);
            return true;
        }
        return false;
    }

    @Transactional
    public boolean deleteUser(HttpServletRequest request) {
        String token = jwtUtil.extractJwtFromRequest(request);
        String username = jwtUtil.extractUsername(token);
        if (username.equalsIgnoreCase("bob"))
            return false;
        if (userRepository.existsByUsername(username)) {
            userRepository.deleteByUsername(username);
            return true;
        }
        return false;
    }

    public boolean verifyUserEmail(String token) {
        Optional<VerificationToken> verificationTokenOpt = verificationTokenRepository.findByToken(token);
        if (verificationTokenOpt.isEmpty()) {
            return false;
        }

        VerificationToken verificationToken = verificationTokenOpt.get();
        if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            return false;
        }

        User user = verificationToken.getUser();
        user.setEnabled(true);
        userRepository.save(user);

        verificationTokenRepository.delete(verificationToken);

        return true;
    }

    public boolean resendVerificationEmail(String username, String origin) {
        User user = userRepository.findByUsername(username);
        if (user == null || user.isEnabled()) {
            return false;
        }
        VerificationToken token = verificationTokenRepository.findByUserId(user.getId());

        String verificationUrl = origin + PATH_VERIFY_EMAIL + token.getToken();

        EmailVerificationRequest request = new EmailVerificationRequest();
        EmailVerificationRequestTemplateData templateData = new EmailVerificationRequestTemplateData();
        request.setTo(user.getEmail());
        request.setSubject("Turnstile Tickets - Email Verification");
        request.setTemplate("verify-email");
        templateData.setUsername(user.getUsername());
        templateData.setVerificationUrl(verificationUrl);
        request.setTemplateData(templateData);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<EmailVerificationRequest> requestEntity = new HttpEntity<>(request, headers);
        restTemplate.exchange("http://localhost:8081/email/verify-email", HttpMethod.POST, requestEntity,
                EmailVerificationRequest.class);

        return true;
    }

    public boolean processForgotPassword(String email, String origin) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            return false;
        }

        Optional<PasswordResetToken> passwordResetToken = passwordResetTokenRepository.findByUserId(user.getId());

        passwordResetToken.ifPresent(passwordResetTokenRepository::delete);

        String token = UUID.randomUUID().toString();
        PasswordResetToken passwordResetToken2 = new PasswordResetToken();
        passwordResetToken2.setToken(token);
        passwordResetToken2.setUser(user);
        passwordResetToken2.setExpiryDate(LocalDateTime.now().plusHours(24));  // Token valid for 24 hours

        passwordResetTokenRepository.save(passwordResetToken2);

        String resetLink = origin + PATH_RESET_PASSWORD + token;

        ForgotPasswordRequest request = new ForgotPasswordRequest();
        ForgotPasswordRequestTemplateData templateData = new ForgotPasswordRequestTemplateData();
        request.setTo(user.getEmail());
        request.setSubject("Turnstile Tickets - Reset Password");
        request.setTemplate("reset-password");
        templateData.setUsername(user.getUsername());
        templateData.setResetUrl(resetLink);
        request.setTemplateData(templateData);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<ForgotPasswordRequest> requestEntity = new HttpEntity<>(request, headers);
        restTemplate.exchange("http://localhost:8081/email/reset-password", HttpMethod.POST, requestEntity,
                ForgotPasswordRequest.class);

        return true;
    }

    public boolean processForgotUsername(String email, String origin) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            return false;
        }

        ForgotUsernameRequest request = new ForgotUsernameRequest();
        ForgotUsernameRequestTemplateData templateData = new ForgotUsernameRequestTemplateData();
        request.setTo(user.getEmail());
        request.setSubject("Turnstile Tickets - Forgotten Username");
        request.setTemplate("forgot-username");
        templateData.setUsername(user.getUsername());
        templateData.setLoginUrl(origin + "/login");
        request.setTemplateData(templateData);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<ForgotUsernameRequest> requestEntity = new HttpEntity<>(request, headers);
        restTemplate.exchange("http://localhost:8081/email/forgot-username", HttpMethod.POST, requestEntity,
                ForgotUsernameRequest.class);

        return true;
    }

    public boolean resetPassword(String token, String newPassword) {
        Optional<PasswordResetToken> passwordResetTokenOpt = passwordResetTokenRepository.findByToken(token);
        if (newPassword == null || passwordResetTokenOpt.isEmpty()) {
            return false;
        }

        PasswordResetToken passwordResetToken = passwordResetTokenOpt.get();
        if (passwordResetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            return false;
        }

        User user = passwordResetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        passwordResetTokenRepository.delete(passwordResetToken);

        return true;
    }

    public boolean initiateEmailUpdate(String username, String newEmail, String origin) {
        User user = userRepository.findByUsername(username);

        if (userRepository.existsByEmail(newEmail))
            return false;

        Optional<EmailToken> emailToken = emailTokenRepository.findByUserId(user.getId());

        emailToken.ifPresent(emailTokenRepository::delete);

        String token = UUID.randomUUID().toString();
        EmailToken emailToken2 = new EmailToken(user, token, newEmail);
        emailTokenRepository.save(emailToken2);

        String confirmationUrl = origin + "/confirm-email/" + token;

        ConfirmEmailRequest request = new ConfirmEmailRequest();
        ConfirmEmailRequestTemplateData templateData = new ConfirmEmailRequestTemplateData();
        request.setTo(newEmail);
        request.setSubject("Turnstile Tickets - Confirm Your Email");
        request.setTemplate("confirm-email");
        templateData.setUsername(user.getUsername());
        templateData.setConfirmationUrl(confirmationUrl);
        request.setTemplateData(templateData);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<ConfirmEmailRequest> requestEntity = new HttpEntity<>(request, headers);
        restTemplate.exchange("http://localhost:8081/email/confirm-email", HttpMethod.POST, requestEntity,
                ConfirmEmailRequest.class);

        return true;
    }


    public boolean confirmEmailUpdate(String token) {
        Optional<EmailToken> emailTokenOpt = emailTokenRepository.findByToken(token);

        if (emailTokenOpt.isEmpty()) {
            return false;
        }

        EmailToken emailToken = emailTokenOpt.get();

        if (emailToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            return false;
        }

        User user = emailToken.getUser();
        user.setEmail(emailToken.getNewEmail());
        userRepository.save(user);

        emailTokenRepository.delete(emailToken);

        return true;
    }
}
