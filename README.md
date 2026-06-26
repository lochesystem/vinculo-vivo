# Vínculo Vivo

Tamagotchi **soulbound** no navegador — cada conta possui uma criatura procedural única, com evoluções ramificadas estilo Digimon, personalidade local e companion PiP.

**Live:** [https://lochesystem.github.io/vinculo-vivo/](https://lochesystem.github.io/vinculo-vivo/)

## Recursos (MVP)

- Conta Supabase (email/senha) ou modo convidado local
- DNA imutável por conta — unicidade estilo NFT sem blockchain
- Care loop: comer, brincar, limpar, descansar, treinar
- Evoluções em níveis 5, 10, 20 (ramificadas por histórico de cuidado)
- Habitat pixel com ciclo dia/noite, partículas e efeitos
- PiP companion (Document PiP → popup → widget)
- PWA mobile portrait-first

## Stack

- Vite + TypeScript + Canvas 2D
- Supabase (Auth + Postgres + RLS)
- GitHub Pages

## Desenvolvimento local

```bash
npm install
cp .env.example .env   # opcional: credenciais Supabase
npm run dev
npm test
npm run build
```

## Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Execute [`supabase/migrations/001_initial.sql`](supabase/migrations/001_initial.sql) no SQL Editor
3. Em Authentication → URL Configuration, adicione:
   - Site URL: `http://localhost:5173/vinculo-vivo/`
   - Redirect URLs: `https://lochesystem.github.io/vinculo-vivo/**`
4. Copie URL e anon key para `.env`

Sem Supabase configurado, o jogo funciona em **modo convidado** com save local.

## Deploy GitHub Pages

1. Repositório `lochesystem/vinculo-vivo`
2. Settings → Pages → Source: **GitHub Actions**
3. Push na branch `main` dispara build + deploy

## Estrutura

```
src/core/       DNA, criatura, evolução, personalidade
src/render/     Canvas, habitat, sprites, partículas
src/ui/         App e telas
src/pip/        Picture-in-Picture companion
src/sync/       Supabase + offline
supabase/       Migrations SQL
docs/ROADMAP.md Batalhas e fases futuras
```

## Licença

MIT — LochéSystem
