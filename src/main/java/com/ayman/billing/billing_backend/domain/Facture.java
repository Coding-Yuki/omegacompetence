package com.ayman.billing.billing_backend.domain;

import com.ayman.billing.billing_backend.enums.StatutFacture;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "factures")
@Getter
@Setter   // ✅ génère tous les getters/setters (getTotalHT, setStatut, etc.)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Facture {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false, unique = true)
    private String numero;

    private LocalDate dateEmission;
    private LocalDate dateEcheance;

    @Enumerated(EnumType.STRING)
    private StatutFacture statut;

    @Column(precision = 15, scale = 2)
    private BigDecimal totalHT;

    @Column(precision = 15, scale = 2)
    private BigDecimal totalTVA;

    @Column(precision = 15, scale = 2)
    private BigDecimal totalTTC;

    @ManyToOne
    @JoinColumn(name = "client_id")
    private Client client;

    @OneToMany(mappedBy = "facture", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LigneFacture> lignes;

    @OneToMany(mappedBy = "facture", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Paiement> paiements;

    @OneToMany(mappedBy = "facture", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Avoir> avoirs;

    @OneToMany(mappedBy = "facture", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<JournalAudit> audits;
}
