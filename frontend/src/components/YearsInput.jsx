export default function YearsInput({ value, onChange }) {
  return (
    <div className="form-group">
      <label htmlFor="years-input">Time Horizon (years):</label>
      <input
        id="years-input"
        type="number"
        min="0"
        step="1"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}
