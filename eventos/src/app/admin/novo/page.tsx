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
      <Link href="/admin" className="text-sm text-[#8b8b9a] hover:text-[#ec4899]">
        ← Voltar
      </Link>
      <h1 className="text-2xl font-bold my-4">Novo evento</h1>
      <EventoForm />
    </div>
  );
}
