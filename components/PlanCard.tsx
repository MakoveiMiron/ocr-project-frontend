import { Plan } from '@/lib/types';

export function PlanCard({ plan }: { plan: Plan }) {
  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>{plan.name}</h3>
      <p style={{ fontSize: 28, margin: '10px 0 14px' }}>{plan.priceLabel}</p>
      <ul className="small">
        {plan.limits.map((limit) => <li key={limit}>{limit}</li>)}
      </ul>
      <button className="btn btn-primary" style={{ marginTop: 16, width: '100%' }}>
        Választom
      </button>
    </div>
  );
}
