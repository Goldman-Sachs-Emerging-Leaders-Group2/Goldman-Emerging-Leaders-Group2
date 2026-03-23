package com.goldmansachs.els.service;

import com.goldmansachs.els.exception.ExternalApiException;
import com.goldmansachs.els.model.CalculationResult;
import com.goldmansachs.els.model.MutualFund;
import org.junit.jupiter.api.Test;

import java.util.Optional;
import java.util.OptionalDouble;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class CalculationServiceTest {

    private final MutualFundService mutualFundService = mock(MutualFundService.class);
    private final BetaService betaService = mock(BetaService.class);
    private final HistoricalReturnService historicalReturnService = mock(HistoricalReturnService.class);
    private final CalculationService calculationService =
            new CalculationService(mutualFundService, betaService, historicalReturnService);

    private final MutualFund fund = new MutualFund("VFIAX", "Vanguard 500 Index Fund", 0.1553);

    private void setupMocks(double beta, OptionalDouble historicalReturn) {
        when(mutualFundService.findFundByTicker("VFIAX")).thenReturn(Optional.of(fund));
        when(betaService.getBeta("VFIAX")).thenReturn(beta);
        when(historicalReturnService.getLastYearExpectedReturn("VFIAX")).thenReturn(historicalReturn);
    }

    @Test
    void calculate_fallsBackToFundExpectedReturn_whenHistoricalReturnUnavailable() {
        setupMocks(1.1, OptionalDouble.empty());

        CalculationResult result = calculationService.calculate("VFIAX", 10_000, 10);

        assertEquals(fund.expectedAnnualReturn(), result.expectedMarketReturn(), 1e-12);

        double riskFreeRate = 0.0425;
        double capmReturn = riskFreeRate + 1.1 * (fund.expectedAnnualReturn() - riskFreeRate);
        double expectedFutureValue = 10_000 * Math.exp(capmReturn * 10);

        assertEquals(capmReturn, result.capmReturn(), 1e-12);
        assertEquals(expectedFutureValue, result.futureValue(), 1e-9);
    }

    @Test
    void calculate_usesHistoricalExpectedReturn_whenAvailable() {
        double historicalExpectedReturn = 0.12;
        setupMocks(1.1, OptionalDouble.of(historicalExpectedReturn));

        CalculationResult result = calculationService.calculate("VFIAX", 10_000, 10);

        assertEquals(historicalExpectedReturn, result.expectedMarketReturn(), 1e-12);

        double riskFreeRate = 0.0425;
        double capmReturn = riskFreeRate + 1.1 * (historicalExpectedReturn - riskFreeRate);
        double expectedFutureValue = 10_000 * Math.exp(capmReturn * 10);

        assertEquals(capmReturn, result.capmReturn(), 1e-12);
        assertEquals(expectedFutureValue, result.futureValue(), 1e-9);
    }

    @Test
    void calculate_returnsCorrectResultShape() {
        setupMocks(1.05, OptionalDouble.of(0.15));

        CalculationResult result = calculationService.calculate("VFIAX", 5_000, 5);

        assertEquals("VFIAX", result.ticker());
        assertEquals("Vanguard 500 Index Fund", result.fundName());
        assertEquals(5_000, result.initialInvestment(), 1e-12);
        assertEquals(5, result.years());
        assertEquals(1.05, result.beta(), 1e-12);
        assertEquals(0.0425, result.riskFreeRate(), 1e-12);
        assertEquals(0.15, result.expectedMarketReturn(), 1e-12);
        assertTrue(Double.isFinite(result.capmReturn()));
        assertTrue(Double.isFinite(result.futureValue()));
        assertTrue(result.futureValue() > 0);
    }

    @Test
    void calculate_throwsExternalApiException_whenBetaIsNaN() {
        setupMocks(Double.NaN, OptionalDouble.of(0.12));

        assertThrows(ExternalApiException.class,
                () -> calculationService.calculate("VFIAX", 10_000, 10));
    }

    @Test
    void calculate_throwsExternalApiException_whenBetaIsInfinite() {
        setupMocks(Double.POSITIVE_INFINITY, OptionalDouble.of(0.12));

        assertThrows(ExternalApiException.class,
                () -> calculationService.calculate("VFIAX", 10_000, 10));
    }

    @Test
    void calculate_propagatesExternalApiException_fromBetaService() {
        when(mutualFundService.findFundByTicker("VFIAX")).thenReturn(Optional.of(fund));
        when(betaService.getBeta("VFIAX")).thenThrow(new ExternalApiException("API down"));

        ExternalApiException thrown = assertThrows(ExternalApiException.class,
                () -> calculationService.calculate("VFIAX", 10_000, 10));
        assertEquals("API down", thrown.getMessage());
    }

    @Test
    void calculate_withZeroYears_returnsInvestmentAsIs() {
        setupMocks(1.1, OptionalDouble.of(0.12));

        CalculationResult result = calculationService.calculate("VFIAX", 10_000, 0);

        assertEquals(10_000, result.futureValue(), 1e-9);
    }
}
