import { ProtectedRoute } from '@/components/ProtectedRoute';
import { UserProfile } from '@/components/UserProfile';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <section className="container page">
        <header className="page-header">
          <p className="eyebrow">Account</p>
          <h1>User profile</h1>
          <p className="muted">Manage your account, organization and subscription details.</p>
        </header>
        <UserProfile />
      </section>
    </ProtectedRoute>
  );
}
