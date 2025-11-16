from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.database import engine
from src.models.base import Base

# include routers
from src.routes import admin, users, categories, inventory, checked_out

app = FastAPI(title="Inventory Management API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# register routers
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(categories.router, prefix="/categories", tags=["categories"])
app.include_router(inventory.router, prefix="/items", tags=["items"])
app.include_router(checked_out.router, prefix="/checked-out", tags=["checked_out"])
app.include_router(admin.router)  # /admin/login

# create DB tables
Base.metadata.create_all(bind=engine)

# basic health + root endpoints (keep existing handlers if present)
@app.get("/")
def read_root():
    return {"msg": "Inventory Management API"}

@app.get("/health")
def health():
    return {"status": "ok"}