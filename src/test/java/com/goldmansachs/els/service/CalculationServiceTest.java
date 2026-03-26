package com.goldmansachs.els.service;

import com.goldmansachs.els.exception.ExternalApiException;
import com.goldmansachs.els.model.Asset;
import com.goldmansachs.els.model.AssetType;
import com.goldmansachs.els.model.CalculationResult;
import org.junit.jupiter.api.Test;

import java.util.OptionalDouble;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class CalculationServiceTest {

    private final AssetService assetService = mock(AssetService.class);
    private final BetaService betaService = mock(BetaService.class);
    private final HistoricalReturnService historicalReturnService = mock(HistoricalReturnService.class);
    private final CalculationService calculationService =
            new CalculationService(assetService, betaService, historicalReturnService);

    private final Asset fund = new Asset("VFIAX", "Vanguard 500 Index Fund", AssetType.MUTUAL_FUND, 0.1553);
    private final Asset etf = new Asset("SPY", "SPDR S&P 500 ETF Trust", AssetType.ETF, 0.1548);

    private void setupMocks(Asset asset, double beta, OptionalDouble historicalReturn) {
        when(assetService.getAssetByTicker(asset.ticker())).thenReturn(asset);
        when(betaService.getBeta(asset.ticker())).thenReturn(beta);
        when(historicalReturnService.getLastYearExpectedReturn(asset.ticker())).thenReturn(historicalReturn);
    }

    @Test
    void calculate_fallsBackToAssetExpectedReturn_whenHistoricalReturnUnavailable() {
        setupMocks(fund, 1.1, OptionalDouble.empty());

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
        setupMocks(fund, 1.1, OptionalDouble.of(historicalExpectedReturn));

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
        setupMocks(fund, 1.05, OptionalDouble.of(0.15));

        CalculationResult result = calculationService.calculate("VFIAX", 5_000, 5);

        assertEquals("VFIAX", result.ticker());
        assertEquals("Vanguard 500 Index Fund", result.assetName());
        assertEquals(AssetType.MUTUAL_FUND, result.assetType());
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
    void calculate_worksForETF() {
        setupMocks(etf, 1.0, OptionalDouble.of(0.15));

        CalculationResult result = calculationService.calculate("SPY", 10_000, 10);

        assertEquals("SPY", result.ticker());
        assertEquals("SPDR S&P 500 ETF Trust", result.assetName());
        assertEquals(AssetType.ETF, result.assetType());
    }

    @Test
    void calculate_throwsExternalApiException_whenBetaIsNaN() {
        setupMocks(fund, Double.NaN, OptionalDouble.of(0.12));

        assertThrows(ExternalApiException.class,
                () -> calculationService.calculate("VFIAX", 10_000, 10));
    }

    @Test
    void calculate_throwsExternalApiException_whenBetaIsInfinite() {
        setupMocks(fund, Double.POSITIVE_INFINITY, OptionalDouble.of(0.12));

        assertThrows(ExternalApiException.class,
                () -> calculationService.calculate("VFIAX", 10_000, 10));
    }

    @Test
    void calculate_propagatesExternalApiException_fromBetaService() {
        when(assetService.getAssetByTicker("VFIAX")).thenReturn(fund);
        when(betaService.getBeta("VFIAX")).thenThrow(new ExternalApiException("API down"));

        ExternalApiException thrown = assertThrows(ExternalApiException.class,
                () -> calculationService.calculate("VFIAX", 10_000, 10));
        assertEquals("API down", thrown.getMessage());
    }

    @Test
    void calculate_withZeroYears_returnsInvestmentAsIs() {
        setupMocks(fund, 1.1, OptionalDouble.of(0.12));

        CalculationResult result = calculationService.calculate("VFIAX", 10_000, 0);

        assertEquals(10_000, result.futureValue(), 1e-9);
    }
}
