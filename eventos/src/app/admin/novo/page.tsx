import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import EventoForm from "../EventoForm";

export const dynamic = "force-dynamic";

export default async function Novo() {
  const session = await getSession();
  if (!session) redirect("/admin");

  return (
    <div>
      <Link href="/admin" className="text-sm text-slate-500 hover:text-pink-600 font-medium">
        ← Voltar
      </Link>
      <h1 className="text-2xl font-bold my-4 text-slate-900">Novo evento</h1>
      <div className="card-3d p-6">
        <EventoForm />
      </div>
    </div>
  );
}
