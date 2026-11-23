import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const guias = [
    { nome: "Diego", email: "diego@partiujapao.com", senha: "partiu2026", cor: "#ec4899" },
    { nome: "Kaori", email: "kaori@partiujapao.com", senha: "partiu2026", cor: "#39ff14" },
    { nome: "Rafael", email: "rafael@partiujapao.com", senha: "partiu2026", cor: "#c0c0c0" },
    { nome: "Pedro", email: "pedro@partiujapao.com", senha: "partiu2026", cor: "#ff1493" },
    { nome: "Naomi", email: "naomi@partiujapao.com", senha: "partiu2026", cor: "#00ffff" },
  ];

  for (const g of guias) {
    await prisma.guia.upsert({
      where: { email: g.email },
      update: {},
      create: g,
    });
  }

  const diego = await prisma.guia.findUnique({ where: { email: "diego@partiujapao.com" } });
  if (!diego) return;

  const eventos = [
    {
      slug: "fogos-sumida-2027",
      titulo: "Fogos de Sumida (Sumidagawa Hanabi)",
      categoria: "FOGOS",
      dataInicio: new Date("2027-07-31T19:00:00+09:00"),
      cidade: "Tokyo",
      local: "Rio Sumida",
      descricao: "Um dos maiores festivais de fogos do Japão. Mais de 20 mil fogos iluminam o céu de Tokyo.",
      destaque: true,
      guiaId: diego.id,
    },
    {
      slug: "gion-matsuri-2027",
      titulo: "Gion Matsuri",
      categoria: "MATSURI",
      dataInicio: new Date("2027-07-17T09:00:00+09:00"),
      dataFim: new Date("2027-07-17T22:00:00+09:00"),
      cidade: "Kyoto",
      local: "Centro de Kyoto",
      descricao: "O festival mais famoso do Japão, com desfile dos carros alegóricos Yamaboko.",
      destaque: true,
      guiaId: diego.id,
    },
    {
      slug: "hanami-ueno-2027",
      titulo: "Hanami no Parque Ueno",
      categoria: "HANAMI",
      dataInicio: new Date("2027-04-01T10:00:00+09:00"),
      dataFim: new Date("2027-04-10T18:00:00+09:00"),
      cidade: "Tokyo",
      local: "Parque Ueno",
      descricao: "Pico das cerejeiras em flor no parque mais famoso de Tokyo.",
      guiaId: diego.id,
    },
  ];

  for (const e of eventos) {
    await prisma.evento.upsert({
      where: { slug: e.slug },
      update: {},
      create: e,
    });
  }

  console.log("Seed concluído.");
}

main().finally(() => prisma.$disconnect());
