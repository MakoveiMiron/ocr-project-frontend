import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { UserProfile } from '@/components/UserProfile';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <section className="container" style={{ paddingBottom: 40 }}>
        <h1>Dashboard</h1>
        <UserProfile />
        <div className="card">
          <h2 className="section-title">Quick actions</h2>
          <div className="actions-row">
            <Link href="/" className="btn btn-primary">Go to converter</Link>
            <Link href="/subscription" className="btn btn-secondary">Manage subscription</Link>
          </div>
        </div>
      </section>
    </ProtectedRoute>
  );
}
