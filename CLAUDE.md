# Fluxo de Caixa - Sistema de Controle Financeiro Mensal

## Visão Geral

Sistema web para controle de fluxo de caixa mensal, permitindo registrar entradas (receitas) e saídas (despesas) organizadas por mês/ano. O sistema calcula automaticamente o saldo final considerando o saldo inicial, total de entradas e total de saídas.

## Tecnologias

- **Framework**: Nuxt 4 (Vue 3 + Nitro)
- **Banco de Dados**: PostgreSQL
- **ORM**: Drizzle ORM
- **Estilização**: Tailwind CSS 4
- **Autenticação**: Sessão via cookie HTTP-only (implementação própria)
- **Linguagem**: TypeScript

## Estrutura de Pastas

```
├── app/                          # Frontend (Nuxt)
│   ├── assets/css/main.css       # Estilos globais (Tailwind)
│   ├── composables/
│   │   └── useAuth.ts            # Composable de autenticação
│   ├── middleware/
│   │   └── auth.global.ts        # Middleware de proteção de páginas
│   ├── pages/
│   │   ├── index.vue             # Lista de fluxos mensais
│   │   ├── login.vue             # Página de login
│   │   ├── users.vue             # Gerenciamento de usuários (admin)
│   │   └── cash-flow/
│   │       └── [id].vue          # Detalhes do fluxo (entradas/saídas)
│   ├── app.vue                   # Layout principal
│   └── app.config.ts             # Configurações do app
├── server/                       # Backend (Nitro)
│   ├── api/
│   │   ├── auth/                 # Autenticação
│   │   │   ├── login.post.ts     # POST /api/auth/login
│   │   │   ├── logout.post.ts    # POST /api/auth/logout
│   │   │   └── me.get.ts         # GET /api/auth/me
│   │   ├── cash-flows/           # Fluxos de caixa
│   │   │   ├── index.get.ts      # GET /api/cash-flows
│   │   │   ├── index.post.ts     # POST /api/cash-flows
│   │   │   ├── [id].get.ts       # GET /api/cash-flows/:id
│   │   │   ├── [id].put.ts       # PUT /api/cash-flows/:id
│   │   │   └── [id].delete.ts    # DELETE /api/cash-flows/:id
│   │   ├── entries/              # Entradas (receitas)
│   │   │   ├── index.post.ts     # POST /api/entries
│   │   │   ├── [id].put.ts       # PUT /api/entries/:id
│   │   │   └── [id].delete.ts    # DELETE /api/entries/:id
│   │   ├── expenses/             # Saídas (despesas)
│   │   │   ├── index.post.ts     # POST /api/expenses
│   │   │   ├── [id].put.ts       # PUT /api/expenses/:id
│   │   │   └── [id].delete.ts    # DELETE /api/expenses/:id
│   │   └── users/                # Usuários (apenas admin)
│   │       ├── index.get.ts      # GET /api/users
│   │       ├── index.post.ts     # POST /api/users
│   │       └── [id].delete.ts    # DELETE /api/users/:id
│   ├── db/
│   │   ├── index.ts              # Conexão com banco (useDb)
│   │   └── schema.ts             # Schemas Drizzle
│   ├── middleware/
│   │   └── auth.ts               # Middleware de proteção de APIs
│   ├── services/
│   │   └── cashFlowService.ts    # Cálculo de saldo
│   └── utils/
│       └── session.ts            # Utilitários de sessão
├── scripts/
│   └── seed.ts                   # Seeder de usuário admin
├── drizzle.config.ts             # Configuração Drizzle Kit
├── nuxt.config.ts                # Configuração Nuxt
└── package.json
```

## Banco de Dados

### Tabelas

#### users
| Campo      | Tipo         | Descrição                    |
|------------|--------------|------------------------------|
| id         | serial (PK)  | ID único                     |
| name       | varchar(255) | Nome do usuário              |
| email      | varchar(255) | Email (único)                |
| password   | varchar(255) | Senha (hash bcrypt)          |
| isAdmin    | boolean      | Se é administrador           |
| createdAt  | timestamp    | Data de criação              |

#### cash_flows
| Campo          | Tipo          | Descrição                 |
|----------------|---------------|---------------------------|
| id             | serial (PK)   | ID único                  |
| month          | integer       | Mês (1-12)                |
| year           | integer       | Ano                       |
| initialBalance | decimal(12,2) | Saldo inicial do mês      |
| createdAt      | timestamp     | Data de criação           |

**Constraint**: Único por (month, year)

