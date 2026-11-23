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
        <h1 className="text-2xl font-bold mb-2">Área do guia</h1>
        <p className="text-[#8b8b9a] mb-6 text-sm">
          Entre com o e-mail e senha cadastrados.
        </p>
        <LoginForm />
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
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ background: guia.cor }} />
            Olá, {guia.nome}
          </h1>
          <p className="text-sm text-[#8b8b9a]">{meusEventos.length} evento(s) cadastrado(s)</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/novo"
            className="bg-[#ec4899] hover:bg-[#db2777] text-white font-bold py-2 px-4 rounded-lg"
          >
            + Novo evento
          </Link>
          <LogoutButton />
        </div>
      </div>

      {meusEventos.length === 0 ? (
        <p className="text-[#8b8b9a] py-10 text-center">
          Você ainda não cadastrou nenhum evento. Clique em "Novo evento" para começar.
        </p>
      ) : (
        <div className="space-y-2">
          {meusEventos.map((e) => {
            const cat = CATEGORIA_MAP[e.categoria as keyof typeof CATEGORIA_MAP] || CATEGORIA_MAP.OUTRO;
            return (
              <Link
                key={e.id}
                href={`/admin/${e.id}`}
                className="flex items-center justify-between border border-[#262636] bg-[#141420] rounded-lg p-4 hover:border-[#ec4899]"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: cat.cor + "33", color: cat.cor }}
                    >
                      {cat.emoji} {cat.label}
                    </span>
                    {e.destaque && <span className="text-xs text-yellow-400">⭐ destaque</span>}
                  </div>
                  <p className="font-medium">{e.titulo}</p>
                  <p className="text-xs text-[#8b8b9a]">
                    {formatarData(e.dataInicio)} · {e.cidade}
                  </p>
                </div>
                <span className="text-[#8b8b9a]">→</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
