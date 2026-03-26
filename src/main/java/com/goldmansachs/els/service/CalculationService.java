package com.goldmansachs.els.service;

import com.goldmansachs.els.exception.ExternalApiException;
import com.goldmansachs.els.model.Asset;
import com.goldmansachs.els.model.CalculationResult;
import org.springframework.stereotype.Service;

@Service
public class CalculationService {

    // US Treasury rate, used as the "zero risk" baseline in CAPM
    private static final double RISK_FREE_RATE = 0.0425;

    private final AssetService assetService;
    private final BetaService betaService;
    private final HistoricalReturnService historicalReturnService;

    public CalculationService(
            AssetService assetService,
            BetaService betaService,
            HistoricalReturnService historicalReturnService
    ) {
        this.assetService = assetService;
        this.betaService = betaService;
        this.historicalReturnService = historicalReturnService;
    }

    public CalculationResult calculate(String ticker, double investment, int years) {
        Asset asset = assetService.getAssetByTicker(ticker);
        double beta = betaService.getBeta(ticker);

        double expectedMarketReturn = historicalReturnService
            .getLastYearExpectedReturn(ticker)
            .orElse(asset.expectedAnnualReturn());
        // CAPM: rate = riskFreeRate + beta * (expectedReturn - riskFreeRate)
        double capmReturn = RISK_FREE_RATE + beta * (expectedMarketReturn - RISK_FREE_RATE);
        // Future value: principal * e^(rate * years)
        double futureValue = investment * Math.exp(capmReturn * years);

        if (!Double.isFinite(capmReturn) || !Double.isFinite(futureValue)) {
            throw new ExternalApiException(
                    "Calculation produced invalid results for " + ticker + ". Please try again.");
        }

        return new CalculationResult(
                asset.ticker(),
                asset.name(),
                asset.type(),
                investment,
                years,
                beta,
                RISK_FREE_RATE,
                expectedMarketReturn,
                capmReturn,
                futureValue
        );
    }
}
