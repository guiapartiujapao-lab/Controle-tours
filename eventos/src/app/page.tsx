import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CATEGORIAS, CATEGORIA_MAP, formatarData } from "@/lib/categorias";
import Calendario from "@/components/Calendario";

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

  const todosParaCalendario = await prisma.evento.findMany({
    orderBy: { dataInicio: "asc" },
    select: {
      id: true,
      slug: true,
      titulo: true,
      categoria: true,
      dataInicio: true,
      cidade: true,
    },
  });

  const destaques = await prisma.evento.findMany({
    where: { destaque: true, dataInicio: { gte: new Date() } },
    orderBy: { dataInicio: "asc" },
    take: 3,
    include: { guia: true },
  });

  return (
    <div className="space-y-12">
      <section className="text-center py-8">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-slate-900">
          Todos os eventos do Japão em um só lugar
        </h1>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto">
          Festivais, fogos, hanami, shows e cultura pop — cadastrados pelos nossos guias
          brasileiros no Japão. Encontre, planeje e vá junto.
        </p>
      </section>

      <Calendario
        eventos={todosParaCalendario.map((e) => ({
          ...e,
          dataInicio: e.dataInicio.toISOString(),
        }))}
      />

      {destaques.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-5 text-slate-900 flex items-center gap-2">
            <span>⭐</span> Destaques
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {destaques.map((e) => (
              <EventoCard key={e.id} evento={e} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex flex-wrap gap-2 mb-6">
          <Link
            href="/"
            className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
              !sp.cat
                ? "bg-pink-500 border-pink-500 text-white shadow-md"
                : "bg-white border-slate-200 text-slate-700 hover:border-pink-400 shadow-sm"
            }`}
          >
            Todos
          </Link>
          {CATEGORIAS.map((c) => (
            <Link
              key={c.key}
              href={`/?cat=${c.key}`}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                sp.cat === c.key
                  ? "border-transparent text-white shadow-md"
                  : "bg-white border-slate-200 text-slate-700 hover:border-pink-400 shadow-sm"
              }`}
              style={sp.cat === c.key ? { background: c.cor } : {}}
            >
              {c.emoji} {c.label}
            </Link>
          ))}
        </div>

        <h2 className="text-2xl font-bold mb-5 text-slate-900">
          {eventos.length} evento{eventos.length === 1 ? "" : "s"}
        </h2>

        {eventos.length === 0 ? (
          <p className="text-slate-500 py-10 text-center">
            Nenhum evento encontrado com esses filtros.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
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
    <Link href={`/eventos/${evento.slug}`} className="card-3d block p-5">
      <div className="flex items-start justify-between mb-3">
        <span
          className="text-xs px-2.5 py-1 rounded-full font-bold border"
          style={{
            background: cat.cor + "15",
            color: cat.cor,
            borderColor: cat.cor + "40",
          }}
        >
          {cat.emoji} {cat.label}
        </span>
        {evento.destaque && <span className="text-yellow-500 text-sm">⭐</span>}
      </div>
      <h3 className="font-bold text-lg mb-2 leading-tight text-slate-900">{evento.titulo}</h3>
      <p className="text-sm text-slate-600 mb-1">📅 {formatarData(evento.dataInicio)}</p>
      <p className="text-sm text-slate-600 mb-3">
        📍 {evento.cidade} · {evento.local}
      </p>
      <p className="text-xs text-slate-500 flex items-center gap-2 pt-3 border-t border-slate-100">
        <span
          className="inline-block w-2.5 h-2.5 rounded-full ring-2 ring-white shadow"
          style={{ background: evento.guia.cor }}
        />
        Cadastrado por {evento.guia.nome}
      </p>
    </Link>
  );
}
