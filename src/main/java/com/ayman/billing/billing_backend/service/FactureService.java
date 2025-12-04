package com.ayman.billing.billing_backend.service;

import com.ayman.billing.billing_backend.domain.Facture;
import com.ayman.billing.billing_backend.domain.LigneFacture;
import com.ayman.billing.billing_backend.enums.StatutFacture;
import com.ayman.billing.billing_backend.repository.FactureRepository;  // ✅ import correct

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class FactureService {

    private final FactureRepository factureRepository;

    public Facture getFacture(UUID id) {
        return factureRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Facture introuvable: " + id));
    }

    // autres méthodes...
    public Facture emettreFacture(UUID id) {
        Facture facture = getFacture(id);
        facture.setStatut(StatutFacture.EMIS);
        return factureRepository.save(facture);
    }

    public Facture annulerFacture(UUID id) {
        Facture facture = getFacture(id);
        facture.setStatut(StatutFacture.ANNULEE);
        return factureRepository.save(facture);
    }

    public Facture recalculerTotaux(UUID id) {
        Facture facture = getFacture(id);

        List<LigneFacture> lignes = facture.getLignes();
        BigDecimal totalHT = lignes.stream()
                .map(LigneFacture::getMontantHT)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalTVA = lignes.stream()
                .map(LigneFacture::getMontantTVA)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalTTC = totalHT.add(totalTVA);

        facture.setTotalHT(totalHT);
        facture.setTotalTVA(totalTVA);
        facture.setTotalTTC(totalTTC);

        return factureRepository.save(facture);
    }
}
