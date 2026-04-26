'use client';

import { useCallback, useEffect, useState } from 'react';
import { Hero } from '@/components/Hero';
import { UploadForm } from '@/components/UploadForm';
import { fetchDocumentDetail, fetchDocuments } from '@/lib/api';
import { DocumentDetail, DocumentSummary } from '@/lib/types';
import { useAuthStatus } from '@/lib/useAuthStatus';

export default function HomePage() {
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [latestDownloadable, setLatestDownloadable] = useState<DocumentDetail | null>(null);
  const [error, setError] = useState('');
  const { isAuthenticated, isLoading } = useAuthStatus();

  const loadLatestDownloadable = useCallback(async (docs: DocumentSummary[]) => {
    const completed = docs
      .filter((doc) => doc.status === 'completed')
      .sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : Number.NaN;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : Number.NaN;
        if (!Number.isNaN(dateA) && !Number.isNaN(dateB) && dateB !== dateA) {
          return dateB - dateA;
        }
        if (!Number.isNaN(dateA) && Number.isNaN(dateB)) return -1;
        if (Number.isNaN(dateA) && !Number.isNaN(dateB)) return 1;
        return b.id.localeCompare(a.id);
      });

    for (const doc of completed) {
      try {
        const detail = await fetchDocumentDetail(doc.id);
        if (detail.docx_available) {
          setLatestDownloadable(detail);
          return;
        }
      } catch {
        // Ignore per-document detail failures and continue with older completed files.
      }
    }

    setLatestDownloadable(null);
  }, []);

  const loadDocuments = useCallback(async () => {
    if (!isAuthenticated) {
      setDocuments([]);
      setLatestDownloadable(null);
      return;
    }

    try {
      const docs = await fetchDocuments();
      setDocuments(docs);
      await loadLatestDownloadable(docs);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load conversions.');
    }
  }, [isAuthenticated, loadLatestDownloadable]);

  useEffect(() => {
    if (!isAuthenticated) return;
    void loadDocuments();
    const interval = setInterval(() => void loadDocuments(), 8000);
    return () => clearInterval(interval);
  }, [isAuthenticated, loadDocuments]);

  return (
    <>
      <Hero />
      <section className="container" style={{ paddingBottom: 40 }}>
        <div className="grid grid-2">
          <UploadForm onComplete={loadDocuments} isAuthenticated={isAuthenticated} />
          <div className="card">
            <h2 className="section-title">Latest processed file</h2>
            {latestDownloadable ? (
              <div className="small" style={{ display: 'grid', gap: 12 }}>
                <p style={{ margin: 0 }}>
                  <strong>File:</strong> {latestDownloadable.original_filename}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Status:</strong> completed
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <a className="btn btn-secondary" href={`/document?documentId=${latestDownloadable.document_id}`}>View GPMB</a>
                  <a className="btn btn-primary" href={`/document?documentId=${latestDownloadable.document_id}&download=1`}>Download DOCX</a>
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
