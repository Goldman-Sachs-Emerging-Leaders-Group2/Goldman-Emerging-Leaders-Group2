package com.goldmansachs.els.service;

import com.goldmansachs.els.model.NewtonAnalyticsResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class BetaService {

    private final RestClient restClient;

    public BetaService(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder
                .baseUrl("https://api.newtonanalytics.com")
                .build();
    }

    public double getBeta(String ticker) {
        NewtonAnalyticsResponse response = restClient.get()
                .uri("/stock-beta/?ticker={ticker}&index=^GSPC&interval=1mo&observations=12", ticker)
                .retrieve()
                .body(NewtonAnalyticsResponse.class);

        if (response == null) {
            throw new RuntimeException("No response from Newton Analytics for ticker: " + ticker);
        }

        return response.data();
    }
}
