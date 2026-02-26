package com.goldmansachs.els.controller;

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

    @GetMapping("/mutualfunds")
    public List<MutualFund> getAllFunds() {
        return mutualFundService.getAllFunds();
    }

    @GetMapping("/calculate")
    public CalculationResult calculate(
            @RequestParam String ticker,
            @RequestParam double investment,
            @RequestParam int years) {
        return calculationService.calculate(ticker, investment, years);
    }
}
