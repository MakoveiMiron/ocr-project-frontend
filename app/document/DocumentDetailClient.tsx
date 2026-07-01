'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  ApiError,
  deleteDocument,
  downloadDocument,
  downloadDocumentArtifact,
  fetchDocumentArtifacts,
  fetchDocumentDetail,
  fetchDocumentIr,
  fetchDocumentQa,
  reprocessDocument
} from '@/lib/api';
import { getOptionalAccessToken } from '@/lib/auth';
import { DocumentArtifact, DocumentDetail } from '@/lib/types';
import { Toast } from '@/components/Toast';
import { ConfirmDialog } from '@/components/ConfirmDialog';

function isDocxArtifact(artifact: DocumentArtifact) {
  const kind = artifact.kind?.toLowerCase();
  const type = artifact.type?.toLowerCase();
  const variant = artifact.variant?.toLowerCase();

  return kind === 'docx' || type === 'docx' || variant === 'legacy' || variant === 'ir';
}

function isAvailableArtifact(artifact: DocumentArtifact) {
  return artifact.available !== false;
}

function isDownloadableArtifact(artifact: DocumentArtifact) {
  return isAvailableArtifact(artifact) && Boolean(artifactDownloadUrl(artifact));
}

function isOtherArtifact(artifact: DocumentArtifact) {
  return !isDocxArtifact(artifact);
}

function artifactLabel(artifact: DocumentArtifact) {
  const label = artifact.label?.trim();
  if (label) return label;

  const variant = artifact.variant?.toLowerCase();

  if (variant === 'legacy') {
    return 'DOCX - legacy layout composer';
  }

  if (variant === 'ir') {
    return 'DOCX - intermediate representation';
  }

  if (variant === 'docling-json') {
    return 'Docling raw JSON';
  }

  if (variant === 'docling-markdown') {
    return 'Docling Markdown';
  }

  if (variant === 'docling-mapped-layout') {
    return 'Docling mapped LayoutDocument summary';
  }

  if (artifact.kind) {
    return `${artifact.kind.toUpperCase()} artifact`;
  }

  return artifact.filename ?? artifact.name ?? 'Artifact';
}

function artifactFilename(artifact: DocumentArtifact, documentId: string) {
  if (artifact.filename) return artifact.filename;
  if (artifact.name) return artifact.name;

  const kind = artifact.kind?.toLowerCase();
  const type = artifact.type?.toLowerCase();
  const variant = artifact.variant?.toLowerCase() ?? 'artifact';
  const contentType = (artifact.content_type ?? artifact.contentType)?.toLowerCase();
  const extension =
    kind === 'json' ||
    contentType === 'application/json' ||
    variant === 'docling-json' ||
    variant === 'docling-mapped-layout'
      ? 'json'
      : kind === 'markdown' ||
          contentType === 'text/markdown' ||
          variant === 'docling-markdown'
        ? 'md'
        : kind === 'docx' || type === 'docx' || variant === 'legacy' || variant === 'ir'
          ? 'docx'
          : 'bin';

  return `${documentId}-${variant}.${extension}`;
}

function artifactDownloadUrl(artifact: DocumentArtifact) {
  const storageKey = artifact.storage_key ?? artifact.storageKey;

  return artifact.download_url ?? artifact.downloadUrl ?? artifact.url ?? (storageKey ? `/api/v1/storage/local/${encodeURIComponent(storageKey)}` : undefined);
}

function unavailableArtifactMessage(artifact: DocumentArtifact) {
  if (artifact.variant === 'ir') {
    return 'Intermediate Representation export failed or was not generated.';
  }

  return `${artifactLabel(artifact)} is not available.`;
}

function fallbackLegacyArtifact(documentId: string): DocumentArtifact {
  return {
    kind: 'docx',
    type: 'docx',
    variant: 'legacy',
    label: 'DOCX - legacy',
    filename: `${documentId}-legacy.docx`,
    download_url: `/api/v1/documents/${documentId}/download?variant=legacy`,
    available: true
  };
}

function downloadErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 404) return 'This document variant is not available.';
    if (error.status === 410) return 'This document has expired and was already deleted.';
  }

  return error instanceof Error ? error.message : 'Download failed.';
}

