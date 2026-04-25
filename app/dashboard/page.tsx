import { ProtectedRoute } from '@/components/ProtectedRoute';
import { UserProfile } from '@/components/UserProfile';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <section className="container" style={{ paddingBottom: 40 }}>
        <h1>User profile</h1>
        <UserProfile />
      </section>
    </ProtectedRoute>
  );
}
