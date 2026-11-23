import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CATEGORIA_MAP, formatarData } from "@/lib/categorias";
import LoginForm from "./LoginForm";
import LogoutButton from "./LogoutButton";

export const dynamic = "force-dynamic";

export default async function Admin() {
  const session = await getSession();
  if (!session) {
    return (
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-2 text-slate-900">Área do guia</h1>
        <p className="text-slate-600 mb-6 text-sm">Entre com o e-mail e senha cadastrados.</p>
        <div className="card-3d p-6">
          <LoginForm />
        </div>
      </div>
    );
  }

  const guia = await prisma.guia.findUnique({ where: { id: session.guiaId } });
  if (!guia) redirect("/admin/logout");

  const meusEventos = await prisma.evento.findMany({
    where: { guiaId: session.guiaId },
    orderBy: { dataInicio: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900">
            <span
              className="w-3 h-3 rounded-full ring-2 ring-white shadow"
              style={{ background: guia.cor }}
            />
            Olá, {guia.nome}
          </h1>
          <p className="text-sm text-slate-500">{meusEventos.length} evento(s) cadastrado(s)</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/novo" className="btn-3d font-bold py-2.5 px-5">
            + Novo evento
          </Link>
          <LogoutButton />
        </div>
      </div>

      {meusEventos.length === 0 ? (
        <div className="card-3d p-10 text-center">
          <p className="text-slate-500">
            Você ainda não cadastrou nenhum evento. Clique em "Novo evento" para começar.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {meusEventos.map((e) => {
            const cat = CATEGORIA_MAP[e.categoria as keyof typeof CATEGORIA_MAP] || CATEGORIA_MAP.OUTRO;
            return (
              <Link
                key={e.id}
                href={`/admin/${e.id}`}
                className="card-3d flex items-center justify-between p-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-bold border"
                      style={{
                        background: cat.cor + "15",
                        color: cat.cor,
                        borderColor: cat.cor + "40",
                      }}
                    >
                      {cat.emoji} {cat.label}
                    </span>
                    {e.destaque && (
                      <span className="text-xs text-yellow-600 font-bold">⭐ destaque</span>
                    )}
                  </div>
                  <p className="font-medium text-slate-900">{e.titulo}</p>
                  <p className="text-xs text-slate-500">
                    {formatarData(e.dataInicio)} · {e.cidade}
                  </p>
                </div>
                <span className="text-slate-400">→</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
