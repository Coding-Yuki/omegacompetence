package com.ayman.billing.billing_backend.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "avoirs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Avoir {

    @Id
    @GeneratedValue
    private UUID id;

    private String numero;
    private LocalDate dateEmission;
    private BigDecimal montantTTC;

    @ManyToOne
    @JoinColumn(name = "facture_id")
    private Facture facture;

    public void appliquerSurFacture(Facture facture) {
        facture.setTotalTTC(facture.getTotalTTC().subtract(montantTTC));
    }
}
