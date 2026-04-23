'use client';

import { useEffect, useMemo, useState } from 'react';
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
        setMessage(error instanceof Error ? error.message : 'Státusz lekérés sikertelen.');
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
        setMessage(error instanceof Error ? error.message : 'A letöltés nem sikerült.');
      }
    }

    void maybeDownload();
  }, [document?.original_filename, documentId, searchParams]);

  const retentionLabel = useMemo(() => {
    if (!document?.retention_deadline) return 'Nincs megadva';
    const deadline = new Date(document.retention_deadline);
    const diffMs = deadline.getTime() - Date.now();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return `Lejárt (${Math.abs(diffDays)} napja)`;
    return `${diffDays} nap múlva jár le`;
  }, [document?.retention_deadline]);

  return (
    <section className="container" style={{ paddingBottom: 40 }}>
      <div className="card">
        <h1 style={{ marginTop: 0 }}>Dokumentum státusz</h1>
        {message ? <p className="small" style={{ color: 'var(--danger)' }}>{message}</p> : null}
        {!document ? <p className="small">Betöltés...</p> : (
          <div className="grid" style={{ gap: 12 }}>
            <p className="small"><strong>Fájlnév:</strong> {document.original_filename}</p>
            <p className="small"><strong>Állapot:</strong> {document.status}</p>
            <p className="small"><strong>Aktuális lépés:</strong> {document.latest_job?.current_step ?? '-'}</p>
            <p className="small"><strong>Job státusz:</strong> {document.latest_job?.status ?? '-'}</p>
            <p className="small"><strong>Blokkok:</strong> {document.block_count ?? '-'}</p>
            <p className="small"><strong>Retention:</strong> {retentionLabel}</p>
            <p className="small"><strong>Cleanup státusz:</strong> {document.cleanup_status ?? '-'}</p>
            <p className="small"><strong>DOCX elérhető:</strong> {document.docx_available ? 'igen' : 'nem'}</p>
            <details>
              <summary className="small">Komplexitás és routing döntések</summary>
              <pre className="small" style={{ whiteSpace: 'pre-wrap' }}>
                {JSON.stringify({ complexity: document.complexity_results, routing: document.ocr_routing_decisions }, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </section>
  );
}
