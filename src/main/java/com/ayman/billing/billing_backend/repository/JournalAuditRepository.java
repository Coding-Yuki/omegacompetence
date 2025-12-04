package com.ayman.billing.billing_backend.repository;

import com.ayman.billing.billing_backend.domain.JournalAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JournalAuditRepository extends JpaRepository<JournalAudit, Long> {
    List<JournalAudit> findByFactureIdOrderByDateEvenementDesc(UUID factureId);
}
