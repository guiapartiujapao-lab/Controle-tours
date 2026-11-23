import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const GUIAS = [
  { user: "gabi", nome: "Gabi", senha: "partiu 123", cor: "#a78bfa" },
  { user: "jonas", nome: "Jonas", senha: "partiu 123", cor: "#3b82f6" },
  { user: "tami", nome: "Tami", senha: "partiu 123", cor: "#22c55e" },
  { user: "mayra", nome: "Mayra", senha: "partiu 123", cor: "#f59e0b" },
];

async function main() {
  let novos = 0;
  let pulados = 0;

  for (const g of GUIAS) {
    const jaExiste = await prisma.guia.findUnique({ where: { user: g.user } });
    if (jaExiste) {
      console.log(`→ Pulando (já existe): ${g.user}`);
      pulados++;
      continue;
    }
    await prisma.guia.create({
      data: {
        user: g.user,
        nome: g.nome,
        senha: g.senha,
        cor: g.cor,
        ativo: true,
      },
    });
    console.log(`✓ Cadastrado: ${g.user} (${g.nome})`);
    novos++;
  }

  console.log(`\n=== Resumo ===`);
  console.log(`Novos: ${novos}`);
  console.log(`Pulados: ${pulados}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
