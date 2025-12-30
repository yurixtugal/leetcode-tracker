# LeetCode Progress Tracker - Project Overview

## 📋 Información del Proyecto

**Nombre del repositorio:** `leetcode-tracker`  
**Objetivo:** Sistema para trackear progreso en LeetCode mientras practicas para entrevistas técnicas  
**Timeline:** 1-2 semanas  
**Target:** Portfolio project para conseguir trabajo remoto $40k-60k USD/año

---

## 🎯 ¿Qué vamos a construir?

Una aplicación web serverless donde puedes:

1. **Subir problemas de LeetCode** que resolviste (con código, notas, complejidad temporal/espacial)
2. **Ver tu progreso** en un dashboard (cuántos Easy/Medium/Hard has completado)
3. **Filtrar y buscar** tus soluciones pasadas por dificultad, categoría, fecha
4. **Trackear tu evolución** en el tiempo con visualizaciones

---

## 🏗️ Arquitectura Técnica
```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
│  Dashboard, formularios, visualizaciones, auth UI        │
│                                                          │
│  Deploy: S3 + CloudFront                                │
└────────────────┬─────────────────────────────────────────┘
                 │
                 │ HTTPS
                 │
┌────────────────▼─────────────────────────────────────────┐
│              API GATEWAY + COGNITO AUTH                  │
│  REST API: /problems (GET, POST, PUT, DELETE)           │
└────────────────┬─────────────────────────────────────────┘
                 │
                 │ Invoca
                 │
┌────────────────▼─────────────────────────────────────────┐
│                 5 LAMBDA FUNCTIONS                       │
│                                                          │
│  • createProblem.ts  - POST /problems                   │
│  • listProblems.ts   - GET /problems                    │
│  • getProblem.ts     - GET /problems/{id}               │
│  • updateProblem.ts  - PUT /problems/{id}               │
│  • deleteProblem.ts  - DELETE /problems/{id}            │
└────────────────┬─────────────────────────────────────────┘
                 │
                 │ Read/Write
                 │
┌────────────────▼─────────────────────────────────────────┐
│                    DYNAMODB                              │
│                                                          │
│  Table: leetcode-problems                               │
│  PK: userId                                             │
│  SK: problemId                                          │
│  GSI: DifficultyIndex, CategoryIndex, DateIndex         │
└──────────────────────────────────────────────────────────┘
```

---

## 📦 Stack Tecnológico

### Frontend
- **Framework:** React + TypeScript + Vite
- **Auth:** AWS Amplify libraries (integración con Cognito)
- **Charts:** Recharts (gráficos de progreso)
- **Styling:** Tailwind CSS
- **Deploy:** S3 + CloudFront

### Backend
- **Compute:** AWS Lambda (Node.js/TypeScript)
- **API:** API Gateway (REST API)
- **Database:** DynamoDB (NoSQL)
- **Auth:** AWS Cognito (User Pools)
- **Handlers:** Lambda functions nativas (NO Express)

### Infrastructure
- **IaC:** AWS CDK (TypeScript)
- **Stacks:**
  - `AuthStack` - Cognito User Pool + Client
  - `DatabaseStack` - DynamoDB table + GSIs
  - `BackendStack` - Lambda functions + API Gateway + Authorizers
  - `FrontendStack` - S3 bucket + CloudFront distribution

### DevOps
- **Monorepo:** Turborepo + pnpm
- **CI/CD:** GitHub Actions
- **Dev Deploy:** CDK hotswap (deploys rápidos)
- **Prod Deploy:** Full CDK deploy

---

