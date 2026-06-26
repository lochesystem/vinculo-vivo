# Supabase — projeto `vinculo-vivo`

| Campo | Valor |
|-------|-------|
| Dashboard | https://supabase.com/dashboard/project/whvescaapfntikhplrut |
| Project ref | `whvescaapfntikhplrut` |
| Região | `sa-east-1` (São Paulo) |
| API URL | `https://whvescaapfntikhplrut.supabase.co` |

## Setup local

1. Copie `.env.example` → `.env` (ou use o `.env` já gerado localmente)
2. Migration aplicada: `supabase/migrations/001_initial.sql`
3. Auth redirects configurados para localhost e GitHub Pages

## Comandos úteis

```bash
# Re-aplicar migrations (com access token)
$env:SUPABASE_ACCESS_TOKEN = "seu-token"
npx supabase db push --linked -p (Get-Content .supabase-db-password.local -Raw) --yes
```

Senha do Postgres: arquivo local `.supabase-db-password.local` (não versionado).
