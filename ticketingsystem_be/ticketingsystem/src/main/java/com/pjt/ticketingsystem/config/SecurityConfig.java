package com.pjt.ticketingsystem.config;

import com.pjt.ticketingsystem.login.service.SecureUserDetailsService;
import org.springframework.boot.web.servlet.server.CookieSameSiteSupplier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableScheduling
public class SecurityConfig{

    private JwtRequestFilter jwtRequestFilter;
    private SecureUserDetailsService secureUserDetailsService;

    public SecurityConfig(JwtRequestFilter jwtRequestFilter, SecureUserDetailsService secureUserDetailsService) {
        this.jwtRequestFilter = jwtRequestFilter;
        this.secureUserDetailsService = secureUserDetailsService;
    }

    @Bean
    public CookieSameSiteSupplier applicationCookieSameSiteSupplier() {
        return CookieSameSiteSupplier.ofNone();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:4200", "https://mazhar-h.github.io",
                "https://login.mazharhossain.com", "https://www.turnstileticket.com", "https://mazharhossain.com"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE"));
        configuration.setAllowCredentials(true);
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Cache-Control", "Content-Type"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.cors(Customizer.withDefaults()).csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                .requestMatchers("/").permitAll()
                .requestMatchers("api/v1/ticketing/spotify/artist/top-tracks").permitAll()
                .requestMatchers("api/v1/location").permitAll()
                .requestMatchers("api/v1/login", "api/v1/users/register", "api/v1/refresh-token", "api/v1/logout",
                        "api/v1/users/forgot-password", "api/v1/users/reset-password", "api/v1/users/verify-email",
                        "api/v1/users/resend-verification", "api/v1/users/forgot-username",
                        "api/v1/users/confirm-email").permitAll()
                .requestMatchers("api/v1/auth/google/**", "api/v1/auth/facebook/**").permitAll()
                .requestMatchers("api/v1/ticketing/bookings/user", "api/v1/ticketing/bookings/reserve",
                        "api/v1/ticketing/bookings/confirm", "api/v1/ticketing/bookings/release").hasAnyRole("ADMIN", "USER")
                 .requestMatchers("api/v1/ticketing/bookings/guest/start", "api/v1/ticketing/bookings/guest/reserve",
                         "api/v1/ticketing/bookings/guest/confirm", "api/v1/ticketing/bookings/guest/release").permitAll()
                .requestMatchers("api/v1/ticketing/events/search").permitAll()
                .requestMatchers(HttpMethod.GET, "api/v1/ticketing/events/*", "api/v1/ticketing/events").permitAll()
                .requestMatchers(HttpMethod.POST, "api/v1/ticketing/events").hasRole("VENUE")
                .requestMatchers(HttpMethod.PUT, "api/v1/ticketing/events/*").hasRole("VENUE")
                .requestMatchers("api/v1/ticketing/events/venue", "api/v1/ticketing/events/*/bookings").hasRole("VENUE")
                .requestMatchers("api/v1/payments/stripe/guest/create-payment-intent",
                        "api/v1/payments/stripe/guest/total-and-fee").permitAll()
                .requestMatchers("api/v1/payments/stripe/session", "api/v1/payments/stripe/express-dashboard",
                        "api/v1/payments/stripe/onboarding/status", "api/v1/payments/stripe/onboarding").hasRole("VENUE")
                .requestMatchers("api/v1/ticketing/tickets/validate").hasRole("VENUE")
                .requestMatchers("api/v1/ticketing/venues/register").permitAll()
                .requestMatchers("api/v1/ticketing/performers/register").permitAll()
                .requestMatchers("api/v1/admin/hello", "api/v1/admin/users/**").hasRole("ADMIN")
                .anyRequest().authenticated()
                ).sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager myAuthenticationManager() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(secureUserDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider::authenticate;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}