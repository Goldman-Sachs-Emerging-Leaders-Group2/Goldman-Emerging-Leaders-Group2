package com.goldmansachs.els.service;

import com.goldmansachs.els.model.Asset;
import com.goldmansachs.els.model.CalculationResult;
import com.goldmansachs.els.model.CopilotRequest;
import com.goldmansachs.els.model.CopilotResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class CopilotService {

    private static final Logger logger = LoggerFactory.getLogger(CopilotService.class);

    private final RestClient openaiClient;
    private final String model;
    private final int maxTokens;

    public CopilotService(
            @Qualifier("openaiRestClient") RestClient openaiClient,
            @Value("${openai.model:gpt-4o-mini}") String model,
            @Value("${openai.max-tokens:1024}") int maxTokens) {
        this.openaiClient = openaiClient;
        this.model = model;
        this.maxTokens = maxTokens;
    }

    public CopilotResponse chat(CopilotRequest request) {
        String systemPrompt = buildSystemPrompt(request.mode(), request.context());
        String userMessage = request.message();

        Map<String, Object> body = Map.of(
                "model", model,
                "max_tokens", maxTokens,
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userMessage))
        );

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = openaiClient.post()
                    .uri("/v1/chat/completions")
                    .body(body)
                    .retrieve()
                    .body(Map.class);

            if (response == null) {
                throw new RuntimeException("Empty response from OpenAI API");
            }

            String fullText = extractText(response);
            String reply = fullText;
            List<String> suggestions = new ArrayList<>();

            // Parse SUGGESTIONS: section from the response
            int suggestionsIndex = fullText.indexOf("SUGGESTIONS:");
            if (suggestionsIndex >= 0) {
                reply = fullText.substring(0, suggestionsIndex).trim();
                String suggestionsBlock = fullText.substring(suggestionsIndex + "SUGGESTIONS:".length()).trim();
                for (String line : suggestionsBlock.split("\n")) {
                    String cleaned = line.replaceAll("^[-•*\\d.]+\\s*", "").trim();
                    if (!cleaned.isEmpty()) {
                        suggestions.add(cleaned);
                    }
                }
            }

            return new CopilotResponse(reply, request.mode(), suggestions);

        } catch (RestClientResponseException ex) {
            logger.warn("OpenAI API returned {}: {}", ex.getStatusCode(), ex.getResponseBodyAsString());
            throw new RuntimeException("AI service temporarily unavailable. Please try again.");
        } catch (RuntimeException ex) {
            if (ex.getMessage() != null && ex.getMessage().contains("AI service")) {
                throw ex;
            }
            logger.error("Copilot error: {}", ex.getMessage(), ex);
            throw new RuntimeException("AI service temporarily unavailable. Please try again.");
        }
    }

    @SuppressWarnings("unchecked")
    private String extractText(Map<String, Object> response) {
        List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
        if (choices == null || choices.isEmpty()) {
            return "I wasn't able to generate a response. Please try again.";
        }
        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
        if (message == null) {
            return "I wasn't able to generate a response. Please try again.";
        }
        return (String) message.get("content");
    }

    private String buildSystemPrompt(String mode, CopilotRequest.CopilotContext context) {
        String contextBlock = formatContext(context);

        return switch (mode) {
            case "teach" -> TEACH_PROMPT + "\n\n" + contextBlock;
            case "builder" -> BUILDER_PROMPT + "\n\n" + contextBlock;
            case "summary" -> SUMMARY_PROMPT + "\n\n" + contextBlock;
            default -> TEACH_PROMPT + "\n\n" + contextBlock;
        };
    }

    private String formatContext(CopilotRequest.CopilotContext context) {
        if (context == null) {
            return "PORTFOLIO DATA:\nNo portfolio data available. The user has not run any calculations yet.";
        }

        StringBuilder sb = new StringBuilder("PORTFOLIO DATA:\n");

        if (context.results() != null && !context.results().isEmpty()) {
            List<CalculationResult> results = context.results();
            String investmentStr = context.investment() != null
                    ? String.format("$%,.2f", context.investment()) : "N/A";
            String yearsStr = context.years() != null
                    ? context.years() + "-year horizon" : "N/A";

            sb.append(String.format("Current selections: %s (%s, %s)\n\n",
                    String.join(", ", context.selectedTickers() != null ? context.selectedTickers() : List.of()),
                    investmentStr, yearsStr));

            for (int i = 0; i < results.size(); i++) {
                CalculationResult r = results.get(i);
                sb.append(String.format("%d. %s — %s (%s)\n", i + 1, r.ticker(), r.assetName(),
                        r.assetType() == com.goldmansachs.els.model.AssetType.MUTUAL_FUND ? "Mutual Fund" : "ETF"));
                sb.append(String.format("   Beta: %.2f | CAPM Return: %.2f%% | Market Return: %.2f%%\n",
                        r.beta(), r.capmReturn() * 100, r.expectedMarketReturn() * 100));
                sb.append(String.format("   Risk-Free Rate: %.2f%% | Future Value: $%,.2f\n\n",
                        r.riskFreeRate() * 100, r.futureValue()));
            }
        } else {
            sb.append("No calculations have been run yet.\n\n");
        }

        if (context.availableAssets() != null && !context.availableAssets().isEmpty()) {
            List<String> mf = new ArrayList<>();
            List<String> etf = new ArrayList<>();
            for (Asset a : context.availableAssets()) {
                if (a.type() == com.goldmansachs.els.model.AssetType.MUTUAL_FUND) {
                    mf.add(a.ticker());
                } else {
                    etf.add(a.ticker());
                }
            }
            sb.append("AVAILABLE ASSETS: ").append(String.join(", ", mf)).append(" (Mutual Funds)");
            if (!etf.isEmpty()) {
                sb.append(" | ").append(String.join(", ", etf)).append(" (ETFs)");
            }
            sb.append("\n");
        }

        if (context.currentPage() != null) {
            sb.append("User is on the: ").append(context.currentPage()).append(" page\n");
        }

        return sb.toString();
    }

    private static final String TEACH_PROMPT = """
            You are CapmFlow Copilot, an educational AI assistant for a CAPM mutual fund calculator application.

            ROLE: Teach finance concepts in plain English. Be patient, clear, and encouraging. \
            Target an audience of college students and early-career professionals.

            RULES:
            - NEVER provide specific financial advice or recommend buying/selling securities
            - NEVER compute or invent financial numbers. ONLY reference numbers provided in PORTFOLIO DATA below
            - If the user asks about numbers not in the data, say "Run a calculation in CapmFlow to find out"
            - Keep responses under 150 words unless the user asks for more detail
            - Use analogies and real-world examples to explain concepts
            - Format responses with markdown (bold for key terms, bullet points for lists)
            - End each response with SUGGESTIONS: followed by 2-3 brief follow-up questions on separate lines""";

    private static final String BUILDER_PROMPT = """
            You are CapmFlow Copilot in Portfolio Builder mode. You help users think through asset allocation decisions.

            ROLE: Ask about risk tolerance, time horizon, and goals, then suggest how to think about \
            diversification using the assets available in this app.

            RULES:
            - Frame suggestions as "things to consider" or "one approach might be" — NEVER give direct financial advice
            - NEVER compute numbers. Only reference numbers from PORTFOLIO DATA below
            - The available assets are ONLY those listed in AVAILABLE ASSETS. Do not mention any other assets
            - Focus on beta as a risk indicator and CAPM return as a return indicator
            - Always include this disclaimer at the end: "*This is educational guidance, not financial advice.*"
            - Keep responses under 200 words
            - Format responses with markdown (bold for key terms, bullet points for lists)
            - End each response with SUGGESTIONS: followed by 2-3 follow-up questions on separate lines""";

    private static final String SUMMARY_PROMPT = """
            You are CapmFlow Copilot in Portfolio Summary mode. You summarize the user's current \
            calculated portfolio in plain English.

            ROLE: Provide a clear, concise summary of what the numbers mean. Highlight standouts \
            (best/worst performers), flag potential risks, and explain trade-offs.

            RULES:
            - ONLY reference numbers from PORTFOLIO DATA below — never invent or compute new ones
            - Structure your response with clear sections: **Overview**, **Highlights**, **Risk Flags**, **Next Steps**
            - Use bullet points for readability
            - Keep total response under 250 words
            - If the user has no results, tell them to run a calculation first on the Calculator page
            - Always include this disclaimer: "*Based on CAPM projections, not guaranteed returns.*"
            - End with SUGGESTIONS: followed by 2-3 brief follow-up questions on separate lines""";
}
