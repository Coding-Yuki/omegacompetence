package com.ayman.billing.billing_backend.controller;

import com.ayman.billing.billing_backend.service.PdfInvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/factures")
@RequiredArgsConstructor
public class FacturePdfController {

    private final PdfInvoiceService pdfInvoiceService;

    @GetMapping(value = "/{id}/pdf", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public byte[] getFacturePdf(@PathVariable UUID id) {
        return pdfInvoiceService.generatePdf(id);
    }
}
