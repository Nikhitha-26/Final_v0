from fastapi import UploadFile
from supabase import create_client
import os
import uuid
from typing import List, Dict
import mimetypes

def get_supabase_client():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_ANON_KEY")
    return create_client(url, key)

async def upload_file(file: UploadFile, title: str, description: str, user_id: str) -> Dict:
    """Upload file to Supabase storage and save metadata"""
    supabase = get_supabase_client()
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    
    # Read file content
    file_content = await file.read()
    
    # Upload to Supabase storage
    storage_response = supabase.storage.from_("project-files").upload(
        unique_filename, 
        file_content,
        file_options={"content-type": file.content_type}
    )
    
    if storage_response.data:
        # Save file metadata to database
        file_metadata = {
            "filename": file.filename,
            "title": title,
            "description": description,
            "file_path": unique_filename,
            "file_size": len(file_content),
            "mime_type": file.content_type,
            "uploaded_by": user_id
        }
        
        db_response = supabase.table("files").insert(file_metadata).execute()
        
        if db_response.data:
            return db_response.data[0]
    
    raise Exception("Failed to upload file")

async def download_file(file_id: str) -> Dict:
    """Download file from Supabase storage"""
    supabase = get_supabase_client()
    
    # Get file metadata
    file_response = supabase.table("files").select("*").eq("id", file_id).execute()
    
    if not file_response.data:
        raise Exception("File not found")
    
    file_metadata = file_response.data[0]
    
    # Get file from storage
    storage_response = supabase.storage.from_("project-files").download(file_metadata["file_path"])
    
    if storage_response:
        return {
            "filename": file_metadata["filename"],
            "content": storage_response,
            "mime_type": file_metadata["mime_type"]
        }
    
    raise Exception("Failed to download file")

async def get_user_files(user_id: str = None) -> List[Dict]:
    """Get files uploaded by users"""
    supabase = get_supabase_client()
    
    query = supabase.table("files").select("""
        *,
        profiles:uploaded_by (
            username,
            email,
            role
        )
    """)
    
    if user_id:
        query = query.eq("uploaded_by", user_id)
    
    response = query.execute()
    return response.data
