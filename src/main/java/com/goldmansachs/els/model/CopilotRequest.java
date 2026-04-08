package com.goldmansachs.els.model;

import java.util.List;

public record CopilotRequest(
        String mode,
        String message,
        CopilotContext context
) {
    public record CopilotContext(
            List<CalculationResult> results,
            List<MutualFund> availableFunds,
            List<String> selectedTickers,
            Double investment,
            Integer years,
            Double monthlyContribution,
            String currentView
    ) {
    }
}
