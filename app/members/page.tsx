'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { OrganizationMember, OrganizationSummary } from '@/lib/types';

export default function MembersPage() {
  const [organization, setOrganization] = useState<OrganizationSummary | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadMembers() {
      try {
        const token = await getAccessToken();
        const org = await apiFetch<OrganizationSummary>('/organizations/me', undefined, token);
        const memberList = await apiFetch<OrganizationMember[]>(`/organizations/${org.id}/members`, undefined, token);
        setOrganization(org);
        setMembers(memberList);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load members.');
      }
    }

    void loadMembers();
  }, []);

  return (
    <section className="container" style={{ paddingBottom: 40 }}>
      <div className="card">
        <h1 style={{ marginTop: 0 }}>Organization members</h1>
        <p className="small">Organization: {organization?.name ?? '-'}</p>
        {error ? <p className="small" style={{ color: 'var(--danger)' }}>{error}</p> : null}
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>User ID</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.user_id}>
                <td>{member.full_name}</td>
                <td>{member.email}</td>
                <td>{member.role}</td>
                <td><code>{member.user_id.slice(0, 8)}…</code></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
