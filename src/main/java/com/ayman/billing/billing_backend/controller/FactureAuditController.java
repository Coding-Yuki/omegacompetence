package com.ayman.billing.billing_backend.controller;

import com.ayman.billing.billing_backend.domain.JournalAudit;
import com.ayman.billing.billing_backend.repository.JournalAuditRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/audits")
@RequiredArgsConstructor
public class FactureAuditController {

    private final JournalAuditRepository journalAuditRepository;

    @GetMapping("/{factureId}")
    public List<JournalAudit> getAudits(@PathVariable UUID factureId) {
        return journalAuditRepository.findByFactureIdOrderByDateEvenementDesc(factureId);
    }
}
