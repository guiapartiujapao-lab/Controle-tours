import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const existente = await prisma.evento.findUnique({ where: { id } });
  if (!existente) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
  if (existente.guiaId !== session.guiaId) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const body = await req.json();
  const {
    titulo, categoria, dataInicio, dataFim, cidade, local,
    enderecoCompleto, descricao, fotoCapa, linkOficial, destaque,
  } = body;

  await prisma.evento.update({
    where: { id },
    data: {
      titulo, categoria,
      dataInicio: new Date(dataInicio),
      dataFim: dataFim ? new Date(dataFim) : null,
      cidade, local,
      enderecoCompleto: enderecoCompleto || null,
      descricao,
      fotoCapa: fotoCapa || null,
      linkOficial: linkOficial || null,
      destaque: Boolean(destaque),
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const existente = await prisma.evento.findUnique({ where: { id } });
  if (!existente) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
  if (existente.guiaId !== session.guiaId) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }
  await prisma.evento.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
