package com.goldmansachs.els.repository;

import com.goldmansachs.els.model.SavedInvestment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SavedInvestmentRepository extends JpaRepository<SavedInvestment, Long> {
    List<SavedInvestment> findAllByOrderBySavedAtDesc();
}
