from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
import os
import jwt
from datetime import datetime, timedelta

router = APIRouter()

class LoginRequest(BaseModel):
    password: str

class LoginResponse(BaseModel):
    token: str

ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "change-me")
ADMIN_JWT_SECRET = os.getenv("ADMIN_JWT_SECRET", "dev-secret-key")
JWT_ALGO = "HS256"
JWT_TTL_HOURS = int(os.getenv("ADMIN_JWT_TTL_HOURS", "2"))

@router.post("/admin/login", response_model=LoginResponse)
def admin_login(payload: LoginRequest):
    if payload.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid password")
    expire = datetime.utcnow() + timedelta(hours=JWT_TTL_HOURS)
    token = jwt.encode({"sub": "admin", "exp": expire}, ADMIN_JWT_SECRET, algorithm=JWT_ALGO)
    return {"token": token}