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

- `/login` — entrar (página estática, sem cabeçalho do sistema). **Não há cadastro público.**
- `/users` — administradores criam contas, redefinem senhas, mudam permissões e excluem contas
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

## Deploy na Vercel

O Next.js roda na Vercel sem configuração. Ordem recomendada: **API primeiro**, depois o front.

1. Publique a API (veja o README do projeto `zeut_gestao_api`) e copie a URL **real** dela (Vercel → projeto da API → *Domains*).
   Confira antes: `https://SEU-PROJETO-API.vercel.app/api/health` deve responder `{"status":"ok"}`.
2. *Add New → Project* → importe este repositório (preset *Next.js*, detectado sozinho).
3. Variável de ambiente (Production **e** Preview): `NEXT_PUBLIC_API_URL` = `https://SEU-PROJETO-API.vercel.app/api`
   — é lida **no build**, então mudar o valor exige novo deploy.
4. Faça o deploy e copie a URL do front. Volte à API e coloque essa URL em `WEB_ORIGIN` (CORS); redeploy da API.
5. O PWA só instala em HTTPS — a Vercel já entrega.

> Com o login, só quem tem conta acessa os dados. Mantenha secreto o `JWT_SECRET` da API.

## Login e sessão

Todo o sistema exige login. Fluxo: `proxy.ts` manda quem não tem sessão para `/login` (lembrando a página pedida) →
Server Action chama `POST /auth/login` da API → o token (JWT) fica em um cookie **httpOnly + Secure + SameSite=Lax** (7 dias).
O JavaScript da página **nunca vê o token**: o servidor do site o anexa nas chamadas à API, e o navegador só fala com o próprio
domínio pela ponte `/backend/*` (por isso não há CORS nem a API precisa ser pública para o navegador).

| Peça | Onde |
|---|---|
| Proteção das páginas (checagem otimista do cookie) | `src/proxy.ts` |
| Leitura/escrita do cookie de sessão | `src/lib/session.ts`, `src/lib/token.ts` |
| API para Server Components (anexa o token) | `src/lib/api-server.ts` |
| API para componentes de cliente (via `/backend`) | `src/lib/api-client.ts` |
| Ponte navegador → API (com defesa de CSRF) | `src/app/backend/[...path]/route.ts` |
| Telas e ações de login/sair | `src/features/auth/` |
| Administração de usuários (só admin) | `src/features/users/`, `src/app/(app)/users/` |
| Token expirado/inválido → limpa o cookie e volta ao login | `src/app/session-expired/route.ts` |

- **Contas são criadas por administradores** (tela `/users`; botão "Gerar senha forte"). Papéis: `USER` (usa o sistema) e `ADMIN` (também gerencia contas).
- **Primeiro administrador**: `yarn user:admin:neon` no projeto da API (lê `.env.admin`). Depois, entre e troque a senha em *Usuários*.
- Quem protege os **dados** é a API (valida a assinatura do token a cada chamada); o `proxy.ts` só evita telas vazias.
- **Variáveis**: nenhuma nova no front. `NEXT_PUBLIC_API_URL` continua valendo; `API_URL` (opcional, privada) tem prioridade no servidor.

## Documentos (CPF/CNPJ)

- **CPF é opcional**: no responsável e no cliente pessoa física. Se informado, precisa ser válido e único.
- **CNPJ é obrigatório** para empresa e órgão público.
- Pedido, detalhe e buscas funcionam com cadastros sem documento (as linhas de CPF simplesmente não aparecem).

## Layout do celular

Testado em 9 tamanhos (320×568 até tablet 768×1024, incluindo celular deitado) e nos temas claro e escuro, em 19 telas/estados
(formulários, modais, diálogos). Regras que o projeto segue — mantenha ao mexer na interface:

- Nada pode gerar rolagem horizontal; larguras mínimas só dentro de contêineres com rolagem própria.
- Alvos de toque com pelo menos 40 px (ícones) / 36 px (botões de texto); campos de formulário com **16 px** em telas de toque
  (abaixo disso o iPhone dá zoom ao focar) — regra global em `globals.css`.
- Modais precisam caber em tela baixa (celular deitado): limitar a altura e rolar por dentro.
- No cabeçalho, "Novo cadastro" vira só o ícone abaixo de 440 px e o texto da marca some abaixo de 400 px.

## Marca e PWA

As logos originais ficam em `brand/` (não são publicadas). `npm run brand:build` gera tudo a partir delas: logo web (`public/brand/`),
avatar do cabeçalho, arte do login, ícones do PWA (`public/icons/`), `apple-icon` e favicon. As cores do tema são as da logo
(azul `#0c1844`, carmim `#c80036`, creme `#fff5e1`, coral `#ff6969`) e estão em `src/app/globals.css`.

## Quando a API está fora do ar

As telas mostram "Não foi possível carregar os dados" com o botão **Tentar novamente** (`src/app/error.tsx`), mantendo o cabeçalho;
os formulários mostram "Não foi possível conectar à API…". Veja a seção de solução de problemas no README da API.

## Limitações conhecidas

- Upload de imagens é só pré-visualização local (sem armazenamento).
- Sessão sem revogação imediata: um usuário removido mantém o acesso até o token expirar (até 7 dias).
- O limite de tentativas de login é por instância (serverless); para um limite global use o Vercel Firewall.
