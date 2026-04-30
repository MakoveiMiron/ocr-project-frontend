import Link from 'next/link';
import { DocumentSummary } from '@/lib/types';
const STATUS_LABELS: Record<string, string> = {queued:'processing',uploaded:'processing',processing:'processing',running:'processing',completed:'completed',failed:'failed',expired:'expired'};
const statusClass=(s:string)=> s==='completed'?'status-pill status-success':(s==='failed'||s==='expired')?'status-pill status-danger':['processing','queued','running','uploaded'].includes(s)?'status-pill status-warning':'status-pill status-neutral';
export function DocumentTable({ documents }: { documents: DocumentSummary[] }) {
const sorted=[...documents].sort((a,b)=>b.id.localeCompare(a.id));
return <div className='card'><h2 className='section-title'>Recent conversions</h2><div className='table-wrap'><table className='table'><thead><tr><th>File</th><th>Status</th><th>Result</th></tr></thead><tbody>{sorted.map((doc)=>{const s=(STATUS_LABELS[doc.status]??doc.status).toLowerCase();return <tr key={doc.id}><td>{doc.original_filename}</td><td><span className={statusClass(s)}>{s}</span></td><td className='actions-row'><Link className='btn btn-secondary' href={`/document?documentId=${doc.id}`}>View</Link>{s==='completed'?<Link className='btn btn-primary' href={`/document?documentId=${doc.id}&download=1`}>Download DOCX</Link>:null}</td></tr>;})}{sorted.length===0?<tr><td colSpan={3} className='small'>No conversions yet.</td></tr>:null}</tbody></table></div></div>;
}
