import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/vercel-geist';
import { SessionProvider } from 'next-auth/react';
import { QueryProvider } from '@/lib/providers/query-provider';
import './globals.css';

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geist_mono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'TrainApp - Seu App de Agendamentos de Personal',
  description:
    'Gerencie seus alunos, agende sessões e receba pagamentos com facilidade. SaaS completo para personal trainers.',
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://trainapp.com',
    siteName: 'TrainApp',
    title: 'TrainApp - Seu App de Agendamentos de Personal',
    description:
      'Gerencie seus alunos, agende sessões e receba pagamentos com facilidade.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'TrainApp',
        type: 'image/png',
      },
    ],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${geist.variable} ${geist_mono.variable}`}>
      <body className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 antialiased">
        <SessionProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
