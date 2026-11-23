"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro("");
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });
    if (r.ok) {
      router.refresh();
    } else {
      const data = await r.json().catch(() => ({}));
      setErro(data.error || "E-mail ou senha incorretos.");
    }
    setLoading(false);
  }

  const inputCls =
    "w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none shadow-sm";

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1 text-slate-700">E-mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={inputCls}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-slate-700">Senha</label>
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          className={inputCls}
        />
      </div>
      {erro && <p className="text-sm text-red-600">{erro}</p>}
      <button type="submit" disabled={loading} className="btn-3d w-full font-bold py-2.5 disabled:opacity-50">
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
