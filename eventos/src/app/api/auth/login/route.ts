import { NextRequest, NextResponse } from "next/server";
import { loginGuia, signToken, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, senha } = await req.json();
  if (!email || !senha) {
    return NextResponse.json({ error: "Dados incompletos." }, { status: 400 });
  }
  const guia = await loginGuia(email, senha);
  if (!guia) {
    return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
  }
  const token = signToken({ guiaId: guia.id, nome: guia.nome });
  await setSessionCookie(token);
  return NextResponse.json({ ok: true, guia: { id: guia.id, nome: guia.nome } });
}
