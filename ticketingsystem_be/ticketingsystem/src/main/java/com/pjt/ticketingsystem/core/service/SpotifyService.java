package com.pjt.ticketingsystem.core.service;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.pjt.ticketingsystem.core.dto.SpotifySearchArtistsItem;
import com.pjt.ticketingsystem.core.dto.SpotifySearchResponse;
import com.pjt.ticketingsystem.core.dto.SpotifyTopTracksResponse;
import com.pjt.ticketingsystem.util.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class SpotifyService {

    private final RestTemplate restTemplate;
    @Value("${spotify.client-id}")
    private String spotifyClientId;
    @Value("${spotify.client-secret}")
    private String spotifyClientSecret;
    private final String tokenUrl = "https://accounts.spotify.com/api/token";
    private final String searchUrl = "https://api.spotify.com/v1/search";
    private final String topTracksUrl = "https://api.spotify.com/v1/artists/";
    private String accessToken;
    private long expiryTime;

    public SpotifyService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
        accessToken = null;
        expiryTime = 0;
    }

    public void setToken(String token) {
        this.accessToken = token;
        this.expiryTime = System.currentTimeMillis() + (3600 * 1000);
    }

    public boolean isTokenExpired() {
        return System.currentTimeMillis() > expiryTime;
    }

    public String getAccessToken() {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        String body = "grant_type=client_credentials&client_id=" + spotifyClientId + "&client_secret=" + spotifyClientSecret;

        HttpEntity<String> request = new HttpEntity<>(body, headers);

        ResponseEntity<String> response = restTemplate.exchange(
                tokenUrl,
                HttpMethod.POST,
                request,
                String.class
        );

        JsonObject jsonObject = JsonParser.parseString(response.getBody()).getAsJsonObject();
        return jsonObject.get("access_token").getAsString();
    }

    public String getArtistId(String artist) {
        if (accessToken == null || isTokenExpired())
            setToken(getAccessToken());

        String url = searchUrl + "?q=" + artist + "&type=artist&limit=1";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);

        HttpEntity<String> request = new HttpEntity<>(headers);
        ResponseEntity<SpotifySearchResponse> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                request,
                SpotifySearchResponse.class
        );
        if (response.getBody().getArtists().getItems().size() > 0) {
            return response.getBody().getArtists().getItems().get(0).getId();
        } else {
            return null;
        }
    }

    public SpotifyTopTracksResponse getPreviewUrl(String artistId) {
        if (accessToken == null || isTokenExpired())
            setToken(getAccessToken());

        String url = topTracksUrl + artistId + "/top-tracks";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);

        HttpEntity<String> request = new HttpEntity<>(headers);
        ResponseEntity<SpotifyTopTracksResponse> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                request,
                SpotifyTopTracksResponse.class
        );

        return response.getBody();
    }
}
