'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';

interface UploadInitResponse {
  document_id: string;
  upload_url: string;
  storage_key: string;
}

export function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>('');
  const [isBusy, setIsBusy] = useState(false);
  const [stage, setStage] = useState<'idle' | 'uploading' | 'processing'>('idle');

  async function handleUpload() {
    if (!file) return;
    setIsBusy(true);
    setStage('uploading');
    setMessage('');
    try {
      const token = await getAccessToken();
      const init = await apiFetch<UploadInitResponse>(
        '/documents/upload/init',
        {
          method: 'POST',
          body: JSON.stringify({
            filename: file.name,
            content_type: file.type || 'application/pdf',
            size_bytes: file.size
          })
        },
        token
      );

      const isLocalUpload = init.upload_url.includes('/local-upload');
      const uploadUrl = isLocalUpload
        ? (() => {
            const parsedUrl = new URL(init.upload_url, window.location.origin);
            return `${parsedUrl.pathname}${parsedUrl.search}`;
          })()
        : init.upload_url;
      const uploadResponse = await fetch(
        uploadUrl,
        isLocalUpload
          ? (() => {
              const formData = new FormData();
              formData.append('file', file);
              return { method: 'PUT', body: formData };
            })()
          : {
              method: 'PUT',
              headers: { 'Content-Type': file.type || 'application/pdf' },
              body: file
            }
      );

      if (!uploadResponse.ok) {
        throw new Error('A feltöltés nem sikerült.');
      }

      setStage('processing');
      await apiFetch(
        `/documents/${init.document_id}/process`,
        {
          method: 'POST',
          body: JSON.stringify({ engine_policy: 'auto' })
        },
        token
      );

      setMessage('A fájl feltöltve, feldolgozás elindítva.');
      setStage('idle');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Ismeretlen hiba történt.');
      setStage('idle');
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>PDF feltöltés</h2>
      <p className="small">A fájl közvetlenül aláírt URL-en megy a privát tárhelyre.</p>
      <div className="dropzone" style={{ marginTop: 16 }}>
        <input
          className="input"
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>
      <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={handleUpload} disabled={!file || isBusy}>
        {isBusy ? 'Feltöltés...' : 'Feltöltés és feldolgozás'}
      </button>
      {isBusy ? (
        <div className="processing-indicator" aria-live="polite" aria-busy="true">
          <span className="spinner" />
          <span>{stage === 'processing' ? 'Feldolgozás alatt…' : 'Feltöltés alatt…'}</span>
        </div>
      ) : null}
      {message ? <p className="small" style={{ marginTop: 12 }}>{message}</p> : null}
    </div>
  );
}
