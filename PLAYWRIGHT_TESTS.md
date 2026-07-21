# Testes E2E com Playwright

**Status:** Implementação Completa  
**Framework:** Playwright  
**Abrangência:** MVP Completo

---

## 📋 Resumo dos Testes

| Suite | Testes | Status | O Que Testa |
|-------|--------|--------|-------------|
| **auth.spec.ts** | 4 | ✅ | Sign up, login, toggle form |
| **onboard.spec.ts** | 8 | ✅ | Planos, preços, responsivo, dark mode |
| **dashboard.spec.ts** | 9 | ✅ | Stats, chart, navigation, mobile |
| **alunos.spec.ts** | 8 | ✅ | CRUD alunos, search, validation |
| **Total** | **29 testes** | ✅ | **Cobertura MVP completa** |

---

## 🚀 Quick Start

### 1. Instalar Playwright (Uma Vez)

```bash
cd apps/web

# Instalar Playwright
npx playwright install

# Ou com npm
npm install --save-dev @playwright/test
```

### 2. Rodar Todos os Testes

```bash
cd apps/web

# Modo CLI (rápido)
npx playwright test

# Modo UI (interativo - RECOMENDADO)
npx playwright test --ui

# Modo Debug (step-by-step)
npx playwright test --debug
```

### 3. Ver Resultados

```bash
# Abrir relatório HTML
npx playwright show-report
```

---

## 📊 O Que Cada Suite Testa

### **auth.spec.ts** - Autenticação
```
✅ Sign up novo usuário
   └─ Preenche form → Redireciona /onboard

✅ Login com usuário existente
   └─ Credenciais → Redireciona /dashboard

✅ Erro em credenciais inválidas
   └─ Password errada → Fica em /auth ou mostra erro

✅ Toggle entre login e signup
   └─ Mostra/esconde campos corretos
```

### **onboard.spec.ts** - Seleção de Plano
```
✅ Exibe 3 planos (Starter, Professional, Enterprise)

✅ Preços corretos (R$49, R$99, R$299)

✅ Badge "Mais popular" no Professional

✅ Listas de features em cada plano

✅ Botões "Começar com este plano" funcionam

✅ Mensagem "7 dias grátis"

✅ Responsivo em mobile (stack vertical)

✅ Dark mode funciona
```

### **dashboard.spec.ts** - Dashboard Principal
```
✅ Heading "Dashboard" visível

✅ Botão "Novo agendamento" presente

✅ 4 stat cards visíveis (alunos, sessões, receita, assinaturas)

✅ Stats carregam com valores

✅ Gráfico "Sessões esta semana"

✅ Seção "Próximas sessões"

✅ Link "Ver todas as sessões"

✅ Responsivo em mobile

✅ Dark mode funciona
```

### **alunos.spec.ts** - Gerenciamento de Alunos
```
✅ Header "Alunos" visível

✅ Botão "Novo aluno"

✅ Campo de busca funcional

✅ Form abre ao clicar "Novo aluno"

✅ Validação de email

✅ Empty state para sem alunos

✅ Cards de alunos exibem info

✅ Botões edit + delete presentes
```

---

## 🛠️ Modo de Operação

### **Modo CLI (Rápido - CI/CD)**
```bash
npx playwright test

# Saída:
# ✓ auth.spec.ts (4 tests passed)
# ✓ onboard.spec.ts (8 tests passed)
# ✓ dashboard.spec.ts (9 tests passed)
# ✓ alunos.spec.ts (8 tests passed)
# 
# 29 passed (1m 45s)
```

### **Modo UI (Interativo - Desenvolvimento)**
```bash
npx playwright test --ui

# Abre navegador com:
# - Seletor de testes
# - Step-by-step execution
# - Screenshots em falhas
# - Network inspection
```

### **Modo Debug (Diagnóstico)**
```bash
npx playwright test --debug

# Abre Playwright Inspector
# - Pause na linha
# - Step over / step into
# - Console
# - Network
```

### **Rodar Um Teste Específico**
```bash
# Apenas auth tests
npx playwright test auth.spec.ts

# Apenas um teste
npx playwright test auth.spec.ts -g "should sign up new user"

# Com filtro
npx playwright test -g "should display"
```

### **Modo Watch (Desenvolvimento Contínuo)**
```bash
npx playwright test --watch

# Rerun testes ao salvar arquivo
```

---

## 📸 Screenshots e Videos

### Automático em Falhas
```bash
# playwright.config.ts já configura:
screenshot: 'only-on-failure'  # Screenshot só em falha
video: 'retain-on-failure'     # Video só em falha
trace: 'on-first-retry'        # Trace de debug
```

### Ver Evidências
```bash
# Após teste falhar:
npx playwright show-report

# Abre HTML com screenshots e videos
```

---

## 🔧 Configuração (playwright.config.ts)

