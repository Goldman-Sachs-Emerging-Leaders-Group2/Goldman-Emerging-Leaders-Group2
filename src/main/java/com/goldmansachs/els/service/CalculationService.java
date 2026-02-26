package com.goldmansachs.els.service;

import com.goldmansachs.els.model.CalculationResult;
import com.goldmansachs.els.model.MutualFund;
import org.springframework.stereotype.Service;

@Service
public class CalculationService {

    // US Treasury rate, used as the "zero risk" baseline in CAPM
    private static final double RISK_FREE_RATE = 0.0425;

    private final MutualFundService mutualFundService;
    private final BetaService betaService;

    public CalculationService(MutualFundService mutualFundService, BetaService betaService) {
        this.mutualFundService = mutualFundService;
        this.betaService = betaService;
    }

    public CalculationResult calculate(String ticker, double investment, int years) {
        MutualFund fund = mutualFundService.getFundByTicker(ticker);
        double beta = betaService.getBeta(ticker);

        double expectedMarketReturn = fund.expectedAnnualReturn();
        // CAPM: rate = riskFreeRate + beta * (expectedReturn - riskFreeRate)
        double capmReturn = RISK_FREE_RATE + beta * (expectedMarketReturn - RISK_FREE_RATE);
        // Future value: principal * (1 + rate) ^ years
        double futureValue = investment * Math.pow(1 + capmReturn, years);

        return new CalculationResult(
                fund.ticker(),
                fund.name(),
                investment,
                years,
                beta,
                RISK_FREE_RATE,
                expectedMarketReturn,
                capmReturn,
                futureValue
        );
    }
}
