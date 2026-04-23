'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';

interface UploadInitResponse {
  document_id: string;
  upload_url: string;
  storage_key: string;
}

type UploadStage = 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';

export function UploadForm({ onComplete }: { onComplete?: () => Promise<void> | void }) {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>('');
  const [isBusy, setIsBusy] = useState(false);
  const [stage, setStage] = useState<UploadStage>('idle');

  async function handleUpload() {
    if (!file) return;
    setIsBusy(true);
    setStage('uploading');
    setMessage('Uploading your PDF...');
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
        throw new Error('Upload failed. Please try again.');
      }

      setStage('processing');
      setMessage('Processing started. Your DOCX will appear in recent conversions when ready.');
      await apiFetch(
        `/documents/${init.document_id}/process`,
        {
          method: 'POST',
          body: JSON.stringify({ engine_policy: 'auto' })
        },
        token
      );

      setStage('completed');
      setFile(null);
      await onComplete?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Conversion failed.');
      setStage('failed');
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="card">
      <h2 className="section-title">Upload PDF</h2>
      <p className="small">Select a PDF file to convert it into an editable DOCX document.</p>
      <div className="dropzone mt-16">
        <input
          className="input"
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>
      <button className="btn btn-primary mt-16" onClick={handleUpload} disabled={!file || isBusy}>
        {isBusy ? 'Working...' : 'Convert to DOCX'}
      </button>
      {isBusy ? (
        <div className="processing-indicator" aria-live="polite" aria-busy="true">
          <span className="spinner" />
          <span>{stage === 'processing' ? 'Processing' : 'Uploading'}</span>
        </div>
      ) : null}
      {message ? <p className="small mt-16">{message}</p> : null}
      {stage === 'completed' ? <p className="small">Status: completed</p> : null}
      {stage === 'failed' ? <p className="small" style={{ color: 'var(--danger)' }}>Status: failed</p> : null}
    </div>
  );
}
