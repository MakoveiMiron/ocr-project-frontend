'use client';

import { useCallback, useEffect, useState } from 'react';
import { Hero } from '@/components/Hero';
import { UploadForm } from '@/components/UploadForm';
import { deleteDocument, ApiError, fetchDocumentDetail, fetchDocuments } from '@/lib/api';
import { getOptionalAccessToken } from '@/lib/auth';
import { DocumentDetail, DocumentSummary } from '@/lib/types';
import { useAuthStatus } from '@/lib/useAuthStatus';

export default function HomePage() {
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [downloadableDocuments, setDownloadableDocuments] = useState<DocumentDetail[]>([]);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [deletingDocumentId, setDeletingDocumentId] = useState('');
  const [deleteErrors, setDeleteErrors] = useState<Record<string, string>>({});
  const [downloadedDocumentIds, setDownloadedDocumentIds] = useState<Record<string, boolean>>({});
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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const downloadedMap = downloadableDocuments.reduce<Record<string, boolean>>((acc, document) => {
      acc[document.document_id] = window.sessionStorage.getItem(`auto-download-consumed:${document.document_id}`) === '1';
      return acc;
    }, {});
    setDownloadedDocumentIds(downloadedMap);
  }, [downloadableDocuments]);

  useEffect(() => {
    if (!toastMessage) return;
    const timeout = window.setTimeout(() => setToastMessage(''), 3000);
    return () => window.clearTimeout(timeout);
  }, [toastMessage]);

  const handleDeleteDocument = useCallback(async (documentId: string) => {
    const shouldDelete = window.confirm('Delete this document now? This cannot be undone.');
    if (!shouldDelete) {
      return;
    }

    setDeletingDocumentId(documentId);
    setDeleteErrors((current) => ({ ...current, [documentId]: '' }));
    try {
      const token = await getOptionalAccessToken();
      await deleteDocument(documentId, token);
      setDownloadableDocuments((current) => current.filter((item) => item.document_id !== documentId));
      setDocuments((current) => current.filter((item) => item.id !== documentId));
      setDownloadedDocumentIds((current) => ({ ...current, [documentId]: false }));
      window.sessionStorage.removeItem(`auto-download-consumed:${documentId}`);
      setToastMessage('Document deleted.');
    } catch (err) {
      let message = 'Delete failed. Please retry.';
      if (err instanceof ApiError && err.status === 422) {
        message = 'Invalid document id.';
      } else if (err instanceof ApiError && err.status === 404) {
        message = 'Document not found or already deleted.';
      }
      setDeleteErrors((current) => ({ ...current, [documentId]: message }));
    } finally {
      setDeletingDocumentId('');
    }
  }, []);

  return (
    <>
      <Hero />
      <section className="container" style={{ paddingBottom: 40 }}>
        {toastMessage ? <p className="small" style={{ color: 'var(--accent)', marginTop: 0 }}>{toastMessage}</p> : null}
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
                      {downloadedDocumentIds[document.document_id] ? (
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => void handleDeleteDocument(document.document_id)}
                          disabled={deletingDocumentId === document.document_id}
                        >
                          {deletingDocumentId === document.document_id ? 'Deleting…' : 'Delete'}
                        </button>
                      ) : null}
                    </div>
                    {deleteErrors[document.document_id] ? (
                      <div className="small" style={{ color: 'var(--danger)', display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span>{deleteErrors[document.document_id]}</span>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => void handleDeleteDocument(document.document_id)}
                          disabled={deletingDocumentId === document.document_id}
                        >
                          Retry
                        </button>
                      </div>
                    ) : null}
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
