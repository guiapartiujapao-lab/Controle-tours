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
      className="text-sm text-[#8b8b9a] hover:text-[#ec4899] px-3 py-2"
    >
      Sair
    </button>
  );
}
