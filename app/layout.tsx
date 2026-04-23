import './globals.css';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

export const metadata = {
  title: 'PDF to DOCX Converter',
  description: 'Convert PDF files to editable DOCX in a simple subscription-based workflow.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light">
      <body>
        <div className="container">
          <nav className="topnav">
            <Link href="/"><strong>PDF → DOCX</strong></Link>
            <div className="links">
              <Link href="/">Home</Link>
              <Link href="/subscription">Subscription</Link>
              <Link href="/login" className="btn btn-secondary">Sign in</Link>
              <Link href="/register" className="btn btn-primary">Register</Link>
              <ThemeToggle />
            </div>
          </nav>
        </div>
        {children}
      </body>
    </html>
  );
}
