package com.pjt.ticketingsystem.core.controller;

import com.pjt.ticketingsystem.core.dto.SpotifyTopTracksResponse;
import com.pjt.ticketingsystem.core.service.SpotifyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/ticketing")
public class SpotifyController {

    private final SpotifyService spotifyService;

    public SpotifyController(SpotifyService spotifyService) {
        this.spotifyService = spotifyService;
    }

    @GetMapping("/spotify/artist/top-tracks")
    public ResponseEntity<?> getTopTracks(@RequestParam String artist) {
        String id = spotifyService.getArtistId(artist);
        SpotifyTopTracksResponse response = spotifyService.getPreviewUrl(id);
        return ResponseEntity.ok(response);
    }
}
