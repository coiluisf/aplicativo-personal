# Integração Asaas - Guia Técnico

**Status:** Implementação Completa  
**Data:** 2024-12-21  
**Provider:** Asaas (Pagamentos)

---

## 📋 Resumo da Implementação

| Componente | Status | Descrição |
|-----------|--------|-----------|
| **AsaasService** | ✅ Completo | Serviço de API do Asaas |
| **SubscriptionController** | ✅ Atualizado | Usa Asaas ao invés de Stripe |
| **Webhook Handler** | ✅ Completo | Processa eventos do Asaas |
| **Middleware Webhook** | ✅ Completo | Valida assinatura de webhooks |
| **Database** | ✅ Compatível | Usa mesma schema (stripe_id → asaas_id) |

---

## 🏗️ Arquitetura de Integração

```
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND (Next.js)                     │
│              /onboard → POST /api/subscriptions          │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ↓ (JSON com plan)
┌─────────────────────────────────────────────────────────┐
│              SUBSCRIPTION CONTROLLER                     │
│                                                         │
│  1. Validar user + plan                                 │
│  2. Chamar AsaasService.createCustomer()                │
│  3. Chamar AsaasService.createSubscription()            │
│  4. Salvar no Prisma                                    │
│  5. Retornar subscription status                        │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────┐
│              ASAAS SERVICE                              │
│                                                         │
│  HTTP Calls:                                            │
│  • POST /v3/customers (criar cliente)                   │
│  • POST /v3/subscriptions (criar assinatura)            │
│  • GET /v3/subscriptions/{id} (verificar status)        │
│  • PUT /v3/subscriptions/{id} (atualizar)               │
│  • DELETE /v3/subscriptions/{id} (cancelar)             │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────┐
│              ASAAS API (Sandbox/Production)             │
│                                                         │
│  • Cria cliente                                         │
│  • Cria assinatura                                      │
│  • Retorna subscription_id + status                     │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ↓ (Webhook)
┌─────────────────────────────────────────────────────────┐
│          WEBHOOK ENDPOINT (POST /webhook)               │
│                                                         │
│  1. Validar x-asaas-access-token                        │
│  2. Processar evento (payment.confirmed, etc)           │
│  3. Atualizar status no banco de dados                  │
│  4. Return 200 OK                                       │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Arquivos Criados/Modificados

### Novos Arquivos
```
✅ apps/server/src/services/AsaasService.ts
   └─ Serviço completo de integração com Asaas

✅ apps/server/src/middleware/asaasWebhook.ts
   └─ Validação de webhook signature
```

### Arquivos Modificados
```
✅ apps/server/src/controllers/SubscriptionController.ts
   └─ Usar Asaas ao invés de Stripe
   └─ Criar customer + subscription
   └─ Processar webhooks do Asaas

✅ apps/server/.env
   └─ Adicionar ASAAS_API_KEY
   └─ Adicionar ASAAS_WEBHOOK_TOKEN
   └─ Adicionar ASAAS_ENVIRONMENT
   └─ Adicionar ASAAS_WEBHOOK_URL
