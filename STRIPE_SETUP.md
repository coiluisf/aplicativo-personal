# Guia de Integração Stripe - TrainApp

Como configurar Stripe pagamentos de verdade no TrainApp.

## 1. Criar Conta Stripe

1. Acesse https://stripe.com
2. Clique em "Sign up"
3. Preencha dados e confirme email
4. Ative a conta

**Dashboard Stripe**: https://dashboard.stripe.com

---

## 2. Obter Chaves API

### Teste (desenvolvimento):
1. No Stripe Dashboard, acesse **Developers** → **API Keys**
2. Você verá duas chaves:
   - **Publishable Key** (pk_test_...)
   - **Secret Key** (sk_test_...)

3. Copie e configure no `.env`:

**apps/server/.env:**
```env
STRIPE_SECRET_KEY=sk_test_seu_codigo_aqui
```

**apps/web/.env.local:**
```env
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_seu_codigo_aqui
```

---

## 3. Criar Planos de Preço

No Stripe Dashboard:

### Passo 1: Criar Produtos

1. Acesse **Products** → **Create**
2. Clique em **Recurring**

**Starter:**
- Name: "Starter - 50 Alunos"
- Description: "Plano iniciante com 50 alunos"

Repeat para Professional e Enterprise

### Passo 2: Criar Preços

Para cada produto (Starter → Professional → Enterprise):

**Starter:**
- Price: R$ 49,00 (digit 4900 em centavos)
- Billing period: Monthly
- Clique em **Create Price**
- **Copie o Price ID** (price_...)

**Professional:**
- Price: R$ 99,00 (9900)
- Monthly
- **Copie o Price ID**

**Enterprise:**
- Price: R$ 299,00 (29900)
- Monthly
- **Copie o Price ID**

### Passo 3: Configurar Price IDs

No **apps/server/.env:**
```env
STRIPE_PRICE_STARTER=price_seu_id_starter
STRIPE_PRICE_PROFESSIONAL=price_seu_id_professional
STRIPE_PRICE_ENTERPRISE=price_seu_id_enterprise
```

---

## 4. Configurar Webhook

O webhook recebe notificações do Stripe em tempo real.

### Passo 1: Obter URL do Webhook

Sua URL pública será:
```
https://seu-dominio.com/api/subscriptions/webhook
```

Para desenvolvimento local com ngrok:
```bash
# Instalar ngrok: https://ngrok.com/download
ngrok http 3001

# Output:
# Forwarding https://abc123.ngrok.io -> http://localhost:3001

# Sua URL será:
# https://abc123.ngrok.io/api/subscriptions/webhook
```

### Passo 2: Registrar Webhook no Stripe

1. Acesse **Developers** → **Webhooks**
2. Clique em **Add an endpoint**
3. Cole sua URL (ex: `https://abc123.ngrok.io/api/subscriptions/webhook`)
4. Selecione eventos:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Clique em **Add endpoint**

### Passo 3: Obter Webhook Secret

1. Na página do webhook, clique no endpoint que acabou de criar
2. Copie o **Signing secret** (whsec_...)
3. Configure no **apps/server/.env:**

```env
STRIPE_WEBHOOK_SECRET=whsec_seu_codigo_aqui
```

---

## 5. Testar Integração

### Teste de Assinatura

1. Inicie o servidor:
```bash
cd apps/server
pnpm dev
```

2. Use curl para criar assinatura:
```bash
curl -X POST http://localhost:3001/api/subscriptions \
  -H "Authorization: Bearer <seu_token_jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "plan": "STARTER",
    "trialDays": 7
  }'
```

**Esperado:**
```json
{
  "id": "sub_xxx",
  "plan": "STARTER",
  "status": "ACTIVE",
  "stripeSubscriptionId": "sub_...",
  "currentPeriodEnd": "2024-02-25T..."
}
```

### Teste de Webhook

Use o Stripe CLI para testar:

