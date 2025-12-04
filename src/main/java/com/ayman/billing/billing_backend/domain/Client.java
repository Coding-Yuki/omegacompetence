package com.ayman.billing.billing_backend.domain;

import com.ayman.billing.billing_backend.enums.StatutClient;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "clients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Client {

    @Id
    @GeneratedValue
    private UUID id;

    private String raisonSociale;
    private String email;
    private String telephone;

    @Enumerated(EnumType.STRING)
    private StatutClient statut;

    @OneToMany(mappedBy = "client", cascade = CascadeType.ALL)
    private List<Facture> factures;

    public void creerClient(String raisonSociale, String email, String telephone) {
        this.raisonSociale = raisonSociale;
        this.email = email;
        this.telephone = telephone;
        this.statut = StatutClient.ACTIF;
    }

    public void modifierClient(String email, String telephone) {
        this.email = email;
        this.telephone = telephone;
    }
}