```

---

## 🔐 Variáveis de Ambiente Necessárias

```env
# Asaas API Configuration
ASAAS_API_KEY=sk_test_xxxxx (de https://app.asaas.com/integrations/api)
ASAAS_WEBHOOK_TOKEN=webh_xxxxx (de https://app.asaas.com/integrations/webhooks)
ASAAS_ENVIRONMENT=test (ou 'production')
ASAAS_WEBHOOK_URL=https://seu-app.com/api/subscriptions/webhook
```

---

## 🚀 Fluxo de Operação

### Passo 1: Criar Subscription (Frontend → Backend)

**Request:**
```http
POST /api/subscriptions HTTP/1.1
Content-Type: application/json

{
  "plan": "PROFESSIONAL",
  "trialDays": 7
}
```

**Backend Process:**
```
1. Validar user.email + plan
2. Criar customer no Asaas:
   POST https://sandbox.asaas.com/v3/customers
   {
     "name": "João Silva",
     "email": "joao@email.com"
   }
   → Retorna: { id: "cus_xxxxx" }

3. Criar subscription:
   POST https://sandbox.asaas.com/v3/subscriptions
   {
     "customer": "cus_xxxxx",
     "billingType": "CREDIT_CARD",
     "value": 99.0,
     "cycle": "MONTHLY",
     "description": "TrainApp Professional Plan"
   }
   → Retorna: { id: "sub_xxxxx", status: "ACTIVE" }

4. Salvar no Prisma:
   INSERT INTO subscriptions (
     workspace_id,
     plan,
     stripe_subscription_id (= asaas_id),
     stripe_customer_id (= asaas_customer_id),
     status
   )

5. Retornar ao frontend:
   {
     "id": "sub_xxxxx",
     "plan": "PROFESSIONAL",
     "status": "ACTIVE",
     "paymentDetails": {
       "provider": "asaas",
       "subscriptionId": "sub_xxxxx",
       "customerId": "cus_xxxxx"
     }
   }
```

**Response:**
```json
{
  "id": "db_sub_id",
  "plan": "PROFESSIONAL",
  "status": "ACTIVE",
  "currentPeriodEnd": "2025-01-21T00:00:00Z",
  "paymentDetails": {
    "provider": "asaas",
    "customerId": "cus_123",
    "subscriptionId": "sub_456",
    "nextDueDate": "2025-01-21T00:00:00Z"
  }
}
```

### Passo 2: Usuário Paga (Asaas → Webhook)

**O que acontece:**
```
1. Asaas envia email ao usuário: "Clique para pagar sua assinatura"
2. Usuário acessa link de pagamento do Asaas
3. Preenche dados do cartão
4. Asaas processa pagamento
5. Asaas envia webhook:

   POST https://seu-app.com/api/subscriptions/webhook
   Headers: {
     "x-asaas-access-token": "webh_xxxxx"
   }
   Body: {
     "event": "payment.confirmed",
     "data": {
       "id": "pay_xxxxx",
       "subscription": "sub_xxxxx",
       "value": 99.0,
       "status": "CONFIRMED",
       "confirmationDate": "2024-12-21T10:30:00Z"
     }
   }
```

**Backend Processa:**
```
1. Validar signature (x-asaas-access-token)
2. Identificar evento: "payment.confirmed"
3. Processar: 
   - Encontrar subscription por asaas_id
   - Atualizar status para PAID
   - (Opcional) Enviar email de confirmação
4. Return 200 OK
```

### Passo 3: Cancelar Subscription

**Request:**
```http
DELETE /api/subscriptions HTTP/1.1

{
  "immediately": false
}
```

**Backend Process:**
```
1. Obter subscription do database
2. Chamar Asaas:
   PUT /v3/subscriptions/sub_xxxxx
   { "status": "CANCELLED" }
3. Atualizar database: status = CANCELLED
4. Return success
```

---

## 📊 Métodos do AsaasService

### `createCustomer(data)`
Cria um novo cliente no Asaas.

```typescript
const customer = await asaasService.createCustomer({
  name: "João Silva",
  email: "joao@email.com",
  cpfCnpj: "12345678901234",
  mobilePhone: "(11) 98765-4321"
});
// Returns: { id: "cus_123", name: "João Silva", ... }
```

### `createSubscription(data)`
Cria uma nova assinatura mensal.

```typescript
const subscription = await asaasService.createSubscription({
  customerId: "cus_123",
  value: 99.0,
  description: "TrainApp Professional",
  billingType: "CREDIT_CARD",
  cycle: "MONTHLY"
});
// Returns: { id: "sub_456", status: "ACTIVE", nextDueDate: "2025-01-21" }
```

### `getSubscription(subscriptionId)`
Obtém status da assinatura.

```typescript
const sub = await asaasService.getSubscription("sub_456");
// Returns: { id: "sub_456", status: "ACTIVE", ... }
```

### `updateSubscription(subscriptionId, data)`
Atualiza assinatura (valor, status).

```typescript
await asaasService.updateSubscription("sub_456", {
  status: "CANCELLED"
});
```

### `cancelSubscription(subscriptionId)`
Cancela assinatura.

```typescript
await asaasService.cancelSubscription("sub_456");
```

### `validateWebhook(signature, body)`
Valida que o webhook veio do Asaas.

```typescript
const isValid = asaasService.validateWebhook(
  req.headers['x-asaas-access-token'],
  req.body
);
```

### `processWebhookEvent(event)`
Processa evento de webhook.

```typescript
const result = await asaasService.processWebhookEvent({
  event: "payment.confirmed",
  data: { id: "pay_123", subscription: "sub_456", ... }
});
// Returns: { success: true, action: "PAYMENT_CONFIRMED", data: {...} }
```

---

## 🧪 Testando a Integração

### Teste 1: Criar Subscription

```bash
# Terminal
curl -X POST http://localhost:3001/api/subscriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer seu_token_jwt" \
  -d '{
    "plan": "PROFESSIONAL",
    "trialDays": 7
  }'

# Resultado esperado:
# 201 Created
# {
#   "id": "sub_xxxx",
#   "plan": "PROFESSIONAL",
#   "status": "ACTIVE",
#   "paymentDetails": { ... }
# }
```

### Teste 2: Webhook Simulado

```bash
# Simular webhook do Asaas
curl -X POST http://localhost:3001/api/subscriptions/webhook \
  -H "Content-Type: application/json" \
  -H "x-asaas-access-token: seu_webhook_token" \
  -d '{
    "event": "payment.confirmed",
    "data": {
      "id": "pay_123",
      "subscription": "sub_xxxx",
      "value": 99.0,
      "status": "CONFIRMED"
    }
  }'

