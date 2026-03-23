package com.goldmansachs.els.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.util.OptionalDouble;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

class HistoricalReturnServiceTest {

    private MockRestServiceServer mockServer;
    private HistoricalReturnService service;

    // Valid Yahoo Finance response with first price 100.0, last price 115.0 → 15% return
    private static final String VALID_YAHOO_RESPONSE = """
            {
              "chart": {
                "result": [{
                  "indicators": {
                    "adjclose": [{
                      "adjclose": [100.0, 105.0, 110.0, 115.0]
                    }]
                  }
                }]
              }
            }
            """;

    private static final String EMPTY_PRICES_RESPONSE = """
            {
              "chart": {
                "result": [{
                  "indicators": {
                    "adjclose": [{
                      "adjclose": []
                    }]
                  }
                }]
              }
            }
            """;

    @BeforeEach
    void setUp() {
        // HistoricalReturnService calls builder twice (primary + secondary),
        // so we use a shared builder with a mock server that handles both.
        RestClient.Builder builder = RestClient.builder();
        mockServer = MockRestServiceServer.bindTo(builder)
                .ignoreExpectOrder(true)
                .build();
        service = new HistoricalReturnService(builder);
    }

    @Test
    void getLastYearExpectedReturn_calculatesReturnFromPrices() {
        mockServer.expect(requestTo(org.hamcrest.Matchers.containsString("query1.finance.yahoo.com")))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withSuccess(VALID_YAHOO_RESPONSE, MediaType.APPLICATION_JSON));

        OptionalDouble result = service.getLastYearExpectedReturn("VFIAX");

        assertTrue(result.isPresent());
        assertEquals(0.15, result.getAsDouble(), 1e-9);
        mockServer.verify();
    }

    @Test
    void getLastYearExpectedReturn_returnsEmpty_onEmptyPrices() {
        mockServer.expect(requestTo(org.hamcrest.Matchers.containsString("query1.finance.yahoo.com")))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withSuccess(EMPTY_PRICES_RESPONSE, MediaType.APPLICATION_JSON));

        OptionalDouble result = service.getLastYearExpectedReturn("VFIAX");

        assertTrue(result.isEmpty());
        mockServer.verify();
    }

    @Test
    void getLastYearExpectedReturn_retriesSecondaryOnNon429Error() {
        // Primary returns 403
        mockServer.expect(requestTo(org.hamcrest.Matchers.containsString("query1.finance.yahoo.com")))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withStatus(HttpStatus.FORBIDDEN));

        // Secondary returns valid data
        mockServer.expect(requestTo(org.hamcrest.Matchers.containsString("query2.finance.yahoo.com")))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withSuccess(VALID_YAHOO_RESPONSE, MediaType.APPLICATION_JSON));

        OptionalDouble result = service.getLastYearExpectedReturn("VFIAX");

        assertTrue(result.isPresent());
        assertEquals(0.15, result.getAsDouble(), 1e-9);
        mockServer.verify();
    }

    @Test
    void getLastYearExpectedReturn_retriesSecondaryOn429() {
        // Primary returns 429
        mockServer.expect(requestTo(org.hamcrest.Matchers.containsString("query1.finance.yahoo.com")))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withStatus(HttpStatus.TOO_MANY_REQUESTS));

        // Secondary returns valid data
        mockServer.expect(requestTo(org.hamcrest.Matchers.containsString("query2.finance.yahoo.com")))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withSuccess(VALID_YAHOO_RESPONSE, MediaType.APPLICATION_JSON));

        OptionalDouble result = service.getLastYearExpectedReturn("VFIAX");

        assertTrue(result.isPresent());
        assertEquals(0.15, result.getAsDouble(), 1e-9);
        mockServer.verify();
    }

    @Test
    void getLastYearExpectedReturn_returnsEmpty_whenBothClientsFail() {
        // Primary returns 429
        mockServer.expect(requestTo(org.hamcrest.Matchers.containsString("query1.finance.yahoo.com")))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withStatus(HttpStatus.TOO_MANY_REQUESTS));

        // Secondary also fails
        mockServer.expect(requestTo(org.hamcrest.Matchers.containsString("query2.finance.yahoo.com")))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withServerError());

        OptionalDouble result = service.getLastYearExpectedReturn("VFIAX");

        assertTrue(result.isEmpty());
    }
}
