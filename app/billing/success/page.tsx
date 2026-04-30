import Link from 'next/link';
export default function BillingSuccessPage() {
  return <section className='container page'><div className='card stack'><p className='eyebrow'>Billing</p><h1>Subscription successful</h1><p className='muted'>Your subscription is now active and billing updates are syncing in the background.</p><div className='actions-row'><Link href='/dashboard' className='btn btn-primary'>Go to dashboard</Link><Link href='/subscription' className='btn btn-secondary'>View plans</Link></div></div></section>;
}
