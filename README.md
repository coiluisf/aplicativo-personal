# 🏋️ TrainApp - SaaS de Agendamentos para Personal Trainers

Uma plataforma SaaS completa para personal trainers gerenciarem seus alunos, agendar sessões de treino e receber pagamentos de forma segura e profissional.

## 📋 Características Principais

### Para Personal Trainers:
- ✅ Dashboard com agenda de sessões
- ✅ Gerenciamento de alunos
- ✅ Programação de treino visual
- ✅ Anotações de exercício por sessão
- ✅ Histórico completo de presença
- ✅ Analytics e relatórios
- ✅ Disponibilidade customizável
- ✅ Recebimento de pagamentos (Stripe)

### Para Alunos:
- ✅ Agendamento de sessões online
- ✅ Visualização de treinos programados
- ✅ Histórico de sessões realizadas
- ✅ Notificações de lembretes
- ✅ Avaliação de sessões

### Técnico:
- ✅ Multi-tenant (isolamento completo de dados)
- ✅ Autenticação JWT + OAuth (Google, GitHub)
- ✅ Pagamentos recorrentes com Stripe
- ✅ Real-time com WebSocket (Socket.io)
- ✅ Notificações por email e push
- ✅ Deploy escalável (Vercel + Railway/AWS)
- ✅ Testes automatizados
- ✅ TypeScript em todo projeto

---

## 🚀 Quick Start

> ⚠️ **Para setup detalhado e troubleshooting**, veja [SETUP_GUIDE.md](./SETUP_GUIDE.md)

### Pré-requisitos

- **Node.js** 18+
- **pnpm** 8+ (ou npm/yarn)
- **Docker & Docker Compose** (para PostgreSQL e Redis)
- **Git**

### Instalação Rápida (5 minutos)

1. **Clone o repositório**
```bash
git clone https://github.com/coiluisf/aplicativo-personal.git
cd aplicativo-personal
```

2. **Instale dependências**
```bash
pnpm install
```

3. **Configure variáveis de ambiente**
```bash
# Copiar arquivos de exemplo
cp .env.example .env
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env.local
```

4. **Inicie Docker (banco de dados)**
```bash
# Subir PostgreSQL, Redis, pgAdmin
docker-compose up -d

# Verificar se está tudo ok
docker-compose ps
```

5. **Configure banco de dados**
```bash
cd packages/database

# Gerar Prisma client
pnpm prisma generate

# Executar migrations
pnpm prisma migrate dev --name init
```

6. **Inicie os servidores**

Terminal 1 - Backend:
```bash
cd apps/server
pnpm dev
# Servidor rodando em http://localhost:3001
```

Terminal 2 - Frontend:
```bash
cd apps/web
pnpm dev
# App rodando em http://localhost:3000
```

**Pronto! Acesse http://localhost:3000 para começar**

---

## 📁 Estrutura do Projeto

```
train-app/
├── apps/
│   ├── web/              # Frontend Next.js
│   │   ├── app/         # App Router (páginas, API)
│   │   ├── components/  # Componentes React
│   │   ├── lib/         # Utilitários (auth, API, hooks)
│   │   └── styles/      # CSS global + Tailwind
│   │
│   └── server/           # Backend Node.js/Express
│       ├── src/
│       │   ├── routes/  # Endpoints da API
│       │   ├── services/ # Lógica de negócio
│       │   ├── middleware/ # Auth, tenant, etc
│       │   └── jobs/    # Background jobs
│       └── prisma/      # Schema do banco
│
├── packages/
│   ├── database/        # Shared Prisma schema
│   └── types/          # Tipos TypeScript compartilhados
│
└── docs/
    ├── API.md
    ├── DATABASE.md
    ├── SETUP.md
    └── DEPLOYMENT.md
```

---

## 🏗️ Stack Tecnológico

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI**: shadcn/ui + TailwindCSS
- **Estado**: Zustand
- **Query**: TanStack Query (React Query)
- **Autenticação**: NextAuth.js
- **Formulários**: React Hook Form + Zod
- **Real-time**: Socket.io client
- **Deploy**: Vercel

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **ORM**: Prisma
- **Autenticação**: JWT + OAuth
- **Pagamentos**: Stripe
- **Real-time**: Socket.io
- **Background Jobs**: Bull (Redis)
- **Email**: SendGrid
- **Deploy**: Railway/Render/AWS

### Database
- **PostgreSQL** 14+
- **Redis** (cache + queue)
- **AWS S3** (file storage)

---

## 🔐 Autenticação

### Fluxo de Login

1. **Email + Senha**
   ```
   Login → Backend valida → JWT criado → Stored no cookie
   ```

2. **OAuth (Google, GitHub)**
   ```
   Click botão → Redirect Google → Callback → User criado/atualizado → JWT
   ```

### Variáveis de Ambiente Necessárias

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=sua-chave-secreta-aqui

# OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

---

## 💳 Integração Stripe

### Configuração

