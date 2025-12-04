package com.ayman.billing.billing_backend.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "journal_audit")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JournalAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime dateEvenement;

    // EMISSION, PAIEMENT, RETARD, ANNULATION...
    private String typeEvenement;

    @Column(length = 1000)
    private String details;

    @ManyToOne
    @JoinColumn(name = "facture_id")
    private Facture facture;
}
