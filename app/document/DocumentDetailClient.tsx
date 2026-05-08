'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  ApiError,
  deleteDocument,
  downloadDocument,
  fetchDocumentArtifacts,
  fetchDocumentDetail,
  fetchDocumentIr,
  fetchDocumentQa,
  reprocessDocument
} from '@/lib/api';
import { getOptionalAccessToken } from '@/lib/auth';
import { DocumentDetail } from '@/lib/types';
import { Toast } from '@/components/Toast';
import { ConfirmDialog } from '@/components/ConfirmDialog';


function getDownloadFilename(response: Response, originalFilename: string | undefined, documentId: string) {
  const disposition = response.headers.get('content-disposition') ?? '';
  const utf8Name = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  if (utf8Name) {
    try {
      return decodeURIComponent(utf8Name).replace(/[\\/]/g, '_');
    } catch {
      return utf8Name.replace(/[\\/]/g, '_');
    }
  }

  const asciiName = disposition.match(/filename="?([^";]+)"?/i)?.[1];
  if (asciiName) return asciiName.replace(/[\\/]/g, '_');

  const stem = (originalFilename || documentId).replace(/\.[^.]+$/i, '');
  return `${stem}.docx`;
}

export default function DocumentDetailClient() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const documentId = useMemo(() => searchParams.get('documentId') ?? '', [searchParams]);
  const [document, setDocument] = useState<DocumentDetail | null>(null);
  const [message, setMessage] = useState('');
  const [irUrl, setIrUrl] = useState<string | null>(null);
  const [isReprocessing, setIsReprocessing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [wasDownloaded, setWasDownloaded] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const hasTriggeredDownload = useRef(false);

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
        const [qaResult, artifactsResult, irResult] = await Promise.allSettled([
          fetchDocumentQa(documentId, token),
          fetchDocumentArtifacts(documentId, token),
          fetchDocumentIr(documentId, token)
        ]);
        const qaData = qaResult.status === 'fulfilled' ? qaResult.value : undefined;
        const artifactsData = artifactsResult.status === 'fulfilled' ? artifactsResult.value : undefined;
        const irData = irResult.status === 'fulfilled' ? irResult.value : undefined;

        const mergedWarnings = [
          ...(detail.warnings ?? []),
          ...(qaData?.warnings ?? []),
          ...(artifactsData?.warnings ?? [])
        ].filter(Boolean);

        setDocument(detail);
        setIrUrl(irData?.ir_url ?? null);
        if (qaData?.qa_report_url && !detail.qa_report_url) {
          setDocument((current) => (current ? { ...current, qa_report_url: qaData.qa_report_url } : current));
        }
        if (artifactsData?.artifacts && !detail.artifacts?.length) {
          setDocument((current) => (current ? { ...current, artifacts: artifactsData.artifacts } : current));
        }
        if (mergedWarnings.length) {
          setDocument((current) => (current ? { ...current, warnings: mergedWarnings } : current));
        }
        setMessage('');
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Failed to fetch status.');
      }
    }

    void load();
    const interval = setInterval(() => {
      if (document?.document_status && ['completed', 'failed', 'expired'].includes(document.document_status.toLowerCase())) {
        return;
      }
      void load();
    }, 7000);
    return () => clearInterval(interval);
  }, [document?.document_status, documentId]);

  useEffect(() => {
    hasTriggeredDownload.current = false;
  }, [documentId]);

  useEffect(() => {
    if (!documentId || typeof window === 'undefined') {
      setWasDownloaded(false);
      return;
    }

    setWasDownloaded(window.sessionStorage.getItem(`auto-download-consumed:${documentId}`) === '1');
  }, [documentId, searchParams]);

  useEffect(() => {
    async function maybeDownload() {
      if (searchParams.get('download') !== '1' || !documentId || !document || hasTriggeredDownload.current) return;
      const downloadKey = `auto-download-consumed:${documentId}`;
      if (window.sessionStorage.getItem(downloadKey) === '1') {
        router.replace(`${pathname}?documentId=${documentId}`, { scroll: false });
        return;
      }

      hasTriggeredDownload.current = true;
      window.sessionStorage.setItem(downloadKey, '1');
      try {
        const token = await getOptionalAccessToken();
        const response = await downloadDocument(documentId, token);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = window.document.createElement('a');
        link.href = url;
        link.download = getDownloadFilename(response, document?.original_filename, documentId);
        window.document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        router.replace(`${pathname}?documentId=${documentId}`, { scroll: false });
      } catch (error) {
        hasTriggeredDownload.current = false;
        window.sessionStorage.removeItem(downloadKey);
        setMessage(error instanceof Error ? error.message : 'Download failed.');
      }
    }

    void maybeDownload();
  }, [document, documentId, pathname, router, searchParams]);

  async function handleReprocess() {
    if (!documentId) return;
    setIsReprocessing(true);
    try {
      const token = await getOptionalAccessToken();
      await reprocessDocument(documentId, {
        engine_policy: 'auto',
        translation_friendly: false,
        preserve_layout: true
      }, token);
      setMessage('Reprocess job queued successfully.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to reprocess document.');
    } finally {
      setIsReprocessing(false);
    }
  }

  async function handleDeleteDocument() {
    if (!documentId || isDeleting) return;

    setIsDeleting(true);
    try {
      const token = await getOptionalAccessToken();
      await deleteDocument(documentId, token);
      window.sessionStorage.removeItem(`auto-download-consumed:${documentId}`);
      setMessage('Document deleted.');
      setIsDeleteConfirmOpen(false);
      router.push('/');
    } catch (error) {
      if (error instanceof ApiError && error.status === 422) {
        setMessage('Invalid document id.');
      } else if (error instanceof ApiError && error.status === 404) {
        setMessage('Document not found or already deleted.');
      } else {
        setMessage('Delete failed. Please retry.');
      }
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <section className="container page">
      <Toast message={message} tone={message.toLowerCase().includes('fail') || message.toLowerCase().includes('missing') || message.toLowerCase().includes('invalid') ? 'error' : 'info'} onClose={() => setMessage('')} />
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        title="Delete document"
        description="Delete this document now? This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isBusy={isDeleting}
        onCancel={() => { if (!isDeleting) setIsDeleteConfirmOpen(false); }}
        onConfirm={() => { void handleDeleteDocument(); }}
      />
      <div className="card">
        <h1 style={{ marginTop: 0 }}>Conversion status</h1>
        {!document ? <p className="small">Loading...</p> : (
          <div className="grid" style={{ gap: 12 }}>
            <p className="small"><strong>File:</strong> {document.original_filename}</p>
            <p className="small"><strong>Status:</strong> {document.document_status}</p>
            <p className="small"><strong>Job status:</strong> {document.job_status ?? document.latest_job?.job_status ?? '-'}</p>
            <p className="small"><strong>OCR step:</strong> {document.current_step ?? document.latest_job?.current_step ?? '-'}</p>
            <p className="small"><strong>OCR provider:</strong> {document.ocr_provider ?? '-'}</p>
            <p className="small"><strong>Layout mode:</strong> {document.layout_mode ?? '-'}</p>
            <p className="small"><strong>Pipeline version:</strong> {document.pipeline_version ?? '-'}</p>
            <p className="small"><strong>DOCX ready:</strong> {document.docx_available ? 'Yes' : 'No'}</p>
            <p className="small"><strong>Retention deadline:</strong> {document.retention_deadline ?? '-'}</p>
            <p className="small"><strong>Cleanup status:</strong> {document.cleanup_status ?? '-'}</p>
            <p className="small"><strong>Error message:</strong> {document.error_message ?? '-'}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button type="button" className="btn" onClick={handleReprocess} disabled={isReprocessing}>
                {isReprocessing ? 'Reprocessing...' : 'Reprocess'}
              </button>
              {document.docx_available ? (
                <a className="btn" href={`/document?documentId=${documentId}&download=1`}>Download DOCX</a>
              ) : null}
              {document.docx_available && wasDownloaded ? (
                <button type="button" className="btn btn-danger" onClick={() => setIsDeleteConfirmOpen(true)} disabled={isDeleting}>
                  Delete
                </button>
              ) : null}
              {document.qa_report_url ? (
                <a className="btn" href={document.qa_report_url} target="_blank" rel="noreferrer">Download QA JSON</a>
              ) : null}
              {irUrl ? (
                <a className="btn" href={irUrl} target="_blank" rel="noreferrer">Download IR JSON</a>
              ) : null}
            </div>
            {document.warnings?.length ? (
              <div className="small">
                <strong>Warnings:</strong>
                <ul style={{ margin: '6px 0 0 20px' }}>
                  {document.warnings.map((warning, index) => <li key={`${warning}-${index}`}>{warning}</li>)}
                </ul>
              </div>
            ) : null}
            {document.artifacts?.length ? (
              <div className="small">
                <strong>Artifacts:</strong>
                <ul style={{ margin: '6px 0 0 20px' }}>
                  {document.artifacts.map((artifact, index) => (
                    <li key={`${artifact.kind}-${artifact.storage_key}-${index}`}>
                      {artifact.kind}: {artifact.storage_key}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}