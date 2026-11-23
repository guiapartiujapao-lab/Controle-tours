import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import EventoForm from "../EventoForm";

export const dynamic = "force-dynamic";

export default async function Editar({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/admin");

  const { id } = await params;
  const evento = await prisma.evento.findUnique({ where: { id } });
  if (!evento) notFound();
  if (evento.guiaId !== session.guiaId) redirect("/admin");

  return (
    <div>
      <Link href="/admin" className="text-sm text-[#8b8b9a] hover:text-[#ec4899]">
        ← Voltar
      </Link>
      <h1 className="text-2xl font-bold my-4">Editar evento</h1>
      <EventoForm
        evento={{
          id: evento.id,
          titulo: evento.titulo,
          categoria: evento.categoria,
          dataInicio: evento.dataInicio.toISOString(),
          dataFim: evento.dataFim?.toISOString() ?? null,
          cidade: evento.cidade,
          local: evento.local,
          enderecoCompleto: evento.enderecoCompleto,
          descricao: evento.descricao,
          fotoCapa: evento.fotoCapa,
          linkOficial: evento.linkOficial,
          destaque: evento.destaque,
        }}
      />
    </div>
  );
}
