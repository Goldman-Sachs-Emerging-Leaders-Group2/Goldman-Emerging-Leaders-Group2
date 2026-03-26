package com.goldmansachs.els.controller;

import com.goldmansachs.els.exception.InvalidInputException;
import com.goldmansachs.els.exception.TickerNotFoundException;
import com.goldmansachs.els.model.Asset;
import com.goldmansachs.els.model.CalculationResult;
import com.goldmansachs.els.service.AssetService;
import com.goldmansachs.els.service.CalculationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class AssetController {

    private final AssetService assetService;
    private final CalculationService calculationService;

    public AssetController(AssetService assetService, CalculationService calculationService) {
        this.assetService = assetService;
        this.calculationService = calculationService;
    }

    @GetMapping({"/assets", "/mutualfunds", "/mutual-funds"})
    public List<Asset> getAllAssets() {
        return assetService.getAllAssets();
    }

    // Consider POST if parameters grow or include sensitive data
    @GetMapping({"/calculate", "/investment/future-value"})
    public CalculationResult calculate(
            @RequestParam String ticker,
            @RequestParam double investment,
            @RequestParam int years) {
        if (ticker == null || ticker.trim().isEmpty()) {
            throw new InvalidInputException("ticker is required and must be non-blank.");
        }
        if (investment <= 0) {
            throw new InvalidInputException("investment must be greater than 0.");
        }
        if (years < 0 || years > 100) {
            throw new InvalidInputException("years must be between 0 and 100.");
        }

        try {
            CalculationResult result = calculationService.calculate(ticker, investment, years);
            if (result == null) {
                throw new TickerNotFoundException(ticker);
            }
            return result;
        } catch (IllegalArgumentException ex) {
            throw new TickerNotFoundException(ticker);
        }
    }
}
