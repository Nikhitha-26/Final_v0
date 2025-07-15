# utils/file_service.py
from fastapi import UploadFile, HTTPException
from utils.storage_handler import upload_to_bucket, download_from_bucket
from utils.project_metadata import insert_project, get_project_by_file_key

async def upload_project_file_service(file: UploadFile, title: str, description: str, student_name: str, student_id: str, abstract: str, user_id: str):
    try:
        file_url = await upload_to_bucket(file)
        record = insert_project({
            "student_name": student_name,
            "student_id": student_id,
            "project_title": title,
            "abstract": abstract,
            "file_url": file_url,
            "uploaded_by": user_id
        })
        return {"project": record, "storage_path": file_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

async def download_project_file_service(file_key: str):
    try:
        record = get_project_by_file_key(file_key)
        return download_from_bucket(record["file_url"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")
