'use client';

import { useEffect, useState } from 'react';

import { Toast } from '@/components/Toast';
import {
  fetchDocumentDetail,
  initDocumentUpload,
  processDocument,
  uploadDocumentBinary
} from '@/lib/api';
import { getOptionalAccessToken } from '@/lib/auth';

type UploadStage = 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';
type LayoutMode = 'fixed' | 'flow';

function UploadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 15V4m0 0L7.5 8.5M12 4l4.5 4.5M5 16.5v1A2.5 2.5 0 0 0 7.5 20h9a2.5 2.5 0 0 0 2.5-2.5v-1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type FileJobState = {
  fileName: string;
  stage: UploadStage;
  message: string;
};

export function UploadForm({
  onComplete,
  isAuthenticated
}: {
  onComplete?: () => Promise<void> | void;
  isAuthenticated: boolean;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [message, setMessage] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [stage, setStage] = useState<UploadStage>('idle');
  const [fileStatuses, setFileStatuses] = useState<FileJobState[]>([]);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('fixed');

  useEffect(() => {
    if (!message) return;

    const timeout = setTimeout(() => {
      setMessage('');
    }, 3200);

    return () => clearTimeout(timeout);
  }, [message]);

  async function wait(ms: number) {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function pollUntilFinished(
    documentId: string,
    token: string | undefined,
    fileName: string
  ) {
    for (let i = 0; i < 120; i++) {
      const detail = await fetchDocumentDetail(documentId, token);
      const status = (
        detail.document_status ??
        detail.job_status ??
        'processing'
      ).toLowerCase();

      setFileStatuses((current) =>
        current.map((item) =>
          item.fileName === fileName
            ? {
                ...item,
                stage: status === 'failed' ? 'failed' : 'processing',
                message: `Step: ${detail.current_step ?? 'queued'}`
              }
            : item
        )
      );

      if (status === 'completed' || detail.docx_available) {
        setFileStatuses((current) =>
          current.map((item) =>
            item.fileName === fileName
              ? {
                  ...item,
                  stage: 'completed',
                  message: 'DOCX ready for download.'
                }
              : item
          )
        );
        return;
      }

      if (status === 'failed' || status === 'expired') {
        setFileStatuses((current) =>
          current.map((item) =>
            item.fileName === fileName
              ? {
                  ...item,
                  stage: 'failed',
                  message: detail.error_message || `Processing ${status}.`
                }
              : item
          )
        );
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

      setFileStatuses(
        files.map((file) => ({
          fileName: file.name,
          stage: 'uploading',
          message: 'Uploading...'
        }))
      );

      for (const file of files) {
        const init = await initDocumentUpload(
          {
            filename: file.name,
            content_type: file.type || 'application/pdf',
            size_bytes: file.size
          },
          token
        );

        await uploadDocumentBinary(init.upload_url, file, token);

        await processDocument(
          init.document_id,
          {
            engine_policy: 'auto',
            translation_friendly: false,
            preserve_layout: layoutMode === 'fixed',
            layout_mode: layoutMode
          },
          token
        );

        await pollUntilFinished(init.document_id, token, file.name);
      }

      setStage('completed');
      setMessage('All files were submitted.');
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
    <div className="card stack">
      <Toast
        message={
          message ||
          (!isAuthenticated ? 'Please sign in before converting files.' : '')
        }
        tone={
          stage === 'failed' || !isAuthenticated
            ? 'error'
            : stage === 'completed'
              ? 'success'
              : 'info'
        }
        onClose={() => setMessage('')}
      />

      <h2 className="section-title">Upload PDF</h2>

      <p className="small muted">
        Select a PDF file to convert it into an editable DOCX document.
      </p>

      <div className="dropzone">
        <span className="dropzone-icon" aria-hidden="true">
          <UploadIcon />
        </span>
        <div className="dropzone-body">
          <input
            className="input"
            type="file"
            accept="application/pdf,image/jpeg,image/png,image/tiff,image/webp,image/bmp"
            onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
          />
        </div>
      </div>

      <fieldset className="field layout-mode-field" disabled={isBusy}>
        <legend className="field-label">Layout mode</legend>
        <div className="radio-group">
          <label className="radio-option">
            <input
              type="radio"
              name="layoutMode"
              value="fixed"
              checked={layoutMode === 'fixed'}
              onChange={() => setLayoutMode('fixed')}
            />
            <span>Fixed layout</span>
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="layoutMode"
              value="flow"
              checked={layoutMode === 'flow'}
              onChange={() => setLayoutMode('flow')}
            />
            <span>Flow layout</span>
          </label>
        </div>
      </fieldset>

      <div className="actions-row">
        <button
          className="btn btn-primary"
          onClick={handleUpload}
          disabled={!files.length || isBusy || !isAuthenticated}
        >
          {isBusy ? 'Working...' : 'Convert to DOCX'}
        </button>
      </div>

      {isBusy ? (
        <div className="processing-indicator">
          <span className="spinner" />
          <span>{stage === 'processing' ? 'Processing' : 'Uploading'}</span>
        </div>
      ) : null}

      {fileStatuses.length ? (
        <ul className="small upload-status-list">
          {fileStatuses.map((item) => (
            <li key={item.fileName}>
              <strong>{item.fileName}:</strong> {item.message}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}