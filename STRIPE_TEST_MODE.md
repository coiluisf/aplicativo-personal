# Configuração Completa do Stripe (Test Mode)

## Objetivo

Configurar o Stripe em modo de teste para processar pagamentos de assinaturas sem usar dinheiro real.

## ⚡ Quick Start (5 minutos)

```bash
# 1. Crie conta em https://dashboard.stripe.com/register
# 2. Após login, você tem automaticamente chaves de teste

# 3. Copie essas chaves do dashboard (Developers > API Keys):
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...

# 4. Atualize seus .env files com as chaves

# 5. Crie 3 produtos com preços (veja seção 2 abaixo)

# 6. Copie os Price IDs dos produtos criados

# 7. Atualize .env com Price IDs

# 8. Comece a testar!
```

---

## 1. Criar Conta Stripe e Obter Chaves

### 1.1 Registrar Conta

1. Acesse: https://dashboard.stripe.com/register
2. Preencha:
   - Email: seu@email.com
   - Password: senha_segura
   - Country: Brazil (se aplicável)
   - Company: Seu nome ou empresa
3. Clique "Create account"
4. Confirme email (você receberá um link)

### 1.2 Acessar API Keys

1. Após login, clique em "Developers" no menu esquerdo
2. Clique em "API Keys"
3. **Importante**: Verifique o toggle no topo direito - ele deve estar em "Test mode" (azul)

Você verá duas chaves:

```
Publishable key    (Public, seguro compartilhar)
pk_test_51XXXxxxxxx...

Secret key         (Private, NUNCA compartilhar)
sk_test_51XXXxxxxxx...
```

### 1.3 Copie e Guarde

```bash
# Salve em um lugar seguro temporariamente
pk_test_sua_chave_aqui
sk_test_sua_chave_aqui

# Depois, adicione aos seus .env files
```

---

## 2. Criar Produtos e Preços

### 2.1 Navegar para Products

1. No dashboard Stripe, clique em "Products" no menu esquerdo
2. Clique em "+ Add product"

### 2.2 Criar Produto "Starter"

**Informações Básicas:**
```
Name: TrainApp Starter
Description: Starter plan - Perfect for solo personal trainers
Image: (opcional - você pode pular)
```

**Pricing:**
- Clique "Add pricing"
- Pricing model: "Standard pricing"
- Price: 49 (será em USD por padrão, ou configure sua moeda)
- Billing period: "Monthly"
- Clique "Create product"

**Resultado:**
- Você receberá um "Price ID" que parece assim: `price_1XXXXXXX...`
- **Copie e guarde** esse ID

### 2.3 Criar Produto "Professional"

Repita o processo acima com:
```
Name: TrainApp Professional
Description: Professional plan - For growing personal trainer businesses
Price: 99
Billing period: Monthly
```

**Copie o Price ID** (ex: `price_2XXXXXXX...`)

### 2.4 Criar Produto "Enterprise"

Repita com:
```
Name: TrainApp Enterprise
Description: Enterprise plan - For large personal training studios
Price: 299
Billing period: Monthly
```

**Copie o Price ID** (ex: `price_3XXXXXXX...`)

### 2.5 Resultado Final

Você agora tem 3 Price IDs:

```
STRIPE_PRICE_STARTER=price_1xxxxxx
STRIPE_PRICE_PROFESSIONAL=price_2xxxxxx
STRIPE_PRICE_ENTERPRISE=price_3xxxxxx
```

---

## 3. Atualizar Variáveis de Ambiente

### 3.1 Backend (.env em apps/server/)

```env
# Chaves obtidas na seção 1.2
STRIPE_SECRET_KEY=sk_test_sua_chave_aqui

# Price IDs obtidos na seção 2.5
STRIPE_PRICE_STARTER=price_1xxxxxx
STRIPE_PRICE_PROFESSIONAL=price_2xxxxxx
STRIPE_PRICE_ENTERPRISE=price_3xxxxxx

# Webhook (configure depois - por enquanto deixe como placeholder)
STRIPE_WEBHOOK_SECRET=whsec_placeholder_configure_depois
```

### 3.2 Frontend (.env.local em apps/web/)

```env
# Chave pública obtida na seção 1.2
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_sua_chave_aqui
```

