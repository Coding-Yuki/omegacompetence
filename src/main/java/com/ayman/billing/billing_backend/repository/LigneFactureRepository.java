package com.ayman.billing.billing_backend.repository;

import com.ayman.billing.billing_backend.domain.LigneFacture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface LigneFactureRepository extends JpaRepository<LigneFacture, UUID> { }
