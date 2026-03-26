package com.goldmansachs.els.service;

import com.goldmansachs.els.exception.ExternalApiException;
import com.goldmansachs.els.model.NewtonAnalyticsResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

// Fetches an asset's beta (volatility relative to the S&P 500) from Newton Analytics
@Service
public class BetaService {

    private static final Logger logger = LoggerFactory.getLogger(BetaService.class);

    private final RestClient restClient;

    public BetaService(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder
                .baseUrl("https://api.newtonanalytics.com")
                .build();
    }

    public double getBeta(String ticker) {
        NewtonAnalyticsResponse response;

        try {
            response = restClient.get()
                    .uri("/stock-beta/?ticker={ticker}&index=^GSPC&interval=1mo&observations=12", ticker)
                    .retrieve()
                    .body(NewtonAnalyticsResponse.class);
        } catch (RestClientResponseException ex) {
            logger.warn("Newton Analytics returned {} for ticker={}", ex.getStatusCode(), ticker);
            throw new ExternalApiException(
                    "Unable to retrieve beta for " + ticker + ". External service returned " + ex.getStatusCode() + ".", ex);
        } catch (Exception ex) {
            logger.warn("Failed to reach Newton Analytics for ticker={}: {}", ticker, ex.getMessage());
            throw new ExternalApiException("Unable to reach beta provider for " + ticker + ".", ex);
        }

        if (response == null) {
            throw new ExternalApiException("No response from Newton Analytics for ticker: " + ticker);
        }

        if (!Double.isFinite(response.data())) {
            throw new ExternalApiException("Received invalid beta value for " + ticker + ".");
        }

        return response.data();
    }
}
