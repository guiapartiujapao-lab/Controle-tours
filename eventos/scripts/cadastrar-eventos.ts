import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

const PENDENTE = "\n\n[PENDENTE DE CONFIRMAÇÃO — verificar datas e detalhes no site oficial antes de publicar.]";

type Novo = {
  titulo: string;
  categoria: string;
  cidade: string;
  local: string;
  dataInicio: string;
  dataFim?: string;
  descricao: string;
  linkOficial: string;
};

const EVENTOS: Novo[] = [
  {
    titulo: "Tokyo Comic Con 2026",
    categoria: "ANIME",
    cidade: "Tokyo",
    local: "Makuhari Messe, Chiba",
    dataInicio: "2026-12-11T10:00:00+09:00",
    dataFim: "2026-12-13T18:00:00+09:00",
    descricao: "Convenção de cultura pop com cinema, quadrinhos, cosplay, celebridades e exposições.",
    linkOficial: "https://tokyocomiccon.jp/en/whatscc",
  },
  {
    titulo: "Jump Festa 2027",
    categoria: "ANIME",
    cidade: "Tokyo",
    local: "Makuhari Messe, Chiba",
    dataInicio: "2026-12-19T09:00:00+09:00",
    dataFim: "2026-12-20T18:00:00+09:00",
    descricao: "Festival de anime, mangá e games, com novidades, apresentações e produtos de franquias populares.",
    linkOficial: "https://www.shonenjump.com/p/re/top/jumpfesta/",
  },
  {
    titulo: "Marunouchi Illumination 2026–2027",
    categoria: "OUTRO",
    cidade: "Tokyo",
    local: "Marunouchi Naka-dori, próximo à Tokyo Station",
    dataInicio: "2026-11-12T17:00:00+09:00",
    dataFim: "2027-02-14T23:00:00+09:00",
    descricao: "Iluminação de inverno que transforma as ruas de Marunouchi em um passeio noturno de luzes douradas.",
    linkOficial: "https://www.marunouchi.com/",
  },
  {
    titulo: "Tokyo Marathon 2027",
    categoria: "ESPORTES",
    cidade: "Tokyo",
    local: "Largada em Shinjuku; percurso por Tóquio",
    dataInicio: "2027-03-07T09:00:00+09:00",
    descricao: "Maratona internacional que reúne corredores e espectadores ao longo das principais ruas da capital.",
    linkOficial: "https://www.marathon.tokyo/en/",
  },
  {
    titulo: "Sanja Matsuri 2027",
    categoria: "MATSURI",
    cidade: "Tokyo",
    local: "Santuário Asakusa, Asakusa",
    dataInicio: "2027-05-14T09:00:00+09:00",
    dataFim: "2027-05-16T20:00:00+09:00",
    descricao: "Festival tradicional com procissões, santuários portáteis, música e celebrações nas ruas de Asakusa.",
    linkOficial: "https://www.asakusajinja.jp/",
  },
  {
    titulo: "Midosuji Illumination 2026",
    categoria: "OUTRO",
    cidade: "Osaka",
    local: "Avenida Midosuji, Osaka",
    dataInicio: "2026-11-03T17:00:00+09:00",
    dataFim: "2026-12-31T23:00:00+09:00",
    descricao: "Iluminação sazonal que cobre a principal avenida de Osaka com luzes coloridas, ideal para passeios noturnos.",
    linkOficial: "https://www.hikari-kyoen.com/en/core/midosuji/",
  },
  {
    titulo: "NAKED meets Nijo Castle 2026",
    categoria: "OUTRO",
    cidade: "Kyoto",
    local: "Castelo Nijo, Nakagyo",
    dataInicio: "2026-10-23T17:00:00+09:00",
    dataFim: "2026-12-05T21:00:00+09:00",
    descricao: "Experiência artística noturna com projeções digitais e iluminação em um castelo histórico de Kyoto.",
    linkOficial: "https://nijo-jocastle.city.kyoto.lg.jp/",
  },
  {
    titulo: "Iluminação Noturna do Templo To-ji 2026",
    categoria: "OUTRO",
    cidade: "Kyoto",
    local: "Templo To-ji, Minami",
    dataInicio: "2026-10-31T17:00:00+09:00",
    dataFim: "2026-12-13T21:00:00+09:00",
    descricao: "Visitação noturna dos jardins e do pagode de cinco andares com iluminação especial de outono.",
    linkOficial: "https://kyoto.travel/en/events/",
  },
  {
    titulo: "Sagano Scenic Railway — Fantasy Train of Light",
    categoria: "OUTRO",
    cidade: "Kyoto",
    local: "Trecho Torokko Arashiyama – Torokko Kameoka",
    dataInicio: "2026-10-24T10:00:00+09:00",
    dataFim: "2026-12-29T20:00:00+09:00",
    descricao: "Passeio panorâmico de trem com iluminação sazonal das paisagens de Arashiyama.",
    linkOficial: "https://www.sagano-kanko.co.jp/en/",
  },
  {
    titulo: "Reikan-ji Temple — Autumn Special Opening",
    categoria: "MOMIJI",
    cidade: "Kyoto",
    local: "Templo Reikan-ji, Sakyo",
    dataInicio: "2026-11-20T10:00:00+09:00",
    dataFim: "2026-12-06T16:30:00+09:00",
    descricao: "Abertura especial de templo histórico com jardins e paisagens de outono, normalmente com acesso restrito.",
    linkOficial: "https://kyoto.travel/en/events/",
  },
  {
    titulo: "Children Who Grew Up with Manga — 40 Years of Manga in Europe",
    categoria: "ANIME",
    cidade: "Kyoto",
    local: "Kyoto International Manga Museum",
    dataInicio: "2026-09-17T10:00:00+09:00",
    dataFim: "2027-01-19T17:30:00+09:00",
    descricao: "Exposição sobre a influência e expansão do mangá japonês na Europa ao longo de quatro décadas.",
    linkOficial: "https://kyoto.travel/en/events/",
  },
  {
    titulo: "Comic Market 109 — Comiket",
    categoria: "ANIME",
    cidade: "Tokyo",
    local: "Tokyo Big Sight, Ariake",
    dataInicio: "2026-12-29T10:00:00+09:00",
    dataFim: "2026-12-31T16:00:00+09:00",
    descricao: "Grande encontro de mangá independente, ilustração, cultura otaku e cosplay.",
    linkOficial: "https://www.comiket.co.jp/info-a/TAFO/C109TAFO/",
  },
  {
    titulo: "Grande Torneio de Sumô de Janeiro 2027",
    categoria: "ESPORTES",
    cidade: "Tokyo",
    local: "Ryogoku Kokugikan, Sumida",
    dataInicio: "2027-01-10T08:30:00+09:00",
    dataFim: "2027-01-24T18:00:00+09:00",
    descricao: "Torneio profissional de sumô com lutas e rituais tradicionais japoneses.",
    linkOficial: "https://sumo.or.jp/EnTicket/year_schedule",
  },
  {
    titulo: "Grande Torneio de Sumô de Maio 2027",
    categoria: "ESPORTES",
    cidade: "Tokyo",
    local: "Ryogoku Kokugikan, Sumida",
    dataInicio: "2027-05-09T08:30:00+09:00",
    dataFim: "2027-05-23T18:00:00+09:00",
    descricao: "Competição oficial de sumô com 15 dias de lutas e cerimônias tradicionais.",
    linkOficial: "https://sumo.or.jp/EnTicket/year_schedule",
  },
  {
    titulo: "Grande Torneio de Sumô de Setembro 2027",
    categoria: "ESPORTES",
    cidade: "Tokyo",
    local: "Ryogoku Kokugikan, Sumida",
    dataInicio: "2027-09-12T08:30:00+09:00",
    dataFim: "2027-09-26T18:00:00+09:00",
    descricao: "Um dos grandes torneios anuais de sumô, com lutadores profissionais de elite.",
    linkOficial: "https://sumo.or.jp/EnTicket/year_schedule",
  },
  {
    titulo: "Grande Torneio de Sumô de Osaka 2027",
    categoria: "ESPORTES",
    cidade: "Osaka",
    local: "EDION Arena Osaka, Namba",
    dataInicio: "2027-03-14T08:30:00+09:00",
    dataFim: "2027-03-28T18:00:00+09:00",
    descricao: "Torneio oficial de sumô com 15 dias de competições e cerimônias tradicionais.",
    linkOficial: "https://sumo.or.jp/EnTicket/year_schedule",
  },
  {
    titulo: "Kyoto Winter Special Openings 2027",
    categoria: "OUTRO",
    cidade: "Kyoto",
    local: "Diversos templos e santuários históricos de Kyoto",
    dataInicio: "2027-01-08T10:00:00+09:00",
    dataFim: "2027-03-18T16:30:00+09:00",
    descricao: "Aberturas especiais de áreas normalmente fechadas ao público; horários e períodos variam por local.",
    linkOficial: "https://kyoto.travel/en/travel-inspiration/winter-openings/",
  },
];

