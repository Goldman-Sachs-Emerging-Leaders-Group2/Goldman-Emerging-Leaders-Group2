package com.goldmansachs.els.service;

import com.goldmansachs.els.model.MutualFund;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MutualFundService {

    // Hardcoded fund list with historical annual returns (decimal form)
    private final List<MutualFund> funds = List.of(
            new MutualFund("VFIAX", "Vanguard 500 Index Fund", 0.1553),
            new MutualFund("FXAIX", "Fidelity 500 Index Fund", 0.1556),
            new MutualFund("AGTHX", "American Funds Growth Fund of America", 0.1515),
            new MutualFund("FCNTX", "Fidelity Contrafund", 0.1776),
            new MutualFund("TRBCX", "T. Rowe Price Blue Chip Growth", 0.1649)
    );

    public List<MutualFund> getAllFunds() {
        return funds;
    }

    public MutualFund getFundByTicker(String ticker) {
        return funds.stream()
                .filter(fund -> fund.ticker().equalsIgnoreCase(ticker))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Fund not found: " + ticker));
    }
}
