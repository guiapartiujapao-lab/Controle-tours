export const CATEGORIAS = [
  { key: "MATSURI", label: "Matsuri", cor: "#ef4444", emoji: "🏮" },
  { key: "HANAMI", label: "Hanami (Sakura)", cor: "#f9a8d4", emoji: "🌸" },
  { key: "MOMIJI", label: "Momiji (Outono)", cor: "#f97316", emoji: "🍁" },
  { key: "FOGOS", label: "Fogos (Hanabi)", cor: "#fbbf24", emoji: "🎆" },
  { key: "SHOWS", label: "Shows & Concertos", cor: "#8b5cf6", emoji: "🎤" },
  { key: "ESPORTES", label: "Esportes", cor: "#06b6d4", emoji: "⚽" },
  { key: "ANIME", label: "Anime & Cultura Pop", cor: "#ec4899", emoji: "🎌" },
  { key: "GASTRONOMIA", label: "Gastronomia", cor: "#84cc16", emoji: "🍜" },
  { key: "FERIADO", label: "Feriado", cor: "#64748b", emoji: "📅" },
  { key: "OUTRO", label: "Outro", cor: "#94a3b8", emoji: "⭐" },
] as const;

export type CategoriaKey = typeof CATEGORIAS[number]["key"];

export const CATEGORIA_MAP = Object.fromEntries(
  CATEGORIAS.map((c) => [c.key, c])
) as Record<CategoriaKey, (typeof CATEGORIAS)[number]>;

export const CIDADES = [
  "Tokyo",
  "Kyoto",
  "Osaka",
  "Nara",
  "Hiroshima",
  "Yokohama",
  "Kamakura",
  "Hakone",
  "Sapporo",
  "Fukuoka",
  "Okinawa",
  "Nagoya",
  "Kobe",
  "Monte Fuji",
] as const;

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

export function formatarData(d: Date | string, comHora = false): string {
  const data = typeof d === "string" ? new Date(d) : d;
  const opts: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Tokyo",
  };
  if (comHora) {
    opts.hour = "2-digit";
    opts.minute = "2-digit";
  }
  return data.toLocaleDateString("pt-BR", opts);
}
