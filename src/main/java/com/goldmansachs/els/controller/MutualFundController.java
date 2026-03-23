package com.goldmansachs.els.controller;

import com.goldmansachs.els.exception.InvalidInputException;
import com.goldmansachs.els.exception.TickerNotFoundException;
import com.goldmansachs.els.model.CalculationResult;
import com.goldmansachs.els.model.MutualFund;
import com.goldmansachs.els.service.CalculationService;
import com.goldmansachs.els.service.MutualFundService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class MutualFundController {

    private final MutualFundService mutualFundService;
    private final CalculationService calculationService;

    public MutualFundController(MutualFundService mutualFundService, CalculationService calculationService) {
        this.mutualFundService = mutualFundService;
        this.calculationService = calculationService;
    }

    @GetMapping({"/mutualfunds", "/mutual-funds"})
    public List<MutualFund> getAllFunds() {
        return mutualFundService.getAllFunds();
    }

    // Consider POST if parameters grow or include sensitive data
    @GetMapping({"/calculate", "/investment/future-value"})
    public CalculationResult calculate(
            @RequestParam String ticker,
            @RequestParam double investment,
            @RequestParam int years,
            @RequestParam(defaultValue = "0") double monthlyContribution) {
        if (ticker == null || ticker.trim().isEmpty()) {
            throw new InvalidInputException("ticker is required and must be non-blank.");
        }
        if (investment <= 0) {
            throw new InvalidInputException("investment must be greater than 0.");
        }
        if (years < 0 || years > 100) {
            throw new InvalidInputException("years must be between 0 and 100.");
        }
        if (monthlyContribution < 0) {
            throw new InvalidInputException("monthlyContribution must be 0 or greater.");
        }

        try {
            CalculationResult result = calculationService.calculate(ticker, investment, years, monthlyContribution);
            if (result == null) {
                throw new TickerNotFoundException(ticker);
            }
            return result;
        } catch (IllegalArgumentException ex) {
            throw new TickerNotFoundException(ticker);
        }
    }
}
