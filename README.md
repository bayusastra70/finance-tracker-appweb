# 💰 Finance Tracker

Personal finance management application with AI-powered insights.

## ✨ Features

- **Multi-Account Management** - Track cash, bank, e-wallet, credit cards
- **Transaction Tracking** - Income & expense with categorization
- **Dashboard Analytics** - Charts for trends and category breakdown
- **AI Assistant** - Chat with your financial data using Agno AI
- **Auto-Categorization** - AI suggests categories for transactions

## 🛠️ Tech Stack

| Layer    | Technology                                     |
| -------- | ---------------------------------------------- |
| Backend  | FastAPI, PostgreSQL, SQLAlchemy, Alembic       |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |
| AI       | Agno Framework, Nvidia NIM / OpenAI            |

---

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd finance-tracker-app
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
# Edit .env with your database credentials and API keys

# Run database migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload
```

API will be available at: http://localhost:8000
API Docs: http://localhost:8000/docs

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

App will be available at: http://localhost:3000

---

## ⚙️ Environment Variables

Create `backend/.env` file:

```bash
# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/finance_tracker

# JWT
SECRET_KEY=your-secret-key-min-32-chars

# AI (Nvidia NIM)
MODEL_ID=meta/llama-3.3-70b-instruct
NVIDIA_API_KEY=your-nvidia-api-key
```

---

## 📁 Project Structure

```
finance-tracker-app/
├── backend/
│   ├── app/
│   │   ├── ai/           # Agno AI agent
│   │   ├── models/       # SQLAlchemy models
│   │   ├── routers/      # API endpoints
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── auth.py       # JWT authentication
│   │   ├── config.py     # Settings
│   │   ├── database.py   # Database connection
│   │   └── main.py       # FastAPI app
│   ├── migrations/       # Alembic migrations
│   └── requirements.txt
│
└── frontend/
    ├── app/
    │   ├── (auth)/       # Login, Register pages
    │   ├── dashboard/    # Dashboard pages
    │   └── page.tsx      # Landing page
    ├── components/       # Reusable UI components
    ├── lib/              # API client, Auth context
    └── types/            # TypeScript types
```

---

## 📝 API Endpoints

| Method | Endpoint                | Description             |
| ------ | ----------------------- | ----------------------- |
| POST   | `/api/v1/auth/register` | User registration       |
| POST   | `/api/v1/auth/login`    | Login                   |
| GET    | `/api/v1/auth/me`       | Current user            |
| CRUD   | `/api/v1/accounts`      | Accounts management     |
| CRUD   | `/api/v1/categories`    | Categories management   |
| CRUD   | `/api/v1/transactions`  | Transactions management |
| GET    | `/api/v1/analytics/*`   | Financial analytics     |
| POST   | `/api/v1/ai/chat`       | AI assistant            |

---

## 🤖 AI Features

The AI assistant can:

- Show financial summary
- Analyze spending by category
- Display recent transactions
- Suggest categories for new transactions
- Search web (DuckDuckGo)
- Get stock prices (YFinance)

---

## 📄 License

MIT
