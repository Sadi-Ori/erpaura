import type { Metadata } from 'next';
import './globals.css';
import AppShell from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'Aura ERP | Open Source Enterprise Resource Planning Platform',
  description:
    'Aura ERP is an open-source, modular ERP software engineered with Python Django and Next.js to automate accounting, inventory, supply chain, CRM, HR, and manufacturing operations.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
