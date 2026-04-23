'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';

interface UploadInitResponse {
  document_id: string;
  upload_url: string;
  storage_key: string;
}

export function UploadForm({ onComplete }: { onComplete?: () => Promise<void> | void }) {
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
        throw new Error('Upload failed.');
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

      setMessage(`File uploaded and processing started. Document ID: ${init.document_id}`);
      setStage('idle');
      setFile(null);
      await onComplete?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unknown error occurred.');
      setStage('idle');
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="card">
      <h2 className="section-title">PDF upload</h2>
      <p className="small">The file is uploaded directly to private storage via signed URL. Tokens are never saved to localStorage.</p>
      <div className="dropzone mt-16">
        <input
          className="input"
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>
      <button className="btn btn-primary mt-16" onClick={handleUpload} disabled={!file || isBusy}>
        {isBusy ? 'Uploading...' : 'Upload and process'}
      </button>
      {isBusy ? (
        <div className="processing-indicator" aria-live="polite" aria-busy="true">
          <span className="spinner" />
          <span>{stage === 'processing' ? 'Processing…' : 'Uploading…'}</span>
        </div>
      ) : null}
      {message ? <p className="small mt-16">{message}</p> : null}
    </div>
  );
}
