package com.ayman.billing.billing_backend.domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "roles",
        indexes = {
                @Index(name = "idx_roles_name", columnList = "name", unique = true)
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ADMIN, COMPTABLE, COMMERCIAL, LECTEUR
    @Column(nullable = false, unique = true)
    private String name;

    @ManyToMany(mappedBy = "roles")
    @Builder.Default
    private Set<Utilisateur> users = new HashSet<>();
}
