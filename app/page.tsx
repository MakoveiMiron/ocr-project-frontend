'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Hero } from '@/components/Hero';
import { DocumentTable } from '@/components/DocumentTable';
import { UploadForm } from '@/components/UploadForm';
import { fetchDocuments } from '@/lib/api';
import { getAccessToken, hasAccessToken } from '@/lib/auth';
import { DocumentSummary } from '@/lib/types';

export default function HomePage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const loggedIn = hasAccessToken();
    if (!loggedIn) {
      router.replace('/login');
      return;
    }

    setIsAuthenticated(true);
    setIsCheckingAuth(false);
  }, [router]);

  const loadDocuments = useCallback(async () => {
    if (!hasAccessToken()) {
      setDocuments([]);
      return;
    }

    try {
      const token = await getAccessToken();
      const docs = await fetchDocuments(token);
      setDocuments(docs);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load conversions.');
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    void loadDocuments();
    const interval = setInterval(() => void loadDocuments(), 8000);
    return () => clearInterval(interval);
  }, [isAuthenticated, loadDocuments]);

  if (isCheckingAuth) {
    return (
      <section className="container" style={{ paddingBottom: 40 }}>
        <div className="card"><p className="small">Checking authentication…</p></div>
      </section>
    );
  }

  return (
    <>
      <Hero />
      <section className="container" style={{ paddingBottom: 40 }}>
        <div className="grid grid-2">
          <UploadForm onComplete={loadDocuments} isAuthenticated={isAuthenticated} />
          <div className="card">
            <h2 className="section-title">How it works</h2>
            <ol className="small" style={{ paddingLeft: 20, marginTop: 0 }}>
              <li>Upload your PDF file.</li>
              <li>OCR processing starts automatically.</li>
              <li>Track status: uploading, processing, completed, or failed.</li>
              <li>Download the final DOCX when conversion is complete.</li>
            </ol>
            <p className="small" style={{ marginBottom: 0 }}>
              Plans: Free, Pro, and Enterprise. Choose your plan during registration.
            </p>
          </div>
        </div>
        {!isAuthenticated ? (
          <p className="small mt-16" style={{ color: 'var(--danger)' }}>
            You must sign in to upload and convert files.
          </p>
        ) : null}
        {error ? <p className="small mt-16" style={{ color: 'var(--danger)' }}>{error}</p> : null}
        <div style={{ marginTop: 16 }}>
          <DocumentTable documents={documents} />
        </div>
      </section>
    </>
  );
}