### 3.3 Reiniciar Servidores

```bash
# Mate os processos atuais (Ctrl+C em ambos os terminals)
# E reinicie:

# Terminal 1: Backend
npm run dev (em apps/server)

# Terminal 2: Frontend  
npm run dev (em apps/web)
```

---

## 4. Configurar Webhooks (Para Receber Eventos)

Webhooks permem que o Stripe notifique seu backend sobre eventos de pagamento.

### 4.1 Usar ngrok para Expor localhost

Como seu servidor roda em `localhost:3001`, você precisa expô-lo publicamente usando ngrok:

```bash
# Download ngrok: https://ngrok.com/download
# Ou use via npm:
npm install -g ngrok

# Em um terminal separado:
ngrok http 3001

# Você verá:
# Forwarding: https://xxxx-xx-xxx-xxx-xx.ngrok.io -> http://localhost:3001
```

**Guarde essa URL**: `https://xxxx-xx-xxx-xxx-xx.ngrok.io`

### 4.2 Criar Webhook Endpoint

1. No Stripe Dashboard, acesse "Developers" > "Webhooks"
2. Clique "+ Add endpoint"
3. Na caixa "Endpoint URL", preencha:
   ```
   https://seu-ngrok-url/api/subscriptions/webhook
   ```
4. Em "Select events to listen to", clique "Select events"
5. Selecione esses eventos (marque as checkboxes):
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
6. Clique "Add endpoint"

### 4.3 Copiar Signing Secret

1. Você verá o endpoint criado com um "Signing secret"
2. Ele parece assim: `whsec_1xxxxxxxxxxxxxxxx...`
3. Clique no ícone de olho para revelar
4. **Copie e guarde**

### 4.4 Atualizar .env

```env
# apps/server/.env
STRIPE_WEBHOOK_SECRET=whsec_seu_valor_aqui
```

### 4.5 Reiniciar Backend

```bash
npm run dev (em apps/server)
```

---

## 5. Testar com Cartões de Teste

### 5.1 Cartões Disponíveis

O Stripe fornece cartões de teste para diferentes cenários:

| Caso de Uso | Número | Exp | CVC | Resultado |
|-------------|--------|-----|-----|-----------|
| Sucesso | 4242 4242 4242 4242 | 12/25 | 123 | ✅ Paga |
| Falha | 4000 0000 0000 0002 | 12/25 | 123 | ❌ Recusa |
| Expirado | 4000 0000 0000 0069 | 12/16 | 123 | ❌ Expirado |
| 3D Secure | 4000 0000 0000 3220 | 12/25 | 123 | ⚠️ 2FA |
| Declined | 5555 5555 5555 4444 | 12/25 | 123 | ❌ Recusa |

**Use `4242 4242 4242 4242` para testes normais!**

### 5.2 Fluxo de Teste Completo

1. Abra `http://localhost:3000/onboard`
2. Clique em "Começar com este plano" no Professional (R$99)
3. Preencha o formulário de pagamento:
   ```
   Card number: 4242 4242 4242 4242
   Expiration: 12/25
   CVC: 123
   Name: Test User
   Email: test@example.com
   ```
4. Clique "Pay" ou "Subscribe"
5. **Esperado**: Você verá "Payment successful!"
6. Redirecionará para `/dashboard`

### 5.3 Verificar em Stripe Dashboard

Após fazer um pagamento de teste:

1. No Stripe Dashboard, acesse "Billing" > "Subscriptions"
2. Você deve ver uma subscription com:
   - Status: "Active"
   - Plano: "Professional"
   - Cliente: Email que você usou
   - Próxima cobrança: 1 mês depois

3. Acesse "Payment" > "Payments"
4. Você verá um pagamento com:
   - Valor: R$99
   - Status: "Succeeded"

---

## 6. Monitorar Webhooks

### 6.1 Via Dashboard Stripe

1. Acesse "Developers" > "Webhooks"
2. Clique no seu endpoint criado
3. Clique em "Events"
4. Você verá todos os eventos enviados (customer.subscription.created, etc)
5. Clique em um evento para ver os detalhes

### 6.2 Via ngrok

Na janela do terminal onde ngrok está rodando, você verá:

```
POST /api/subscriptions/webhook HTTP/1.1
200 OK
```

