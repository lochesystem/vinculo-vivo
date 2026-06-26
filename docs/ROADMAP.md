# Vínculo Vivo — Roadmap

## Fase 1 — MVP Tamagotchi (atual)

- [x] Auth Supabase + modo convidado local
- [x] DNA procedural soulbound (1 criatura/conta)
- [x] Care loop: comer, brincar, limpar, descansar, treinar
- [x] Needs decay com cap offline 8h
- [x] Personalidade procedural + falas
- [x] Níveis 1–20, evoluções em 5/10/20
- [x] Habitat pixel + partículas
- [x] PiP companion (Document PiP → popup → widget)
- [x] PWA básico
- [x] GitHub Pages CI/CD

## Fase 2 — Profundidade

- [ ] Níveis 21–50 + evoluções 30/40/50
- [ ] Lista de amigos (Supabase)
- [ ] Visitar habitat read-only
- [ ] Skill tree visível (sem batalha)
- [ ] Creature Card export assinado (Edge Function)
- [ ] Perfil público `/c/{shortId}`
- [ ] Tick server-side (anti-cheat relógio)
- [ ] Sync offline robusto (IndexedDB)

## Fase 3 — Mobile nativo

- [ ] WebView APK (padrão pacto-sombrio)
- [ ] Push notifications (needs críticos)

## Fase 4 — Batalhas (documentado)

### Combate turn-based estilo Pokémon

- HP, 4 moves por criatura, type affinity por arquétipo
- Skills desbloqueadas nos marcos 5–80 conforme care path
- Animação de replay via log JSON no canvas

### Modos

| Modo | Descrição |
|------|-----------|
| Amistoso | Convite por friend code, sem ELO |
| Ranqueada | ELO Supabase, seasons, matchmaking **async** |

### Anti-cheat

- Simulação server-side via Supabase Edge Function
- Cliente envia ações, servidor resolve dano/ordem

### Schema futuro (rascunho)

```sql
-- battles, battle_replays, ranked_stats (Fase 4)
```

## Fase 5 — Opcional

- [ ] LLM para pensamentos da criatura (Edge Function)
- [ ] Prova criptográfica de ownership (sem blockchain)
- [ ] Marketplace cosmético (sem NFT chain)
