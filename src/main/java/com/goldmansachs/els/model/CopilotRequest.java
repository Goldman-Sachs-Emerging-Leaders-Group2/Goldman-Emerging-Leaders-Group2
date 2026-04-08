package com.goldmansachs.els.model;

import java.util.List;

public record CopilotRequest(
        String mode,
        String message,
        CopilotContext context
) {
    public record CopilotContext(
            List<CalculationResult> results,
            List<Asset> availableAssets,
            List<String> selectedTickers,
            Double investment,
            Integer years,
            String currentPage
    ) {
    }
}
