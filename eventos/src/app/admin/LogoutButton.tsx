"use client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.refresh();
      }}
      className="text-sm text-slate-500 hover:text-pink-600 px-3 py-2 font-medium"
    >
      Sair
    </button>
  );
}
