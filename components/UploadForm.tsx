'use client';

import { useState } from 'react';
import { fetchDocumentDetail, initDocumentUpload, processDocument } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';

type UploadStage = 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';
type FileJobState = {
  fileName: string;
  stage: UploadStage;
  message: string;
};

export function UploadForm({ onComplete, isAuthenticated }: { onComplete?: () => Promise<void> | void; isAuthenticated: boolean }) {
  const [files, setFiles] = useState<File[]>([]);
  const [message, setMessage] = useState<string>('');
  const [isBusy, setIsBusy] = useState(false);
  const [stage, setStage] = useState<UploadStage>('idle');
  const [fileStatuses, setFileStatuses] = useState<FileJobState[]>([]);

  async function wait(ms: number) {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function pollUntilFinished(documentId: string, token: string, fileName: string) {
    for (let attempt = 0; attempt < 120; attempt += 1) {
      const detail = await fetchDocumentDetail(documentId, token);
      const status = detail.document_status ?? detail.job_status ?? 'processing';
      const step = detail.current_step ?? 'queued';
      const normalizedStatus = status.toLowerCase();

      setFileStatuses((current) => current.map((item) => (
        item.fileName === fileName
          ? { ...item, stage: normalizedStatus === 'failed' ? 'failed' : 'processing', message: `Step: ${step}` }
          : item
      )));

      if (normalizedStatus === 'completed' || detail.docx_available) {
        setFileStatuses((current) => current.map((item) => (
          item.fileName === fileName
            ? { ...item, stage: 'completed', message: 'DOCX ready for download.' }
            : item
        )));
        return;
      }

      if (normalizedStatus === 'failed' || normalizedStatus === 'expired') {
        setFileStatuses((current) => current.map((item) => (
          item.fileName === fileName
            ? { ...item, stage: 'failed', message: `Processing ${normalizedStatus}.` }
            : item
        )));
        return;
      }

      await wait(2000);
    }
  }

  async function handleUpload() {
    if (!files.length || !isAuthenticated) return;
    setIsBusy(true);
    setStage('uploading');
    setMessage('Uploading files...');
    try {
      const token = await getAccessToken();
      setFileStatuses(files.map((file) => ({ fileName: file.name, stage: 'uploading', message: 'Uploading...' })));
      for (const file of files) {
        const init = await initDocumentUpload({
          filename: file.name,
          content_type: file.type || 'application/pdf',
          size_bytes: file.size
        }, token);

        const isLocalUpload = init.upload_url.includes('/local-upload');
        const uploadResponse = await fetch(
          init.upload_url,
          isLocalUpload
            ? (() => {
                const formData = new FormData();
                formData.append('file', file);
                return {
                  method: 'PUT',
                  headers: { Authorization: `Bearer ${token}` },
                  body: formData
                };
              })()
            : {
                method: 'PUT',
                headers: { 'Content-Type': file.type || 'application/pdf' },
                body: file
              }
        );

        if (!uploadResponse.ok) {
          throw new Error(`Upload failed for ${file.name}. Please try again.`);
        }

        setFileStatuses((current) => current.map((item) => (
          item.fileName === file.name ? { ...item, stage: 'processing', message: 'Queued for OCR processing...' } : item
        )));
        setStage('processing');
        await processDocument(init.document_id, { engine_policy: 'auto' }, token);
        await pollUntilFinished(init.document_id, token, file.name);
      }

      setStage('completed');
      setMessage('All files were submitted. Download DOCX files from Recent conversions when ready.');
      setFiles([]);
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
          accept="application/pdf,image/jpeg,image/png,image/tiff,image/webp,image/bmp"
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
        />
      </div>
      <button className="btn btn-primary mt-16" onClick={handleUpload} disabled={!files.length || isBusy || !isAuthenticated}>
        {isBusy ? 'Working...' : 'Convert to DOCX'}
      </button>
      {!isAuthenticated ? <p className="small mt-16" style={{ color: 'var(--danger)' }}>Please sign in before converting files.</p> : null}
      {isBusy ? (
        <div className="processing-indicator" aria-live="polite" aria-busy="true">
          <span className="spinner" />
          <span>{stage === 'processing' ? 'Processing' : 'Uploading'}</span>
        </div>
      ) : null}
      {fileStatuses.length ? (
        <ul className="small mt-16" style={{ marginBottom: 0 }}>
          {fileStatuses.map((item) => <li key={item.fileName}><strong>{item.fileName}:</strong> {item.message}</li>)}
        </ul>
      ) : null}
      {message ? <p className="small mt-16">{message}</p> : null}
      {stage === 'completed' ? <p className="small">Status: completed</p> : null}
      {stage === 'failed' ? <p className="small" style={{ color: 'var(--danger)' }}>Status: failed</p> : null}
    </div>
  );
}