#### entries (Entradas/Receitas)
| Campo          | Tipo          | Descrição                 |
|----------------|---------------|---------------------------|
| id             | serial (PK)   | ID único                  |
| cashFlowId     | integer (FK)  | Referência ao cash_flow   |
| date           | date          | Data da entrada           |
| description    | varchar(255)  | Descrição                 |
| amountExpected | decimal(12,2) | Valor previsto            |
| amountReceived | decimal(12,2) | Valor efetivamente recebido |
| createdAt      | timestamp     | Data de criação           |

#### expenses (Saídas/Despesas)
| Campo       | Tipo          | Descrição               |
|-------------|---------------|-------------------------|
| id          | serial (PK)   | ID único                |
| cashFlowId  | integer (FK)  | Referência ao cash_flow |
| date        | date          | Data da saída           |
| description | varchar(255)  | Descrição               |
| amount      | decimal(12,2) | Valor                   |
| createdAt   | timestamp     | Data de criação         |

### Relacionamentos

- `cash_flows` 1:N `entries` (um fluxo tem várias entradas)
- `cash_flows` 1:N `expenses` (um fluxo tem várias saídas)
- Cascata: ao deletar um cash_flow, entries e expenses são deletados

## Autenticação e Autorização

### Fluxo de Autenticação

1. Usuário faz login em `/login` com email e senha
2. Backend verifica credenciais e cria sessão via cookie HTTP-only
3. Cookie contém dados do usuário codificados em Base64
4. Middleware global verifica autenticação em todas as páginas (exceto `/login`)
5. APIs verificam sessão via middleware do servidor

### Níveis de Acesso

| Recurso              | Usuário Normal | Admin |
|----------------------|----------------|-------|
| Fluxos de caixa      | Sim            | Sim   |
| Entradas/Saídas      | Sim            | Sim   |
| Ver usuários         | Não            | Sim   |
| Criar usuários       | Não            | Sim   |
| Excluir usuários     | Não            | Sim   |

### Funções de Sessão (server/utils/session.ts)

- `setUserSession(event, user)` - Define sessão do usuário
- `getUserSession(event)` - Obtém sessão atual (ou null)
- `clearUserSession(event)` - Remove sessão (logout)
- `requireAuth(event)` - Exige autenticação (401 se não autenticado)
- `requireAdmin(event)` - Exige admin (403 se não for admin)

## APIs

### Autenticação

| Método | Rota              | Descrição           | Autenticação |
|--------|-------------------|---------------------|--------------|
| POST   | /api/auth/login   | Fazer login         | Não          |
| POST   | /api/auth/logout  | Fazer logout        | Não          |
| GET    | /api/auth/me      | Dados do usuário    | Sim          |

### Fluxos de Caixa

| Método | Rota                 | Descrição                    | Autenticação |
|--------|----------------------|------------------------------|--------------|
| GET    | /api/cash-flows      | Listar fluxos                | Sim          |
| POST   | /api/cash-flows      | Criar fluxo                  | Sim          |
| GET    | /api/cash-flows/:id  | Detalhes (com entradas/saídas e saldo) | Sim |
| PUT    | /api/cash-flows/:id  | Atualizar fluxo              | Sim          |
| DELETE | /api/cash-flows/:id  | Excluir fluxo                | Sim          |

### Entradas

| Método | Rota               | Descrição        | Autenticação |
|--------|--------------------|------------------|--------------|
| POST   | /api/entries       | Criar entrada    | Sim          |
| PUT    | /api/entries/:id   | Atualizar entrada| Sim          |
| DELETE | /api/entries/:id   | Excluir entrada  | Sim          |

### Saídas

| Método | Rota               | Descrição      | Autenticação |
|--------|--------------------|----------------|--------------|
| POST   | /api/expenses      | Criar saída    | Sim          |
| PUT    | /api/expenses/:id  | Atualizar saída| Sim          |
| DELETE | /api/expenses/:id  | Excluir saída  | Sim          |

### Usuários (apenas admin)

| Método | Rota             | Descrição        | Autenticação |
|--------|------------------|------------------|--------------|
| GET    | /api/users       | Listar usuários  | Admin        |
| POST   | /api/users       | Criar usuário    | Admin        |
| DELETE | /api/users/:id   | Excluir usuário  | Admin        |

## Cálculo do Saldo

O saldo final é calculado pelo serviço `cashFlowService.ts`:

```
Saldo Final = Saldo Inicial + Total Entradas (recebido) - Total Saídas
```

- **Total Entradas**: soma de `amountReceived` de todas as entries do fluxo
- **Total Saídas**: soma de `amount` de todas as expenses do fluxo

