package com.goldmansachs.els.service;

import com.goldmansachs.els.model.CalculationResult;
import com.goldmansachs.els.model.MutualFund;
import org.junit.jupiter.api.Test;

import java.util.OptionalDouble;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class CalculationServiceTest {

    @Test
    void calculate_fallsBackToFundExpectedReturn_whenHistoricalReturnUnavailable() {
        MutualFundService mutualFundService = mock(MutualFundService.class);
        BetaService betaService = mock(BetaService.class);
        HistoricalReturnService historicalReturnService = mock(HistoricalReturnService.class);

        MutualFund fund = new MutualFund("VFIAX", "Vanguard 500 Index Fund", 0.1553);
        when(mutualFundService.getFundByTicker("VFIAX")).thenReturn(fund);
        when(betaService.getBeta("VFIAX")).thenReturn(1.1);
        when(historicalReturnService.getLastYearExpectedReturn("VFIAX")).thenReturn(OptionalDouble.empty());

        CalculationService calculationService = new CalculationService(mutualFundService, betaService, historicalReturnService);

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
        MutualFundService mutualFundService = mock(MutualFundService.class);
        BetaService betaService = mock(BetaService.class);
        HistoricalReturnService historicalReturnService = mock(HistoricalReturnService.class);

        MutualFund fund = new MutualFund("VFIAX", "Vanguard 500 Index Fund", 0.1553);
        double historicalExpectedReturn = 0.12;

        when(mutualFundService.getFundByTicker("VFIAX")).thenReturn(fund);
        when(betaService.getBeta("VFIAX")).thenReturn(1.1);
        when(historicalReturnService.getLastYearExpectedReturn("VFIAX"))
                .thenReturn(OptionalDouble.of(historicalExpectedReturn));

        CalculationService calculationService = new CalculationService(mutualFundService, betaService, historicalReturnService);

        CalculationResult result = calculationService.calculate("VFIAX", 10_000, 10);

        assertEquals(historicalExpectedReturn, result.expectedMarketReturn(), 1e-12);

        double riskFreeRate = 0.0425;
        double capmReturn = riskFreeRate + 1.1 * (historicalExpectedReturn - riskFreeRate);
        double expectedFutureValue = 10_000 * Math.exp(capmReturn * 10);

        assertEquals(capmReturn, result.capmReturn(), 1e-12);
        assertEquals(expectedFutureValue, result.futureValue(), 1e-9);
    }
}
