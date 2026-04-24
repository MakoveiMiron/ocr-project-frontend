'use client';

import { useCallback, useEffect, useState } from 'react';
import { Hero } from '@/components/Hero';
import { DocumentTable } from '@/components/DocumentTable';
import { UploadForm } from '@/components/UploadForm';
import { apiFetch } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { DocumentSummary } from '@/lib/types';

export default function HomePage() {
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [error, setError] = useState('');

  const loadDocuments = useCallback(async () => {
    try {
      const token = await getAccessToken();
      const docs = await apiFetch<DocumentSummary[]>('/documents', undefined, token);
      setDocuments(docs);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load conversions.');
    }
  }, []);

  useEffect(() => {
    void loadDocuments();
    const interval = setInterval(() => void loadDocuments(), 8000);
    return () => clearInterval(interval);
  }, [loadDocuments]);

  return (
    <>
      <Hero />
      <section className="container" style={{ paddingBottom: 40 }}>
        <div className="grid grid-2">
          <UploadForm onComplete={loadDocuments} />
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
        {error ? <p className="small mt-16" style={{ color: 'var(--danger)' }}>{error}</p> : null}
        <div style={{ marginTop: 16 }}>
          <DocumentTable documents={documents} />
        </div>
      </section>
    </>
  );
}
