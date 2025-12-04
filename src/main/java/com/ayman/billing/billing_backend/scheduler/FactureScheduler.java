package com.ayman.billing.billing_backend.scheduler;

import com.ayman.billing.billing_backend.domain.Facture;
import com.ayman.billing.billing_backend.enums.StatutFacture;
import com.ayman.billing.billing_backend.repository.FactureRepository;  // ✅ import correct

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class FactureScheduler {

    private final FactureRepository factureRepository;

    @Scheduled(cron = "0 0 2 * * *") // tous les jours à 02:00
    public void marquerRetards() {
        factureRepository.findAll().forEach(facture -> {
            LocalDate echeance = facture.getDateEcheance();
            if (echeance != null && LocalDate.now().isAfter(echeance)) {
                if (facture.getStatut() == StatutFacture.EMIS) {
                    facture.setStatut(StatutFacture.EN_RETARD);
                    factureRepository.save(facture);
                }
            }
        });
    }
}
