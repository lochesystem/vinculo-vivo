# Supabase setup

1. Create project at https://supabase.com
2. Run `migrations/001_initial.sql` in SQL Editor
3. Enable Email auth (and Google OAuth if desired)
4. Add redirect URLs:
   - `http://localhost:5173/vinculo-vivo/**`
   - `https://lochesystem.github.io/vinculo-vivo/**`
5. Copy project URL and anon key to `.env`
