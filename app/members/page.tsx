'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { fetchMyOrganization, fetchOrganizationMembers } from '@/lib/api';
import { OrganizationMember, OrganizationSummary } from '@/lib/types';
import { Toast } from '@/components/Toast';

function MembersContent() {
  const [organization, setOrganization] = useState<OrganizationSummary | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadMembers() {
      try {
        const org = await fetchMyOrganization();
        const orgMembers = await fetchOrganizationMembers(org.id);
        setOrganization(org);
        setMembers(orgMembers);
        setMessage('');
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Failed to load organization members.');
      }
    }

    void loadMembers();
  }, []);

  return (
    <>
      <Toast message={message} tone={message ? (message.toLowerCase().includes('fail') || message.toLowerCase().includes('error') ? 'error' : 'info') : 'info'} onClose={() => setMessage('')} />
    <section className="container page">
      <div className="card">
        <h1 style={{ marginTop: 0 }}>Organization members</h1>
        {organization ? (
          <p className="small">
            <strong>{organization.name}</strong> ({organization.slug}) — your role: {organization.role}
          </p>
        ) : <p className="small">Loading organization…</p>}
        {message ? <p className="small" style={{ color: 'var(--danger)' }}>{message}</p> : null}
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.user_id}>
                <td>{member.full_name}</td>
                <td>{member.email}</td>
                <td>{member.role}</td>
              </tr>
            ))}
            {members.length === 0 ? (
              <tr>
                <td colSpan={3} className="small">No members found.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
    </>
  );
}

export default function MembersPage() {
  return (
    <ProtectedRoute>
      <MembersContent />
    </ProtectedRoute>
  );
}
