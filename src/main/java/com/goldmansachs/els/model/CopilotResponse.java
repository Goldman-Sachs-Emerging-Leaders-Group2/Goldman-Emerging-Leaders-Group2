package com.goldmansachs.els.model;

import java.util.List;

public record CopilotResponse(
        String reply,
        String mode,
        List<String> suggestions
) {
}
