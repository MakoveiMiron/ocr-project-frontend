import Link from 'next/link';
export default function BillingCancelPage() {
  return <section className='container page'><div className='card stack'><p className='eyebrow'>Billing</p><h1>Payment canceled</h1><p className='muted'>No charge was made. You can return anytime and choose a plan.</p><div className='actions-row'><Link href='/subscription' className='btn btn-primary'>Back to subscription</Link></div></div></section>;
}
