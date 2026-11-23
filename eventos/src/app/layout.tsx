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
      <body className="min-h-screen">
        <header className="border-b border-[#262636] bg-[#0b0b0f]/80 backdrop-blur sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🎌</span>
              <span className="font-bold text-lg">
                Eventos no Japão
                <span className="text-[#8b8b9a] font-normal text-sm ml-2">· Partiu Japão</span>
              </span>
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/" className="hover:text-[#ec4899]">Calendário</Link>
              <Link href="/categorias" className="hover:text-[#ec4899]">Categorias</Link>
              <Link href="/admin" className="px-3 py-1.5 rounded-lg border border-[#262636] hover:border-[#ec4899]">
                Área do guia
              </Link>
            </nav>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
        <footer className="border-t border-[#262636] mt-20 py-8 text-center text-sm text-[#8b8b9a]">
          <p>Partiu Japão · Eventos cadastrados pelos guias no Japão</p>
          <p className="mt-2">
            <a href="https://wa.me/5511999999999" className="hover:text-[#ec4899]">
              Fale no WhatsApp
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