async function main() {
  const diego = await prisma.guia.findUnique({
    where: { email: "diego@partiujapao.com" },
  });
  if (!diego) throw new Error("Guia diego@partiujapao.com não encontrado");

  let novos = 0;
  let pulados = 0;

  for (const e of EVENTOS) {
    const slug = slugify(e.titulo);
    const jaExiste = await prisma.evento.findUnique({ where: { slug } });
    if (jaExiste) {
      console.log(`→ Pulando (já existe): ${e.titulo}`);
      pulados++;
      continue;
    }

    await prisma.evento.create({
      data: {
        slug,
        titulo: e.titulo,
        categoria: e.categoria,
        dataInicio: new Date(e.dataInicio),
        dataFim: e.dataFim ? new Date(e.dataFim) : null,
        cidade: e.cidade,
        local: e.local,
        descricao: e.descricao + PENDENTE,
        linkOficial: e.linkOficial,
        destaque: false,
        guiaId: diego.id,
      },
    });
    console.log(`✓ Cadastrado: ${e.titulo}`);
    novos++;
  }

  console.log(`\n=== Resumo ===`);
  console.log(`Novos: ${novos}`);
  console.log(`Pulados (já existentes): ${pulados}`);
  console.log(`Total processado: ${EVENTOS.length}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
