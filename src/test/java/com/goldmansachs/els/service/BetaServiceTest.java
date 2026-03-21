package com.goldmansachs.els.service;

import com.goldmansachs.els.exception.ExternalApiException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

class BetaServiceTest {

    private MockRestServiceServer mockServer;
    private BetaService betaService;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder();
        mockServer = MockRestServiceServer.bindTo(builder).build();
        betaService = new BetaService(builder);
    }

    @Test
    void getBeta_returnsValidBeta() {
        mockServer.expect(requestTo(org.hamcrest.Matchers.containsString("/stock-beta/")))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withSuccess("{\"data\": 1.15}", MediaType.APPLICATION_JSON));

        double beta = betaService.getBeta("VFIAX");

        assertEquals(1.15, beta, 1e-12);
        mockServer.verify();
    }

    @Test
    void getBeta_throwsExternalApiException_onHttpError() {
        mockServer.expect(requestTo(org.hamcrest.Matchers.containsString("/stock-beta/")))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withServerError());

        assertThrows(ExternalApiException.class, () -> betaService.getBeta("VFIAX"));
        mockServer.verify();
    }

    @Test
    void getBeta_throwsExternalApiException_onNonFiniteValue() {
        mockServer.expect(requestTo(org.hamcrest.Matchers.containsString("/stock-beta/")))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withSuccess("{\"data\": \"NaN\"}", MediaType.APPLICATION_JSON));

        assertThrows(ExternalApiException.class, () -> betaService.getBeta("VFIAX"));
        mockServer.verify();
    }
}
