# Manual Testing Guide - TrainApp MVP
## Test the App as an End User

**Last Updated:** 2026-07-21  
**Status:** Ready for Manual Testing  
**Estimated Time:** 30-45 minutes for complete flow

---

## 🚀 Quick Start - Running the App Locally

### Step 1: Start the Backend Server

```bash
# Open terminal 1 - Backend
cd apps/server
npm install
npm run dev
```

**Expected Output:**
```
✓ Prisma schema validation passed
✓ Database connection OK
Server running on http://localhost:3001
```

### Step 2: Start the Frontend Dev Server

```bash
# Open terminal 2 - Frontend
cd apps/web
npm install
npm run dev
```

**Expected Output:**
```
▲ Next.js 14.1.0
- Local:        http://localhost:3000
- Ready in 3.2s
```

### Step 3: Open the App in Browser

Visit: **http://localhost:3000**

---

## 📋 Complete User Flows

### Flow 1: Sign Up (Create Account)

**Page:** http://localhost:3000/auth

#### Steps:
1. ✅ Click **"Criar conta"** tab (it should toggle the form)
2. ✅ Fill in the Sign Up form:
   - **Nome:** João Silva (any name)
   - **Email:** joao@test.com (must be a new email)
   - **Password:** Senha123! (min 8 chars)
   - **Confirm Password:** Senha123!

3. ✅ Click **"Criar conta"** button
4. ✅ Should redirect to: **http://localhost:3000/onboard**

#### Validations to Check:
- ❌ Email validation: Try entering "invalid-email" → should show error
- ❌ Password validation: Try entering "123" → should show "min 8 characters"
- ❌ Password mismatch: Fill passwords differently → should show error
- ✅ Form toggle: Click "Login" tab → form should change
- ✅ Form toggle: Click "Criar conta" tab → back to signup

**What's Happening:**
- Your credentials are saved in the database
- A JWT access token (15 min) + refresh token (7 days) are created
- You're automatically logged in

---

### Flow 2: Select Plan (Onboarding)

**Page:** http://localhost:3000/onboard

#### Steps:
1. ✅ Verify **3 pricing plans** are displayed:
   - **Starter** - R$ 49,00/mês
   - **Professional** - R$ 99,00/mês (has "Mais popular" badge)
   - **Enterprise** - R$ 299,00/mês

2. ✅ Read the features for each plan
3. ✅ Click **"Começar com este plano"** on any plan (e.g., Professional)
4. ✅ Should redirect to: **http://localhost:3000/dashboard**

#### Validations to Check:
- ✅ Prices are correct
- ✅ "Professional" has "Mais popular" badge
- ✅ "7 dias grátis" message is visible
- ✅ Feature lists show checkmarks
- 📱 **Mobile Test:** Open DevTools (F12) → Toggle device toolbar → Should stack vertically

**What's Happening:**
- A workspace is created for this user
- Subscription is initiated (in test mode)
- User is granted "trainer" role

---

### Flow 3: Dashboard (Main Page)

**Page:** http://localhost:3000/dashboard

#### Steps:
1. ✅ Verify **"Dashboard"** heading is visible
2. ✅ Check **4 stat cards** display:
   - Alunos ativos (active students)
   - Sessões agendadas (scheduled sessions)
   - Receita (revenue)
   - Assinaturas ativas (active subscriptions)

3. ✅ Look for **"Novo agendamento"** button (top right)
4. ✅ Look for **Chart section** "Sessões esta semana"
5. ✅ Look for **"Próximas sessões"** section
6. ✅ Click **"Ver todas as sessões"** link → goes to `/dashboard/agendamentos`

#### Validations to Check:
- ✅ Stats show numeric values (even if 0)
- ✅ Chart renders (bar chart showing sessions by day)
- ✅ "Nenhuma sessão agendada" message when no sessions exist
- ✅ Navigation links work
- 🌙 **Dark Mode Test:** Press your browser's dark mode toggle (or DevTools) → page should have dark background

**What's Happening:**
- Dashboard aggregates data from your workspace
- Stats are calculated in real-time
- Chart uses Recharts to visualize weekly sessions

---

### Flow 4: Manage Students (Alunos)

**Page:** http://localhost:3000/dashboard/alunos

#### Steps:

**A) View Empty State:**
1. ✅ Page should show "Nenhum aluno" message (since none exist yet)
2. ✅ See **"Novo aluno"** button

**B) Create a Student:**
1. ✅ Click **"Novo aluno"** button
2. ✅ A form appears with title "Adicionar novo aluno"
3. ✅ Fill in:
   - **Nome:** Maria Silva
   - **Email:** maria@test.com
   - **Telefone:** (11) 99999-9999 (optional)
   - **Data de Início:** 2026-07-21

4. ✅ Click **"Adicionar aluno"** button
5. ✅ Form closes
6. ✅ New student card appears with "Maria Silva" and email

**C) Search Students:**
1. ✅ Type "Maria" in the search box
2. ✅ Student card is highlighted/filtered
3. ✅ Clear search → all students shown

