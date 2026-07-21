import type { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';
import { Manrope } from 'next/font/google';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-manrope',
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
    <html lang="pt-BR" className={manrope.variable}>
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
