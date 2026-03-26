package com.goldmansachs.els.service;

import com.goldmansachs.els.model.YahooChartResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpHeaders;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.List;
import java.util.OptionalDouble;

@Service
public class HistoricalReturnService {

    private static final Logger logger = LoggerFactory.getLogger(HistoricalReturnService.class);

    private final RestClient primaryYahooClient;
    private final RestClient secondaryYahooClient;

    public HistoricalReturnService(RestClient.Builder restClientBuilder) {
        this.primaryYahooClient = restClientBuilder
                .baseUrl("https://query1.finance.yahoo.com")
                .defaultHeader(HttpHeaders.USER_AGENT, "Mozilla/5.0")
                .defaultHeader(HttpHeaders.ACCEPT, "application/json")
                .build();

        this.secondaryYahooClient = restClientBuilder
                .baseUrl("https://query2.finance.yahoo.com")
                .defaultHeader(HttpHeaders.USER_AGENT, "Mozilla/5.0")
                .defaultHeader(HttpHeaders.ACCEPT, "application/json")
                .build();
    }

    public OptionalDouble getLastYearExpectedReturn(String ticker) {
        try {
            YahooChartResponse response = fetchYahooChartResponse(ticker);

            if (response == null || response.chart() == null || response.chart().result() == null || response.chart().result().isEmpty()) {
                return OptionalDouble.empty();
            }

            YahooChartResponse.Result result = response.chart().result().get(0);
            if (result == null || result.indicators() == null || result.indicators().adjClose() == null || result.indicators().adjClose().isEmpty()) {
                return OptionalDouble.empty();
            }

            var adjCloseEntry = result.indicators().adjClose().get(0);
            if (adjCloseEntry == null) {
                return OptionalDouble.empty();
            }
            List<Double> prices = adjCloseEntry.prices();
            if (prices == null || prices.isEmpty()) {
                return OptionalDouble.empty();
            }

            Double firstPrice = null;
            Double lastPrice = null;

            for (Double price : prices) {
                if (price != null && Double.isFinite(price) && price > 0) {
                    firstPrice = price;
                    break;
                }
            }

            for (int i = prices.size() - 1; i >= 0; i--) {
                Double price = prices.get(i);
                if (price != null && Double.isFinite(price) && price > 0) {
                    lastPrice = price;
                    break;
                }
            }

            if (firstPrice == null || lastPrice == null || firstPrice <= 0) {
                return OptionalDouble.empty();
            }

            double expectedReturn = (lastPrice - firstPrice) / firstPrice;
            if (!Double.isFinite(expectedReturn)) {
                return OptionalDouble.empty();
            }

            return OptionalDouble.of(expectedReturn);
        } catch (Exception ex) {
            logger.warn("Failed to fetch historical return for {}: {}", ticker, ex.getMessage());
            return OptionalDouble.empty();
        }
    }

    private YahooChartResponse fetchYahooChartResponse(String ticker) {
        try {
            return primaryYahooClient.get()
                    .uri("/v8/finance/chart/{ticker}?range=1y&interval=1d", ticker)
                    .retrieve()
                    .body(YahooChartResponse.class);
        } catch (RestClientResponseException ex) {
            logger.warn("Yahoo Finance primary returned {} for ticker={}, trying secondary", ex.getStatusCode(), ticker);

            try {
                return secondaryYahooClient.get()
                        .uri("/v8/finance/chart/{ticker}?range=1y&interval=1d", ticker)
                        .retrieve()
                        .body(YahooChartResponse.class);
            } catch (Exception retryEx) {
                logger.warn("Yahoo Finance secondary also failed for ticker={}: {}", ticker, retryEx.getMessage());
                return null;
            }
        }
    }
}
