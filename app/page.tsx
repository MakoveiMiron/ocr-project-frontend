'use client';

import { useCallback, useEffect, useState } from 'react';
import { Hero } from '@/components/Hero';
import { UploadForm } from '@/components/UploadForm';
import { fetchDocumentDetail, fetchDocuments } from '@/lib/api';
import { DocumentDetail, DocumentSummary } from '@/lib/types';
import { useAuthStatus } from '@/lib/useAuthStatus';

export default function HomePage() {
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [downloadableDocuments, setDownloadableDocuments] = useState<DocumentDetail[]>([]);
  const [error, setError] = useState('');
  const { isAuthenticated, isLoading } = useAuthStatus();

  const loadDownloadableDocuments = useCallback(async (docs: DocumentSummary[]) => {
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

    const downloadable: DocumentDetail[] = [];

    for (const doc of completed) {
      try {
        const detail = await fetchDocumentDetail(doc.id);
        if (detail.docx_available) {
          downloadable.push(detail);
        }
      } catch {
        // Ignore per-document detail failures and continue with older completed files.
      }
    }

    setDownloadableDocuments(downloadable);
  }, []);

  const loadDocuments = useCallback(async () => {
    if (!isAuthenticated) {
      setDocuments([]);
      setDownloadableDocuments([]);
      return;
    }

    try {
      const docs = await fetchDocuments();
      setDocuments(docs);
      await loadDownloadableDocuments(docs);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load conversions.');
    }
  }, [isAuthenticated, loadDownloadableDocuments]);

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
            <h2 className="section-title">Downloadable files</h2>
            {downloadableDocuments.length ? (
              <div className="small" style={{ display: 'grid', gap: 10 }}>
                {downloadableDocuments.map((document) => (
                  <div key={document.document_id} style={{ display: 'grid', gap: 8, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                    <p style={{ margin: 0 }}>
                      <strong>File:</strong> {document.original_filename}
                    </p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <a className="btn btn-secondary" href={`/document?documentId=${document.document_id}`}>View GPMB</a>
                      <a className="btn btn-primary" href={`/document?documentId=${document.document_id}&download=1`}>Download DOCX</a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="small" style={{ marginBottom: 0 }}>
                Your downloadable files will appear here after OCR processing finishes.
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
