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

  async function handleUpload() {
    if (!file) return;
    setIsBusy(true);
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
      const uploadResponse = await fetch(init.upload_url, isLocalUpload
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

      await apiFetch(
        `/documents/${init.document_id}/process`,
        {
          method: 'POST',
          body: JSON.stringify({ engine_policy: 'auto' })
        },
        token
      );

      setMessage('A fájl feltöltve, feldolgozás elindítva.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Ismeretlen hiba történt.');
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
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>
      <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={handleUpload} disabled={!file || isBusy}>
        {isBusy ? 'Feltöltés...' : 'Feltöltés és feldolgozás'}
      </button>
      {message ? <p className="small" style={{ marginTop: 12 }}>{message}</p> : null}
    </div>
  );
}
