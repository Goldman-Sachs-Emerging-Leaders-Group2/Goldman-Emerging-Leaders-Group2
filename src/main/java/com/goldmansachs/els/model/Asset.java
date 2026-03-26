package com.goldmansachs.els.model;

public record Asset(
        String ticker,
        String name,
        AssetType type,
        double expectedAnnualReturn
) {
}
