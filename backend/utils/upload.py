import os
from utils.supabase_client import supabase
from fastapi import UploadFile
from dotenv import load_dotenv

load_dotenv()
BUCKET_NAME = os.getenv("SUPABASE_BUCKET_NAME")

def upload_file_to_supabase(file: UploadFile, user_email: str):
    content = file.file.read()
    filename = f"{user_email}/{file.filename}"

    response = supabase.storage.from_(BUCKET_NAME).upload(
        path=filename,
        file=content,
        file_options={"content-type": file.content_type}
    )

    # Optional: Store file metadata in DB
    supabase.table("project_files").insert({
        "user_email": user_email,
        "filename": file.filename,
        "path": filename,
        "content_type": file.content_type
    }).execute()

    return response
