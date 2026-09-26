# Tibia Consult

Referência do Master Sorcerer (level 800+) para o Tibia depois do Vocation Adjustments de junho de 2026
e do Summer Update de julho de 2026: cooldowns, rotações por elemento com validador, gemas da Wheel of Destiny,
equipamento por slot e fichas de hunt.

Projeto pessoal. Todos os dados vêm da TibiaWiki e do tibia.com, com a data de conferência indicada no app.
Tibia e todo o seu conteúdo são de propriedade da CipSoft GmbH.

## Rodar

```bash
npm install
npm run dev
```

## Estrutura

- `src/data/` dados conferidos (feitiços, rotações, gemas, equipamento, hunts).
- `src/lib/rotation.ts` validador de cooldown (grupo de ataque, individual, secundário, piso de 50%).
- `src/app/` páginas em português.

## Próximos passos

- Login por pessoa (Supabase) e chars salvos.
- Outras vocações (Druid primeiro).
- Ícones de feitiço e linha do tempo visual.
