package com.goldmansachs.els.model;

public record MutualFund(
        String ticker,
        String name,
        double expectedAnnualReturn
) {
}
