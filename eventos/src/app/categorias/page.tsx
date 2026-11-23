import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CATEGORIAS } from "@/lib/categorias";

export const dynamic = "force-dynamic";

export default async function Categorias() {
  const counts = await prisma.evento.groupBy({
    by: ["categoria"],
    _count: true,
    where: { dataInicio: { gte: new Date() } },
  });
  const countMap = Object.fromEntries(counts.map((c) => [c.categoria, c._count]));

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Eventos por categoria</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORIAS.map((c) => (
          <Link
            key={c.key}
            href={`/?cat=${c.key}`}
            className="rounded-xl border border-[#262636] bg-[#141420] p-6 hover:border-[#ec4899] transition"
          >
            <div className="text-4xl mb-3">{c.emoji}</div>
            <h3 className="font-bold text-lg mb-1" style={{ color: c.cor }}>
              {c.label}
            </h3>
            <p className="text-sm text-[#8b8b9a]">
              {countMap[c.key] ?? 0} evento{(countMap[c.key] ?? 0) === 1 ? "" : "s"} próximo
              {(countMap[c.key] ?? 0) === 1 ? "" : "s"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
