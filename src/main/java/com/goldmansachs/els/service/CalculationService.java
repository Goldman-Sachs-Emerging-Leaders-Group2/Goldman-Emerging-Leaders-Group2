package com.goldmansachs.els.service;

import com.goldmansachs.els.exception.ExternalApiException;
import com.goldmansachs.els.model.CalculationResult;
import com.goldmansachs.els.model.MutualFund;
import org.springframework.stereotype.Service;

@Service
public class CalculationService {

    // US Treasury rate, used as the "zero risk" baseline in CAPM
    private static final double RISK_FREE_RATE = 0.0425;

    private final MutualFundService mutualFundService;
    private final BetaService betaService;
    private final HistoricalReturnService historicalReturnService;

    public CalculationService(
            MutualFundService mutualFundService,
            BetaService betaService,
            HistoricalReturnService historicalReturnService
    ) {
        this.mutualFundService = mutualFundService;
        this.betaService = betaService;
        this.historicalReturnService = historicalReturnService;
    }

    public CalculationResult calculate(String ticker, double investment, int years, double monthlyContribution) {
        MutualFund fund = mutualFundService.findFundByTicker(ticker)
                .orElse(new MutualFund(ticker.toUpperCase(), ticker.toUpperCase(), 0.0));
        double beta = betaService.getBeta(ticker);

        double expectedMarketReturn = historicalReturnService
            .getLastYearExpectedReturn(ticker)
            .orElse(fund.expectedAnnualReturn());
        // CAPM: rate = riskFreeRate + beta * (expectedReturn - riskFreeRate)
        double capmReturn = RISK_FREE_RATE + beta * (expectedMarketReturn - RISK_FREE_RATE);

        // Future value: lump sum + annuity (monthly contributions)
        double lumpSumFV = investment * Math.exp(capmReturn * years);
        double annuityFV = 0;
        if (monthlyContribution > 0 && years > 0 && capmReturn != 0) {
            double monthlyRate = Math.exp(capmReturn / 12.0) - 1;
            if (monthlyRate > 0) {
                annuityFV = monthlyContribution * (Math.exp(capmReturn * years) - 1) / monthlyRate;
            }
        }
        double futureValue = lumpSumFV + annuityFV;
        double totalContributed = investment + monthlyContribution * 12.0 * years;

        if (!Double.isFinite(capmReturn) || !Double.isFinite(futureValue)) {
            throw new ExternalApiException(
                    "Calculation produced invalid results for " + ticker + ". Please try again.");
        }

        return new CalculationResult(
                fund.ticker(),
                fund.name(),
                investment,
                years,
                beta,
                RISK_FREE_RATE,
                expectedMarketReturn,
                capmReturn,
                futureValue,
                monthlyContribution,
                totalContributed
        );
    }
}
