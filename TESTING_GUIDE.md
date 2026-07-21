# Guia de Teste e Configuração Stripe

## 1. Preparação do Ambiente Local

### 1.1 Pré-requisitos
- Node.js 18+ (com npm ou pnpm)
- Docker & Docker Compose (para banco de dados)
- Git
- Conta Stripe (gratuita)

### 1.2 Clone e Setup Inicial

```bash
# Clone o repositório
git clone <seu-repo> aplicativo-personal
cd aplicativo-personal

# Use npm ao invés de pnpm (pnpm tem problemas de proxy em alguns ambientes)
npm install

# Gere os arquivos de lock
npm ci
```

### 1.3 Configurar Variáveis de Ambiente

**Arquivo: `.env` (raiz do projeto)**
```env
POSTGRES_USER=trainapp_user
POSTGRES_PASSWORD=seu_senha_segura_aqui
POSTGRES_DB=trainapp_db

PGADMIN_DEFAULT_EMAIL=admin@example.com
PGADMIN_DEFAULT_PASSWORD=seu_senha_pgadmin

REDIS_PASSWORD=seu_senha_redis
```

**Arquivo: `apps/server/.env`**
```env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

DATABASE_URL=postgresql://trainapp_user:seu_senha_segura_aqui@localhost:5432/trainapp_db

JWT_SECRET=gere_uma_chave_aleatoria_super_longa_aqui_pelo_menos_32_caracteres
REFRESH_TOKEN_SECRET=outra_chave_aleatoria_super_longa_aqui_32_caracteres

REDIS_URL=redis://:seu_senha_redis@localhost:6379

# Deixe como placeholder por enquanto (será preenchido após Stripe setup)
STRIPE_SECRET_KEY=sk_test_placeholder
STRIPE_WEBHOOK_SECRET=whsec_placeholder
STRIPE_PRICE_STARTER=price_placeholder
STRIPE_PRICE_PROFESSIONAL=price_placeholder
STRIPE_PRICE_ENTERPRISE=price_placeholder

SENDGRID_API_KEY=SG.placeholder
SENDGRID_FROM_EMAIL=noreply@trainapp.com

LOG_LEVEL=info
```

**Arquivo: `apps/web/.env.local`**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_NAME=TrainApp

NEXTAUTH_SECRET=gere_uma_chave_aleatoria_aqui_32_caracteres
NEXTAUTH_URL=http://localhost:3000

GOOGLE_CLIENT_ID=placeholder
GOOGLE_CLIENT_SECRET=placeholder
GITHUB_CLIENT_ID=placeholder
GITHUB_CLIENT_SECRET=placeholder

NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_placeholder
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
```

## 2. Iniciar Infraestrutura

### 2.1 Iniciar Docker Compose

```bash
# Na raiz do projeto
docker-compose up -d

# Verificar se os containers estão rodando
docker-compose ps

# Verificar logs
docker-compose logs -f postgres redis
```

### 2.2 Executar Migrations

```bash
# Gerar Prisma Client
pnpm db:generate

# Executar migrations
pnpm db:push

# (Opcional) Seed do banco com dados de teste
pnpm db:seed
```

## 3. Iniciar Servidores de Desenvolvimento

### 3.1 Terminal 1: Backend

```bash
# Na raiz ou em apps/server
npm run dev
# ou
pnpm -F @trainapp/server dev

# Você deve ver: "Server running on http://localhost:3001"
```

### 3.2 Terminal 2: Frontend

```bash
# Na raiz ou em apps/web
npm run dev
# ou
pnpm -F @trainapp/web dev

# Você deve ver: "Local: http://localhost:3000"
```

## 4. Testando o Frontend

### 4.1 Páginas Disponíveis

| URL | Descrição | Status |
|-----|-----------|--------|
| `http://localhost:3000/auth` | Login/Signup | ✅ Completo |
| `http://localhost:3000/onboard` | Seleção de Plano | ✅ Completo |
| `http://localhost:3000/dashboard` | Dashboard Principal | ✅ Completo |
| `http://localhost:3000/dashboard/agendamentos` | Gerenciar Sessões | ✅ Completo |
| `http://localhost:3000/dashboard/alunos` | Gerenciar Alunos | ✅ Completo |
| `http://localhost:3000/dashboard/configuracoes` | Configurações | ✅ Completo |

### 4.2 Fluxo de Teste Completo

**Passo 1: Sign Up**
1. Abra `http://localhost:3000/auth`
2. Clique em "Criar conta"
3. Preencha:
   - Nome: "João Silva"
   - Email: "joao@test.com"
   - Workspace: "Silva Personal Training"
   - Senha: "Senha123!"
