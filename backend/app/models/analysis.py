from pydantic import BaseModel
from typing import List, Optional


class SoilAnalysisResult(BaseModel):
    soil_type: str
    confidence: float
    moisture: str
    estimated_ph: str
    organic_matter: str
    suitable_crops: List[str]
    recommendations: List[str]
    fertilizer_suggestion: str


class AnalysisRecord(BaseModel):
    user_id: str
    image_filename: str
    location: Optional[str] = None
    soil_type: str
    confidence: float
    moisture: str
    estimated_ph: str
    organic_matter: str
    suitable_crops: List[str]
    recommendations: List[str]
    fertilizer_suggestion: str
    created_at: str
