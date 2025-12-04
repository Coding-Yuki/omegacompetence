package com.ayman.billing.billing_backend.repository;

import com.ayman.billing.billing_backend.domain.Avoir;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AvoirRepository extends JpaRepository<Avoir, UUID> { }