4. Clique em "Criar conta"
5. **Esperado**: Redireciona para `/onboard`

**Passo 2: Selecionar Plano**
1. Você está em `http://localhost:3000/onboard`
2. Visualize os 3 planos (Starter R$49, Professional R$99, Enterprise R$299)
3. Clique em "Começar com este plano" no plano Professional
4. **Esperado**: Redireciona para `/dashboard` com carregamento de dados

**Passo 3: Dashboard Principal**
1. Você está em `http://localhost:3000/dashboard`
2. Verifique:
   - ✓ Stats cards com números (alunos, sessões, receita, assinaturas)
   - ✓ Chart mostrando sessões por dia (segunda a sábado)
   - ✓ Próximas sessões listing (vazio se não houver agendamentos)
3. Clique em "Novo agendamento" (botão azul no canto superior direito)
4. **Esperado**: Abre formulário de criação

**Passo 4: Criar Aluno**
1. Clique em "Alunos" no menu lateral (ou acesse `/dashboard/alunos`)
2. Clique em "Novo aluno"
3. Preencha:
   - Nome: "Carlos Santos"
   - Email: "carlos@test.com"
   - Telefone: "(11) 98765-4321"
4. Clique em "Adicionar aluno"
5. **Esperado**: Aluno aparece na lista com card mostrando nome, email, telefone

**Passo 5: Criar Agendamento**
1. Acesse `/dashboard/agendamentos`
2. Clique em "Novo agendamento"
3. Preencha:
   - Aluno: Selecione "Carlos Santos"
   - Data/hora início: "2024-12-25 14:00"
   - Data/hora fim: "2024-12-25 15:00"
   - Notas: "Treino de perna"
4. Clique em "Criar agendamento"
5. **Esperado**: Agendamento aparece na lista com status "Próximo"

**Passo 6: Configurações**
1. Acesse `/dashboard/configuracoes`
2. Verifique seções:
   - Configurações da Conta (nome do workspace)
   - Plano de Assinatura (Professional R$99/mês)
   - Zona de Risco (Logout, etc)
3. Clique em "Editar" próximo ao workspace
4. Mude o nome para "Silva Personal Training Premium"
5. Clique em "Salvar"
6. **Esperado**: Nome atualizado e salvo

### 4.3 Verificação Visual

