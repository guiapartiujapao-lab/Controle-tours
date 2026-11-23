import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CATEGORIA_MAP, formatarData } from "@/lib/categorias";
import { WHATSAPP_LINKS, comMensagem } from "@/lib/whatsapp";
import CtasPrincipais from "@/components/CtasPrincipais";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const evento = await prisma.evento.findUnique({ where: { slug } });
  if (!evento) return { title: "Evento não encontrado" };
  return {
    title: `${evento.titulo} | Partiu Japão`,
    description: evento.descricao.slice(0, 160),
  };
}

export default async function EventoDetalhe({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const evento = await prisma.evento.findUnique({
    where: { slug },
    include: { guia: true },
  });
  if (!evento) notFound();

  const cat = CATEGORIA_MAP[evento.categoria as keyof typeof CATEGORIA_MAP] || CATEGORIA_MAP.OUTRO;
  const whatsappMsg = encodeURIComponent(
    `Oi! Vi o evento "${evento.titulo}" no site da Partiu Japão e queria ir com guia. Pode me ajudar?`
  );

  return (
    <article className="max-w-3xl mx-auto">
      <Link href="/" className="text-sm text-slate-500 hover:text-pink-600 font-medium">
        ← Voltar
      </Link>

      <div className="mt-4 mb-6">
        <span
          className="inline-block text-xs px-2.5 py-1 rounded-full font-bold border mb-3"
          style={{
            background: cat.cor + "15",
            color: cat.cor,
            borderColor: cat.cor + "40",
          }}
        >
          {cat.emoji} {cat.label}
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-slate-900">{evento.titulo}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
          <span>📅 {formatarData(evento.dataInicio, true)}</span>
          {evento.dataFim && <span>até {formatarData(evento.dataFim, true)}</span>}
          <span>
            📍 {evento.cidade} · {evento.local}
          </span>
        </div>
      </div>

      {evento.fotoCapa && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={evento.fotoCapa} alt={evento.titulo} className="w-full rounded-xl mb-6 shadow" />
      )}

      <div className="card-3d p-6 mb-6">
        <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">{evento.descricao}</p>
      </div>

      {evento.enderecoCompleto && (
        <p className="text-sm text-slate-600 mb-4">
          <strong className="text-slate-900">Endereço:</strong> {evento.enderecoCompleto}
        </p>
      )}

      {evento.linkOficial && (
        <p className="text-sm mb-6">
          <a
            href={evento.linkOficial}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-600 hover:text-cyan-700 font-medium"
          >
            Site oficial →
          </a>
        </p>
      )}

      <div className="card-3d p-7 text-center">
        <h3 className="text-xl font-bold mb-2 text-slate-900">Quer ir com guia brasileiro?</h3>
        <p className="text-slate-600 mb-5">Fale com a gente no WhatsApp e monte seu roteiro.</p>
        <a
          href={comMensagem(WHATSAPP_LINKS.atendimentoGeral, decodeURIComponent(whatsappMsg))}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block font-bold py-3 px-8 rounded-lg text-white"
          style={{
            background: "#25d366",
            boxShadow:
              "0 1px 0 rgba(255,255,255,0.3) inset, 0 -2px 0 rgba(0,0,0,0.12) inset, 0 2px 0 #1fb855, 0 6px 16px -4px rgba(37, 211, 102, 0.4)",
          }}
        >
          Falar no WhatsApp
        </a>
      </div>

      <div className="mt-6">
        <p className="text-sm text-slate-500 mb-3 text-center">Ou escolha uma das opções:</p>
        <CtasPrincipais variant="evento" contextoEvento={evento.titulo} />
      </div>

      <p className="text-xs text-slate-500 mt-6 flex items-center gap-2">
        <span
          className="inline-block w-2.5 h-2.5 rounded-full ring-2 ring-white shadow"
          style={{ background: evento.guia.cor }}
        />
        Cadastrado por {evento.guia.nome}
      </p>
    </article>
  );
}