function DownloadableArtifacts({
  documentId,
  artifacts,
  docxAvailable,
  onDownloadArtifact
}: {
  documentId: string;
  artifacts?: DocumentArtifact[] | null;
  docxAvailable: boolean;
  onDownloadArtifact: (artifact: DocumentArtifact) => void;
}) {
  const docxArtifacts = (artifacts ?? []).filter(isDocxArtifact);
  const otherArtifacts = (artifacts ?? []).filter(isOtherArtifact);
  const availableDocxArtifacts = docxArtifacts.filter(isAvailableArtifact);

  const renderOtherArtifacts = () => {
    if (!otherArtifacts.length) return null;

    return (
      <section className="small">
        <h3 style={{ margin: '0 0 8px' }}>Other downloadable artifacts</h3>
        <div className="grid" style={{ gap: 8 }}>
          {otherArtifacts.map((artifact, index) => {
            const key = artifact.variant ?? artifact.filename ?? artifact.name ?? artifact.download_url ?? artifact.url ?? artifact.storage_key ?? artifact.storageKey ?? `artifact-${index}`;
            const label = artifactLabel(artifact);
            const filename = artifactFilename(artifact, documentId);
            const storageKey = artifact.storage_key ?? artifact.storageKey;
            const available = isAvailableArtifact(artifact);
            const downloadUrl = artifactDownloadUrl(artifact);
            const downloadable = isDownloadableArtifact(artifact);

            return (
              <div key={`${key}-${index}`} className="panel" style={{ padding: 12 }}>
                <button
                  type="button"
                  className="btn"
                  onClick={() => onDownloadArtifact(artifact)}
                  disabled={!downloadable}
                >
                  Download {label}
                </button>
                <div style={{ marginTop: 8 }}>
                  <strong>{label}</strong>
                </div>
                <div className="muted" style={{ marginTop: 6 }}>{filename}</div>
                {storageKey ? <div className="muted" style={{ marginTop: 6 }}>Storage key: {storageKey}</div> : null}
                {!available ? <div className="muted" style={{ marginTop: 6 }}>{unavailableArtifactMessage(artifact)}</div> : null}
                {available && !downloadUrl ? <div className="muted" style={{ marginTop: 6 }}>Missing download URL for this artifact.</div> : null}
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  if (!availableDocxArtifacts.length) {
    if (docxArtifacts.length) {
      return (
        <>
          <section className="small">
            <h3 style={{ margin: '0 0 8px' }}>Downloadable documents</h3>
            <div className="grid" style={{ gap: 8 }}>
              {docxArtifacts.map((artifact, index) => (
                <div key={`${artifact.variant ?? artifact.filename ?? artifact.name ?? artifact.storage_key ?? 'docx'}-${index}`} className="panel" style={{ padding: 12 }}>
                  <button type="button" className="btn" disabled>{artifactLabel(artifact)}</button>
                  <div className="muted" style={{ marginTop: 6 }}>{unavailableArtifactMessage(artifact)}</div>
                </div>
              ))}
            </div>
          </section>
          {renderOtherArtifacts()}
        </>
      );
    }

    if (!docxAvailable) return renderOtherArtifacts();

    return (
      <>
        <section className="small">
          <h3 style={{ margin: '0 0 8px' }}>Downloadable documents</h3>
          <button type="button" className="btn" onClick={() => onDownloadArtifact(fallbackLegacyArtifact(documentId))}>
            Download DOCX - legacy
          </button>
        </section>
        {renderOtherArtifacts()}
      </>
    );
  }

  return (
    <>
      <section className="small">
        <h3 style={{ margin: '0 0 8px' }}>Downloadable documents</h3>
        <div className="grid" style={{ gap: 8 }}>
          {docxArtifacts.map((artifact, index) => {
            const key = artifact.variant ?? artifact.filename ?? artifact.name ?? artifact.download_url ?? artifact.url ?? artifact.storage_key ?? artifact.storageKey ?? `docx-${index}`;
            const label = artifactLabel(artifact);
            const filename = artifactFilename(artifact, documentId);
            const available = isAvailableArtifact(artifact);
            const downloadUrl = artifactDownloadUrl(artifact);

            return (
              <div key={`${key}-${index}`} className="panel" style={{ padding: 12 }}>
                <button
                  type="button"
                  className="btn"
                  onClick={() => onDownloadArtifact(artifact)}
                  disabled={!available || !downloadUrl}
                >
                  Download {label}
                </button>
                <div className="muted" style={{ marginTop: 6 }}>{filename}</div>
                {!available ? <div className="muted" style={{ marginTop: 6 }}>{unavailableArtifactMessage(artifact)}</div> : null}
                {available && !downloadUrl ? <div className="muted" style={{ marginTop: 6 }}>Missing download URL for this artifact.</div> : null}
              </div>
            );
          })}
        </div>
      </section>
      {renderOtherArtifacts()}
    </>
  );
}

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
        const artifact = (document.artifacts ?? []).find((item) => isDocxArtifact(item) && item.available !== false && artifactDownloadUrl(item));
        const response = artifact
          ? await downloadDocumentArtifact(artifactDownloadUrl(artifact) as string, token)
          : await downloadDocument(documentId, token);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = window.document.createElement('a');
        link.href = url;
        link.download = artifact ? artifactFilename(artifact, documentId) : getDownloadFilename(response, document?.original_filename, documentId);
        window.document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        router.replace(`${pathname}?documentId=${documentId}`, { scroll: false });
      } catch (error) {
        hasTriggeredDownload.current = false;
        window.sessionStorage.removeItem(downloadKey);
        setMessage(downloadErrorMessage(error));
      }
    }

    void maybeDownload();
  }, [document, documentId, pathname, router, searchParams]);

  async function handleDownloadArtifact(artifact: DocumentArtifact) {
    const downloadUrl = artifactDownloadUrl(artifact);
    if (!downloadUrl) {
      setMessage('Missing artifact download URL.');
      return;
    }

    try {
      const token = await getOptionalAccessToken();
      const response = await downloadDocumentArtifact(downloadUrl, token);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = artifactFilename(artifact, documentId);
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      window.sessionStorage.setItem(`auto-download-consumed:${documentId}`, '1');
      setWasDownloaded(true);
    } catch (error) {
      setMessage(downloadErrorMessage(error));
    }
  }

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
            <DownloadableArtifacts
              documentId={documentId}
              artifacts={document.artifacts}
              docxAvailable={document.docx_available}
              onDownloadArtifact={handleDownloadArtifact}
            />
            {document.warnings?.length ? (
              <div className="small">
                <strong>Warnings:</strong>
                <ul style={{ margin: '6px 0 0 20px' }}>
                  {document.warnings.map((warning, index) => <li key={`${warning}-${index}`}>{warning}</li>)}
                </ul>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
