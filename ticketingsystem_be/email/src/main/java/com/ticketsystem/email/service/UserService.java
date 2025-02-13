package com.ticketsystem.email.service;

import com.ticketsystem.email.dto.*;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class UserService {
    public Map<String, Object> mapConfirmEmailRequest(ConfirmEmailRequestTemplateData templateData) {
        Map<String, Object> model = new HashMap<>();

        model.put("name", templateData.getUsername());
        model.put("confirmationUrl", templateData.getConfirmationUrl());

        return model;
    }

    public Map<String, Object> mapForgotUsernameRequest(ForgotUsernameRequestTemplateData templateData) {
        Map<String, Object> model = new HashMap<>();

        model.put("name", templateData.getUsername());
        model.put("username", templateData.getUsername());
        model.put("loginUrl", templateData.getLoginUrl());

        return model;
    }

    public Map<String, Object> mapResetPasswordRequest(ForgotPasswordRequestTemplateData templateData) {
        Map<String, Object> model = new HashMap<>();

        model.put("name", templateData.getUsername());
        model.put("resetPasswordUrl", templateData.getResetUrl());

        return model;
    }

    public Map<String, Object> mapEmailVerificationRequest(EmailVerificationRequestTemplateData templateData) {
        Map<String, Object> model = new HashMap<>();

        model.put("name", templateData.getUsername());
        model.put("verificationUrl", templateData.getVerificationUrl());

        return model;
    }
}
