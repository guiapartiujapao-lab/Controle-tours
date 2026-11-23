import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CATEGORIAS, CATEGORIA_MAP, formatarData } from "@/lib/categorias";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; cidade?: string; mes?: string }>;
}) {
  const sp = await searchParams;
  const where: Record<string, unknown> = {};
  if (sp.cat && CATEGORIA_MAP[sp.cat as keyof typeof CATEGORIA_MAP]) where.categoria = sp.cat;
  if (sp.cidade) where.cidade = sp.cidade;

  if (sp.mes) {
    const [ano, mes] = sp.mes.split("-").map(Number);
    if (ano && mes) {
      const inicio = new Date(ano, mes - 1, 1);
      const fim = new Date(ano, mes, 1);
      where.dataInicio = { gte: inicio, lt: fim };
    }
  } else {
    where.dataInicio = { gte: new Date() };
  }

  const eventos = await prisma.evento.findMany({
    where,
    orderBy: { dataInicio: "asc" },
    include: { guia: true },
    take: 60,
  });

  const destaques = await prisma.evento.findMany({
    where: { destaque: true, dataInicio: { gte: new Date() } },
    orderBy: { dataInicio: "asc" },
    take: 3,
    include: { guia: true },
  });

  return (
    <div className="space-y-10">
      <section className="text-center py-10">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
          Todos os eventos do Japão em um só lugar
        </h1>
        <p className="text-[#8b8b9a] text-lg max-w-2xl mx-auto">
          Festivais, fogos, hanami, shows e cultura pop — cadastrados pelos nossos guias
          brasileiros no Japão. Encontre, planeje e vá junto.
        </p>
      </section>

      {destaques.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">⭐ Destaques</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {destaques.map((e) => (
              <EventoCard key={e.id} evento={e} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex flex-wrap gap-2 mb-4">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-full border text-sm ${
              !sp.cat ? "bg-[#ec4899] border-[#ec4899]" : "border-[#262636] hover:border-[#ec4899]"
            }`}
          >
            Todos
          </Link>
          {CATEGORIAS.map((c) => (
            <Link
              key={c.key}
              href={`/?cat=${c.key}`}
              className={`px-3 py-1.5 rounded-full border text-sm ${
                sp.cat === c.key
                  ? "border-transparent text-white"
                  : "border-[#262636] hover:border-[#ec4899]"
              }`}
              style={sp.cat === c.key ? { background: c.cor } : {}}
            >
              {c.emoji} {c.label}
            </Link>
          ))}
        </div>

        <h2 className="text-2xl font-bold mb-4">
          {eventos.length} evento{eventos.length === 1 ? "" : "s"}
        </h2>

        {eventos.length === 0 ? (
          <p className="text-[#8b8b9a] py-10 text-center">
            Nenhum evento encontrado com esses filtros.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {eventos.map((e) => (
              <EventoCard key={e.id} evento={e} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

type EventoComGuia = Awaited<ReturnType<typeof prisma.evento.findMany>>[number] & {
  guia: { nome: string; cor: string };
};

function EventoCard({ evento }: { evento: EventoComGuia }) {
  const cat = CATEGORIA_MAP[evento.categoria as keyof typeof CATEGORIA_MAP] || CATEGORIA_MAP.OUTRO;
  return (
    <Link
      href={`/eventos/${evento.slug}`}
      className="block rounded-xl border border-[#262636] bg-[#141420] p-5 hover:border-[#ec4899] transition"
    >
      <div className="flex items-start justify-between mb-2">
        <span
          className="text-xs px-2 py-1 rounded-full font-medium"
          style={{ background: cat.cor + "33", color: cat.cor }}
        >
          {cat.emoji} {cat.label}
        </span>
        {evento.destaque && <span className="text-xs text-yellow-400">⭐</span>}
      </div>
      <h3 className="font-bold text-lg mb-2 leading-tight">{evento.titulo}</h3>
      <p className="text-sm text-[#8b8b9a] mb-1">📅 {formatarData(evento.dataInicio)}</p>
      <p className="text-sm text-[#8b8b9a] mb-3">📍 {evento.cidade} · {evento.local}</p>
      <p className="text-xs text-[#8b8b9a] flex items-center gap-2">
        <span
          className="inline-block w-2 h-2 rounded-full"
          style={{ background: evento.guia.cor }}
        />
        Cadastrado por {evento.guia.nome}
      </p>
    </Link>
  );
}
