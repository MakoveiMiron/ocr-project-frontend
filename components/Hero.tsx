'use client';
import Link from 'next/link';
import { useAuthStatus } from '@/lib/useAuthStatus';

export function Hero() {
  const { isAuthenticated, isLoading } = useAuthStatus();
  return <section className='hero container'><div className='hero-grid'><div className='hero-copy stack'><div className='eyebrow'>OCR document conversion</div><h1>Convert PDFs into editable DOCX without the clutter</h1><p className='muted'>Built for reliable OCR throughput with clean outputs, transparent status tracking, and account-level file history.</p>{!isAuthenticated && !isLoading ? <div className='actions-row'><Link className='btn btn-primary' href='/register'>Start free</Link><Link className='btn btn-secondary' href='/login'>Sign in</Link></div> : null}</div><div className='hero-card stack-sm'><h3 className='section-title'>Why teams choose this workflow</h3><p className='small'>Accurate OCR workflow</p><p className='small'>Editable DOCX output</p><p className='small'>Secure account-based history</p></div></div></section>;
}
