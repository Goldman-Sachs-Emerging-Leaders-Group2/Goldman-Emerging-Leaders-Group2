package com.goldmansachs.els.controller;

import com.goldmansachs.els.exception.ExternalApiException;
import com.goldmansachs.els.model.CalculationResult;
import com.goldmansachs.els.model.MutualFund;
import com.goldmansachs.els.service.CalculationService;
import com.goldmansachs.els.service.MutualFundService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(MutualFundController.class)
class MutualFundControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MutualFundService mutualFundService;

    @MockBean
    private CalculationService calculationService;

    private final CalculationResult sampleResult = new CalculationResult(
            "VFIAX", "Vanguard 500 Index Fund", 10_000, 10,
            1.1, 0.0425, 0.1420, 0.15248, 46_012.34
    );

    // --- Response shape tests ---

    @Test
    void getAllFunds_returnsJsonArray() throws Exception {
        when(mutualFundService.getAllFunds()).thenReturn(List.of(
                new MutualFund("VFIAX", "Vanguard 500 Index Fund", 0.1420),
                new MutualFund("FXAIX", "Fidelity 500 Index Fund", 0.1420)
        ));

        mockMvc.perform(get("/api/mutualfunds"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].ticker").value("VFIAX"))
                .andExpect(jsonPath("$[0].name").value("Vanguard 500 Index Fund"))
                .andExpect(jsonPath("$[0].expectedAnnualReturn").value(0.1420));
    }

    @Test
    void calculate_returnsFullResponseShape() throws Exception {
        when(calculationService.calculate(eq("VFIAX"), eq(10_000.0), eq(10)))
                .thenReturn(sampleResult);

        mockMvc.perform(get("/api/calculate")
                        .param("ticker", "VFIAX")
                        .param("investment", "10000")
                        .param("years", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ticker").value("VFIAX"))
                .andExpect(jsonPath("$.fundName").value("Vanguard 500 Index Fund"))
                .andExpect(jsonPath("$.initialInvestment").value(10_000))
                .andExpect(jsonPath("$.years").value(10))
                .andExpect(jsonPath("$.beta").value(1.1))
                .andExpect(jsonPath("$.riskFreeRate").value(0.0425))
                .andExpect(jsonPath("$.expectedMarketReturn").value(0.1420))
                .andExpect(jsonPath("$.capmReturn").value(0.15248))
                .andExpect(jsonPath("$.futureValue").value(46_012.34));
    }

    // --- Validation tests ---

    @Test
    void calculate_returns400_whenTickerMissing() throws Exception {
        mockMvc.perform(get("/api/calculate")
                        .param("investment", "10000")
                        .param("years", "10"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void calculate_returns400_whenTickerBlank() throws Exception {
        mockMvc.perform(get("/api/calculate")
                        .param("ticker", "  ")
                        .param("investment", "10000")
                        .param("years", "10"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("INVALID_INPUT"));
    }

    @Test
    void calculate_returns400_whenInvestmentMissing() throws Exception {
        mockMvc.perform(get("/api/calculate")
                        .param("ticker", "VFIAX")
                        .param("years", "10"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void calculate_returns400_whenInvestmentNegative() throws Exception {
        mockMvc.perform(get("/api/calculate")
                        .param("ticker", "VFIAX")
                        .param("investment", "-100")
                        .param("years", "10"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("INVALID_INPUT"));
    }

    @Test
    void calculate_returns400_whenInvestmentZero() throws Exception {
        mockMvc.perform(get("/api/calculate")
                        .param("ticker", "VFIAX")
                        .param("investment", "0")
                        .param("years", "10"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("INVALID_INPUT"));
    }

    @Test
    void calculate_returns400_whenYearsMissing() throws Exception {
        mockMvc.perform(get("/api/calculate")
                        .param("ticker", "VFIAX")
                        .param("investment", "10000"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void calculate_returns400_whenYearsNegative() throws Exception {
        mockMvc.perform(get("/api/calculate")
                        .param("ticker", "VFIAX")
                        .param("investment", "10000")
                        .param("years", "-1"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("INVALID_INPUT"));
    }

    @Test
    void calculate_returns400_whenYearsExceeds100() throws Exception {
        mockMvc.perform(get("/api/calculate")
                        .param("ticker", "VFIAX")
                        .param("investment", "10000")
                        .param("years", "101"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("INVALID_INPUT"));
    }

    @Test
    void calculate_returns400_whenInvestmentNotANumber() throws Exception {
        mockMvc.perform(get("/api/calculate")
                        .param("ticker", "VFIAX")
                        .param("investment", "abc")
                        .param("years", "10"))
                .andExpect(status().isBadRequest());
    }

    // --- Error mapping tests ---

    @Test
    void calculate_returns404_whenTickerNotFound() throws Exception {
        when(calculationService.calculate(eq("UNKNOWN"), anyDouble(), anyInt()))
                .thenThrow(new IllegalArgumentException("Fund not found: UNKNOWN"));

        mockMvc.perform(get("/api/calculate")
                        .param("ticker", "UNKNOWN")
                        .param("investment", "10000")
                        .param("years", "10"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("TICKER_NOT_FOUND"));
    }

    @Test
    void calculate_returns502_whenExternalApiFails() throws Exception {
        when(calculationService.calculate(eq("VFIAX"), anyDouble(), anyInt()))
                .thenThrow(new ExternalApiException("Unable to retrieve beta"));

        mockMvc.perform(get("/api/calculate")
                        .param("ticker", "VFIAX")
                        .param("investment", "10000")
                        .param("years", "10"))
                .andExpect(status().is(502))
                .andExpect(jsonPath("$.error").value("EXTERNAL_API_ERROR"))
                .andExpect(jsonPath("$.message").value("Unable to retrieve beta"));
    }

    @Test
    void calculate_returns500_onUnexpectedException() throws Exception {
        when(calculationService.calculate(eq("VFIAX"), anyDouble(), anyInt()))
                .thenThrow(new RuntimeException("something broke"));

        mockMvc.perform(get("/api/calculate")
                        .param("ticker", "VFIAX")
                        .param("investment", "10000")
                        .param("years", "10"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.error").value("INTERNAL_ERROR"));
    }

    // --- Alias endpoint tests ---

    @Test
    void getMutualFunds_aliasEndpoint() throws Exception {
        when(mutualFundService.getAllFunds()).thenReturn(List.of());

        mockMvc.perform(get("/api/mutual-funds"))
                .andExpect(status().isOk());
    }

    @Test
    void calculate_aliasEndpoint() throws Exception {
        when(calculationService.calculate(eq("VFIAX"), eq(10_000.0), eq(10)))
                .thenReturn(sampleResult);

        mockMvc.perform(get("/api/investment/future-value")
                        .param("ticker", "VFIAX")
                        .param("investment", "10000")
                        .param("years", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ticker").value("VFIAX"));
    }
}
