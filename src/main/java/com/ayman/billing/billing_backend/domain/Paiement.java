package com.ayman.billing.billing_backend.domain;

import com.ayman.billing.billing_backend.enums.ModePaiement;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "paiements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Paiement {

    @Id
    @GeneratedValue
    private UUID id;

    private LocalDateTime datePaiement;
    private BigDecimal montant;

    @Enumerated(EnumType.STRING)
    private ModePaiement mode;

    private boolean valide;

    @ManyToOne
    @JoinColumn(name = "facture_id")
    private Facture facture;

    public void enregistrerPaiement(BigDecimal montant, ModePaiement mode) {
        this.montant = montant;
        this.mode = mode;
        this.datePaiement = LocalDateTime.now();
        this.valide = true;
    }

    public void validerPaiement() {
        this.valide = true;
    }
}
