import './globals.css';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

export const metadata = {
  title: 'PDF OCR SaaS',
  description: 'Secure PDF processing platform'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light">
      <body>
        <div className="container">
          <nav className="topnav">
            <Link href="/"><strong>PDF OCR SaaS</strong></Link>
            <div className="links">
              <Link href="/">Home</Link>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/pricing">Plans</Link>
              <Link href="/members">Members</Link>
              <ThemeToggle />
              <Link href="/login" className="btn btn-secondary">Sign in</Link>
            </div>
          </nav>
        </div>
        {children}
      </body>
    </html>
  );
}
