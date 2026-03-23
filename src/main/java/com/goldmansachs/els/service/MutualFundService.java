package com.goldmansachs.els.service;

import com.goldmansachs.els.model.MutualFund;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MutualFundService {

    // Fallback returns from Yahoo Finance (used when live API is unavailable)
    private final List<MutualFund> funds = List.of(
            // Mutual Funds
            new MutualFund("VFIAX", "Vanguard 500 Index Fund", 0.1420),
            new MutualFund("FXAIX", "Fidelity 500 Index Fund", 0.1420),
            new MutualFund("AGTHX", "American Funds Growth Fund of America", 0.2509),
            new MutualFund("FCNTX", "Fidelity Contrafund", 0.2061),
            new MutualFund("TRBCX", "T. Rowe Price Blue Chip Growth", 0.1666),
            // ETFs
            new MutualFund("SPY", "SPDR S&P 500 ETF", 0.1636),
            new MutualFund("QQQ", "Invesco QQQ Trust (Nasdaq 100)", 0.2128),
            new MutualFund("VTI", "Vanguard Total Stock Market ETF", 0.1641),
            new MutualFund("SCHD", "Schwab US Dividend Equity ETF", 0.1367),
            new MutualFund("ARKK", "ARK Innovation ETF", 0.3102)
    );

    public List<MutualFund> getAllFunds() {
        return funds;
    }

    public Optional<MutualFund> findFundByTicker(String ticker) {
        return funds.stream()
                .filter(fund -> fund.ticker().equalsIgnoreCase(ticker))
                .findFirst();
    }

    public MutualFund getFundByTicker(String ticker) {
        return findFundByTicker(ticker)
                .orElseThrow(() -> new IllegalArgumentException("Fund not found: " + ticker));
    }
}
