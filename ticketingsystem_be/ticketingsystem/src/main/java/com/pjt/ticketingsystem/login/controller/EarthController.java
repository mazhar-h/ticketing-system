package com.pjt.ticketingsystem.login.controller;

import com.pjt.ticketingsystem.login.dto.IPInfoGeoLocationResponse;
import com.pjt.ticketingsystem.login.service.EarthService;
import com.pjt.ticketingsystem.util.IpAddressUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class EarthController {

    private final EarthService earthService;

    public EarthController(EarthService earthService) {
        this.earthService = earthService;
    }

    @GetMapping("/api/v1/weather")
    public ResponseEntity<String> getWeather(HttpServletRequest request) {
        String ipAddress = IpAddressUtil.getClientIp(request);
        String weatherData = earthService.getWeatherByIp(ipAddress);
        return ResponseEntity.ok(weatherData);
    }

    @GetMapping("api/v1/location")
    public ResponseEntity<?> getLocation(HttpServletRequest request) {
        String ipAddress = "2.56.191.250";//IpAddressUtil.getClientIp(request);
        IPInfoGeoLocationResponse geoLocation = earthService.getGeoLocationByIp(ipAddress);
        return ResponseEntity.ok(geoLocation);
    }
}