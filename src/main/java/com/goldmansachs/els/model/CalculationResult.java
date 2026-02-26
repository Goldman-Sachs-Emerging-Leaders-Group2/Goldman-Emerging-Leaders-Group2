package com.goldmansachs.els.model;

public record CalculationResult(
        String ticker,
        String fundName,
        double initialInvestment,
        int years,
        double beta,
        double riskFreeRate,
        double expectedMarketReturn,
        double capmReturn,
        double futureValue
) {
}
