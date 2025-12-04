package com.ayman.billing.billing_backend.controller;

import com.ayman.billing.billing_backend.domain.Utilisateur;
import com.ayman.billing.billing_backend.dto.UserResponse;
import com.ayman.billing.billing_backend.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UtilisateurRepository utilisateurRepository;

    @GetMapping("/me")
    public UserResponse getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        Utilisateur user = utilisateurRepository.findByNom(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        return UserResponse.builder()
                .id(user.getId())
                .nom(user.getNom())
                .email(user.getEmail())
                .roles(user.getRoles().stream()
                        .map(role -> role.getNom()) // ou getName() selon ton modèle
                        .collect(Collectors.toSet()))
                .build();
    }
}
