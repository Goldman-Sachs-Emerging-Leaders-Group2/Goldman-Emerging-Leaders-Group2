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
