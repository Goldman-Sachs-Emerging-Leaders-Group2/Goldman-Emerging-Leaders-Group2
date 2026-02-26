import { useState } from 'react';
import './App.css';
import InvestmentForm from './components/InvestmentForm';

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCalculate = ({ fund, amount, years }) => {
    setLoading(true);
    setError('');

    fetch(`/api/calc?fund=${encodeURIComponent(fund)}&amount=${amount}&years=${years}`)
      .then(r => r.json())
      .then(data => setResult(data))
      .catch(() => setError('Calculation failed'))
      .finally(() => setLoading(false));
  };

  return (
    <div className="app-container">
      <div className="card">
        <h1 className="title">Mutual Fund Calculator</h1>
        <InvestmentForm onCalculate={handleCalculate} loading={loading} />
        {loading && <div className="spinner" />}
        {error && <p className="error">{error}</p>}
        {result && !loading && <pre className="output">{JSON.stringify(result, null, 2)}</pre>}
      </div>
    </div>
  );
}

export default App;