Isso significa que o backend recebeu e processou o webhook com sucesso.

### 6.3 Verificar Logs do Backend

Se você tiver logging configurado:

```bash
# Terminal do backend (apps/server)
# Você verá logs como:
# [info] Webhook received: customer.subscription.created
# [info] Subscription created: sub_XXXXXXXXX for customer cus_XXXXXXX
```

---

## 7. Troubleshooting

### Erro: "Invalid API Key"
```
Problema: Você copiou a chave errada
Solução: 
- Verifique que pk_test_* ou sk_test_* (começa com "test")
- Não use a chave de produção (começaria com pk_live_ ou sk_live_)
- Copie diretamente do dashboard Stripe
```

### Erro: "Could not authenticate you"
```
Problema: STRIPE_SECRET_KEY não está definida ou está vazia
Solução:
- Verifique que apps/server/.env tem a chave
- Reinicie o backend (Ctrl+C e npm run dev)
- Confirme que não tem espaços extras
```

### Erro: "Cannot read property 'id' of undefined" ao criar subscription
```
Problema: Price ID não está configurado corretamente
Solução:
- Verifique STRIPE_PRICE_* em apps/server/.env
- Confirme que os Price IDs começam com "price_"
- Certifique-se que os produtos foram criados em Stripe
```

### Webhook não está recebendo eventos
```
Problema: URL do webhook incorreta ou ngrok não está rodando
Solução:
- Verifique que ngrok está rodando: ngrok http 3001
- Confirme que a URL do webhook em Stripe é exatamente:
  https://seu-ngrok-url/api/subscriptions/webhook
- Verifique que /api/subscriptions/webhook é pública (sem autenticação JWT)
```

### Erro: "Customer not found"
```
Problema: Tentativa de criar subscription para cliente que não existe
Solução:
- Sempre criar customer via Stripe antes de criar subscription
- Backend já faz isso automaticamente em createSubscription()
- Verifique que o user está logado ao tentar assinar
```

---

## 8. Checklist de Configuração

- [ ] Conta Stripe criada
- [ ] Modo TEST ativo (não live)
- [ ] Chaves API copiadas
  - [ ] Secret key: `sk_test_...`
  - [ ] Publishable key: `pk_test_...`
- [ ] Variáveis de ambiente atualizadas
  - [ ] `apps/server/.env` → `STRIPE_SECRET_KEY`
  - [ ] `apps/web/.env.local` → `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`
- [ ] 3 Produtos criados
  - [ ] Starter (R$49/mês)
  - [ ] Professional (R$99/mês)
  - [ ] Enterprise (R$299/mês)
- [ ] Price IDs copiados
  - [ ] `STRIPE_PRICE_STARTER=price_...`
  - [ ] `STRIPE_PRICE_PROFESSIONAL=price_...`
  - [ ] `STRIPE_PRICE_ENTERPRISE=price_...`
- [ ] ngrok instalado e rodando
  - [ ] `ngrok http 3001`
  - [ ] URL copiada
- [ ] Webhook criado em Stripe
  - [ ] URL: `https://ngrok-url/api/subscriptions/webhook`
  - [ ] Eventos selecionados
  - [ ] Signing secret copiado
- [ ] Variável `STRIPE_WEBHOOK_SECRET` atualizada
- [ ] Servidores reiniciados (backend + frontend)
- [ ] Fluxo de pagamento testado
  - [ ] Uso de cartão `4242 4242 4242 4242`
  - [ ] Subscription ativa em Stripe Dashboard
  - [ ] Webhook recebido e processado

---

## 9. Próximos Passos

Após configurar Stripe em teste:

1. **Configurar Email Notifications**
   - Enviar email quando subscription é criada
   - Enviar email quando pagamento falha
   - Use SendGrid ou similar

2. **Testar Fluxos de Erro**
   - Use cartão `4000 0000 0000 0002` para simular falha
   - Verifique que o erro é tratado no frontend
   - Verifique que o webhook processa falhas corretamente

3. **Migrar para Production** (quando pronto)
   - Trocar para chaves `pk_live_*` e `sk_live_*`
   - Desabilitar modo de teste
   - Criar webhooks de produção
   - Testar com valores reais (em staging primeiro)

---

**Pronto para processar pagamentos!** 🎉