**Design System Checks:**
- [ ] Fonte Geist (limpa, sem serifs)
- [ ] Cores: Indigo (#4f46e5) para botões primários
- [ ] Espaçamento apropriado (p-6, gap-6, py-8)
- [ ] Dark mode funciona (toggle com system preference)
- [ ] Icons Phosphor (duotone, tamanho 18-20px)
- [ ] Nenhum emoji desnecessário
- [ ] Responsivo em mobile (teste redimensionando o navegador)

## 5. Configuração do Stripe (Test Mode)

### 5.1 Criar Conta Stripe

1. Acesse https://dashboard.stripe.com/register
2. Preencha email, nome, empresa
3. Confirme email
4. Complete o onboarding básico

### 5.2 Obter Chaves API

1. No dashboard Stripe, acesse "Developers" > "API Keys"
2. Certifique-se que está em "Test mode" (toggle no canto superior esquerdo)
3. Copie:
   - **Publishable key** (começa com `pk_test_...`)
   - **Secret key** (começa com `sk_test_...`)

**Atualize seus .env:**

```env
# apps/server/.env
STRIPE_SECRET_KEY=sk_test_seu_valor_aqui

# apps/web/.env.local
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_seu_valor_aqui
```

### 5.3 Criar Produtos e Preços

No dashboard Stripe:

**1. Criar Produto "Starter"**
   - Name: "TrainApp Starter"
   - Description: "Starter plan with basic features"
   - Clique em "Add product"

**2. Adicionar Preço**
   - Pricing model: "Standard pricing"
   - Price: "49" (USD) ou "49" (BRL se configurado)
   - Billing period: "Monthly"
   - Clique em "Create price"
   - **Copie o Price ID** (formato: `price_xxxxx...`)

**3. Repetir para Professional e Enterprise**
   - Professional: R$99/mês
   - Enterprise: R$299/mês

**Atualize seu .env com os Price IDs:**

```env
# apps/server/.env
STRIPE_PRICE_STARTER=price_xxxxx_starter
STRIPE_PRICE_PROFESSIONAL=price_xxxxx_professional
STRIPE_PRICE_ENTERPRISE=price_xxxxx_enterprise
```

### 5.4 Configurar Webhooks

1. No dashboard Stripe, acesse "Developers" > "Webhooks"
2. Clique em "Add endpoint"
3. Para desenvolvimento local, use **ngrok**:

```bash
# Terminal separado
ngrok http 3001

# Você receberá uma URL como: https://xxxx-xx-xxx-xxx-xx.ngrok.io
```

4. No webhook do Stripe, use: `https://seu-ngrok-url/api/subscriptions/webhook`
5. Selecione eventos:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
6. Clique em "Add endpoint"
7. Copie o **Signing secret** (começa com `whsec_...`)

**Atualize seu .env:**

```env
# apps/server/.env
STRIPE_WEBHOOK_SECRET=whsec_seu_valor_aqui
```

### 5.5 Cartões de Teste

Use esses cartões no modo de teste Stripe:

| Caso de Uso | Número | Exp | CVC |
|-------------|--------|-----|-----|
| Sucesso | 4242 4242 4242 4242 | 12/25 | 123 |
| Falha | 4000 0000 0000 0002 | 12/25 | 123 |
| Requer 3D Secure | 4000 0000 0000 3220 | 12/25 | 123 |

### 5.6 Testando o Fluxo de Pagamento

1. **Fazer Login**: `http://localhost:3000/auth` → Sign up
2. **Selecionar Plano**: Clique em um plano em `/onboard`
3. **Preencher Dados de Pagamento**:
   - Use cartão teste: `4242 4242 4242 4242`
   - Exp: `12/25`
   - CVC: `123`
   - Nome: Qualquer nome
4. **Verificar Webhook**: No ngrok, você deve ver a chamada:
   ```
   POST /api/subscriptions/webhook
   Status: 200
   ```
5. **Confirmar em Stripe Dashboard**:
   - Acesse "Billing" > "Subscriptions"
   - Você deve ver uma subscription ativa com status "Active"

## 6. Troubleshooting

### Porta 3000 já em uso
```bash
# Encontre o processo
lsof -i :3000

# Mate o processo
kill -9 <PID>

# Ou use porta diferente
PORT=3002 npm run dev
```

### Erro: "DATABASE_URL not set"
```bash
# Verifique que o arquivo .env existe em apps/server/
cat apps/server/.env | grep DATABASE_URL

# Se vazio, execute:
docker-compose up -d postgres
# E aguarde 30 segundos para o postgres inicializar
```

### Erro: "NEXT_PUBLIC_API_URL is not defined"
```bash
# Verifique que o arquivo .env.local existe em apps/web/
cat apps/web/.env.local | grep NEXT_PUBLIC_API_URL

# Frontend precisa das variáveis públicas (NEXT_PUBLIC_*)
```

### Erro ao conectar ao Stripe
```bash
# Verifique que as chaves estão corretas
echo "Secret: $STRIPE_SECRET_KEY"
echo "Public: $NEXT_PUBLIC_STRIPE_PUBLIC_KEY"

# Confirme que estão em modo TEST (começam com pk_test_ e sk_test_)
```

## 7. Próximos Passos

Após validar o frontend e Stripe:

1. **Email Notifications**: Configurar SendGrid para notificações
2. **CI/CD**: GitHub Actions para testes automáticos
3. **Deployment**: 
   - Frontend → Vercel
   - Backend → Railway
   - Database → Vercel Postgres ou Supabase
4. **Monitoring**: Configurar logs e alertas

## 8. Checklist de Teste

### Frontend UI
- [ ] Auth page renderiza corretamente
- [ ] Onboard page mostra 3 planos
- [ ] Dashboard carrega stats e chart
- [ ] Agendamentos CRUD funciona
- [ ] Alunos CRUD funciona
- [ ] Configurações salva alterações
- [ ] Dark mode funciona em todas as páginas
- [ ] Responsivo em mobile

### Backend API
- [ ] POST /api/auth/register funciona
- [ ] POST /api/auth/login retorna tokens
- [ ] GET /api/workspace/stats retorna dados
- [ ] POST /api/students cria aluno
- [ ] POST /api/sessions cria agendamento
- [ ] POST /api/subscriptions/webhook processa eventos Stripe

### Stripe Integration
- [ ] Chaves API configuradas
- [ ] Produtos criados com preços corretos
- [ ] Webhook recebe eventos
- [ ] Cartão teste passa
- [ ] Subscription ativa em Stripe Dashboard

---

**Pronto!** Seu ambiente local está configurado e pronto para testes. 🚀
