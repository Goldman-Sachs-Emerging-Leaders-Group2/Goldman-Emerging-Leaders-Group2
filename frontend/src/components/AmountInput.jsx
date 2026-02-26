export default function AmountInput({ value, onChange }) {
  return (
    <div className="form-group">
      <label htmlFor="amount-input">Initial Amount ($):</label>
      <input
        id="amount-input"
        type="number"
        min="0"
        step="0.01"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}