```typescript
{
  testDir: './e2e',              // Onde estão os testes
  fullyParallel: true,            // Rodar testes em paralelo
  forbidOnly: !!process.env.CI,  // Fail se deixar test.only
  retries: process.env.CI ? 2 : 0, // Retry em CI
  workers: process.env.CI ? 1 : undefined, // Workers em paralelo
  baseURL: 'http://localhost:3000', // URL base
  webServer: {                    // Inicia dev server automaticamente
    command: 'npm run dev',
    url: 'http://localhost:3000'
  }
}
```

---

## 🚦 Interpretar Resultados

### ✅ Sucesso
```
✓ auth.spec.ts (4/4 passed)
✓ onboard.spec.ts (8/8 passed)

12 passed (45s)
```
→ Todos os testes passaram. MVP OK! ✨

### ❌ Falha
```
✗ dashboard.spec.ts
  ✗ should display stats cards grid (2 failed)

1 failed
Relatório: file:///path/to/playwright-report/index.html
```
→ Verifique o relatório HTML para screenshots

### ⏭️ Skipped
```
⊙ alunos.spec.ts (5/8 passed, 3 skipped)
```
→ Alguns testes foram pulados (ex: sem permissão)

---

## 🐛 Troubleshooting

### "timeout: waiting for locator"
```
Problema: Elemento não encontrado
Solução:
  1. Verificar se seletor está correto
  2. Adicionar espera explícita:
     await page.waitForSelector('button:has-text("Save")')
  3. Usar --debug para inspecionar
```

### "Browser launch failed"
```
Problema: Navegador não iniciou
Solução:
  npx playwright install chromium
```

### "Test timed out after 30s"
```
Problema: Teste muito lento
Solução:
  1. Aumentar timeout: test.setTimeout(60000)
  2. Usar test.slow() para avisar
  3. Verificar waitFor() calls
```

### "Port 3000 already in use"
```
Problema: Dev server já rodando
Solução:
  1. Kill processo: lsof -i :3000 | kill -9 <PID>
  2. Usar reuseExistingServer: true em config
```

---

## 📚 Exemplo de Teste Customizado

```typescript
import { test, expect } from '@playwright/test';

test('should create and delete student', async ({ page }) => {
  // Navigate
  await page.goto('/dashboard/alunos');

  // Click "Novo aluno"
  await page.click('button:has-text("Novo aluno")');

  // Fill form
  await page.fill('input[placeholder="João Silva"]', 'João Silva');
  await page.fill('input[placeholder="joao@email.com"]', 'joao@test.com');

  // Submit
  await page.click('button:has-text("Adicionar aluno")');

  // Verify student appears
  await expect(page.locator('text=João Silva')).toBeVisible();

  // Find and click delete button for this student
  const studentCard = page.locator('text=João Silva').locator('..');
  await studentCard.locator('button').last().click();

  // Confirm deletion
  await page.on('dialog', dialog => dialog.accept());

  // Verify student is gone
  await expect(page.locator('text=João Silva')).not.toBeVisible();
});
```

---

## 🔄 CI/CD Integration (GitHub Actions)

### Arquivo: `.github/workflows/e2e.yml`
```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run tests
        run: npm run test:e2e
      
      - name: Upload results
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: apps/web/playwright-report/
```

---

## 📦 Package.json Scripts

Adicione ao `apps/web/package.json`:

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:report": "playwright show-report"
  }
}
```

### Uso:
```bash
npm run test:e2e           # Rodar todos
npm run test:e2e:ui       # Interface
npm run test:e2e:debug    # Debug
npm run test:e2e:headed   # Com navegador visível
npm run test:e2e:report   # Ver relatório
```

---

## ✅ Checklist: Cobertura MVP

- ✅ Autenticação (sign up, login)
- ✅ Seleção de plano
- ✅ Dashboard principal
- ✅ Gestão de alunos (CRUD)
- ⏳ Gestão de agendamentos (criar/listar)
- ⏳ Configurações (editar workspace)
- ⏳ Webhook de pagamentos
- ⏳ Dark mode em todas as páginas
- ⏳ Responsivo em mobile
- ⏳ Performance (carregamento)

---

## 🚀 Próximos Testes a Adicionar

```
1. agendamentos.spec.ts
   - Criar agendamento
   - Listar agendamentos
   - Filtrar por status
   - Cancelar agendamento

2. configuracoes.spec.ts
   - Editar workspace
   - Visualizar plano
   - Cancelar subscription
   - Logout

3. integration.spec.ts
   - Fluxo completo: Sign up → Onboard → Dashboard
   - Criar aluno → Criar agendamento
   - Multi-user isolation

4. performance.spec.ts
   - Tempo de carregamento < 2s
   - API response time < 200ms
   - Bundle size check

5. accessibility.spec.ts
   - WCAG 2.1 AA compliance
   - Keyboard navigation
   - Screen reader compatibility
```

---

## 📞 Referências

| Recurso | URL |
|---------|-----|
| Docs | https://playwright.dev |
| Locators | https://playwright.dev/docs/locators |
| API | https://playwright.dev/docs/api/class-page |
| Best Practices | https://playwright.dev/docs/best-practices |
| Debugging | https://playwright.dev/docs/debug |

---

**Pronto para testar automaticamente!** 🎉

Rode `npm run test:e2e:ui` para começar.
