package com.ticketsystem.email.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.util.ByteArrayDataSource;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.util.List;
import java.util.Map;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final MimeMessageHelperFactory mimeMessageHelperFactory;
    private final SpringTemplateEngine templateEngine;

    public EmailService(JavaMailSender mailSender, MimeMessageHelperFactory mimeMessageHelperFactory,
                        SpringTemplateEngine templateEngine) {
        this.mailSender = mailSender;
        this.mimeMessageHelperFactory = mimeMessageHelperFactory;
        this.templateEngine = templateEngine;
    }

    public void sendHtmlEmailWithTemplate(String to, String subject, String templateName,
                          Map<String, Object> templateModel) {
        try {
            Context context = new Context();
            context.setVariables(templateModel);

            String htmlContent = templateEngine.process(templateName, context);
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = mimeMessageHelperFactory.create(mimeMessage);

            helper.setFrom("noreply@mazharhossain.com");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(mimeMessage);
        }  catch (MailException e) {
            throw new RuntimeException("Failed to send email due to MailException", e);
        } catch (MessagingException e) {
            throw new RuntimeException(e);
        }
    }

    public void sendEmailWithAttachment(
            String toEmail,
            String subject,
            String templateName,
            Map<String, Object> templateModel,
            List<ByteArrayDataSource> attachments) {

        try {
            // Prepare the Thymeleaf context with variables
            Context context = new Context();
            context.setVariables(templateModel);

            // Generate the HTML content using Thymeleaf
            String htmlContent = templateEngine.process(templateName, context);

            // Create a MIME message for the email
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = mimeMessageHelperFactory.create(message);

            helper.setFrom("noreply@mazharhossain.com");
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            // Attach the PDF files
            int counter = 0;
            for (ByteArrayDataSource attachment : attachments) {
                attachment.setName("ticket" + counter++);
                helper.addAttachment(attachment.getName(), attachment);
            }

            // Send the email
            mailSender.send(message);
        }  catch (MailException e) {
            throw new RuntimeException("Failed to send email due to MailException", e);
        } catch (MessagingException e) {
            throw new RuntimeException(e);
        }
    }
}