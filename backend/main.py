import uvicorn
# Load environment variables from .env at startup
from dotenv import load_dotenv
load_dotenv()
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
class WebsiteQuery(BaseModel):
    query: str
# AI endpoints
from search import search_projects
from utils.file_handler import upload_file, download_file, get_user_files
from utils.db import get_supabase_client

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
    username: str
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
        result = await create_user(user.email, user.password, user.username, user.role)
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
    student_name: str = Form(...),
    student_id: str = Form(...),
    project_title: str = Form(...),
    abstract: str = Form(...),
    current_user = Depends(get_current_user)
):
    try:
        # Check if user is teacher
        if current_user.get('role') != 'teacher':
            raise HTTPException(status_code=403, detail="Only teachers can upload files")

        supabase = get_supabase_client()
        import os, uuid
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_content = await file.read()
        storage_response = supabase.storage.from_("project-files").upload(
            unique_filename,
            file_content,
            file_options={"content-type": file.content_type}
        )
        if storage_response.data:
            project_data = {
                "student_name": student_name,
                "student_id": student_id,
                "project_title": project_title,
                "abstract": abstract,
                "file_path": unique_filename,
                "file_size": len(file_content),
                "mime_type": file.content_type,
                "uploaded_by": current_user['id'],
                "filename": file.filename
            }
            db_response = supabase.table("project_data").insert(project_data).execute()
            if db_response.data:
                return {"message": "File uploaded successfully", "file": db_response.data[0]}
        raise Exception("Failed to upload file")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/files/submissions")
async def get_submissions(current_user = Depends(get_current_user)):
    try:
        # Check if user is examiner
        if current_user.get('role') != 'examiner':
            raise HTTPException(status_code=403, detail="Only examiners can view submissions")
        
        files = await get_user_files()
        return {"files": files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/files/download/{file_id}")
async def download_project_file(file_id: str, current_user = Depends(get_current_user)):
    try:
        # Check if user is examiner
        if current_user.get('role') != 'examiner':
            raise HTTPException(status_code=403, detail="Only examiners can download files")
        
        file_data = await download_file(file_id)
        return file_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