1. Crie conta em [stripe.com](https://stripe.com)
2. Copie chaves do dashboard
3. Configure em `.env.local`:
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Criar Planos

```bash
# Via Stripe dashboard ou API
stripe products create --name "Starter" -d "50 alunos"
stripe prices create --product prod_... --unit_amount 4900 --recurring interval=month

# Armazenar price IDs no .env
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_PROFESSIONAL=price_...
```

### Webhooks Importantes

Configurar em Stripe Dashboard → Webhooks:

- `customer.subscription.created` → Ativar workspace
- `customer.subscription.updated` → Sincronizar plano
- `invoice.payment_failed` → Notificar payment failure

---

## 📦 Scripts Úteis

### Desenvolvimento

```bash
# Iniciar todos os servidores
pnpm dev

# Lint de código
pnpm lint
pnpm lint:fix

# Type checking
pnpm typecheck

# Testes
pnpm test
pnpm test:watch
pnpm test:coverage
```

### Database

```bash
# Gerar Prisma Client (rodar após alterar schema)
pnpm db:generate

# Criar migration
pnpm db:migrate

# Push schema para DB (sem migration file)
pnpm db:push

# Seed com dados de teste
pnpm db:seed

# Reset completo (cuidado!)
pnpm db:reset
```

### Build & Deploy

```bash
# Build para produção
pnpm build

# Iniciar servidor em produção
pnpm start

# Check TypeScript errors
pnpm typecheck
```

---

## 🌍 Deployment

### Frontend (Vercel)

1. Push para GitHub
2. Connect no [Vercel Dashboard](https://vercel.com)
3. Configure variáveis de ambiente
4. Deploy automático em cada push

### Backend (Railway/Render)

#### Railway (recomendado)

1. Connect GitHub repo em [railway.app](https://railway.app)
2. Criar PostgreSQL plugin
3. Configure variáveis de ambiente
4. Deploy automático

#### Render

1. Create New Web Service
2. Connect GitHub
3. Configure build command: `pnpm build`
4. Configure start command: `pnpm start`
5. Add environment variables
6. Deploy

---

## 📊 Monitoramento

### Erros (Sentry)

```bash
# Configure em .env
SENTRY_DSN=https://...@sentry.io/...
```

### Logs

Acessar logs via:
- **Railway**: Dashboard → Logs
- **Vercel**: Deployments → Logs
- **Local**: `tail -f combined.log`

---

## 📚 Documentação Adicional

- **[Setup Guia Completo](./SETUP_GUIDE.md)** - Instruções detalhadas para iniciar o projeto
- **[API Endpoints](./API_ENDPOINTS.md)** - Documentação completa de todos os endpoints REST
- **[Plano SaaS](./SAAS_PLAN.md)** - Estratégia de negócio, modelo de pricing e roadmap
- **[Database Schema](./packages/database/prisma/schema.prisma)** - Schema Prisma completo
- **[Architecture](./SAAS_PLAN.md#arquitetura)** - Diagrama e decisões arquiteturais

---

## 🤝 Contribuindo

1. Create uma branch: `git checkout -b feature/minha-feature`
2. Commit mudanças: `git commit -m "feat: adicionei X"`
3. Push: `git push origin feature/minha-feature`
4. Abra Pull Request

---

## 📝 Roadmap

### Fase 1: MVP ✅ (Em Desenvolvimento)
- [x] Autenticação JWT + OAuth
- [x] CRUD de alunos com busca
- [x] Agendamento de sessões
- [x] Workspace multi-tenant
- [x] API REST completa com 25+ endpoints
- [x] Frontend API client com React Query
- [x] Dashboard básico
- [ ] Integração Stripe (próximo)
- [ ] Email notifications (próximo)
- [ ] Deploy staging (próximo)

### Fase 2: V1 (Estável)
- [ ] Analytics dashboard
- [ ] Programa de treino
- [ ] Upload de fotos
- [ ] Mobile responsive
- [ ] Testes E2E (Cypress/Playwright)
- [ ] Relatórios em PDF

### Fase 3: Growth
- [ ] Chat em tempo real via WebSocket
- [ ] Notificações push
- [ ] Integrações (Google Calendar, Zoom)
- [ ] Marketplace de personais
- [ ] Sistema de afiliados
- [ ] App mobile nativo

---

## 📞 Suporte

- **Issues**: GitHub Issues
- **Discussões**: GitHub Discussions
- **Email**: support@trainapp.com
- **Slack Community**: [Comunidade TrainApp]

---

## 📄 Licença

MIT License - veja [LICENSE](./LICENSE) para detalhes

---

## 🙏 Agradecimentos

Feito com ❤️ para personal trainers

**Pronto para começar? Clone o repositório e siga as instruções acima!**

---

### 🚨 Checklist Antes de Produção

- [ ] Variáveis de ambiente configuradas (sem valores de teste)
- [ ] Banco de dados migrado e backup
- [ ] Stripe em modo live (não teste)
- [ ] HTTPS configurado
- [ ] Testes passando
- [ ] Sentry configurado
- [ ] Email sending testado
- [ ] Rate limiting ativo
- [ ] CORS configurado corretamente
- [ ] Backup strategy em place
- [ ] Monitoring & alertas setup
- [ ] Disaster recovery plan