## 📁 Estructura del Monorepo
```
leetcode-tracker/
├── apps/                       # Aplicaciones deployables
│   ├── web/                    # Frontend React (Vite + TypeScript)
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── ProblemList.tsx
│   │   │   │   ├── AddProblem.tsx
│   │   │   │   └── Login.tsx
│   │   │   ├── components/
│   │   │   │   ├── ProblemCard.tsx
│   │   │   │   ├── StatsChart.tsx
│   │   │   │   └── Navbar.tsx
│   │   │   ├── services/
│   │   │   │   └── api.ts      # API client
│   │   │   ├── hooks/
│   │   │   ├── types/
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── public/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   │
│   └── backend/                # AWS Lambda functions
│       ├── src/
│       │   ├── handlers/
│       │   │   ├── createProblem.ts
│       │   │   ├── listProblems.ts
│       │   │   ├── getProblem.ts
│       │   │   ├── updateProblem.ts
│       │   │   └── deleteProblem.ts
│       │   ├── utils/
│       │   │   ├── response.ts      # Response helpers
│       │   │   ├── validators.ts    # Input validation
│       │   │   ├── logger.ts        # Structured logging
│       │   │   └── auth.ts          # Extract userId from event
│       │   └── types/
│       ├── package.json
│       └── tsconfig.json
│
├── infra/                      # AWS CDK (Infrastructure as Code)
│   ├── bin/
│   │   └── app.ts              # CDK app entry point
│   ├── lib/
│   │   ├── auth-stack.ts       # Cognito configuration
│   │   ├── database-stack.ts   # DynamoDB + GSIs
│   │   ├── backend-stack.ts    # Lambda + API Gateway
│   │   └── frontend-stack.ts   # S3 + CloudFront
│   ├── cdk.json
│   ├── package.json
│   └── tsconfig.json
│
├── packages/                   # Código compartido
│   └── shared-types/           # Types compartidos entre web/backend
│       ├── src/
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── .github/
│   └── workflows/
│       ├── deploy-dev.yml      # Auto-deploy a dev en push a main
│       └── deploy-prod.yml     # Deploy a prod (manual trigger)
│
├── turbo.json                  # Turborepo pipeline config
├── pnpm-workspace.yaml         # pnpm workspaces
├── package.json                # Root package.json
├── .gitignore
└── README.md
```

---

## 🎨 Features del MVP (1-2 semanas)

### 1. Autenticación
- Sign up con email + password (Cognito)
- Login con sesiones persistentes
- Logout

### 2. CRUD de Problemas
- **Crear:** Formulario para agregar problema nuevo
  - Título (ej: "Two Sum")
  - Dificultad (Easy/Medium/Hard)
  - Categoría (Array, String, DP, Graph, etc.)
  - Código (tu solución)
  - Notas opcionales
  - URL de LeetCode
  - Complejidad temporal y espacial
- **Listar:** Ver todos tus problemas resueltos
- **Ver detalle:** Ver problema específico con todo el contexto
- **Editar:** Actualizar información de un problema
- **Borrar:** Eliminar problema

### 3. Dashboard
- Total de problemas resueltos
- Breakdown por dificultad (gráfico de pie: Easy/Medium/Hard)
- Breakdown por categoría (gráfico de barras)
- Timeline de progreso (gráfico de línea: problemas por fecha)
- Stats rápidos (ej: "15 Easy, 8 Medium, 2 Hard")

### 4. Filtros y Búsqueda
- Filtrar por dificultad
- Filtrar por categoría
- Ordenar por fecha (más reciente primero)
- Búsqueda por título

---

## 🔧 Decisiones Técnicas Clave

### Por qué Lambda handlers nativos (NO Express)
- ✅ Cold start más rápido (~200-400ms vs ~800ms-1.5s)
- ✅ Bundles más pequeños (~500KB vs ~5-10MB)
- ✅ Escalamiento independiente por endpoint
- ✅ Best practice de AWS serverless
- ✅ Amplify Gen 2 migró a este approach
- ✅ Mejor para demostrar conocimiento profundo de AWS

**Alternativas consideradas:** Express con aws-serverless-express (descartado por overhead)

### Por qué DynamoDB (NO RDS)
- ✅ Serverless nativo (pay-per-request)
- ✅ Auto-scaling sin configuración
- ✅ Free tier generoso
- ✅ Query patterns simples (lookup por userId)
- ✅ GSIs para filtros eficientes

**Data model:**
```javascript
{
  userId: "user-123",           // PK
  problemId: "prob-uuid",       // SK
  title: "Two Sum",
  difficulty: "Easy",           // Para GSI
  category: "Array",            // Para GSI
  createdAt: "2024-01-15T...",  // Para GSI
  code: "function twoSum...",
  notes: "Usar hashmap...",
  tags: ["hashmap", "array"],
  timeComplexity: "O(n)",
  spaceComplexity: "O(n)",
  leetcodeUrl: "https://..."
}
```

### Por qué Turborepo + pnpm
- ✅ Velocidad: pnpm 2-3x más rápido que npm
- ✅ Disk space: ~400MB vs ~1.5GB
- ✅ Build caching inteligente
- ✅ Parallel execution
- ✅ Strict workspace isolation (previene phantom dependencies)
- ✅ Recomendación oficial de Vercel/Turborepo

### Por qué CDK (NO CloudFormation directo)
- ✅ TypeScript nativo (type safety)
- ✅ L2/L3 constructs (abstracciones de alto nivel)
- ✅ Reutilización de código
- ✅ Mejor developer experience
- ✅ Hotswap para dev (deploys en ~10-20 seg)

---

## 📊 DynamoDB Schema Design

### Main Table: `leetcode-problems`

**Primary Key:**
- Partition Key (PK): `userId` (STRING)
- Sort Key (SK): `problemId` (STRING)

