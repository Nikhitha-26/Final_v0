from supabase import create_client, Client
import os
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Body
from utils.supabase_client import supabase

router = APIRouter()

@router.post("/register")
def register_user(email: str = Body(...), password: str = Body(...), role: str = Body(...)):
    try:
        result = supabase.auth.sign_up({
            "email": email,
            "password": password
        })
        # Add role info to custom table
        supabase.table("users").insert({
            "email": email,
            "role": role
        }).execute()

        return {"message": "User registered", "user": result.user.email}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login")
def login_user(email: str = Body(...), password: str = Body(...)):
    try:
        result = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        return {"access_token": result.session.access_token, "user": result.user.email}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

security = HTTPBearer()

def get_supabase_client() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_ANON_KEY")
    return create_client(url, key)

async def create_user(email: str, password: str, username: str, role: str):
    supabase = get_supabase_client()
    
    # Create user in Supabase Auth
    auth_response = supabase.auth.sign_up({
        "email": email,
        "password": password
    })
    
    if auth_response.user:
        # Insert user profile
        profile_data = {
            "id": auth_response.user.id,
            "username": username,
            "email": email,
            "role": role,
            "created_at": datetime.utcnow().isoformat()
        }
        
        supabase.table("profiles").insert(profile_data).execute()
        
        return {
            "id": auth_response.user.id,
            "email": email,
            "username": username,
            "role": role
        }
    else:
        raise Exception("Failed to create user")

async def authenticate_user(email: str, password: str):
    supabase = get_supabase_client()
    
    # Authenticate with Supabase
    auth_response = supabase.auth.sign_in_with_password({
        "email": email,
        "password": password
    })
    
    if auth_response.user:
        # Get user profile
        profile = supabase.table("profiles").select("*").eq("id", auth_response.user.id).execute()
        
        if profile.data:
            user_data = profile.data[0]
            return {
                "id": user_data["id"],
                "email": user_data["email"],
                "username": user_data["username"],
                "role": user_data["role"],
                "access_token": auth_response.session.access_token
            }
    
    raise Exception("Invalid credentials")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        supabase = get_supabase_client()
        
        # Verify token with Supabase
        user_response = supabase.auth.get_user(credentials.credentials)
        
        if user_response.user:
            # Get user profile
            profile = supabase.table("profiles").select("*").eq("id", user_response.user.id).execute()
            
            if profile.data:
                return profile.data[0]
        
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")
