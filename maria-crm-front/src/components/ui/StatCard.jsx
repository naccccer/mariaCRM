import { formatNumber } from '../../lib/formatters';

export default function StatCard({ label, value, hint }) {
  return (
    <article className="stat-card">
      <p className="stat-label">{label}</p>
      <strong className="stat-value">{typeof value === 'number' ? formatNumber(value) : value}</strong>
      {hint ? <p className="stat-hint">{hint}</p> : null}
    </article>
  );
}
