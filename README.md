# Mutual Fund Investment Calculator

Goldman Sachs Emerging Leaders Program — Group 2

A dashboard for comparing mutual fund and ETF investments using the Capital Asset Pricing Model (CAPM). Select funds, set your parameters, and see projected returns with interactive charts and insights.

## Quick Start

```bash
./start.sh
```

This starts both the Spring Boot backend (port 8080) and the React frontend (port 5173). Open [http://localhost:5173](http://localhost:5173).

To stop, press `Ctrl+C`.

## Prerequisites

- Java 21
- Maven 3.9+
- Node.js 18+
- Yarn

## Running Manually

If you prefer to start each server separately:

```bash
# Terminal 1 — Backend
mvn spring-boot:run

# Terminal 2 — Frontend
cd frontend
yarn install
yarn dev
```

## Running Tests

```bash
# Backend (from project root)
mvn test

# Frontend (from frontend/)
cd frontend
yarn test
```

## Features

- **CAPM Calculator** — Future value projections using continuous compounding
- **Multi-Fund Comparison** — Compare up to 5 funds side-by-side
- **5 Mutual Funds + 5 ETFs** — VFIAX, FXAIX, AGTHX, FCNTX, TRBCX, SPY, QQQ, VTI, SCHD, ARKK
- **Custom Tickers** — Search and add any valid US ticker
- **Monthly Contributions (SIP)** — Factor in recurring investments
- **Risk Tolerance** — 1-10 scale with bidirectional fund-risk matching
- **Goal Tracking** — Set a target amount, see if/when projections reach it
- **Saved Investments** — Save calculations to an H2 database, view history, re-run scenarios
- **Interactive Charts** — Growth projections, investment breakdown pie chart
- **Financial Insights** — Time to double, inflation-adjusted returns, risk analysis
- **Dashboard Layout** — Sidebar navigation with animated transitions
- **Dark / Light Theme** — Toggle with persistence

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 21, Spring Boot 3.3.5, Spring Data JPA, H2 Database |
| Frontend | React 19, Vite 7, Tailwind CSS |
| Charts | Recharts |
| External APIs | Newton Analytics (beta), Yahoo Finance (historical returns) |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/mutualfunds` | List all available funds |
| GET | `/api/calculate?ticker=VFIAX&investment=10000&years=10` | Calculate future value |
| GET | `/api/investments` | List saved investments |
| POST | `/api/investments` | Save a calculation |
| DELETE | `/api/investments/{id}` | Delete a saved investment |

Optional query params on `/api/calculate`: `monthlyContribution` (default 0).

## CAPM Formula

```
CAPM Return = Risk-Free Rate + β × (Expected Market Return − Risk-Free Rate)
Future Value = Investment × e^(CAPM Return × Years)
```

- **Risk-free rate:** 4.25% (US Treasury baseline)
- **Beta:** Live from Newton Analytics API
- **Expected market return:** Yahoo Finance 1-year return, with hardcoded fallback
