import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eventos no Japão | Partiu Japão",
  description:
    "Calendário completo de eventos no Japão: matsuri, hanami, fogos, shows e cultura pop. Vá com guias brasileiros.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-white text-slate-900">
        <header className="border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🎌</span>
              <span className="font-bold text-lg text-slate-900">
                Eventos no Japão
                <span className="text-slate-500 font-normal text-sm ml-2">· Partiu Japão</span>
              </span>
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/" className="text-slate-700 hover:text-pink-600 font-medium">
                Calendário
              </Link>
              <Link href="/categorias" className="text-slate-700 hover:text-pink-600 font-medium">
                Categorias
              </Link>
              <Link
                href="/admin"
                className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 font-medium hover:border-pink-500 hover:text-pink-600 shadow-sm"
              >
                Área do guia
              </Link>
            </nav>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
        <footer className="border-t border-slate-200 mt-20 py-8 text-center text-sm text-slate-500">
          <p>Partiu Japão · Eventos cadastrados pelos guias no Japão</p>
          <p className="mt-2">
            <a href="https://wa.me/5511999999999" className="text-pink-600 hover:text-pink-700 font-medium">
              Fale no WhatsApp
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
