package com.ayman.billing.billing_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BillingBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(BillingBackendApplication.class, args);
    }
}
