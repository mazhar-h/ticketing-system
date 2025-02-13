package com.pjt.ticketingsystem.core.service;

import com.pjt.ticketingsystem.core.model.Ticket;
import com.pjt.ticketingsystem.util.AESUtil;
import org.springframework.stereotype.Service;

@Service
public class QRCodeService {

    public String generateEncryptedQRCodeData(Ticket ticket, String secretKey) throws Exception {
        String ticketData = ticket.getId() + "@" + ticket.getEvent().getId();
        return AESUtil.encrypt(ticketData, secretKey);
    }
}
