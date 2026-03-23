package com.goldmansachs.els.service;

import com.goldmansachs.els.model.MutualFund;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class MutualFundServiceTest {

    private final MutualFundService service = new MutualFundService();

    @Test
    void getAllFunds_returnsTenFunds() {
        List<MutualFund> funds = service.getAllFunds();

        assertEquals(10, funds.size());
        List<String> tickers = funds.stream().map(MutualFund::ticker).toList();
        // Mutual Funds
        assertTrue(tickers.contains("VFIAX"));
        assertTrue(tickers.contains("FXAIX"));
        assertTrue(tickers.contains("AGTHX"));
        assertTrue(tickers.contains("FCNTX"));
        assertTrue(tickers.contains("TRBCX"));
        // ETFs
        assertTrue(tickers.contains("SPY"));
        assertTrue(tickers.contains("QQQ"));
        assertTrue(tickers.contains("VTI"));
        assertTrue(tickers.contains("SCHD"));
        assertTrue(tickers.contains("ARKK"));
    }

    @Test
    void getFundByTicker_returnsCorrectMutualFund() {
        MutualFund fund = service.getFundByTicker("VFIAX");

        assertEquals("VFIAX", fund.ticker());
        assertEquals("Vanguard 500 Index Fund", fund.name());
        assertEquals(0.1420, fund.expectedAnnualReturn(), 1e-4);
    }

    @Test
    void getFundByTicker_returnsCorrectEtf() {
        MutualFund fund = service.getFundByTicker("SPY");

        assertEquals("SPY", fund.ticker());
        assertEquals("SPDR S&P 500 ETF", fund.name());
        assertEquals(0.1636, fund.expectedAnnualReturn(), 1e-4);
    }

    @Test
    void findFundByTicker_returnsEmptyForUnknown() {
        assertTrue(service.findFundByTicker("AAPL").isEmpty());
    }

    @Test
    void findFundByTicker_returnsPresentForKnown() {
        assertTrue(service.findFundByTicker("VFIAX").isPresent());
        assertEquals("VFIAX", service.findFundByTicker("VFIAX").get().ticker());
    }

    @Test
    void getFundByTicker_isCaseInsensitive() {
        MutualFund fund = service.getFundByTicker("vfiax");
        assertEquals("VFIAX", fund.ticker());

        MutualFund etf = service.getFundByTicker("spy");
        assertEquals("SPY", etf.ticker());
    }

    @Test
    void getFundByTicker_throwsForUnknownTicker() {
        assertThrows(IllegalArgumentException.class, () -> service.getFundByTicker("UNKNOWN"));
    }
}
