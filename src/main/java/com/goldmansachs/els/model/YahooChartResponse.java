package com.goldmansachs.els.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record YahooChartResponse(
        Chart chart
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Chart(
            List<Result> result
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Result(
            Indicators indicators
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Indicators(
            @JsonProperty("adjclose") List<AdjCloseSeries> adjClose
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record AdjCloseSeries(
            @JsonProperty("adjclose") List<Double> prices
    ) {
    }
}
