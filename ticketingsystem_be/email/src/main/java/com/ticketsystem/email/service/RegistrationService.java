package com.ticketsystem.email.service;

import com.ticketsystem.email.dto.RegisteredUserTemplateData;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class RegistrationService {

    public Map<String, Object> mapRegisteredUserRequest(RegisteredUserTemplateData templateData) {
        Map<String, Object> model = new HashMap<>();

        model.put("name", templateData.getName());
        model.put("username", templateData.getUsername());
        model.put("verificationUrl", templateData.getVerificationUrl());

        return model;
    }
}