```bash
# Instalar Stripe CLI: https://stripe.com/docs/stripe-cli

# Login
stripe login

# Escutar webhooks
stripe listen --forward-to localhost:3001/api/subscriptions/webhook

# Simular evento (em outro terminal)
stripe trigger customer.subscription.created
```

---

## 6. Modo Live (Produção)

### Quando estiver pronto para produção:

1. No Stripe Dashboard:
   - Acesse **Developers** → **API Keys**
   - Mude de "Test mode" para "Live mode" (toggle no topo)

2. Copie as chaves LIVE:
   - **Live Publishable Key** (pk_live_...)
   - **Live Secret Key** (sk_live_...)

3. Configure em produção:

**apps/server/.env (produção):**
```env
STRIPE_SECRET_KEY=sk_live_seu_codigo_live
STRIPE_WEBHOOK_SECRET=whsec_live_seu_codigo_live
```

**apps/web/.env.local (produção):**
```env
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_seu_codigo_live
```

---

## 7. Fluxo de Pagamento Completo

### Backend (já implementado):

```
1. Usuario se registra
   → POST /api/auth/register

2. Cria assinatura
   → POST /api/subscriptions
   → Stripe cria customer + subscription

3. Webhook notifica servidor
   → POST /api/subscriptions/webhook
   → Atualiza status no banco

4. Usuario consegue usar app
   → Workspace ativo
```

### Frontend (falta implementar UI):

```
1. Usuário clica em "Escolher Plano"
   → Mostra 3 opções (Starter/Professional/Enterprise)

2. Clica em "Assinar"
   → Mostra Stripe Checkout

3. Preenche dados do cartão
   → Stripe processa pagamento

4. Confirmação
   → Usuário vê "Assinatura ativa!"
```

---

## 8. Teste com Cartões de Teste

Stripe fornece cartões fake para testar SEM gastar dinheiro:

**Cartão de sucesso:**
- Número: `4242 4242 4242 4242`
- Validade: 12/26
- CVC: 123

**Cartão para falhar pagamento:**
- Número: `4000 0000 0000 0002`
- Validade: 12/26
- CVC: 123

**Cartão com 3D Secure:**
- Número: `4000 0027 6000 3184`
- Validade: 12/26
- CVC: 123

---

## 9. Troubleshooting

### "Invalid API Key"
- Verifique se copiou corretamente
- Teste mode vs Live mode - use Test por enquanto
- Regenere se necessário

### Webhook não recebe eventos
- Verifique se ngrok está rodando
- Confirme URL no Stripe Dashboard
- Veja logs em Developers → Webhooks → Event Logs

### Pagamento falha
- Use cartões de teste do Stripe
- Verifique se modo é "Test"
- Veja erro em Stripe Dashboard → Payments

### "Webhook signature verification failed"
- Copie exatamente o Signing Secret
- Não adicione espaços
- Regenere se necessário

---

## 10. Checklist

- [ ] Conta Stripe criada
- [ ] Chaves API copiadas
- [ ] 3 produtos criados (Starter/Professional/Enterprise)
- [ ] 3 preços criados
- [ ] Price IDs configurados no .env
- [ ] Webhook registrado
- [ ] Webhook Secret configurado
- [ ] Ngrok rodando (para teste local)
- [ ] Testou assinatura com curl
- [ ] Testou webhook
- [ ] Pronto para frontend!

---

## 💡 Próximas Features

Após integrar pagamentos básicos:

1. **Checkout da Web** - Página onde usuário escolhe plano
2. **Upgrade de Plano** - Usuario muda de Starter para Professional
3. **Cancelamento** - Usuario cancela assinatura
4. **Invoices** - Enviar recibos por email
5. **Email de Confirmação** - SendGrid

---

## 📞 Documentação Oficial

- [Stripe Docs](https://stripe.com/docs)
- [API Reference](https://stripe.com/docs/api)
- [Webhooks Guide](https://stripe.com/docs/webhooks)
- [Testing Cards](https://stripe.com/docs/testing)

---

Pronto para integrar Stripe! 🚀
