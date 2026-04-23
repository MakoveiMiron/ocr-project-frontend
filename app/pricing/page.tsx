import { PlanCard } from '@/components/PlanCard';
import { Plan } from '@/lib/types';

const plans: Plan[] = [
  {
    code: 'free',
    name: 'Free',
    priceLabel: '0 € / hó',
    limits: ['50 oldal / hó', '10 MB fájlméret', 'Document AI alap routing']
  },
  {
    code: 'starter',
    name: 'Starter',
    priceLabel: '49 € / hó',
    limits: ['1 000 oldal / hó', '50 MB fájlméret', 'Textract használat is']
  },
  {
    code: 'pro',
    name: 'Pro',
    priceLabel: '199 € / hó',
    limits: ['10 000 oldal / hó', '200 MB fájlméret', 'prioritásos feldolgozás']
  }
];

export default function PricingPage() {
  return (
    <section className="container" style={{ paddingBottom: 40 }}>
      <div className="card" style={{ marginBottom: 16 }}>
        <h1 style={{ marginTop: 0 }}>Előfizetési csomagok</h1>
        <p className="small">A backend entitlement alapon kezeli a hozzáférést és a limiteket.</p>
      </div>
      <div className="grid grid-3">
        {plans.map((plan) => <PlanCard key={plan.code} plan={plan} />)}
      </div>
    </section>
  );
}
