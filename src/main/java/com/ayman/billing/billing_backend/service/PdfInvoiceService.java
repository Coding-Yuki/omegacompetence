package com.ayman.billing.billing_backend.service;

import com.ayman.billing.billing_backend.domain.Facture;
import com.ayman.billing.billing_backend.domain.LigneFacture;
import com.ayman.billing.billing_backend.domain.ParametresSociete;
import com.ayman.billing.billing_backend.repository.FactureRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PdfInvoiceService {

    private final FactureRepository factureRepository;
    private final ParametresSocieteService parametresSocieteService;

    public byte[] generatePdf(UUID factureId) {
        // ✅ Récupération de la facture
        Facture facture = factureRepository.findById(factureId)
                .orElseThrow(() -> new IllegalArgumentException("Facture introuvable: " + factureId));

        // ✅ Infos client
        String clientName = facture.getClient().getRaisonSociale();

        // ✅ Calcul des totaux
        BigDecimal totalLignesTTC = facture.getLignes().stream()
                .map(LigneFacture::getMontantTTC)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalHT = facture.getTotalHT() != null ? facture.getTotalHT() : BigDecimal.ZERO;
        BigDecimal totalTVA = facture.getTotalTVA() != null ? facture.getTotalTVA() : BigDecimal.ZERO;
        BigDecimal totalTTC = facture.getTotalTTC() != null ? facture.getTotalTTC() : BigDecimal.ZERO;

        // ✅ Paramètres société
        ParametresSociete societe = parametresSocieteService.getParametres();

        // ✅ Construction du contenu
        String content = "===== FACTURE =====\n"
                + "Société : " + societe.getNomSociete() + "\n"
                + "Adresse : " + societe.getAdresse() + "\n"
                + "Téléphone : " + societe.getTelephone() + "\n"
                + "Email : " + societe.getEmail() + "\n"
                + "Site Web : " + societe.getSiteWeb() + "\n\n"
                + "Client : " + clientName + "\n"
                + "Total HT : " + totalHT + "\n"
                + "Total TVA : " + totalTVA + "\n"
                + "Total TTC : " + totalTTC + "\n"
                + "Total Lignes TTC (calculé) : " + totalLignesTTC + "\n";

        // ✅ Retourne le contenu en bytes (à remplacer par génération PDF réelle avec iText ou autre)
        return content.getBytes();
    }
}