**D) Edit Student:**
1. ✅ Click **"Editar"** button on student card
2. ✅ Form opens with pre-filled data
3. ✅ Change name to "Maria Santos"
4. ✅ Click **"Atualizar aluno"**
5. ✅ Card updates with new name

**E) Delete Student:**
1. ✅ Click **trash icon** on student card
2. ✅ Confirmation appears (might be a modal or toast)
3. ✅ Confirm deletion
4. ✅ Card disappears

#### Validations to Check:
- ❌ **Email validation:** Add student with "invalid-email" → should show error
- ✅ **Empty state:** Delete all students → "Nenhum aluno" message returns
- ✅ **Search:** Type partial name → filters correctly
- 📱 **Mobile:** Cards should stack in single column

**What's Happening:**
- Each student is associated with your workspace
- Students can be assigned to sessions later
- Search filters in real-time

---

### Flow 5: Manage Sessions (Agendamentos)

**Page:** http://localhost:3000/dashboard/agendamentos

#### Steps:

**A) View Sessions:**
1. ✅ Page should show "Nenhuma sessão agendada" (empty state)
2. ✅ See **"Novo agendamento"** button

**B) Create a Session:**
1. ✅ Click **"Novo agendamento"** button
2. ✅ Form appears with title "Agendar nova sessão"
3. ✅ Fill in:
   - **Aluno:** Select "Maria Silva" (from dropdown)
   - **Data:** 2026-07-25
   - **Hora Início:** 10:00
   - **Hora Fim:** 11:00
   - **Observações:** "Treino de perna" (optional)

4. ✅ Click **"Agendar"** button
5. ✅ Form closes
6. ✅ Session appears in list

**C) Filter by Status:**
1. ✅ Tab **"Próximos"** - shows upcoming sessions
2. ✅ Tab **"Concluídos"** - completed sessions
3. ✅ Tab **"Cancelados"** - cancelled sessions

**D) Cancel a Session:**
1. ✅ Click **"Cancelar"** button on a session
2. ✅ Confirmation dialog appears
3. ✅ Confirm cancellation
4. ✅ Session moves to "Cancelados" tab

#### Validations to Check:
- ✅ **Student selection:** Only students you created appear
- ✅ **Date validation:** Past dates might be rejected
- ✅ **Time logic:** End time must be after start time
- ✅ **Status filtering:** Each tab shows correct sessions

**What's Happening:**
- Sessions are linked to students
- Real-time updates show in the list
- Status changes trigger UI updates

---

### Flow 6: Settings & Workspace

**Page:** http://localhost:3000/dashboard/configuracoes

#### Steps:

**A) View Workspace Info:**
1. ✅ See **"Workspace"** section with workspace name
2. ✅ See **Subscription Status** (should show active plan)
3. ✅ See **"7 dias grátis"** remaining message

**B) Update Workspace Name:**
1. ✅ Click **edit icon** next to workspace name
2. ✅ Text becomes editable
3. ✅ Change to "Meu Studio Fitness"
4. ✅ Click **"Salvar"**
5. ✅ Name updates

**C) View Billing:**
1. ✅ See current plan details (Professional - R$ 99,00/mês)
2. ✅ See **"Gerenciar assinatura"** button
3. ✅ See **"Cancelar plano"** button

**D) Danger Zone:**
1. ✅ Look for **"Zona de Perigo"** section at bottom
2. ✅ **"Sair da conta"** button (Logout)
3. ✅ Click it → redirects to `/auth`

#### Validations to Check:
- ✅ Workspace name updates immediately
- ✅ Subscription shows correct plan and price
- ✅ Logout works and clears auth tokens

**What's Happening:**
- Workspace settings are stored and isolated per user
- Subscription status reflects the Asaas integration
- Logout clears JWT tokens

---

### Flow 7: Full User Journey (Complete MVP Flow)

**Time:** ~20 minutes

#### Step-by-Step:

1. **Open App** → http://localhost:3000
   - Redirects to `/auth` (not logged in)

2. **Sign Up**
   - Fill form → Create account → Redirects to `/onboard`

3. **Select Plan**
   - Choose Professional plan → Redirects to `/dashboard`

4. **Create Student** (Alunos page)
   - "Novo aluno" → Add "João Training"

5. **Create Another Student**
   - "Novo aluno" → Add "Maria Fitness"

6. **Create Sessions** (Agendamentos page)
   - Session 1: João Training, 2026-07-25, 09:00-10:00
   - Session 2: Maria Fitness, 2026-07-25, 10:00-11:00
   - Session 3: João Training, 2026-07-26, 14:00-15:00

7. **View Dashboard**
   - Check stats: 2 students, 3 sessions
   - Check chart: Should show 2 sessions on 25th, 1 on 26th
   - Check "Próximas sessões": Should list all 3

8. **Search & Edit**
   - Go to Alunos → Search "João" → Edit name → Save

