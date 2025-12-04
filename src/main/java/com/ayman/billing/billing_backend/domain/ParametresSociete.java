package com.ayman.billing.billing_backend.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "parametres_societe")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParametresSociete {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nomSociete;
    private String adresse;
    private String telephone;
    private String email;
    private String siteWeb;

    @Lob
    private byte[] logo;
}
