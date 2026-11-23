import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/categorias";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const body = await req.json();
  const {
    titulo, categoria, dataInicio, dataFim, cidade, local,
    enderecoCompleto, descricao, fotoCapa, linkOficial, destaque,
  } = body;

  if (!titulo || !categoria || !dataInicio || !cidade || !local || !descricao) {
    return NextResponse.json({ error: "Campos obrigatórios ausentes." }, { status: 400 });
  }

  let slug = slugify(titulo);
  const existente = await prisma.evento.findUnique({ where: { slug } });
  if (existente) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

  const evento = await prisma.evento.create({
    data: {
      slug,
      titulo,
      categoria,
      dataInicio: new Date(dataInicio),
      dataFim: dataFim ? new Date(dataFim) : null,
      cidade,
      local,
      enderecoCompleto: enderecoCompleto || null,
      descricao,
      fotoCapa: fotoCapa || null,
      linkOficial: linkOficial || null,
      destaque: Boolean(destaque),
      guiaId: session.guiaId,
    },
  });

  return NextResponse.json({ ok: true, id: evento.id, slug: evento.slug });
}
