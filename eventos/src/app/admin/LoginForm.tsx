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

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm mb-1">E-mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-[#141420] border border-[#262636] rounded-lg px-3 py-2 focus:border-[#ec4899] outline-none"
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Senha</label>
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          className="w-full bg-[#141420] border border-[#262636] rounded-lg px-3 py-2 focus:border-[#ec4899] outline-none"
        />
      </div>
      {erro && <p className="text-sm text-red-400">{erro}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#ec4899] hover:bg-[#db2777] disabled:opacity-50 text-white font-bold py-2 rounded-lg"
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