**Attributes:**
- `title` - STRING
- `difficulty` - STRING (Easy|Medium|Hard)
- `category` - STRING (Array, String, DP, etc.)
- `code` - STRING
- `notes` - STRING (optional)
- `tags` - LIST (optional)
- `leetcodeUrl` - STRING (optional)
- `timeComplexity` - STRING (optional)
- `spaceComplexity` - STRING (optional)
- `createdAt` - STRING (ISO timestamp)
- `updatedAt` - STRING (ISO timestamp)

**Global Secondary Indexes (GSIs):**

1. **DifficultyIndex**
   - PK: `userId`
   - SK: `difficulty`
   - Use case: "Get all Medium problems for this user"

2. **CategoryIndex**
   - PK: `userId`
   - SK: `category`
   - Use case: "Get all Array problems for this user"

3. **DateIndex**
   - PK: `userId`
   - SK: `createdAt`
   - Use case: "Get problems sorted by date"

---

## 🔐 API Endpoints

All endpoints require Cognito authentication via `Authorization` header.

### `POST /problems`
Create new problem
```json
{
  "title": "Two Sum",
  "difficulty": "Easy",
  "category": "Array",
  "code": "function twoSum(nums, target) {...}",
  "notes": "Use hashmap for O(n)",
  "tags": ["hashmap", "array"],
  "leetcodeUrl": "https://leetcode.com/problems/two-sum/",
  "timeComplexity": "O(n)",
  "spaceComplexity": "O(n)"
}
```

### `GET /problems`
List all problems (with optional filters)
- Query params: `?difficulty=Easy&category=Array`

### `GET /problems/{problemId}`
Get specific problem

### `PUT /problems/{problemId}`
Update problem

### `DELETE /problems/{problemId}`
Delete problem

---

## 🚀 Development Workflow

### Initial Setup
```bash
# Clone repo
git clone <repo-url>
cd leetcode-tracker

# Install all dependencies
pnpm install

# Build all workspaces
pnpm build
```

### Daily Development
```bash
# Terminal 1 - Frontend dev server
pnpm --filter @leetcode-tracker/web dev

# Terminal 2 - Backend watch mode
pnpm --filter @leetcode-tracker/backend dev

# Terminal 3 - Shared types watch mode
pnpm --filter @leetcode-tracker/shared-types dev
```

### Deploy to AWS
```bash
# Dev environment (fast)
pnpm deploy:dev

# Production environment
pnpm deploy
```

### Useful Commands
```bash
# Build everything
pnpm build

# Type check all
pnpm type-check

# Lint all
pnpm lint

# Clean build artifacts
pnpm clean

# Install dep in specific workspace
pnpm --filter @leetcode-tracker/backend add <package>

# See dependency graph
turbo run build --graph
```

---

## 📅 Timeline (1-2 semanas)

### Semana 1

**Días 1-2: Backend Foundation**
- ✅ Setup Turborepo + pnpm (DONE)
- ✅ Shared types (DONE)
- ⏳ Backend utils (response, validators, logger, auth)
- ⏳ CDK stacks (Auth, Database, Backend)
- ⏳ Lambda handlers (5 functions)
- ⏳ Deploy y test con Postman/curl

**Días 3-4: Frontend Core**
- ⏳ Auth pages (Login/Signup)
- ⏳ API client service
- ⏳ CRUD forms (Create/Edit problem)
- ⏳ Problem list view

**Días 5-7: Dashboard & Polish**
- ⏳ Dashboard con stats
- ⏳ Charts (Recharts)
- ⏳ Filtros y búsqueda
- ⏳ Frontend deploy (S3 + CloudFront)

### Semana 2 (Buffer/Polish)

**Días 8-10: CI/CD & Documentation**
- ⏳ GitHub Actions workflows
- ⏳ README profesional
- ⏳ Architecture diagram
- ⏳ Screenshots

**Días 11-14: Testing & Fixes**
- ⏳ Manual testing completo
- ⏳ Bug fixes
- ⏳ Performance optimization
- ⏳ Security review

---

## 🎯 Objetivos de Aprendizaje

### AWS Services (Hands-on)
- ✅ Lambda: Handlers nativos, bundle optimization, cold starts
- ✅ DynamoDB: Data modeling, GSIs, query patterns
- ✅ API Gateway: REST API, Cognito authorizers, CORS
- ✅ Cognito: User Pools, authentication flow, JWT
- ✅ S3 + CloudFront: Static hosting, CDN, HTTPS
- ✅ IAM: Least privilege, Lambda execution roles
- ✅ CloudWatch: Logs, debugging

