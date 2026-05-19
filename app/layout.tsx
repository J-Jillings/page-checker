import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Page Checker — QA before it ships',
  description: 'Visual QA tool — screenshots, layout analysis, PageSpeed scores, console errors, and link auditing.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
