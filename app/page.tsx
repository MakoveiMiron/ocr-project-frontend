'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Hero } from '@/components/Hero';
import { UploadForm } from '@/components/UploadForm';
import { Toast } from '@/components/Toast';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { deleteDocument, ApiError, fetchDocumentDetail, fetchDocuments } from '@/lib/api';
import { getOptionalAccessToken } from '@/lib/auth';
import { DocumentDetail, DocumentSummary } from '@/lib/types';
import { useAuthStatus } from '@/lib/useAuthStatus';

const DOWNLOADABLE_CACHE_KEY = 'flowcr:downloadable-documents';

function readCachedDownloadableDocuments(): DocumentDetail[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.sessionStorage.getItem(DOWNLOADABLE_CACHE_KEY);
    return raw ? (JSON.parse(raw) as DocumentDetail[]) : [];
  } catch {
    return [];
  }
}

export default function HomePage(){const [documents,setDocuments]=useState<DocumentSummary[]>([]);const [downloadableDocuments,setDownloadableDocuments]=useState<DocumentDetail[]>([]);const [error,setError]=useState('');const [toastMessage,setToastMessage]=useState('');const [deletingDocumentId,setDeletingDocumentId]=useState('');const [downloadedDocumentIds,setDownloadedDocumentIds]=useState<Record<string, boolean>>({});const {isAuthenticated,isLoading}=useAuthStatus();const detailCacheRef=useRef<Record<string,{detail?:DocumentDetail;docxAvailable:boolean;lastCheckedAt:number}>>({});
  // Merge fresh results into the existing list instead of replacing it, so a
  // remount (e.g. navigating away and back) or a transient fetch failure
  // doesn't wipe out documents we already know are downloadable.
  const loadDownloadableDocuments=useCallback(async(docs:DocumentSummary[])=>{
    const completed=docs.filter(d=>d.status==='completed').sort((a,b)=>b.id.localeCompare(a.id));
    const completedIds=new Set(completed.map(d=>d.id));
    const now=Date.now();
    setDownloadableDocuments((previous)=>previous.filter((d)=>completedIds.has(d.document_id)));
    for(const doc of completed){
      const cached=detailCacheRef.current[doc.id];
      if(cached?.docxAvailable&&cached.detail)continue;
      if(cached&&!cached.docxAvailable&&now-cached.lastCheckedAt<60000)continue;
      try{
        const detail=await fetchDocumentDetail(doc.id);
        detailCacheRef.current[doc.id]={detail,docxAvailable:detail.docx_available,lastCheckedAt:now};
        setDownloadableDocuments((previous)=>{
          const withoutCurrent=previous.filter((d)=>d.document_id!==detail.document_id);
          const next=detail.docx_available?[...withoutCurrent,detail]:withoutCurrent;
          return next.sort((a,b)=>b.document_id.localeCompare(a.document_id));
        });
      }catch{
        // Transient failure - keep whatever we already knew about this document.
      }
    }
  },[]);
const loadDocuments=useCallback(async()=>{if(!isAuthenticated){setDocuments([]);setDownloadableDocuments([]);detailCacheRef.current={};return;}try{const docs=await fetchDocuments();setDocuments(docs);await loadDownloadableDocuments(docs);setError('');}catch(err){setError(err instanceof Error?err.message:'Could not load conversions.');}},[isAuthenticated,loadDownloadableDocuments]);
// Restore the last known downloadable list immediately on mount (before the
// network round-trip resolves) so it doesn't flash empty when this page
// remounts after client-side navigation.
useEffect(()=>{if(!isAuthenticated)return;setDownloadableDocuments(readCachedDownloadableDocuments())},[isAuthenticated]);
useEffect(()=>{if(typeof window==='undefined')return;if(downloadableDocuments.length)window.sessionStorage.setItem(DOWNLOADABLE_CACHE_KEY,JSON.stringify(downloadableDocuments));else window.sessionStorage.removeItem(DOWNLOADABLE_CACHE_KEY)},[downloadableDocuments]);
useEffect(()=>{if(!isAuthenticated)return;void loadDocuments();const i=setInterval(()=>void loadDocuments(),15000);return()=>clearInterval(i)},[isAuthenticated,loadDocuments]);
useEffect(()=>{if(typeof window==='undefined')return;setDownloadedDocumentIds(downloadableDocuments.reduce<Record<string,boolean>>((a,d)=>{a[d.document_id]=window.sessionStorage.getItem(`auto-download-consumed:${d.document_id}`)==='1';return a;},{}))},[downloadableDocuments]);
useEffect(()=>{if(!toastMessage&&!error&&(!isLoading&&isAuthenticated))return;const t=window.setTimeout(()=>{setToastMessage('');setError('');},3500);return()=>window.clearTimeout(t)},[toastMessage,error,isLoading,isAuthenticated]);
const [pendingDeleteDocumentId,setPendingDeleteDocumentId]=useState('');const handleDeleteDocument=useCallback(async(id:string)=>{setDeletingDocumentId(id);try{const token=await getOptionalAccessToken();await deleteDocument(id,token);setDownloadableDocuments(c=>c.filter(i=>i.document_id!==id));setDocuments(c=>c.filter(i=>i.id!==id));window.sessionStorage.removeItem(`auto-download-consumed:${id}`);setToastMessage('Document deleted.');setPendingDeleteDocumentId('');}catch(err){let m='Delete failed. Please retry.';if(err instanceof ApiError&&err.status===422)m='Invalid document id.';else if(err instanceof ApiError&&err.status===404)m='Document not found or already deleted.';setError(m);}finally{setDeletingDocumentId('');}},[]);
return (
    <>
      <Hero />
      <section className="container page">
        <ConfirmDialog
          isOpen={Boolean(pendingDeleteDocumentId)}
          title="Delete document"
          description="Delete this document now? This cannot be undone."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          isBusy={Boolean(deletingDocumentId)}
          onCancel={() => { if (!deletingDocumentId) setPendingDeleteDocumentId(''); }}
          onConfirm={() => { if (pendingDeleteDocumentId) void handleDeleteDocument(pendingDeleteDocumentId); }}
        />
        <Toast
          message={toastMessage || error || (!isAuthenticated && !isLoading ? 'You must sign in to upload and convert files.' : '')}
          tone={error || (!isAuthenticated && !isLoading) ? 'error' : 'success'}
          onClose={() => { setToastMessage(''); setError(''); }}
        />
        <div className="grid grid-2">
          <UploadForm onComplete={loadDocuments} isAuthenticated={isAuthenticated} isLoading={isLoading} />
          <div className="card">
            <h2 className="section-title">Downloadable files</h2>
            <div className="stack-sm">
              {downloadableDocuments.length ? downloadableDocuments.map((document) => (
                <div key={document.document_id} className="panel">
                  <p className="small" style={{ marginBottom: 10 }}><strong>File:</strong> {document.original_filename}</p>
                  <div className="actions-row">
                    <a className="btn btn-secondary" href={`/document?documentId=${document.document_id}`}>View GPMB</a>
                    <a className="btn btn-primary" href={`/document?documentId=${document.document_id}&download=1`}>Download DOCX</a>
                    {downloadedDocumentIds[document.document_id] ? (
                      <button type="button" className="btn btn-danger" onClick={() => setPendingDeleteDocumentId(document.document_id)} disabled={Boolean(deletingDocumentId)}>
                        Delete
                      </button>
                    ) : null}
                  </div>
                </div>
              )) : (
                <div className="empty-state">
                  <span className="empty-state-icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                      <path d="M5 3h7l3 3v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                      <path d="M12 3v3h3" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <p className="small muted" style={{ margin: 0 }}>Your downloadable files will appear here after OCR processing finishes.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
