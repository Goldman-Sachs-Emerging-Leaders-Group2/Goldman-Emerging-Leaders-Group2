# Mutual Fund Calculator — Goldman Sachs Emerging Leaders Group 2

A web app where users select a mutual fund, enter an investment amount and time horizon, and see the predicted future value using the CAPM formula.

## Prerequisites

- **Java 21** — [Download](https://adoptium.net/)
- **Maven 3.9+** — [Download](https://maven.apache.org/download.cgi)
- **Node.js 18+** and **Yarn** — for the React frontend

Verify your setup:

```bash
java -version    # should show 21
mvn -version     # should show 3.9+
node --version   # should show 18+
yarn --version   # should show 1.22+
```

## Getting Started

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd Goldman-Emerging-Leaders-Group2
```

### 2. Run the backend

```bash
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`.

### 3. Run the frontend

```bash
cd frontend
yarn install
yarn dev
```

The React app will open at `http://localhost:5173`.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 21, Spring Boot 4.0.3, Maven |
| Frontend | React 19, Vite 7, Yarn |
| External API | Newton Analytics (stock beta values) |

## API Endpoints

### GET `/api/mutualfunds`

Returns the list of available mutual funds.

```json
[
  { "ticker": "VFIAX", "name": "Vanguard 500 Index Fund", "expectedAnnualReturn": 0.1553 },
  { "ticker": "FXAIX", "name": "Fidelity 500 Index Fund", "expectedAnnualReturn": 0.1556 },
  { "ticker": "AGTHX", "name": "American Funds Growth Fund of America", "expectedAnnualReturn": 0.1515 },
  { "ticker": "FCNTX", "name": "Fidelity Contrafund", "expectedAnnualReturn": 0.1776 },
  { "ticker": "TRBCX", "name": "T. Rowe Price Blue Chip Growth", "expectedAnnualReturn": 0.1649 }
]
```

### GET `/api/calculate?ticker=VFIAX&investment=10000&years=10`

Calculates the predicted future value using CAPM.

```json
{
  "ticker": "VFIAX",
  "fundName": "Vanguard 500 Index Fund",
  "initialInvestment": 10000.0,
  "years": 10,
  "beta": 1.0,
  "riskFreeRate": 0.0425,
  "expectedMarketReturn": 0.1553,
  "capmReturn": 0.1553,
  "futureValue": 42317.69
}
```

## Project Structure

```
Goldman-Emerging-Leaders-Group2/
├── pom.xml                              ← Maven build config
├── src/main/java/com/goldmansachs/els/
│   ├── ElsApplication.java             ← Entry point
│   ├── model/
│   │   ├── MutualFund.java             ← Fund data (ticker, name, return)
│   │   ├── CalculationResult.java      ← API response for /calculate
│   │   └── NewtonAnalyticsResponse.java ← Newton API response mapping
│   ├── service/
│   │   ├── MutualFundService.java      ← Hardcoded fund list + lookup
│   │   ├── BetaService.java            ← Calls Newton Analytics for beta
│   │   └── CalculationService.java     ← CAPM formula + future value
│   ├── controller/
│   │   └── MutualFundController.java   ← REST endpoints
│   └── config/
│       └── WebConfig.java              ← CORS config for React
└── frontend/                            ← React app (Vite + Yarn)
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx                     ← React entry point
        ├── App.jsx                      ← Main app component
        ├── App.css
        └── index.css
```

## CAPM Formula

```
CAPM Return = Risk-Free Rate + Beta × (Expected Market Return − Risk-Free Rate)
Future Value = Investment × (1 + CAPM Return) ^ Years
```

- **Risk-free rate:** 4.25% (hardcoded)
- **Beta:** Fetched from Newton Analytics API
- **Expected market return:** Based on the fund's historical annual return
