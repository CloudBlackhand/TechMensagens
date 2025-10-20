<!-- 53a5dbff-e69e-449a-b70c-a1c21cd5ae32 e6722476-a083-4d0f-aaef-54f388821541 -->
# Sistema de Autenticação e Leitura de Google Sheets

## Arquitetura Modular

```
/frontend  # React + Vite + Shadcn/ui + Tailwind
/backend   # Fastify + PostgreSQL (pg) + Google Sheets API
/shared    # Tipos TypeScript compartilhados
```

## Stack Tecnológica

### Backend

- **Fastify** - Framework performático
- **pg** - Driver PostgreSQL nativo (queries SQL diretas, sem ORM)
- **bcrypt** - Hash de senhas
- **jsonwebtoken** - JWT para sessões
- **Google APIs** - Leitura de Sheets (Service Account)
- **Zod** - Validação de dados
- **TypeScript** - Tipagem forte

### Frontend

- **React + Vite** - Build rápido
- **Shadcn/ui** - Componentes elegantes
- **Tailwind CSS** - Design moderno
- **TanStack Query** - Cache e estado
- **React Router** - Navegação
- **TypeScript** - Tipagem forte

### Database

- **PostgreSQL** - Usuários e autenticação
- Railway Postgres plugin
- Queries SQL diretas (sem ORM)

## Módulos Backend

### 1. Auth (`/backend/src/modules/auth`)

- Login tradicional email/senha
- JWT para sessões
- Middleware de autenticação
- Rotas: `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`

### 2. Users (`/backend/src/modules/users`)

- CRUD de usuários (apenas admin pode criar)
- Queries SQL diretas com pg
- Hash bcrypt para senhas
- Rotas: `GET /api/users/me`, `POST /api/users` (admin), `GET /api/users` (admin)

### 3. Sheets (`/backend/src/modules/sheets`)

- Leitura sob demanda via Google Sheets API
- Service Account com credenciais fornecidas
- Cache em memória opcional
- Rotas: `GET /api/sheets/data`, `POST /api/sheets/refresh`

### 4. Waha (`/backend/src/modules/waha`)

- Placeholder vazio para implementação futura
- Estrutura preparada para sessões

## Schema PostgreSQL

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Features Frontend

1. **Login** - Form email/senha
2. **Dashboard** - Tabela com dados da planilha + botão atualizar
3. **Perfil** - Dados do usuário logado
4. **Admin Panel** - Criar novos usuários (apenas admin)
5. **Design Responsivo** - Mobile-first

## Configuração Railway

### Variáveis Backend

```
DATABASE_URL=postgresql://...
JWT_SECRET=...
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_PRIVATE_KEY=...
GOOGLE_SHEET_ID=...
WAHA_API_KEY=...
FRONTEND_URL=...
PORT=3000
```

### Variáveis Frontend

```
VITE_API_URL=...
```

### Deploy

- Backend e Frontend como serviços separados
- PostgreSQL via Railway plugin
- Build commands: `npm run build`
- Start: `npm start` (backend), `npm run preview` (frontend)

## Segurança

- Senhas com bcrypt (10 rounds)
- JWT com expiração
- CORS configurado
- Validação Zod em todas rotas
- Apenas admin cria usuários
- Logs e configs apenas para admin/dev

## Estrutura de Arquivos

### Backend

```
/backend
  /src
    /modules
      /auth
      /users
      /sheets
      /waha (placeholder)
    /database
      init.sql
      pool.ts
    /middleware
      auth.middleware.ts
    /utils
    server.ts
  package.json
  tsconfig.json
  .env.example
```

### Frontend

```
/frontend
  /src
    /components
      /ui (shadcn)
      Header.tsx
      SheetsTable.tsx
      LoginForm.tsx
      UserForm.tsx
    /pages
      Login.tsx
      Dashboard.tsx
      Admin.tsx
    /lib
      api.ts
      auth.ts
    /hooks
    App.tsx
    main.tsx
  package.json
  tsconfig.json
  tailwind.config.ts
  .env.example
```

### Shared

```
/shared
  /src
    types.ts
    validation.ts
  package.json
  tsconfig.json
```

### To-dos

- [ ] Criar estrutura de pastas (frontend, backend, shared) e configurar package.json raiz
- [ ] Configurar backend: Fastify, TypeScript, dependências (pg, bcrypt, jwt, google-apis, zod)
- [ ] Criar schema SQL, pool de conexão pg e script de inicialização do banco
- [ ] Implementar módulo auth: login, JWT, middleware de autenticação
- [ ] Implementar módulo users: CRUD com queries SQL diretas, rotas protegidas admin
- [ ] Implementar módulo sheets: integração Google Sheets API, leitura sob demanda
- [ ] Criar estrutura placeholder do módulo Waha para implementação futura
- [ ] Configurar frontend: React, Vite, Tailwind, Shadcn/ui, TanStack Query, React Router
- [ ] Implementar páginas de login, contexto de autenticação e rotas protegidas
- [ ] Criar dashboard com tabela de planilha, botão atualizar e componentes UI
- [ ] Criar painel admin para gerenciar usuários (apenas admin)
- [ ] Criar tipos TypeScript compartilhados entre frontend e backend
- [ ] Configurar arquivos de deploy Railway (railway.json, .env.example, docs)