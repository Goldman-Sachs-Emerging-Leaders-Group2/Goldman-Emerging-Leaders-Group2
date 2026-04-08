package com.goldmansachs.els.controller;

import com.goldmansachs.els.exception.InvalidInputException;
import com.goldmansachs.els.model.CopilotRequest;
import com.goldmansachs.els.model.CopilotResponse;
import com.goldmansachs.els.service.CopilotService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Set;

@RestController
@RequestMapping("/api")
public class CopilotController {

    private static final Set<String> VALID_MODES = Set.of("teach", "builder", "summary");
    private static final int MAX_MESSAGE_LENGTH = 500;

    private final CopilotService copilotService;

    public CopilotController(CopilotService copilotService) {
        this.copilotService = copilotService;
    }

    @PostMapping("/copilot")
    public CopilotResponse chat(@RequestBody CopilotRequest request) {
        if (request.message() == null || request.message().isBlank()) {
            throw new InvalidInputException("message is required and must be non-blank.");
        }
        if (request.message().length() > MAX_MESSAGE_LENGTH) {
            throw new InvalidInputException("message must be " + MAX_MESSAGE_LENGTH + " characters or fewer.");
        }
        if (request.mode() == null || !VALID_MODES.contains(request.mode())) {
            throw new InvalidInputException("mode must be one of: teach, builder, summary.");
        }

        return copilotService.chat(request);
    }
}
