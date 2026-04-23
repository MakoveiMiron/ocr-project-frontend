import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'PDF OCR SaaS',
  description: 'Secure PDF processing platform'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hu">
      <body>
        <div className="container">
          <nav className="topnav">
            <Link href="/"><strong>PDF OCR SaaS</strong></Link>
            <div className="links">
              <Link href="/">Home</Link>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/pricing">Csomagok</Link>
              <Link href="/members">Tagok</Link>
              <Link href="/login" className="btn btn-secondary">Belépés</Link>
            </div>
          </nav>
        </div>
        {children}
      </body>
    </html>
  );
}
