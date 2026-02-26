export default function FundDropdown({ funds, value, onChange }) {
  return (
    <div className="form-group">
      <label htmlFor="fund-select">Mutual Fund:</label>
      <select id="fund-select" value={value} onChange={e => onChange(e.target.value)}>
        <option value="">-- choose a fund --</option>
        {funds.map(f => (
          <option key={f.symbol} value={f.symbol}>
            {f.name} ({f.symbol})
          </option>
        ))}
      </select>
    </div>
  );
}
