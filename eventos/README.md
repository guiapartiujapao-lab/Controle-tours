# Eventos no Japão — Partiu Japão

MVP de calendário público de eventos no Japão. Os guias cadastram, o público consulta.

## Stack

- Next.js 16 (App Router) + TypeScript
- Prisma 6 + PostgreSQL (Neon São Paulo)
- Tailwind 4
- JWT em cookie httpOnly

## Rodar local

```bash
cd eventos
npm install
cp .env.example .env
# edite .env com DATABASE_URL e JWT_SECRET
npx prisma db push
npm run db:seed
npm run dev
```

Abre em http://localhost:3004.

### Logins de teste (seed)

| Guia   | E-mail                        | Senha        |
|--------|-------------------------------|--------------|
| Diego  | diego@partiujapao.com         | partiu2026   |
| Kaori  | kaori@partiujapao.com         | partiu2026   |
| Rafael | rafael@partiujapao.com        | partiu2026   |
| Pedro  | pedro@partiujapao.com         | partiu2026   |
| Naomi  | naomi@partiujapao.com         | partiu2026   |

> Senhas em texto plano no banco para o MVP. Antes de produção, migrar para bcrypt/argon2.

## Deploy na Vercel

1. Suba o repositório.
2. No painel da Vercel: **Add New → Project → Import** (apontar para a pasta `eventos/`, _root directory_).
3. Variáveis de ambiente:
   - `DATABASE_URL` — string do Neon
   - `JWT_SECRET` — segredo longo e aleatório
4. Deploy. Depois rodar `npx prisma db push` e o seed uma vez contra o banco de produção.
5. Apontar o domínio `eventos.partiujapao.com` (ou um subcaminho via rewrite no domínio principal).

## Estrutura

- `/` — calendário/lista com filtro por categoria
- `/eventos/[slug]` — detalhe do evento + CTA de WhatsApp
- `/categorias` — grid de todas as categorias
- `/admin` — login + painel do guia
- `/admin/novo` — cadastrar
- `/admin/[id]` — editar/excluir
- `/api/eventos` e `/api/eventos/[id]` — CRUD (só o dono edita/apaga)

## Próximos passos sugeridos

- Hash de senha (bcrypt) antes de abrir cadastro público de guias
- Upload de foto (Vercel Blob ou UploadThing) no lugar de URL
- RSS/ICS do calendário (`/eventos.ics`) para quem quiser assinar
- Filtro por intervalo de datas na home
- Sitemap.xml automático dos slugs para SEO
