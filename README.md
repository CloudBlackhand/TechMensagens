# msgSYSTEC - Sistema de Autenticação e Leitura de Google Sheets

Sistema completo de autenticação tradicional com leitura de planilhas Google Sheets, seguindo arquitetura supermodular.

## Arquitetura

```
/frontend  # React + Vite + Shadcn/ui + Tailwind
/backend   # Fastify + PostgreSQL + Google Sheets API
/shared    # Tipos TypeScript compartilhados
```

## Stack Tecnológica

### Backend
- **Fastify** - Framework performático
- **PostgreSQL** - Banco de dados com driver nativo `pg`
- **Google APIs** - Leitura de Sheets
- **JWT + bcrypt** - Autenticação segura
- **TypeScript** - Tipagem forte

### Frontend
- **React** + **Vite** - Build rápido e moderno
- **Shadcn/ui** - Componentes elegantes
- **Tailwind CSS** - Design responsivo
- **TanStack Query** - Gerenciamento de estado
- **React Router** - Navegação

## Módulos

### 1. Autenticação (`/backend/src/modules/auth`)
- Login tradicional email/senha
- JWT para sessões
- Middleware de autenticação
- Rotas: `/api/auth/login`, `/api/auth/logout`, `/api/auth/verify`

### 2. Usuários (`/backend/src/modules/users`)
- CRUD de usuários (apenas admin cria contas)
- PostgreSQL com queries SQL diretas
- Rotas: `/api/users/me`, `/api/users/:id`

### 3. Google Sheets (`/backend/src/modules/sheets`)
- Leitura sob demanda (botão "atualizar")
- Google Sheets API
- Rotas: `/api/sheets/read`, `/api/sheets/refresh`

### 4. Waha Integration (`/backend/src/modules/waha`)
- **Placeholder para implementação futura**
- Estrutura preparada para sessões por usuário

## Configuração

### Variáveis de Ambiente

#### Backend
```env
DATABASE_URL=postgresql://username:password@localhost:5432/msgsystec
JWT_SECRET=your-super-secret-jwt-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_SHEET_ID=your-google-sheet-id
WAHA_API_KEY=your-waha-api-key
FRONTEND_URL=http://localhost:5173
PORT=3001
NODE_ENV=development
```

#### Frontend
```env
VITE_API_URL=http://localhost:3001
```

## Desenvolvimento

### Pré-requisitos
- Node.js 18+
- PostgreSQL 15+
- Conta Google Cloud (para Sheets API)

### Instalação

1. **Clone o repositório**
```bash
git clone <repository-url>
cd msgsystec
```

2. **Instalar dependências**
```bash
npm install
```

3. **Configurar banco de dados**
```bash
# Criar banco PostgreSQL
createdb msgsystec

# Executar migração
cd backend
npm run db:migrate
```

4. **Configurar variáveis de ambiente**
```bash
# Backend
cp backend/env.example backend/.env
# Editar backend/.env com suas credenciais

# Frontend
cp frontend/env.example frontend/.env
# Editar frontend/.env com URL da API
```

5. **Executar em desenvolvimento**
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

### Usuário Padrão
- **Email**: admin@msgsystec.com
- **Senha**: admin123
- **Role**: admin

## Deploy no Railway

### 1. Configurar Projeto
- Criar projeto no Railway
- Adicionar PostgreSQL plugin
- Configurar variáveis de ambiente

### 2. Deploy
```bash
# Deploy automático via Git
git push origin main
```

### 3. Variáveis Railway
- `DATABASE_URL` (automático com PostgreSQL plugin)
- `JWT_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_SHEET_ID`
- `WAHA_API_KEY`
- `FRONTEND_URL`
- `VITE_API_URL`

## Funcionalidades

### Frontend
- ✅ Login tradicional (email/senha)
- ✅ Dashboard com visualização da planilha
- ✅ Botão atualizar dados sob demanda
- ✅ Perfil do usuário logado
- ✅ Design responsivo mobile-first

### Backend
- ✅ API RESTful completa
- ✅ Autenticação JWT
- ✅ Middleware de autenticação
- ✅ Leitura otimizada de Google Sheets
- ✅ Sistema de usuários (apenas admin cria)
- ✅ Placeholder Waha para futuro

## Próximos Passos

- [ ] Integração Waha com sessões por usuário
- [ ] Sistema de permissões avançado
- [ ] Logs e auditoria
- [ ] Testes automatizados
- [ ] CI/CD pipeline

## Segurança

- JWT para sessões
- CORS configurado
- Validação de dados com Zod
- Senhas hash com bcrypt
- Variáveis sensíveis em .env
- Rate limiting (opcional)

## Licença

MIT
# Railway Cache Buster seg 20 out 2025 16:14:35 -03
