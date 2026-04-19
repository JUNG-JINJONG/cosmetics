from pydantic import BaseModel, condecimal
from typing import Optional, Dict, Any
from datetime import datetime

class RatingBase(BaseModel):
    score: float # Using float for validation simplicity
    review_text: Optional[str] = None
    evaluation_criteria: Optional[Dict[str, Any]] = None

class RatingCreate(RatingBase):
    pass

class Rating(RatingBase):
    rating_id: int
    target_company_id: int
    reviewer_buyer_id: Optional[int]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
