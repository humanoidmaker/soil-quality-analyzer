from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from typing import Optional
from bson import ObjectId
from ..core.database import get_db
from ..core.security import get_current_user
from ..core.config import settings
from ..ml.soil_analyzer import analyze, get_crop_guide

router = APIRouter(prefix="/api/analyze", tags=["analyze"])


@router.post("/soil")
async def analyze_soil(
    file: UploadFile = File(...),
    location: Optional[str] = Form(None),
    user=Depends(get_current_user),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    image_bytes = await file.read()
    max_size = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(image_bytes) > max_size:
        raise HTTPException(
            status_code=400,
            detail=f"Image too large. Maximum size is {settings.MAX_UPLOAD_SIZE_MB}MB",
        )

    try:
        result = analyze(image_bytes, location=location)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

    db = get_db()
    record = {
        "user_id": user["_id"],
        "image_filename": file.filename or "uploaded_image",
        "location": location,
        "soil_type": result["soil_type"],
        "confidence": result["confidence"],
        "moisture": result["moisture"],
        "estimated_ph": result["estimated_ph"],
        "organic_matter": result["organic_matter"],
        "suitable_crops": result["suitable_crops"],
        "recommendations": result["recommendations"],
        "fertilizer_suggestion": result["fertilizer_suggestion"],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    insert_result = await db.analyses.insert_one(record)

    return {"id": str(insert_result.inserted_id), **result}


@router.get("/history")
async def get_history(page: int = 1, limit: int = 20, user=Depends(get_current_user)):
    db = get_db()
    skip = (page - 1) * limit

    total = await db.analyses.count_documents({"user_id": user["_id"]})
    cursor = db.analyses.find({"user_id": user["_id"]}).sort("created_at", -1).skip(skip).limit(limit)

    records = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        doc["user_id"] = str(doc["user_id"])
        records.append(doc)

    return {
        "records": records,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit,
    }


@router.delete("/history/{record_id}")
async def delete_record(record_id: str, user=Depends(get_current_user)):
    db = get_db()
    result = await db.analyses.delete_one({
        "_id": ObjectId(record_id),
        "user_id": user["_id"],
    })
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Record not found")
    return {"message": "Record deleted"}


@router.get("/crop-guide")
async def crop_guide():
    return {"guide": get_crop_guide()}
