import uvicorn
# Load environment variables from .env at startup
from dotenv import load_dotenv

import sys
import tempfile
from collections import OrderedDict
from contextlib import contextmanager
from typing import IO, Dict, Iterable, Iterator, Mapping, Optional, Tuple, Union


# FastAPI and related imports
from fastapi import FastAPI, HTTPException, Depends, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

from auth import get_current_user, create_user, authenticate_user
from auth import router as auth_router
from ai_ollama import get_project_suggestions, improve_idea, chat_with_ollama, get_relevant_websites

# AI endpoints
from search import search_projects
from utils.db import get_supabase_client

class WebsiteQuery(BaseModel):
    query: str

load_dotenv()

app = FastAPI(title="Project Marketplace API", version="1.0.0")

# CORS middleware for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)

security = HTTPBearer()

# Pydantic models
class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str  # student, teacher, examiner

class UserLogin(BaseModel):
    email: str
    password: str

class SearchQuery(BaseModel):
    query: str

class IdeaImprovement(BaseModel):
    idea: str

class ChatMessage(BaseModel):
    message: str

# Auth endpoints
@app.post("/api/auth/register")
async def register(user: UserCreate):
    try:
        result = await create_user(user.email, user.password, user.name, user.role)
        return {"message": "User created successfully", "user": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/auth/login")
async def login(user: UserLogin):
    try:
        result = await authenticate_user(user.email, user.password)
        return {"message": "Login successful", "user": result}
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@app.post("/api/auth/logout")
async def logout(credentials: HTTPAuthorizationCredentials = Depends(security)):
    return {"message": "Logged out successfully"}

# Search endpoints
@app.post("/api/search/projects")
async def search_project_ideas(query: SearchQuery, current_user = Depends(get_current_user)):
    try:
        results = await search_projects(query.query)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# AI endpoints
@app.post("/api/ai/suggestions")
async def get_suggestions(query: SearchQuery, current_user = Depends(get_current_user)):
    try:
        suggestions = await get_project_suggestions(query.query)
        return {"suggestions": suggestions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/improve")
async def improve_project_idea(idea: IdeaImprovement, current_user = Depends(get_current_user)):
    try:
        improvement = await improve_idea(idea.idea)
        return {"improvement": improvement}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/chat")
async def chat(message: ChatMessage, current_user = Depends(get_current_user)):
    try:
        response = await chat_with_ollama(message.message)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Relevant Websites endpoint
@app.post("/api/ai/websites")
async def relevant_websites(query: WebsiteQuery, current_user = Depends(get_current_user)):
    try:
        websites = await get_relevant_websites(query.query)
        return websites
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# File endpoints
@app.post("/api/files/upload")
async def upload_project_file(
    file: UploadFile = File(...),
    title: str = Form(...),
    description: str = Form(...),
    student_name: str = Form(...),
    student_id: str = Form(...),
    abstract: str = Form(...),
    current_user = Depends(get_current_user)
):
    try:
        # Check if user is teacher
        if current_user.get('role') != 'teacher':
            raise HTTPException(status_code=403, detail="Only teachers can upload files")

        # Upload file to Supabase Storage
        import os
        from supabase import create_client
        import os
        # Use service role key to bypass RLS
        supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))
        import uuid
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_content = await file.read()
        bucket_name = os.getenv("SUPABASE_BUCKET_NAME", "project-files")
        file_size = len(file_content) if file_content else 0
        storage_response = supabase.storage.from_(bucket_name).upload(
            unique_filename,
            file_content,
            file_options={"content-type": file.content_type}
        )
        # Supabase Python client returns UploadResponse with path/full_path on success
        upload_success = False
        upload_path = getattr(storage_response, 'path', None)
        upload_full_path = getattr(storage_response, 'full_path', None)
        if upload_path or upload_full_path:
            upload_success = True
        if not upload_success:
            # Debug info for troubleshooting
            debug_info = {
                "bucket": bucket_name,
                "filename": unique_filename,
                "file_size": file_size,
                "content_type": file.content_type,
                "supabase_response": str(storage_response)
            }
            error_message = getattr(storage_response, 'error', None)
            if error_message:
                debug_info["supabase_error"] = error_message
                raise HTTPException(status_code=500, detail=f"File upload failed: {error_message}. Debug: {debug_info}")
            raise HTTPException(status_code=500, detail=f"File upload failed (no error message from Supabase). Debug: {debug_info}")

        # Insert metadata into project_data table
        project_row = {
            "student_name": student_name,
            "student_id": student_id,
            "project_title": title,
            "abstract": abstract,
            "file_url": unique_filename,
            "uploaded_by": current_user['id']
        }
        db_response = supabase.table("project_data").insert(project_row).execute()
        db_result = getattr(db_response, 'data', None)
        if db_result and isinstance(db_result, list) and len(db_result) > 0:
            return {
                "message": "File uploaded successfully",
                "project": db_result[0],
                "storage": {
                    "path": upload_path,
                    "full_path": upload_full_path
                }
            }
        else:
            raise HTTPException(status_code=500, detail="Database insert failed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/files/submissions")
async def get_submissions(current_user = Depends(get_current_user)):
    try:
        # Check if user is examiner
        if current_user.get('role') != 'examiner':
            raise HTTPException(status_code=403, detail="Only examiners can view submissions")

        # Fetch all project submissions from project_data
        from supabase import create_client
        import os
        supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))
        response = supabase.table("project_data").select("*").execute()
        data = getattr(response, 'data', None)
        if data and isinstance(data, list):
            return {"files": data}
        else:
            return {"files": []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/files/download/{file_key}")
async def download_project_file(file_key: str, current_user = Depends(get_current_user)):
    import os
    from supabase import create_client
    from fastapi.responses import StreamingResponse
    import io

    if current_user.get("role") != "examiner":
        raise HTTPException(status_code=403, detail="Only examiners can download files")

    supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))
    bucket_name = os.getenv("SUPABASE_BUCKET_NAME", "project-files")

    # Try to find the file in the database by file_url
    response = supabase.table("project_data").select("*").eq("file_url", file_key).execute()
    data = response.data

    if not data or not isinstance(data, list) or len(data) == 0:
        raise HTTPException(status_code=404, detail="File not found in database")

    file_name = data[0]["file_url"]

    # Download file content from Supabase Storage
    file_response = supabase.storage.from_(bucket_name).download(file_name)

    if hasattr(file_response, 'error') and file_response.error:
        raise HTTPException(status_code=500, detail=f"Failed to download file from bucket: {file_response.error}")

    # Return as a StreamingResponse
    return StreamingResponse(io.BytesIO(file_response), media_type="application/octet-stream", headers={
        "Content-Disposition": f"attachment; filename={file_name}"
    })
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
