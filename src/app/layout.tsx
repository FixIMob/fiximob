import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FixIMOB — Marketplace de Obras e Gestão Imobiliária",
  description: "Prestadores verificados, pagamento com escrow, contratos digitais e DIMOB automática.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}