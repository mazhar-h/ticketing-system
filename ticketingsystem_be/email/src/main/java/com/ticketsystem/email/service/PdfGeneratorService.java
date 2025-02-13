package com.ticketsystem.email.service;

import com.itextpdf.html2pdf.HtmlConverter;

import jakarta.mail.util.ByteArrayDataSource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.Map;

@Service
public class PdfGeneratorService {

    private final PdfService pdfService;

    public PdfGeneratorService(PdfService pdfService) {
        this.pdfService = pdfService;
    }

    public ByteArrayDataSource generatePdfFromHtml(String templateName, Map<String, Object> variables) {
        String htmlContent = pdfService.renderTemplate(templateName, variables);
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        HtmlConverter.convertToPdf(htmlContent, outputStream);

        return new ByteArrayDataSource(outputStream.toByteArray(), "application/pdf");
    }
}