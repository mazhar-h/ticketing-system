package com.pjt.ticketingsystem.login.service;

import com.pjt.ticketingsystem.core.dto.OSMGeoLocationResponse;
import com.pjt.ticketingsystem.login.dto.IPInfoGeoLocationResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Optional;

@Service
public class EarthService {

    @Value("${openweathermap.api.key}")
    private String weatherApiKey;
    private static final String QUERY_PARAM_APPID = "&appid=" ;
    private static final String QUERY_PARAM_UNITS = "&units=imperial" ;
    private static final String OPENWEATHERMAP_BASEURL = "http://api.openweathermap.org/data/2.5/weather?";

    @Value("${ipinfo.api.key}")
    private String ipinfoApiKey;
    private static final String QUERY_PARAM_TOKEN = "&token=" ;
    private static final String IPINFO_BASEURL = "http://ipinfo.io/";
    private final RestTemplate restTemplate;
    private static final double EARTH_RADIUS = 6371;

    public EarthService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String getWeatherByIp(String ipAddress) {
        IPInfoGeoLocationResponse location = getGeoLocationByIp(ipAddress);
        String[] latLongValues = location.getLoc().split(",");
        String latParam = "&lat=" + latLongValues[0];
        String longParam = "&lon=" + latLongValues[1];
        String appIdKeyParam = QUERY_PARAM_APPID + weatherApiKey;
        String url = OPENWEATHERMAP_BASEURL + latParam + longParam + QUERY_PARAM_UNITS + appIdKeyParam;
        return restTemplate.getForObject(url, String.class);
    }

    public IPInfoGeoLocationResponse getGeoLocationByIp(String ipAddress) {
        String url = IPINFO_BASEURL + ipAddress + "?" + QUERY_PARAM_TOKEN + ipinfoApiKey;
        return restTemplate.getForObject(url, IPInfoGeoLocationResponse.class);
    }

    public Optional<OSMGeoLocationResponse> getGeoLocationByAddress(String address) {
        String encodedAddress = address.replace(" ", "+");
        String url = "https://nominatim.openstreetmap.org/search";
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(url)
                .queryParam("q", encodedAddress)
                .queryParam("format", "json")
                .queryParam("addressdetails", "1");

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.add("User-Agent", "TurnstileTicket/1.0 (mh.testdev@gmail.com)");

            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<OSMGeoLocationResponse[]> response = restTemplate.exchange(
                    builder.toUriString(),
                    HttpMethod.GET,
                    entity,
                    OSMGeoLocationResponse[].class
            );

            OSMGeoLocationResponse[] geoLocationResponses = response.getBody();

            if (geoLocationResponses != null && geoLocationResponses.length > 0) {
                return Optional.of(geoLocationResponses[0]);
            }
        } catch (Exception e) {
            System.err.println("Error retrieving coordinates: " + e.getMessage());
        }

        return Optional.empty();
    }

    public double calculateDistanceInMiles(double startLat, double startLong, double endLat, double endLong) {

        double dLat = Math.toRadians((endLat - startLat));
        double dLong = Math.toRadians((endLong - startLong));

        startLat = Math.toRadians(startLat);
        endLat = Math.toRadians(endLat);

        double a = haversine(dLat) + Math.cos(startLat) * Math.cos(endLat) * haversine(dLong);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return kmToMiles(EARTH_RADIUS * c);
    }

    public double haversine(double val) {
        return Math.pow(Math.sin(val / 2), 2);
    }

    public double kmToMiles(double kilometers) {
        return kilometers/1.609344;
    }
}