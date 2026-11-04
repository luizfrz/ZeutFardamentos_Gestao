# Zeut · Gestão de Encomendas — Web

Front-end em Next.js 16 (App Router, Cache Components) + Tailwind 4.
A API fica em outro projeto: `../zeut_gestao_api` (NestJS + PostgreSQL).

## Rodar

```bash
# 1) API e banco (no projeto da API)
cd ../zeut_gestao_api && npm install && docker compose up -d && npm run db:deploy && npm run start:dev

# 2) este projeto
cp .env.example .env.local      # NEXT_PUBLIC_API_URL (padrão http://localhost:3333/api)
npm install
npm run dev                     # http://localhost:3000
```

Scripts: `dev`, `build`, `start`, `lint`.

## Telas

- `/` Encomendas: resumo, filtros (prioridade/prazo/ciclo/ordenação), cards priorizados e entregues
- `/register` (botão **Novo cadastro**): dados do cliente · aba Responsável (`?tab=responsible`)
- `/orders/new` (botão **Cadastrar novo pedido**): escolhe o cliente, já mostra os dados dele, adiciona produtos (+ modal "Novo tipo de produto") e salva (`?client=<id>` / `?responsible=<id>` pré-selecionam)
- `/orders/[id]` detalhe · `/orders/[id]/edit`

## Estrutura

```
src/
├── app/                      rotas finas (só composição + Suspense): register · orders/new · orders/[id] · orders/[id]/edit
├── components/
│   ├── layout/               header
│   └── ui/                   design system: button, card, badges, fields, steps, breadcrumb, confirm-dialog
├── features/                 uma pasta por funcionalidade
│   ├── orders/
│   │   ├── components/       listagem, cards, filtros, detalhe, ciclo de vida
│   │   └── form/             formulário de pedido, produtos, seletor de pessoas, dados do cliente
│   ├── clients/              formulário de cliente
│   ├── responsibles/         formulário de responsável
│   ├── molds/                catálogo de moldes: modal, categorias
│   └── registration/         abas do /register (cliente · responsável)
└── lib/                      api, types, format (datas/rótulos), documents (CPF/CNPJ/telefone), priority, cn
```

Regras: `app/` não contém lógica; `features/*` importam de `components/ui` e `lib`, nunca de outra feature
(exceção: `registration` compõe as demais); componentes de dados são Server Components dentro de `<Suspense>`.

## Regras de negócio no front

- **Prioridade** (espelha `src/common/priority.ts` da API): menos de 7 dias → URGENTE (≥ 50 peças) ou ALTA · 7–14 dias → MÉDIA · mais de 14 → BAIXA.
- **Data de entrega**: classificada em tempo real (passada / hoje / P.E. 1–3); data passada exige confirmação antes de salvar.
- **Responsável**: nome, CPF e telefone (com DDD) obrigatórios.

## Tema claro/escuro e PWA

- **Modo escuro**: botão sol/lua no cabeçalho; segue o tema do sistema até haver uma escolha, que fica salva no aparelho.
  Cores são tokens CSS em `src/app/globals.css` (`:root` = claro, `[data-theme="dark"]` = escuro) — para ajustar a paleta, edite só esse arquivo.
  Use as classes semânticas (`bg-surface`, `text-ink`, `text-crimson-ink`, `text-ok-ink`…) e não cores fixas (`bg-white`).
- **PWA** (`src/app/manifest.ts`, `public/sw.js`, `public/icons/`): instalável, com página offline. O Service Worker só é registrado em produção
  e não guarda páginas nem dados da API, só arquivos estáticos.

## Quando a API está fora do ar

As telas mostram "Não foi possível carregar os dados" com o botão **Tentar novamente** (`src/app/error.tsx`), mantendo o cabeçalho;
os formulários mostram "Não foi possível conectar à API…". Veja a seção de solução de problemas no README da API.

## Limitações conhecidas

- Upload de imagens é só pré-visualização local (sem armazenamento).
- Sem autenticação.