### Infrastructure as Code
- ✅ CDK L2/L3 constructs
- ✅ Stack organization y dependencies
- ✅ Environment management (dev/prod)
- ✅ CDK hotswap para desarrollo

### Software Engineering
- ✅ TypeScript avanzado
- ✅ Monorepo con Turborepo + pnpm
- ✅ Shared types entre frontend/backend
- ✅ Error handling patterns
- ✅ API design (REST best practices)

### DevOps
- ✅ CI/CD con GitHub Actions
- ✅ Automated deployments
- ✅ Environment separation
- ✅ Infrastructure versioning

---

## 💼 Valor para Job Search ($40k-60k USD)

### Portfolio Piece
- ✅ Proyecto completo end-to-end
- ✅ Arquitectura production-ready
- ✅ Código limpio y documentado
- ✅ Live demo disponible
- ✅ GitHub repo profesional

### Talking Points para Entrevistas
- "Diseñé arquitectura serverless con 5 Lambdas detrás de API Gateway"
- "Optimicé bundles a ~1MB usando esbuild para reducir cold starts"
- "Implementé GSIs en DynamoDB para queries eficientes"
- "Configuré CI/CD con GitHub Actions y CDK hotswap"
- "Usé Turborepo + pnpm para monorepo con build caching"

### Skills Demostrados
- ✅ AWS serverless architecture
- ✅ Infrastructure as Code (CDK)
- ✅ Full-stack development (React + Lambda)
- ✅ NoSQL data modeling
- ✅ CI/CD automation
- ✅ Modern tooling (Turborepo, pnpm, TypeScript)

---

## 🔄 Estado Actual del Proyecto

### ✅ Completado
- Setup de Turborepo + pnpm
- Estructura de workspaces
- Shared types definidos
- Package.json de cada workspace configurado

### ⏳ En Progreso
- Backend utils (siguiente paso)

### 📋 Por Hacer
- CDK stacks (Auth, Database, Backend, Frontend)
- Lambda handlers (5 functions)
- Frontend React app
- GitHub Actions workflows
- README con arquitectura
- Deploy a AWS

---

## 📚 Recursos y Decisiones Técnicas

### Por qué NO usar Express en Lambda
- Overhead innecesario (bundle ~5-10MB vs ~500KB)
- Cold starts más lentos (~800ms-1.5s vs ~200-400ms)
- API Gateway ya maneja routing, CORS, auth
- Amplify Gen 2 migró de Express a handlers nativos
- Best practice actual de AWS

### Middleware Functionality Replacement
| Express Middleware | Serverless Alternative |
|-------------------|----------------------|
| Authentication | Cognito Authorizer en API Gateway |
| CORS | API Gateway CORS config |
| Request Validation | API Gateway validators + shared utils |
| Error Handling | Shared utils (handleError, buildResponse) |
| Logging | CloudWatch Logs + structured logger |
| Rate Limiting | API Gateway throttling & usage plans |

### Comparación: Certificado AWS vs Este Proyecto

| Aspecto | Certificado AWS SAA | Este Proyecto |
|---------|-------------------|--------------|
| **Aprendizaje** | Teoría y conceptos | Hands-on real |
| **Costo** | ~$150 | $0-5 (AWS free tier) |
| **Tiempo** | 2-4 semanas | 1-2 semanas |
| **Valor en CV** | Nice to have | Portfolio piece |
| **En entrevistas** | "Tengo certificado" | "Construí esto..." |
| **Skills probados** | Multiple choice | Código real + arquitectura |

**Conclusión:** El proyecto vale 10x más que el certificado para demostrar skills reales.

---

## 🎓 Lecciones Aprendidas (Expected)

### AWS Serverless
- Lambda cold starts y cómo optimizarlos
- DynamoDB query patterns y cuándo usar GSIs
- Cognito authentication flow
- IAM permissions debugging
- CloudWatch logs y troubleshooting

### Monorepo
- Turborepo task pipelines
- pnpm workspace dependencies
- Shared types entre frontend/backend
- Build caching strategies

### Infrastructure as Code
- CDK stack organization
- Cross-stack references
- Environment management
- CDK hotswap vs full deploy

---

## 📞 Next Steps

1. **Crear backend utils** (response.ts, validators.ts, logger.ts, auth.ts)
2. **Crear CDK stacks** (empezar con DatabaseStack)
3. **Crear primer Lambda handler** (createProblem.ts)
4. **Deploy y test**
5. **Continuar con otros handlers**
6. **Frontend básico**
7. **Dashboard y visualizaciones**
8. **CI/CD**
9. **Documentation**
10. **Deploy final**

---

**Este documento sirve como fuente de verdad para el proyecto LeetCode Progress Tracker (leetcode-tracker).**