package com.ayman.billing.billing_backend.service;

import com.ayman.billing.billing_backend.domain.ParametresSociete;
import com.ayman.billing.billing_backend.repository.ParametresSocieteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ParametresSocieteService {
    private final ParametresSocieteRepository repository;

    public ParametresSociete getParametres() {
        return repository.findById(1L)
                .orElseThrow(() -> new IllegalStateException("Paramètres société non définis"));
    }
}
