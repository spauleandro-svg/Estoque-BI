import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Estoque & BI Preditivo',
  description: 'Plataforma SaaS de gestão de estoque inteligente e BI preditivo com um Analista Virtual de Compras e Suprimentos.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
