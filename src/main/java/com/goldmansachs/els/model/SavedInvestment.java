package com.goldmansachs.els.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "saved_investments")
public class SavedInvestment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String label;
    private String ticker;
    private String fundName;
    private double initialInvestment;
    private double monthlyContribution;
    private int years;
    private double futureValue;
    private double capmReturn;
    private double beta;
    private double totalContributed;
    private double riskFreeRate;
    private double expectedMarketReturn;

    @Column(nullable = false)
    private LocalDateTime savedAt;

    @PrePersist
    protected void onCreate() {
        this.savedAt = LocalDateTime.now();
    }

    public SavedInvestment() {
    }

    public SavedInvestment(String label, String ticker, String fundName, double initialInvestment,
                           double monthlyContribution, int years, double futureValue, double capmReturn,
                           double beta, double totalContributed, double riskFreeRate, double expectedMarketReturn) {
        this.label = label;
        this.ticker = ticker;
        this.fundName = fundName;
        this.initialInvestment = initialInvestment;
        this.monthlyContribution = monthlyContribution;
        this.years = years;
        this.futureValue = futureValue;
        this.capmReturn = capmReturn;
        this.beta = beta;
        this.totalContributed = totalContributed;
        this.riskFreeRate = riskFreeRate;
        this.expectedMarketReturn = expectedMarketReturn;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public String getTicker() { return ticker; }
    public void setTicker(String ticker) { this.ticker = ticker; }

    public String getFundName() { return fundName; }
    public void setFundName(String fundName) { this.fundName = fundName; }

    public double getInitialInvestment() { return initialInvestment; }
    public void setInitialInvestment(double initialInvestment) { this.initialInvestment = initialInvestment; }

    public double getMonthlyContribution() { return monthlyContribution; }
    public void setMonthlyContribution(double monthlyContribution) { this.monthlyContribution = monthlyContribution; }

    public int getYears() { return years; }
    public void setYears(int years) { this.years = years; }

    public double getFutureValue() { return futureValue; }
    public void setFutureValue(double futureValue) { this.futureValue = futureValue; }

    public double getCapmReturn() { return capmReturn; }
    public void setCapmReturn(double capmReturn) { this.capmReturn = capmReturn; }

    public double getBeta() { return beta; }
    public void setBeta(double beta) { this.beta = beta; }

    public double getTotalContributed() { return totalContributed; }
    public void setTotalContributed(double totalContributed) { this.totalContributed = totalContributed; }

    public double getRiskFreeRate() { return riskFreeRate; }
    public void setRiskFreeRate(double riskFreeRate) { this.riskFreeRate = riskFreeRate; }

    public double getExpectedMarketReturn() { return expectedMarketReturn; }
    public void setExpectedMarketReturn(double expectedMarketReturn) { this.expectedMarketReturn = expectedMarketReturn; }

    public LocalDateTime getSavedAt() { return savedAt; }
    public void setSavedAt(LocalDateTime savedAt) { this.savedAt = savedAt; }
}
