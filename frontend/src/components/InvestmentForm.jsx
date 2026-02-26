import React, { useState, useEffect } from 'react';
import FundDropdown from './FundDropdown';
import AmountInput from './AmountInput';
import YearsInput from './YearsInput';

const FALLBACK_FUNDS = [
  { symbol: 'VFIAX', name: 'Vanguard 500 Index Fund' },
  { symbol: 'SWPPX', name: 'Schwab S&P 500 Index Fund' },
  { symbol: 'FXAIX', name: 'Fidelity 500 Index Fund' },
];

export default function InvestmentForm({ onCalculate, loading }) {
  const [funds, setFunds] = useState([]);
  const [selectedFund, setSelectedFund] = useState('');
  const [amount, setAmount] = useState('');
  const [years, setYears] = useState('');

  useEffect(() => {
    fetch('/api/funds')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length) {
          setFunds(data);
        } else {
          setFunds(FALLBACK_FUNDS);
        }
      })
      .catch(() => setFunds(FALLBACK_FUNDS));
  }, []);

  const handleSubmit = e => {
    e.preventDefault();
    if (!selectedFund || !amount || !years) return;
    onCalculate({ fund: selectedFund, amount: parseFloat(amount), years: parseInt(years, 10) });
  };

  return (
    <form className="investment-form" onSubmit={handleSubmit}>
      <FundDropdown funds={funds} value={selectedFund} onChange={setSelectedFund} />
      <AmountInput value={amount} onChange={setAmount} />
      <YearsInput value={years} onChange={setYears} />
      <button type="submit" disabled={!selectedFund || !amount || !years || loading}>
        {loading ? 'Calculating...' : 'Calculate'}
      </button>
    </form>
  );
}
