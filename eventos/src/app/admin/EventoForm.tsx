"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIAS, CIDADES } from "@/lib/categorias";

type Props = {
  evento?: {
    id: string;
    titulo: string;
    categoria: string;
    dataInicio: string;
    dataFim: string | null;
    cidade: string;
    local: string;
    enderecoCompleto: string | null;
    descricao: string;
    fotoCapa: string | null;
    linkOficial: string | null;
    destaque: boolean;
  };
};

function toInput(d: string | null): string {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 16);
}

export default function EventoForm({ evento }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    titulo: evento?.titulo || "",
    categoria: evento?.categoria || "MATSURI",
    dataInicio: evento ? toInput(evento.dataInicio) : "",
    dataFim: evento ? toInput(evento.dataFim) : "",
    cidade: evento?.cidade || "Tokyo",
    local: evento?.local || "",
    enderecoCompleto: evento?.enderecoCompleto || "",
    descricao: evento?.descricao || "",
    fotoCapa: evento?.fotoCapa || "",
    linkOficial: evento?.linkOficial || "",
    destaque: evento?.destaque || false,
  });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro("");
    const url = evento ? `/api/eventos/${evento.id}` : "/api/eventos";
    const method = evento ? "PUT" : "POST";
    const r = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (r.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      const d = await r.json().catch(() => ({}));
      setErro(d.error || "Erro ao salvar.");
    }
    setSalvando(false);
  }

  async function excluir() {
    if (!evento || !confirm("Excluir este evento?")) return;
    await fetch(`/api/eventos/${evento.id}`, { method: "DELETE" });
    router.push("/admin");
    router.refresh();
  }

  const upd = (k: keyof typeof form, v: unknown) => setForm({ ...form, [k]: v });
  const inputCls =
    "w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none shadow-sm";

  return (
    <form onSubmit={submit} className="space-y-4 max-w-2xl">
      <Field label="Título">
        <input className={inputCls} required value={form.titulo} onChange={(e) => upd("titulo", e.target.value)} />
      </Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Categoria">
          <select className={inputCls} value={form.categoria} onChange={(e) => upd("categoria", e.target.value)}>
            {CATEGORIAS.map((c) => (
              <option key={c.key} value={c.key}>
                {c.emoji} {c.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Cidade">
          <select className={inputCls} value={form.cidade} onChange={(e) => upd("cidade", e.target.value)}>
            {CIDADES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Data de início (JP)">
          <input type="datetime-local" className={inputCls} required value={form.dataInicio}
            onChange={(e) => upd("dataInicio", e.target.value)} />
        </Field>
        <Field label="Data de fim (opcional)">
          <input type="datetime-local" className={inputCls} value={form.dataFim}
            onChange={(e) => upd("dataFim", e.target.value)} />
        </Field>
      </div>

      <Field label="Local (ex: Parque Ueno)">
        <input className={inputCls} required value={form.local} onChange={(e) => upd("local", e.target.value)} />
      </Field>

      <Field label="Endereço completo (opcional)">
        <input className={inputCls} value={form.enderecoCompleto} onChange={(e) => upd("enderecoCompleto", e.target.value)} />
      </Field>

      <Field label="Descrição">
        <textarea rows={6} className={inputCls} required value={form.descricao}
          onChange={(e) => upd("descricao", e.target.value)} />
      </Field>

      <Field label="Foto de capa (URL, opcional)">
        <input className={inputCls} value={form.fotoCapa} onChange={(e) => upd("fotoCapa", e.target.value)} />
      </Field>

      <Field label="Link oficial (opcional)">
        <input className={inputCls} value={form.linkOficial} onChange={(e) => upd("linkOficial", e.target.value)} />
      </Field>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={form.destaque} onChange={(e) => upd("destaque", e.target.checked)} />
        Marcar como destaque (aparece no topo da home)
      </label>

      {erro && <p className="text-sm text-red-600">{erro}</p>}

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={salvando} className="btn-3d font-bold py-2.5 px-6 disabled:opacity-50">
          {salvando ? "Salvando..." : evento ? "Atualizar" : "Publicar"}
        </button>
        {evento && (
          <button type="button" onClick={excluir} className="text-red-600 hover:text-red-700 px-4 py-2 font-medium">
            Excluir
          </button>
        )}
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1 text-slate-700">{label}</label>
      {children}
    </div>
  );
}
