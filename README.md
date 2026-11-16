<div align="center">

<img src="public/brand/avatar-128.webp" alt="Zeut" width="100" height="100" />

# Zeut · Gestão de Encomendas — Web

Front-end do sistema de gestão de encomendas de uniformes e confecções.
Aplicação **Next.js 16 (App Router)** com renderização híbrida, autenticação por sessão em cookie `httpOnly`,

<img alt="Next.js" src="https://img.shields.io/badge/Next.js-16.4-000000?logo=nextdotjs&logoColor=white" />
<img alt="React" src="https://img.shields.io/badge/React-19.3-149ECA?logo=react&logoColor=white" />
<img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
<img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" />
<img alt="Vercel" src="https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white" />
<img alt="Vercel Blob" src="https://img.shields.io/badge/Storage-Vercel_Blob-000000?logo=vercel&logoColor=white" />
<img alt="PWA" src="https://img.shields.io/badge/PWA-installable-5A0FC8?logo=pwa&logoColor=white" />
<img alt="ESLint" src="https://img.shields.io/badge/ESLint-9-4B32C3?logo=eslint&logoColor=white" />
<img alt="Node.js" src="https://img.shields.io/badge/Node.js-22-5FA04E?logo=nodedotjs&logoColor=white" />
<img alt="NestJS API" src="https://img.shields.io/badge/API-NestJS_·_Prisma_·_PostgreSQL-E0234E?logo=nestjs&logoColor=white" />

</div>
Painel priorizado de encomendas, alerta de atrasos, cadastro de clientes/responsáveis, formulário de pedido
com produtos por molde e grade de tamanhos, ciclo de vida do pedido, galeria de fotos, gestão de usuários com papéis,
modo escuro e instalação como aplicativo (PWA).

## Arquitetura

```mermaid
flowchart LR
    B[Navegador]

    subgraph Vercel_Front["Next.js (Vercel)"]
        P[proxy.ts<br/>checagem de sessão]
        RSC[Server Components<br/>api-server.ts]
        BR["/backend/[...path]<br/>ponte + CSRF"]
        UP["/upload<br/>Route Handler"]
        SA[Server Actions<br/>login · logout]
    end

    API[(API NestJS<br/>Prisma · PostgreSQL)]
    BLOB[(Vercel Blob<br/>imagens)]

    B -->|requisição de página| P --> RSC -->|Bearer token| API
    B -->|mutações em componentes de cliente| BR -->|Bearer token| API
    B -->|foto já comprimida| UP -->|valida em /auth/me| API
    UP -->|put| BLOB
    B -->|formulário de login| SA -->|POST /auth/login| API
    B -.->|exibe a foto direto do CDN| BLOB
```
## Autenticação e sessão

```mermaid
sequenceDiagram
    autonumber
    participant U as Navegador
    participant X as Next.js
    participant A as API

    U->>X: GET /orders/123 (sem cookie)
    X-->>U: 307 → /login (guarda a página pedida)
    U->>X: Server Action: e-mail + senha
    X->>A: POST /auth/login
    A-->>X: JWT HS256 (7 dias)
    X-->>U: Set-Cookie zeut_session (httpOnly, Secure, SameSite=Lax)
    U->>X: GET /orders/123 (cookie)
    X->>A: GET /orders/123 · Authorization: Bearer
    A-->>X: dados
    X-->>U: HTML (streaming)
```
## Upload de imagens

```mermaid
flowchart LR
    A[Escolher fotos<br/>PNG · JPG · WebP] --> B[Prévia em slide<br/>FileReader]
    B -->|Salvar pedido| C[shrinkImage<br/>canvas → WebP]
    C -->|FormData| D["POST /upload"]
    D --> E{Sessão válida?<br/>GET /auth/me}
    E -->|não| X1[401]
    E -->|sim| F[put → Vercel Blob<br/>addRandomSuffix]
    F --> G[URL pública]
    G --> H["PATCH/POST pedido<br/>images: string[]"]
    H --> I[API valida host<br/>*.public.blob.vercel-storage.com]
```
## Rotas

| Rota | Tipo | Acesso | Descrição |
|---|---|---|---|
| `/login` | Estática | Pública | Entrada; sem cadastro público |
| `/` | Dinâmica (PPR) | Logado | Resumo, alerta de atrasos, filtros e cards por prioridade, entregues |
| `/register` | Dinâmica | Logado | Cadastro de cliente · aba Responsável (`?tab=responsible`) |
| `/orders/new` | Dinâmica | Logado | Novo pedido (`?client=<id>` / `?responsible=<id>` pré-selecionam) |
| `/orders/[id]` | Dinâmica | Logado | Detalhe, ciclo de vida, galeria de fotos |
| `/orders/[id]/edit` | Dinâmica | Logado | Edição do pedido e das fotos |
| `/users` | Dinâmica | `ADMIN` | Criar, redefinir senha, mudar papel e excluir contas |
| `/offline` | Estática | Pública | Página do PWA sem conexão |
| `/session-expired` | Route Handler | — | Limpa o cookie e volta ao login |
| `/backend/[...path]` | Route Handler | Logado | Ponte para a API (bloqueia `auth/*`) |
| `/upload` | Route Handler | Logado | Envio de foto para o Vercel Blob |

##  Estrutura do projeto

```
src/
├── app/                      Rotas finas (composição + Suspense). Grupos: (app) logado · (auth) login
│   ├── backend/[...path]/    ponte navegador → API
│   ├── upload/               Route Handler do Vercel Blob
│   ├── session-expired/      limpeza de sessão
│   ├── manifest.ts · error.tsx · globals.css (tokens de tema)
├── components/
│   ├── layout/               header, navegação ativa, alternador de tema
│   └── ui/                   design system: button, card, badges, fields, steps, breadcrumb,
│                             back-button, confirm-dialog, toast
├── features/                 uma pasta por funcionalidade (isoladas entre si)
│   ├── auth/                 login, menu do usuário, navegação de admin
│   ├── users/                gestão de contas
│   ├── orders/
│   │   ├── components/       listagem, cards, filtros, detalhe, ciclo de vida, galeria (lightbox)
│   │   └── form/             formulário, produtos, seletor de pessoas, slide de upload
│   ├── clients/ · responsibles/ · molds/ · registration/
├── lib/                      api-core/server/client · session · token · image · format
│                             documents (CPF/CNPJ/telefone) · priority · types · cn
└── proxy.ts                  proteção das páginas
```
