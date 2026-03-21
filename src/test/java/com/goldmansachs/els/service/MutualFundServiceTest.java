package com.goldmansachs.els.service;

import com.goldmansachs.els.model.MutualFund;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class MutualFundServiceTest {

    private final MutualFundService service = new MutualFundService();

    @Test
    void getAllFunds_returnsFiveFunds() {
        List<MutualFund> funds = service.getAllFunds();

        assertEquals(5, funds.size());
        List<String> tickers = funds.stream().map(MutualFund::ticker).toList();
        assertTrue(tickers.contains("VFIAX"));
        assertTrue(tickers.contains("FXAIX"));
        assertTrue(tickers.contains("AGTHX"));
        assertTrue(tickers.contains("FCNTX"));
        assertTrue(tickers.contains("TRBCX"));
    }

    @Test
    void getFundByTicker_returnsCorrectFund() {
        MutualFund fund = service.getFundByTicker("VFIAX");

        assertEquals("VFIAX", fund.ticker());
        assertEquals("Vanguard 500 Index Fund", fund.name());
        assertEquals(0.1553, fund.expectedAnnualReturn(), 1e-6);
    }

    @Test
    void getFundByTicker_isCaseInsensitive() {
        MutualFund fund = service.getFundByTicker("vfiax");

        assertEquals("VFIAX", fund.ticker());
    }

    @Test
    void getFundByTicker_throwsForUnknownTicker() {
        assertThrows(IllegalArgumentException.class, () -> service.getFundByTicker("UNKNOWN"));
    }
}
