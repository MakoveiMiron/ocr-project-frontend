'use client';

import { useCallback, useEffect, useState } from 'react';
import { Hero } from '@/components/Hero';
import { UploadForm } from '@/components/UploadForm';
import { fetchDocuments } from '@/lib/api';
import { DocumentSummary } from '@/lib/types';
import { useAuthStatus } from '@/lib/useAuthStatus';

export default function HomePage() {
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [error, setError] = useState('');
  const { isAuthenticated, isLoading } = useAuthStatus();

  const loadDocuments = useCallback(async () => {
    if (!isAuthenticated) {
      setDocuments([]);
      return;
    }

    try {
      const docs = await fetchDocuments();
      setDocuments(docs);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load conversions.');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    void loadDocuments();
    const interval = setInterval(() => void loadDocuments(), 8000);
    return () => clearInterval(interval);
  }, [isAuthenticated, loadDocuments]);

  const sortedDocuments = [...documents].sort((a, b) => b.id.localeCompare(a.id));
  const latestCompletedDocument = sortedDocuments.find((doc) => doc.status === 'completed');

  return (
    <>
      <Hero />
      <section className="container" style={{ paddingBottom: 40 }}>
        <div className="grid grid-2">
          <UploadForm onComplete={loadDocuments} isAuthenticated={isAuthenticated} />
          <div className="card">
            <h2 className="section-title">Latest processed file</h2>
            {latestCompletedDocument ? (
              <div className="small" style={{ display: 'grid', gap: 12 }}>
                <p style={{ margin: 0 }}>
                  <strong>File:</strong> {latestCompletedDocument.original_filename}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Status:</strong> completed
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <a className="btn btn-secondary" href={`/document?documentId=${latestCompletedDocument.id}`}>View GPMB</a>
                  <a className="btn btn-primary" href={`/document?documentId=${latestCompletedDocument.id}&download=1`}>Download DOCX</a>
                </div>
              </div>
            ) : (
              <p className="small" style={{ marginBottom: 0 }}>
                Your processed file will appear here. After OCR finishes, you can open details (View GPMB) or download DOCX.
              </p>
            )}
          </div>
        </div>
        {isLoading ? <p className="small mt-16">Checking authentication…</p> : null}
        {!isAuthenticated && !isLoading ? (
          <p className="small mt-16" style={{ color: 'var(--danger)' }}>
            You must sign in to upload and convert files.
          </p>
        ) : null}
        {error ? <p className="small mt-16" style={{ color: 'var(--danger)' }}>{error}</p> : null}
      </section>
    </>
  );
}
