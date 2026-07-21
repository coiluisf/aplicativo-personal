# Estrutura do Projeto - TrainApp SaaS

```
train-app/
├── apps/
│   ├── web/                    # Frontend Next.js
│   │   ├── app/               # App Router
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   ├── signup/
│   │   │   │   └── forgot-password/
│   │   │   ├── (app)/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── students/
│   │   │   │   ├── sessions/
│   │   │   │   ├── settings/
│   │   │   │   └── layout.tsx
│   │   │   ├── api/
│   │   │   │   ├── auth/
│   │   │   │   └── webhooks/
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── forms/
│   │   │   ├── tables/
│   │   │   └── ui/
│   │   ├── lib/
│   │   │   ├── api.ts         # HTTP client
│   │   │   ├── auth.ts        # NextAuth config
│   │   │   └── hooks/
│   │   ├── styles/
│   │   ├── public/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── next.config.js
│   │
│   └── server/                # Backend Node.js
│       ├── src/
│       │   ├── config/
│       │   │   ├── database.ts
│       │   │   ├── env.ts
│       │   │   └── stripe.ts
│       │   ├── middleware/
│       │   │   ├── auth.ts
│       │   │   ├── tenant.ts
│       │   │   ├── errorHandler.ts
│       │   │   └── logger.ts
│       │   ├── routes/
│       │   │   ├── auth.ts
│       │   │   ├── students.ts
│       │   │   ├── sessions.ts
│       │   │   ├── workspaces.ts
│       │   │   ├── subscriptions.ts
│       │   │   └── webhooks/
│       │   │       └── stripe.ts
│       │   ├── services/
│       │   │   ├── AuthService.ts
│       │   │   ├── StripeService.ts
│       │   │   ├── EmailService.ts
│       │   │   ├── SessionService.ts
│       │   │   └── TenantService.ts
│       │   ├── models/
│       │   │   ├── User.ts
│       │   │   ├── Workspace.ts
│       │   │   ├── Student.ts
│       │   │   └── Session.ts
│       │   ├── controllers/
│       │   │   ├── AuthController.ts
│       │   │   ├── StudentController.ts
│       │   │   └── SessionController.ts
│       │   ├── jobs/
│       │   │   ├── sendReminderEmail.ts
│       │   │   ├── checkExpiredSubscriptions.ts
│       │   │   └── generateMonthlyReports.ts
│       │   ├── utils/
│       │   │   ├── validators.ts
│       │   │   ├── helpers.ts
│       │   │   └── constants.ts
│       │   └── index.ts
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── migrations/
│       ├── tests/
│       ├── package.json
│       ├── tsconfig.json
│       └── .env.example
│
├── packages/                   # Código compartilhado
│   ├── database/
│   │   ├── prisma/
│   │   └── seeds/
│   ├── types/                 # Tipos TypeScript compartilhados
│   │   └── index.ts
│   └── utils/
│       └── validation.ts
│
├── docs/
│   ├── API.md
│   ├── DATABASE.md
│   ├── SETUP.md
│   └── DEPLOYMENT.md
│
├── .github/
│   ├── workflows/
│   │   ├── test.yml
│   │   ├── lint.yml
│   │   └── deploy.yml
│   └── pull_request_template.md
│
├── docker-compose.yml
├── .env.local.example
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

## Arquivos Críticos para Começar

### 1. `package.json` (root)
```json
{
  "name": "train-app",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "concurrently \"pnpm --filter web dev\" \"pnpm --filter server dev\"",
    "build": "pnpm --filter web build && pnpm --filter server build",
    "test": "pnpm --filter '*/tests' test",
    "lint": "pnpm --filter '*' lint",
    "db:push": "pnpm --filter database prisma db push",
    "db:migrate": "pnpm --filter database prisma migrate dev",
    "db:seed": "pnpm --filter database ts-node prisma/seed.ts"
  },
  "devDependencies": {
    "concurrently": "^8.0.0",
    "turbo": "^1.10.0"
  },
  "packageManager": "pnpm@8.0.0"
}
```

### 2. `prisma/schema.prisma` (Database)
Veja arquivo separado abaixo.

### 3. `server/src/index.ts` (Express Setup)
Veja arquivo separado abaixo.

### 4. `web/app/layout.tsx` (Next.js Root)
Veja arquivo separado abaixo.
