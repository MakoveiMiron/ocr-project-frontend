'use client';

import { useState } from 'react';
import { fetchDocumentDetail, initDocumentUpload, processDocument, uploadDocumentBinary } from '@/lib/api';
import { getOptionalAccessToken } from '@/lib/auth';

type UploadStage = 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';
type FileJobState = {
  fileName: string;
  stage: UploadStage;
  message: string;
};

export function UploadForm({ onComplete, isAuthenticated }: { onComplete?: () => Promise<void> | void; isAuthenticated: boolean }) {
  const [files, setFiles] = useState<File[]>([]);
  const [translationFriendly, setTranslationFriendly] = useState(true);
  const [preserveLayout, setPreserveLayout] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [isBusy, setIsBusy] = useState(false);
  const [stage, setStage] = useState<UploadStage>('idle');
  const [fileStatuses, setFileStatuses] = useState<FileJobState[]>([]);

  async function wait(ms: number) {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function pollUntilFinished(documentId: string, token: string | undefined, fileName: string) {
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
            ? { ...item, stage: 'failed', message: detail.error_message || `Processing ${normalizedStatus}.` }
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
      const token = await getOptionalAccessToken();
      setFileStatuses(files.map((file) => ({ fileName: file.name, stage: 'uploading', message: 'Uploading...' })));

      for (const file of files) {
        const init = await initDocumentUpload({
          filename: file.name,
          content_type: file.type || 'application/pdf',
          size_bytes: file.size
        }, token);

        await uploadDocumentBinary(init.upload_url, file, token);

        setFileStatuses((current) => current.map((item) => (
          item.fileName === file.name ? { ...item, stage: 'processing', message: 'Queued for OCR processing...' } : item
        )));
        setStage('processing');
        await processDocument(init.document_id, {
          engine_policy: 'auto',
          translation_friendly: translationFriendly,
          preserve_layout: preserveLayout
        }, token);
        await pollUntilFinished(init.document_id, token, file.name);
      }

      setStage('completed');
      setMessage('All files were submitted. Download the DOCX from the latest processed file panel when ready.');
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
      <p className="small" style={{ marginBottom: 8 }}>Select a PDF file to convert it into an editable DOCX document.</p>
      <div className="dropzone mt-12">
        <input
          className="input"
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/tiff,image/webp,image/bmp"
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
        />
      </div>
      <button className="btn btn-primary mt-12" onClick={handleUpload} disabled={!files.length || isBusy || !isAuthenticated}>
        {isBusy ? 'Working...' : 'Convert to DOCX'}
      </button>
      <div className="mt-12 small" style={{ display: 'grid', gap: 8 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            checked={translationFriendly}
            onChange={(e) => setTranslationFriendly(e.target.checked)}
            disabled={isBusy}
          />
          Translation friendly output
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            checked={preserveLayout}
            onChange={(e) => setPreserveLayout(e.target.checked)}
            disabled={isBusy}
          />
          Preserve original layout
        </label>
      </div>
      {!isAuthenticated ? <p className="small mt-12" style={{ color: 'var(--danger)' }}>Please sign in before converting files.</p> : null}
      {isBusy ? (
        <div className="processing-indicator" aria-live="polite" aria-busy="true">
          <span className="spinner" />
          <span>{stage === 'processing' ? 'Processing' : 'Uploading'}</span>
        </div>
      ) : null}
      {fileStatuses.length ? (
        <ul className="small mt-12 upload-status-list" style={{ marginBottom: 0 }}>
          {fileStatuses.map((item) => <li key={item.fileName}><strong>{item.fileName}:</strong> {item.message}</li>)}
        </ul>
      ) : null}
      {message ? <p className="small mt-12">{message}</p> : null}
      {stage === 'completed' ? <p className="small">Status: completed</p> : null}
      {stage === 'failed' ? <p className="small" style={{ color: 'var(--danger)' }}>Status: failed</p> : null}
    </div>
  );
}
