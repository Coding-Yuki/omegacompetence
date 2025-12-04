package com.ayman.billing.billing_backend.repository;

import com.ayman.billing.billing_backend.domain.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UtilisateurRepository extends JpaRepository<Utilisateur, UUID> {
    // ✅ recherche par nom (champ défini dans Utilisateur)
    Optional<Utilisateur> findByNom(String nom);

    // ✅ vérifie si un email existe déjà
    boolean existsByEmail(String email);
}
