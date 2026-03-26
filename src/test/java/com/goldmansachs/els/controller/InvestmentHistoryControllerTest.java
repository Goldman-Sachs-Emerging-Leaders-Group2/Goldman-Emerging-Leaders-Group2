package com.goldmansachs.els.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.goldmansachs.els.model.SavedInvestment;
import com.goldmansachs.els.repository.SavedInvestmentRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(InvestmentHistoryController.class)
class InvestmentHistoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private SavedInvestmentRepository repository;

    private SavedInvestment sampleInvestment() {
        SavedInvestment inv = new SavedInvestment(
                "Retirement", "VFIAX", "Vanguard 500 Index Fund",
                10_000, 500, 10, 46_012.34, 0.15248,
                1.1, 70_000, 0.0425, 0.1420
        );
        inv.setId(1L);
        inv.setSavedAt(LocalDateTime.of(2026, 3, 25, 12, 0));
        return inv;
    }

    // --- GET tests ---

    @Test
    void getAll_returnsEmptyArray() throws Exception {
        when(repository.findAllByOrderBySavedAtDesc()).thenReturn(List.of());

        mockMvc.perform(get("/api/investments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void getAll_returnsSavedInvestments() throws Exception {
        when(repository.findAllByOrderBySavedAtDesc()).thenReturn(List.of(sampleInvestment()));

        mockMvc.perform(get("/api/investments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].ticker").value("VFIAX"))
                .andExpect(jsonPath("$[0].label").value("Retirement"))
                .andExpect(jsonPath("$[0].futureValue").value(46_012.34))
                .andExpect(jsonPath("$[0].id").value(1));
    }

    // --- POST tests ---

    @Test
    void save_returnsCreatedInvestment() throws Exception {
        SavedInvestment input = new SavedInvestment(
                "Test", "VFIAX", "Vanguard 500 Index Fund",
                10_000, 0, 10, 46_012.34, 0.15248,
                1.1, 10_000, 0.0425, 0.1420
        );

        SavedInvestment saved = sampleInvestment();
        when(repository.save(any(SavedInvestment.class))).thenReturn(saved);

        mockMvc.perform(post("/api/investments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.ticker").value("VFIAX"))
                .andExpect(jsonPath("$.savedAt").exists());
    }

    @Test
    void save_returns400_whenTickerMissing() throws Exception {
        SavedInvestment input = new SavedInvestment(
                null, null, null,
                10_000, 0, 10, 46_012.34, 0.15248,
                1.1, 10_000, 0.0425, 0.1420
        );

        mockMvc.perform(post("/api/investments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("INVALID_INPUT"));
    }

    @Test
    void save_returns400_whenInvestmentZero() throws Exception {
        SavedInvestment input = new SavedInvestment(
                null, "VFIAX", "Vanguard 500 Index Fund",
                0, 0, 10, 0, 0.15248,
                1.1, 0, 0.0425, 0.1420
        );

        mockMvc.perform(post("/api/investments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("INVALID_INPUT"));
    }

    // --- DELETE tests ---

    @Test
    void delete_returns204_whenExists() throws Exception {
        when(repository.existsById(1L)).thenReturn(true);

        mockMvc.perform(delete("/api/investments/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void delete_returns404_whenNotFound() throws Exception {
        when(repository.existsById(999L)).thenReturn(false);

        mockMvc.perform(delete("/api/investments/999"))
                .andExpect(status().isNotFound());
    }
}
