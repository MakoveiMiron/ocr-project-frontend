'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { apiFetch, apiFetchRaw } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { DocumentDetail } from '@/lib/types';

export default function DocumentDetailPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const searchParams = useSearchParams();
  const [document, setDocument] = useState<DocumentDetail | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const token = await getAccessToken();
        const detail = await apiFetch<DocumentDetail>(`/documents/${documentId}`, undefined, token);
        setDocument(detail);
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
      if (searchParams.get('download') !== '1') return;
      try {
        const token = await getAccessToken();
        const response = await apiFetchRaw(`/documents/${documentId}/download`, undefined, token);
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
            <p className="small"><strong>Status:</strong> {document.status}</p>
            <p className="small"><strong>OCR step:</strong> {document.latest_job?.current_step ?? '-'}</p>
            <p className="small"><strong>DOCX ready:</strong> {document.docx_available ? 'Yes' : 'No'}</p>
          </div>
        )}
      </div>
    </section>
  );
}
