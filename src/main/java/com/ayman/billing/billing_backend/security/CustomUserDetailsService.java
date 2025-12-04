package com.ayman.billing.billing_backend.security;

import com.ayman.billing.billing_backend.domain.Utilisateur;
import com.ayman.billing.billing_backend.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Override
    public UserDetails loadUserByUsername(String nom) throws UsernameNotFoundException {
        Utilisateur user = utilisateurRepository.findByNom(nom)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé"));

        return new org.springframework.security.core.userdetails.User(
                user.getNom(),
                user.getMotDePasse(),
                new java.util.ArrayList<>()
        );
    }
}
