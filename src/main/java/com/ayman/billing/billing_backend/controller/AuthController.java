package com.ayman.billing.billing_backend.controller;

import com.ayman.billing.billing_backend.domain.Utilisateur;
import com.ayman.billing.billing_backend.repository.UtilisateurRepository;
import com.ayman.billing.billing_backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public String register(@RequestBody Utilisateur utilisateur) {
        // encode le mot de passe avant sauvegarde
        utilisateur.setMotDePasse(passwordEncoder.encode(utilisateur.getMotDePasse()));
        utilisateurRepository.save(utilisateur);
        return "Utilisateur enregistré avec succès";
    }

    @PostMapping("/login")
    public String login(@RequestBody Utilisateur utilisateur) {
        // recherche par nom (pas username)
        Utilisateur user = utilisateurRepository.findByNom(utilisateur.getNom())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // vérifie le mot de passe
        if (passwordEncoder.matches(utilisateur.getMotDePasse(), user.getMotDePasse())) {
            return jwtUtil.generateToken(user.getNom()); // génère un token basé sur le nom
        } else {
            throw new RuntimeException("Mot de passe incorrect");
        }
    }
}
