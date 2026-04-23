'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DocumentTable } from '@/components/DocumentTable';
import { UploadForm } from '@/components/UploadForm';
import { apiFetch } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { DocumentSummary, OrganizationSummary } from '@/lib/types';

export default function DashboardPage() {
  const [organization, setOrganization] = useState<OrganizationSummary | null>(null);
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    try {
      const token = await getAccessToken();
      const [org, docs] = await Promise.all([
        apiFetch<OrganizationSummary>('/organizations/me', undefined, token),
        apiFetch<DocumentSummary[]>('/documents/', undefined, token)
      ]);
      setOrganization(org);
      setDocuments(docs);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nem sikerült az adatok lekérése.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
    const interval = setInterval(() => void loadDashboard(), 10000);
    return () => clearInterval(interval);
  }, [loadDashboard]);

  const activeJobs = useMemo(
    () => documents.filter((doc) => !['completed', 'failed', 'expired'].includes(doc.status)).length,
    [documents]
  );

  return (
    <section className="container" style={{ paddingBottom: 40 }}>
      <div className="kpis" style={{ marginBottom: 16 }}>
        <div className="kpi"><span className="small">Szervezet</span><strong>{organization?.name ?? (loading ? 'Betöltés...' : '-')}</strong></div>
        <div className="kpi"><span className="small">Szerepkör</span><strong>{organization?.role ?? '-'}</strong></div>
        <div className="kpi"><span className="small">Dokumentumok</span><strong>{documents.length}</strong></div>
        <div className="kpi"><span className="small">Aktív jobok</span><strong>{activeJobs}</strong></div>
      </div>

      {error ? <p className="small" style={{ color: 'var(--danger)' }}>{error}</p> : null}

      <div className="grid grid-2">
        <UploadForm onComplete={loadDashboard} />
        <div className="card">
          <h2 className="section-title">Szervezet és billing</h2>
          <p className="small">Állítsd be a szervezetet, kezeld a tagokat és az előfizetést adatvédelmi kontrollokkal.</p>
          <div className="stack-sm">
            <Link className="btn btn-secondary" href="/organizations/register">Szervezet regisztráció</Link>
            <Link className="btn btn-secondary" href="/members">Tagok kezelése</Link>
            <Link className="btn btn-secondary" href="/pricing">Csomagváltás / checkout</Link>
            <Link className="btn btn-secondary" href="/admin/webhooks">Webhook admin</Link>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <DocumentTable documents={documents} />
      </div>
    </section>
  );
}
