package com.pjt.ticketingsystem.core.dto;

import lombok.Data;

import java.util.List;

@Data
public class SpotifySearchArtists {
    private List<SpotifySearchArtistsItem> items;
}