## Páginas do Frontend

### / (index.vue)
- Lista de fluxos de caixa em cards
- Mostra mês/ano e saldo inicial
- Botão para criar novo fluxo
- Link para gerenciar usuários (apenas admin)
- Botão de logout

### /login (login.vue)
- Formulário de login (email/senha)
- Redireciona para / após sucesso

### /cash-flow/:id ([id].vue)
- Detalhes do fluxo mensal
- Cards de resumo: Saldo Inicial, Total Entradas, Total Saídas, Saldo Final
- Tabela de entradas com CRUD
- Tabela de saídas com CRUD
- Modais para criar/editar entradas e saídas

### /users (users.vue)
- Apenas para administradores
- Lista de usuários do sistema
- Criar novos usuários
- Excluir usuários (não pode excluir a si mesmo)

## Variáveis de Ambiente

```env
DATABASE_URL=postgresql://user:password@localhost:5432/fluxo_caixa
SESSION_SECRET=sua-chave-secreta-aqui-mude-em-producao
```

## Scripts NPM

| Script         | Descrição                              |
|----------------|----------------------------------------|
| npm run dev    | Inicia servidor de desenvolvimento     |
| npm run build  | Build de produção                      |
| npm run db:push| Sincroniza schema com banco            |
| npm run db:seed| Cria/atualiza usuário admin            |
| npm run db:studio | Abre Drizzle Studio (GUI do banco)  |

## Usuário Padrão

Após rodar `npm run db:seed`:

- **Email**: admin@admin.com
- **Senha**: admin123
- **Admin**: Sim

## Convenções de Código

- APIs usam `useDb()` para obter conexão com banco
- Proteção de rotas via `requireAuth()` ou `requireAdmin()`
- Datas são armazenadas como `date` (sem hora)
- Valores monetários são `decimal(12,2)`
- Frontend usa composable `useAuth()` para autenticação
- Formatação de moeda: `pt-BR` com `BRL`

## UI Guidelines

**IMPORTANTE**: Todo desenvolvimento de interface deve seguir o arquivo `design.json` na raiz do projeto.

### Design System

O projeto utiliza um tema escuro (dark theme) inspirado em dashboards financeiros modernos. As especificações completas estão em `design.json`.

### Cores Principais

| Uso | Cor | Hex |
|-----|-----|-----|
| Background principal | Preto profundo | `#0a0a0f` |
| Background secundário | Cinza escuro | `#12121a` |
| Cards | Cinza card | `#1a1a24` |
| Bordas | Cinza borda | `#2a2a3a` |
| Texto principal | Branco | `#ffffff` |
| Texto secundário | Cinza claro | `#8b8b9e` |
| Accent/Primário | Indigo | `#6366f1` |
| Sucesso (entradas) | Verde | `#22c55e` |
| Perigo (saídas) | Vermelho | `#ef4444` |

### Componentes

#### Cards
- Background: `#1a1a24`
- Borda: `1px solid #2a2a3a`
- Border-radius: `1rem`
- Padding: `1.5rem`

#### Botões
- **Primário**: Background `#6366f1`, hover `#818cf8`
- **Secundário**: Background transparente, borda `#2a2a3a`
- **Perigo**: Background `#ef4444`
- Border-radius: `0.5rem`

#### Inputs
- Background: `#12121a`
- Borda: `1px solid #2a2a3a`
- Focus: borda `#6366f1`
- Border-radius: `0.5rem`

#### Tabelas
- Header background: `#12121a`
- Row hover: `#1a1a24`
- Borda: `#2a2a3a`

### Layout

- Sidebar à esquerda (280px)
- Conteúdo principal com max-width `1400px`
- Grid gap: `1.5rem`
- Padding do conteúdo: `2rem`

### Tipografia

- Font family: Inter (sans-serif)
- Tamanhos: xs (0.75rem), sm (0.875rem), base (1rem), lg (1.125rem), xl+ para títulos

### Badges de Status

- **Valores positivos**: Background `rgba(34, 197, 94, 0.1)`, texto `#22c55e`
- **Valores negativos**: Background `rgba(239, 68, 68, 0.1)`, texto `#ef4444`

### Regras de UI

1. Sempre usar o tema escuro definido em `design.json`
2. Cards devem ter hover state com `#22222e`
3. Transições suaves (200ms) em interações
4. Ícones com 20px para sidebar, 24px para ações
5. Espaçamento consistente usando a escala definida
6. Valores monetários positivos em verde, negativos em vermelho
