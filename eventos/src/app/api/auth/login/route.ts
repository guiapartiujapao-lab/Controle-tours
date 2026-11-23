import { NextRequest, NextResponse } from "next/server";
import { loginGuia, signToken, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const identifier: string = body.identifier ?? body.email ?? body.user ?? "";
  const senha: string = body.senha ?? "";

  if (!identifier || !senha) {
    return NextResponse.json({ error: "Dados incompletos." }, { status: 400 });
  }
  const guia = await loginGuia(identifier, senha);
  if (!guia) {
    return NextResponse.json({ error: "Usuário ou senha incorretos." }, { status: 401 });
  }
  const token = signToken({ guiaId: guia.id, nome: guia.nome });
  await setSessionCookie(token);
  return NextResponse.json({ ok: true, guia: { id: guia.id, nome: guia.nome } });
}
