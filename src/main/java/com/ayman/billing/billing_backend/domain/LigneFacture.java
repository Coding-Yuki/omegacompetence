package com.ayman.billing.billing_backend.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "lignes_facture")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LigneFacture {

    @Id
    @GeneratedValue
    private UUID id;

    private BigDecimal quantite;
    private BigDecimal prixUnitaireHt; // cohérence camelCase
    private BigDecimal tva;            // taux en %

    // champs persistés si tu veux garder les montants calculés
    private BigDecimal montantHt;
    private BigDecimal montantTva;
    private BigDecimal montantTtc;

    @ManyToOne
    @JoinColumn(name = "facture_id")
    private Facture facture;

    @ManyToOne
    @JoinColumn(name = "produit_id")
    private Produit produit;

    public BigDecimal getMontantHT() {
        if (prixUnitaireHt == null || quantite == null) return BigDecimal.ZERO;
        return prixUnitaireHt.multiply(quantite);
    }

    public BigDecimal getMontantTVA() {
        BigDecimal taux = tva != null ? tva : BigDecimal.ZERO;
        return getMontantHT().multiply(taux).divide(BigDecimal.valueOf(100));
    }

    public BigDecimal getMontantTTC() {
        return getMontantHT().add(getMontantTVA());
    }

    public void calculerTotalLigne() {
        this.montantHt = getMontantHT();
        this.montantTva = getMontantTVA();
        this.montantTtc = getMontantTTC();
    }
}
