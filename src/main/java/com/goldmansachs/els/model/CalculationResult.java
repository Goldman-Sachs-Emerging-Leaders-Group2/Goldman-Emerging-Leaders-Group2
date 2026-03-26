package com.goldmansachs.els.model;

public record CalculationResult(
        String ticker,
        String assetName,
        AssetType assetType,
        double initialInvestment,
        int years,
        double beta,
        double riskFreeRate,
        double expectedMarketReturn,
        double capmReturn,
        double futureValue
) {
}
