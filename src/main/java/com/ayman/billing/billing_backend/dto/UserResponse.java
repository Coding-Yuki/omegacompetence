package com.ayman.billing.billing_backend.dto;

import lombok.*;

import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private UUID id;
    private String nom;
    private String email;
    private Set<String> roles;
}
