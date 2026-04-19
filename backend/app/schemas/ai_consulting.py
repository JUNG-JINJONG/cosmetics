from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime

# --- AI Chat Message Schemas ---
class AIChatMessageBase(BaseModel):
    role: str
    content: str
    metadata: Optional[Any] = None

class AIChatMessageCreate(AIChatMessageBase):
    session_id: int

class AIChatMessageRead(AIChatMessageBase):
    message_id: int
    session_id: int
    created_at: datetime
    class Config:
        from_attributes = True

# --- AI Chat Session Schemas ---
class AIChatSessionBase(BaseModel):
    title: Optional[str] = None
    status_code: Optional[str] = "Active"

class AIChatSessionCreate(AIChatSessionBase):
    user_id: int

class AIChatSessionUpdate(AIChatSessionBase):
    pass

class AIChatSessionRead(AIChatSessionBase):
    session_id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

# --- AI Consulting Brief Schemas ---
class AIConsultingBriefBase(BaseModel):
    session_id: int
    proposed_strategy: Optional[str] = None
    recommended_items: Optional[Any] = None

class AIConsultingBriefCreate(AIConsultingBriefBase):
    pass

class AIConsultingBriefRead(AIConsultingBriefBase):
    brief_id: int
    created_at: datetime
    class Config:
        from_attributes = True
