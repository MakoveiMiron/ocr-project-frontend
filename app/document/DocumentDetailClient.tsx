'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { downloadDocument, fetchDocumentDetail } from '@/lib/api';
import { getOptionalAccessToken } from '@/lib/auth';
import { DocumentDetail } from '@/lib/types';

export default function DocumentDetailClient() {
  const searchParams = useSearchParams();
  const documentId = useMemo(() => searchParams.get('documentId') ?? '', [searchParams]);
  const [document, setDocument] = useState<DocumentDetail | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!documentId) {
      setMessage('Missing document ID. Open this page from the Recent conversions table.');
      setDocument(null);
      return;
    }

    async function load() {
      try {
        const token = await getOptionalAccessToken();
        const detail = await fetchDocumentDetail(documentId, token);
        setDocument(detail);
        setMessage('');
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Failed to fetch status.');
      }
    }

    void load();
    const interval = setInterval(() => void load(), 5000);
    return () => clearInterval(interval);
  }, [documentId]);

  useEffect(() => {
    async function maybeDownload() {
      if (searchParams.get('download') !== '1' || !documentId) return;
      try {
        const token = await getOptionalAccessToken();
        const response = await downloadDocument(documentId, token);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = window.document.createElement('a');
        link.href = url;
        link.download = `${document?.original_filename?.replace(/\.pdf$/i, '') || documentId}.docx`;
        window.document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Download failed.');
      }
    }

    void maybeDownload();
  }, [document?.original_filename, documentId, searchParams]);

  return (
    <section className="container" style={{ paddingBottom: 40 }}>
      <div className="card">
        <h1 style={{ marginTop: 0 }}>Conversion status</h1>
        {message ? <p className="small" style={{ color: 'var(--danger)' }}>{message}</p> : null}
        {!document ? <p className="small">Loading...</p> : (
          <div className="grid" style={{ gap: 12 }}>
            <p className="small"><strong>File:</strong> {document.original_filename}</p>
            <p className="small"><strong>Status:</strong> {document.document_status}</p>
            <p className="small"><strong>Job status:</strong> {document.job_status ?? document.latest_job?.job_status ?? '-'}</p>
            <p className="small"><strong>OCR step:</strong> {document.current_step ?? document.latest_job?.current_step ?? '-'}</p>
            <p className="small"><strong>DOCX ready:</strong> {document.docx_available ? 'Yes' : 'No'}</p>
            <p className="small"><strong>Retention deadline:</strong> {document.retention_deadline ?? '-'}</p>
            <p className="small"><strong>Cleanup status:</strong> {document.cleanup_status ?? '-'}</p>
            <p className="small"><strong>Error message:</strong> {document.error_message ?? '-'}</p>
          </div>
        )}
      </div>
    </section>
  );
}
