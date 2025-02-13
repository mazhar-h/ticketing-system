package com.pjt.ticketingsystem.core.dto;

import lombok.Data;

import java.util.List;

@Data
public class TicketmasterEventAttraction {
    private String name;
    private List<TicketmasterEventAttractionClassifications> classifications;
}
