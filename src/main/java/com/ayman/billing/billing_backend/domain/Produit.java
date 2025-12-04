package com.ayman.billing.billing_backend.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "produits")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Produit {

    @Id
    @GeneratedValue
    private UUID id;

    private String reference;
    private String nom;
    private BigDecimal prixHT;
    private BigDecimal tva;

    @OneToMany(mappedBy = "produit", cascade = CascadeType.ALL)
    private List<LigneFacture> lignes;

    public void ajouterProduit(String reference, String nom, BigDecimal prixHT, BigDecimal tva) {
        this.reference = reference;
        this.nom = nom;
        this.prixHT = prixHT != null ? prixHT : BigDecimal.ZERO;
        this.tva = tva != null ? tva : BigDecimal.ZERO;
    }

    public void modifierProduit(String nom, BigDecimal prixHT, BigDecimal tva) {
        this.nom = nom;
        this.prixHT = prixHT != null ? prixHT : BigDecimal.ZERO;
        this.tva = tva != null ? tva : BigDecimal.ZERO;
    }

    public BigDecimal getPrixTTC() {
        if (prixHT == null || tva == null) return BigDecimal.ZERO;
        return prixHT.add(prixHT.multiply(tva).divide(BigDecimal.valueOf(100)));
    }
}