# Resultado esperado:
# 200 OK
# { "received": true, "action": "PAYMENT_CONFIRMED" }
```

### Teste 3: Cancelar Subscription

```bash
curl -X DELETE http://localhost:3001/api/subscriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer seu_token_jwt" \
  -d '{ "immediately": false }'

# Resultado esperado:
# 200 OK
# { "id": "sub_xxxx", "status": "CANCELLED" }
```

---

## 🔄 Eventos de Webhook Suportados

| Evento | Ação | Descrição |
|--------|------|-----------|
| `payment.confirmed` | `PAYMENT_CONFIRMED` | Pagamento aprovado |
| `payment.created` | `PAYMENT_CREATED` | Pagamento iniciado |
| `payment.failed` | `PAYMENT_FAILED` | Pagamento falhou |
| `subscription.active` | `SUBSCRIPTION_ACTIVE` | Assinatura ativada |
| `subscription.inactive` | `SUBSCRIPTION_INACTIVE` | Assinatura inativada |

---

## 🛠️ Troubleshooting

### "Invalid API Key"
```
❌ Problema: ASAAS_API_KEY incorreta
✅ Solução: Copie direto de https://app.asaas.com/integrations/api
   Deve começar com "sk_test_" ou "sk_live_"
```

### "Webhook validation failed"
```
❌ Problema: ASAAS_WEBHOOK_TOKEN incorreto ou não configurado
✅ Solução: Copie de https://app.asaas.com/integrations/webhooks
   Deve começar com "webh_"
```

### "Customer not found"
```
❌ Problema: Tentou criar subscription sem customer
✅ Solução: CreateSubscription cria customer automaticamente
   Se erro persist, verifique se customer_id é válido
```

### "Webhook não recebe notificações"
```
❌ Problema: URL webhook incorreta no Asaas
✅ Solução:
   1. Acesse https://app.asaas.com/integrations/webhooks
   2. Verifique URL: https://seu-app.com/api/subscriptions/webhook
   3. Certifique-se que é HTTPS (não HTTP)
   4. Para local: use ngrok
      ngrok http 3001
      Adicione https://seu-ngrok-url/api/subscriptions/webhook
```

---

## 📝 Checklist: Implementação Completa

- ✅ AsaasService criado
- ✅ SubscriptionController atualizado
- ✅ Webhook middleware adicionado
- ✅ Variáveis de ambiente configuradas
- ✅ Fluxo de criação de subscription
- ✅ Fluxo de cancelamento
- ✅ Processamento de webhooks
- ✅ Validação de assinatura
- ⏳ Testes manuais (próxima etapa)

---

## 🚀 Próximos Passos

1. **Obter credenciais do Asaas**
   - Crie conta em https://www.asaas.com
   - Obtenha API_KEY e WEBHOOK_TOKEN
   - Configure no .env

2. **Configurar Webhook**
   - Acesse https://app.asaas.com/integrations/webhooks
   - Adicione endpoint: https://seu-app.com/api/subscriptions/webhook
   - Copie webhook token

3. **Testar com ngrok** (para desenvolvimento local)
   - `ngrok http 3001`
   - Adicione ngrok URL no webhook do Asaas

4. **Executar testes**
   - Criar subscription de teste
   - Simular webhook
   - Verificar database

5. **Deploy em produção**
   - Trocar para `ASAAS_ENVIRONMENT=production`
   - Usar chaves de produção
   - Atualizar URL webhook

---

## 📚 Referências

| Recurso | URL |
|---------|-----|
| Dashboard Asaas | https://app.asaas.com |
| Documentação API | https://docs.asaas.com |
| Integrations | https://app.asaas.com/integrations |
| Sandbox (Testes) | https://sandbox.asaas.com |

---

**Status:** Pronto para testes! 🎉
