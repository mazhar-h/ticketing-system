package com.pjt.ticketingsystem.core.service;

import com.pjt.ticketingsystem.core.dto.Performer2Dto;
import com.pjt.ticketingsystem.core.dto.PerformerDto;
import com.pjt.ticketingsystem.core.dto.RegisteredUserRequest;
import com.pjt.ticketingsystem.core.dto.RegisteredUserTemplateData;
import com.pjt.ticketingsystem.core.model.Performer;
import com.pjt.ticketingsystem.core.repository.PerformerRepository;
import com.pjt.ticketingsystem.login.exception.UserExistsException;
import com.pjt.ticketingsystem.login.model.Role;
import com.pjt.ticketingsystem.login.model.VerificationToken;
import com.pjt.ticketingsystem.login.repository.RoleRepository;
import com.pjt.ticketingsystem.login.repository.VerificationTokenRepository;
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
import java.util.LinkedList;
import java.util.List;
import java.util.UUID;

@Service
public class PerformerService {
    private final PerformerRepository performerRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final VerificationTokenRepository verificationTokenRepository;
    private static final String PATH_VERIFY_EMAIL = "/verify-email/";
    private final RestTemplate restTemplate;

    public PerformerService(PerformerRepository performerRepository, PasswordEncoder passwordEncoder,
                            RoleRepository roleRepository, VerificationTokenRepository verificationTokenRepository,
                            RestTemplate restTemplate) {
        this.performerRepository = performerRepository;
        this.passwordEncoder = passwordEncoder;
        this.roleRepository = roleRepository;
        this.verificationTokenRepository = verificationTokenRepository;
        this.restTemplate = restTemplate;
    }

    public void registerPerformer(Performer2Dto performer2Dto, String origin) throws RoleNotFoundException {
        Performer performer = new Performer();
        if (performerRepository.existsByUsername(performer2Dto.getUsername())) {
            throw new UserExistsException("Username already exists");
        }
        performer.setUsername(performer2Dto.getUsername());
        performer.setName(performer2Dto.getName());
        performer.setEmail(performer2Dto.getEmail());
        performer.setPassword(passwordEncoder.encode(performer2Dto.getPassword()));
        Role userRole = roleRepository.findByName("ROLE_PERFORMER");

        if (userRole == null)
            throw new RoleNotFoundException("Role not found");

        performer.setRoles(Collections.singleton(userRole));
        performerRepository.save(performer);

        String token = UUID.randomUUID().toString();
        VerificationToken verificationToken = new VerificationToken();
        verificationToken.setToken(token);
        verificationToken.setUser(performer);
        verificationToken.setExpiryDate(LocalDateTime.now().plusDays(1)); // Token valid for 24 hours

        verificationTokenRepository.save(verificationToken);

        String verificationUrl = origin + PATH_VERIFY_EMAIL + token;

        RegisteredUserRequest request = new RegisteredUserRequest();
        RegisteredUserTemplateData templateData = new RegisteredUserTemplateData();
        request.setTo(performer.getEmail());
        request.setSubject("Welcome! - Email Verification");
        request.setTemplate("registered-performer");
        templateData.setName(performer.getName());
        templateData.setUsername(performer.getUsername());
        templateData.setVerificationUrl(verificationUrl);
        request.setTemplateData(templateData);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<RegisteredUserRequest> requestEntity = new HttpEntity<>(request, headers);
        restTemplate.exchange("http://localhost:8081/email/registered", HttpMethod.POST, requestEntity,
                RegisteredUserRequest.class);
    }

    public List<PerformerDto> searchPerformers(String keyword) {
        List<Performer> performers = performerRepository.findEventsBySearchText(keyword);
        List<PerformerDto> performersDto = new LinkedList<>();
        performers.forEach(performer -> {
            PerformerDto performerDto = new PerformerDto();
            performerDto.setId(performer.getId());
            performerDto.setName(performer.getName());
            performersDto.add(performerDto);
        });
        return performersDto;
    }
}
