from fastapi import HTTPException, Depends, Body, APIRouter, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.status import HTTP_401_UNAUTHORIZED
from fastapi.security.utils import get_authorization_scheme_param
from datetime import datetime
from utils.supabase_client import get_supabase_client
import logging

from pydantic import BaseModel
import asyncio
import time

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str


router = APIRouter()

@router.post("/register")
async def register_user(data: RegisterRequest):
    try:
        user = await create_user(
            email=data.email,
            password=data.password,
            name=data.name,
            role=data.role,
        )
        return {"message": "User registered", "user": user}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
def login_user(email: str = Body(...), password: str = Body(...)):
    try:
        supabase = get_supabase_client()
        result = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        return {"access_token": result.session.access_token, "user": result.user.email}
    except Exception as e:
        print("LOGIN ERROR:", str(e))  # Now this will show up in terminal logs
        raise HTTPException(status_code=401, detail="Invalid email or password")


security = HTTPBearer()






async def create_user(email: str, password: str, name: str, role: str):
    supabase = get_supabase_client()

    # Step 1: Create user in Supabase Auth
    auth_response = supabase.auth.sign_up({
        "email": email,
        "password": password
    })

    if not auth_response.user:
        raise Exception("Failed to create user in Supabase Auth")

    user_id = auth_response.user.id

    # Step 2: Retry insert into profiles with up to 5 attempts
    profile_data = {
        "id": user_id,
        "name": name,
        "email": email,
        "role": role,
        "created_at": datetime.utcnow().isoformat()
    }

    max_retries = 5
    for i in range(max_retries):
        try:
            supabase.table("profiles").insert(profile_data).execute()
            return {
                "id": user_id,
                "email": email,
                "name": name,
                "role": role
            }
        except Exception as e:
            print(f"Retry {i+1}/5: Supabase user not synced yet. Waiting...")
            await asyncio.sleep(2)

    raise Exception("Failed to insert user profile after multiple retries")


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
                "name": user_data["name"],
                "role": user_data["role"],
                "access_token": auth_response.session.access_token
            }
    
    raise Exception("Invalid credentials")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = None
        # Try to get token from Depends(security) (works for JSON requests)
        if credentials and hasattr(credentials, 'credentials') and credentials.credentials:
            token = credentials.credentials
        else:
            # Fallback: extract from request headers (for multipart/form-data)
            import inspect
            frame = inspect.currentframe()
            request = None
            while frame:
                if 'request' in frame.f_locals:
                    request = frame.f_locals['request']
                    break
                frame = frame.f_back
            # If not found, raise a clear error
            if not request:
                logging.error("Request object not found in call stack for get_current_user.")
                raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Request object not found for authentication.")
            auth_header = request.headers.get('authorization')
            scheme, param = get_authorization_scheme_param(auth_header)
            if scheme and scheme.lower() == 'bearer' and param:
                token = param
        if not token:
            logging.warning("No Authorization token found in request headers.")
            raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Not authenticated: Bearer token missing.")
        supabase = get_supabase_client()
        user_response = supabase.auth.get_user(token)
        if user_response.user:
            # Get user profile
            profile = supabase.table("profiles").select("*").eq("id", user_response.user.id).execute()
            if profile.data:
                return profile.data[0]
            else:
                logging.error(f"User profile not found for id: {user_response.user.id}")
        else:
            logging.error("Supabase could not validate user from token.")
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Invalid or expired token.")
    except HTTPException:
        raise
    except Exception as e:
        logging.exception(f"Error in get_current_user: {e}")
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail=f"Authentication failed: {str(e)}")
