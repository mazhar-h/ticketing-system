package com.pjt.ticketingsystem.util;

import com.pjt.ticketingsystem.core.model.Performer;
import com.pjt.ticketingsystem.core.model.Venue;
import com.pjt.ticketingsystem.login.model.Role;
import com.pjt.ticketingsystem.login.model.User;
import com.pjt.ticketingsystem.login.repository.RoleRepository;
import com.pjt.ticketingsystem.login.repository.UserRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.Account;
import com.stripe.model.Customer;
import com.stripe.param.AccountCreateParams;
import com.stripe.param.CustomerCreateParams;
import jakarta.annotation.PostConstruct;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Collections;
import java.util.Set;

@Component
public class DataSeeder {

    private RoleRepository roleRepository;
    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;

    public DataSeeder(RoleRepository roleRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostConstruct
    public void seedData() {
        if (roleRepository.count() == 0) {
            Role userRole = new Role("ROLE_USER");
            Role adminRole = new Role("ROLE_ADMIN");
            Role venuRole = new Role("ROLE_VENUE");
            Role performerRole = new Role("ROLE_PERFORMER");


            roleRepository.saveAll(Arrays.asList(userRole, adminRole, venuRole, performerRole));
        }
        if (userRepository.count() == 0) {
            User user = new User();
            user.setUsername("bob");
            user.setEmail("hossains.mazhar@gmail.com");
            user.setPassword(passwordEncoder.encode("1234567"));
            user.setEnabled(true);
            Role userRole = roleRepository.findByName("ROLE_ADMIN");
            user.setRoles(Collections.singleton(userRole));

            CustomerCreateParams customerCreateParam =
                    CustomerCreateParams.builder()
                            .setEmail(user.getEmail())
                            .build();
            Customer customer = null;
            try {
                customer = Customer.create
                        (customerCreateParam);
            } catch (StripeException e) {
                throw new RuntimeException(e);
            }
            user.setStripeCustomerId(customer.getId());

            Venue user2 = new Venue();
            user2.setUsername("xanasdarkra");
            user2.setName("Club Dada");
            user2.setEmail("gethefreeoranges@gmail.com");
            user2.setPassword(passwordEncoder.encode("1234567"));
            user2.setEnabled(true);
            Role userRole4 = roleRepository.findByName("ROLE_VENUE");
            user2.setRoles(Set.of(userRole4));

            AccountCreateParams params = AccountCreateParams.builder()
                    .setController(
                            AccountCreateParams.Controller.builder()
                                    .setStripeDashboard(
                                            AccountCreateParams.Controller.StripeDashboard.builder()
                                                    .setType(AccountCreateParams.Controller.StripeDashboard.Type.EXPRESS)
                                                    .build()
                                    )
                                    .setFees(
                                            AccountCreateParams.Controller.Fees.builder()
                                                    .setPayer(AccountCreateParams.Controller.Fees.Payer.APPLICATION)
                                                    .build()
                                    )
                                    .setLosses(
                                            AccountCreateParams.Controller.Losses.builder()
                                                    .setPayments(AccountCreateParams.Controller.Losses.Payments.APPLICATION)
                                                    .build()
                                    )
                                    .setRequirementCollection(
                                            AccountCreateParams.Controller.RequirementCollection.STRIPE
                                    )
                                    .build()
                    )
                    .setEmail(user2.getEmail())
                    .setCapabilities(AccountCreateParams.Capabilities.builder()
                            .setTransfers(AccountCreateParams.Capabilities.Transfers.builder().setRequested(true).build())
                            .build())
                    .build();

            Account account = null;
            try {
                account = Account.create(params);
            } catch (StripeException e) {
                throw new RuntimeException(e);
            }
            String accountId = account.getId();
            user2.setStripeAccountId(accountId);

            Performer user3 = new Performer();
            user3.setUsername("wow");
            user3.setName("Soulja Boy");
            user3.setEmail("mh.testdev@gmail.com");
            user3.setPassword(passwordEncoder.encode("1234567"));
            user3.setEnabled(true);
            Role userRole5 = roleRepository.findByName("ROLE_PERFORMER");
            user3.setRoles(Set.of(userRole5));
            userRepository.save(user);
            userRepository.save(user2);
            userRepository.save(user3);
        }
    }
}