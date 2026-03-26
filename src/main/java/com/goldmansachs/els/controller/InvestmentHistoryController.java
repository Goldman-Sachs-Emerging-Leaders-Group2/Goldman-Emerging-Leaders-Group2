package com.goldmansachs.els.controller;

import com.goldmansachs.els.exception.InvalidInputException;
import com.goldmansachs.els.model.SavedInvestment;
import com.goldmansachs.els.repository.SavedInvestmentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/investments")
public class InvestmentHistoryController {

    private final SavedInvestmentRepository repository;

    public InvestmentHistoryController(SavedInvestmentRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<SavedInvestment> getAll() {
        return repository.findAllByOrderBySavedAtDesc();
    }

    @PostMapping
    public SavedInvestment save(@RequestBody SavedInvestment investment) {
        if (investment.getTicker() == null || investment.getTicker().isBlank()) {
            throw new InvalidInputException("ticker is required.");
        }
        if (investment.getInitialInvestment() <= 0) {
            throw new InvalidInputException("initialInvestment must be greater than 0.");
        }
        if (investment.getYears() < 1) {
            throw new InvalidInputException("years must be at least 1.");
        }
        if (investment.getMonthlyContribution() < 0) {
            throw new InvalidInputException("monthlyContribution must be 0 or greater.");
        }
        if (!Double.isFinite(investment.getFutureValue())) {
            throw new InvalidInputException("futureValue must be a finite number.");
        }
        if (investment.getLabel() != null && investment.getLabel().length() > 100) {
            throw new InvalidInputException("label must be 100 characters or fewer.");
        }
        investment.setId(null);
        investment.setSavedAt(null);
        return repository.save(investment);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
