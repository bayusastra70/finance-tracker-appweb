from contextlib import asynccontextmanager # Tambahkan ini
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import auth, accounts, categories, transactions, analytics, ai_chat
from app.database import engine, Base

# Import SEMUA model di sini agar terdeteksi oleh create_all
from app.models import user, account, transaction 

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Logika Create Table saat Startup
    # Jika koneksi kamu ASYNC (+asyncpg), gunakan ini:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Database Tables Created!")
    yield

# Inisialisasi FastAPI dengan lifespan
app = FastAPI(
    title=settings.APP_NAME,
    description="Personal Finance Tracker API with AI capabilities",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan # Pasang lifespan di sini
)

# --- Sisanya (CORS & Routers) tetap sama ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(accounts.router, prefix=settings.API_V1_PREFIX)
app.include_router(categories.router, prefix=settings.API_V1_PREFIX)
app.include_router(transactions.router, prefix=settings.API_V1_PREFIX)
app.include_router(analytics.router, prefix=settings.API_V1_PREFIX)
app.include_router(ai_chat.router, prefix=settings.API_V1_PREFIX)

@app.get("/")
async def root():
    return {"message": "Welcome to Finance Tracker API", "docs": "/docs"}