9. **Test Settings**
   - Go to Configurações → Update workspace name → Logout

10. **Confirm Logout**
    - Should be back at `/auth` login page

---

## 🔍 Debugging Tips

### If Backend Won't Start:
```bash
# Check if port 3001 is in use
lsof -i :3001

# Kill the process
kill -9 <PID>

# Try again
npm run dev
```

### If Frontend Won't Start:
```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill process and try again
npm run dev
```

### If "Database Connection" error:
```bash
# Backend needs PostgreSQL running
# You have 3 options:

# Option 1: Use Docker (requires Docker installed)
docker-compose up -d postgres

# Option 2: Install PostgreSQL locally and start it

# Option 3: Comment out database calls temporarily for UI testing
# (Edit apps/server/src/index.ts)
```

### Common Errors & Fixes:

| Error | Solution |
|-------|----------|
| "Port 3000 already in use" | Kill process: `lsof -i :3000 \| kill -9 <PID>` |
| "Cannot find module 'axios'" | Run `npm install` in terminal |
| "ECONNREFUSED" on API calls | Ensure backend is running on port 3001 |
| "Unexpected token <" (HTML response) | CORS issue - check `apps/server/src/index.ts` |
| Redirects to login on refresh | Session token expired - login again |

---

## ✅ Testing Checklist

### Authentication
- [ ] Sign up with new email works
- [ ] Form validation rejects invalid emails
- [ ] Password validation works
- [ ] Form toggle (Login ↔ Signup) works
- [ ] Can login with created account

### Onboarding
- [ ] All 3 plans display correctly
- [ ] Prices are R$ 49, R$ 99, R$ 299
- [ ] "Mais popular" badge on Professional
- [ ] Plan selection redirects to dashboard

### Dashboard
- [ ] Header shows "Dashboard"
- [ ] 4 stat cards visible
- [ ] Chart renders (Sessões esta semana)
- [ ] "Próximas sessões" section visible
- [ ] All navigation links work

### Students (Alunos)
- [ ] Create student works
- [ ] Edit student works
- [ ] Delete student works
- [ ] Search filters students
- [ ] Email validation works
- [ ] Empty state shows when no students

### Sessions (Agendamentos)
- [ ] Create session works
- [ ] Student dropdown populated
- [ ] Cancel session works
- [ ] Status filter tabs work
- [ ] Empty state shows when no sessions

### Settings
- [ ] Workspace name editable
- [ ] Subscription status shows
- [ ] Logout button works
- [ ] Redirects to login on logout

### Responsive Design
- [ ] Desktop (1920×1080): All layouts look good
- [ ] Tablet (768×1024): Content stacks properly
- [ ] Mobile (375×667): Touch-friendly, readable

### Dark Mode
- [ ] Toggle dark mode in browser
- [ ] All text remains readable
- [ ] Contrast is WCAG AA compliant
- [ ] Colors shift appropriately

---

## 🎯 What Each API Endpoint Does

When you interact with the UI, here's what's happening behind the scenes:

| Action | Endpoint | Method |
|--------|----------|--------|
| Sign up | `POST /api/auth/signup` | Creates user + workspace |
| Login | `POST /api/auth/login` | Returns JWT tokens |
| Refresh token | `POST /api/auth/refresh` | Gets new access token |
| Get students | `GET /api/alunos` | Lists all students for workspace |
| Create student | `POST /api/alunos` | Adds new student |
| Update student | `PUT /api/alunos/:id` | Edits student details |
| Delete student | `DELETE /api/alunos/:id` | Removes student |
| Get sessions | `GET /api/agendamentos` | Lists all sessions |
| Create session | `POST /api/agendamentos` | Schedules new session |
| Cancel session | `PATCH /api/agendamentos/:id/cancel` | Cancels session |
| Get workspace | `GET /api/workspace` | Current workspace info |
| Update workspace | `PUT /api/workspace` | Updates workspace settings |

---

## 📊 What to Expect from the Test

### ✅ Working Features (MVP Complete)
- User authentication (signup, login)
- Workspace isolation (multi-tenant)
- Student CRUD (create, read, update, delete)
- Session scheduling (CRUD + cancel)
- Dashboard statistics
- Responsive design
- Dark mode support
- Form validation

### ⏳ Not Yet Implemented (Next Phase)
- Stripe/Asaas payment processing
- Email notifications
- Real-time notifications (Socket.io)
- PDF exports
- Advanced reporting
- Team management
- Custom branding

---

## 🎓 Next Steps After Testing

1. **Run Automated Tests** (Playwright)
   ```bash
   cd apps/web
   npm run test:e2e:ui
   ```

2. **Check Code Coverage**
   ```bash
   npm run test:coverage
   ```

3. **Deploy to Production**
   - Frontend: Vercel
   - Backend: Railway or Render
   - Database: Managed PostgreSQL

---

**Questions?** Check TESTING_GUIDE.md for Docker setup or PLAYWRIGHT_TESTS.md for automated testing.

**Happy testing!** 🚀
