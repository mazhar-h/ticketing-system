package com.pjt.ticketingsystem.core.dto;

import com.pjt.ticketingsystem.core.enums.TicketMasterEventStatusEnum;
import lombok.Data;

@Data
public class TicketmasterEventStatus {
    private TicketMasterEventStatusEnum code;
}
