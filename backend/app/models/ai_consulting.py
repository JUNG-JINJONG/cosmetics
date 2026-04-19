from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class AIChatSession(Base):
    __tablename__ = "ai_chat_sessions"

    session_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("buyer.buyer_id", ondelete="CASCADE"))
    title = Column(String(255))
    status_code = Column(String(20), default="1800000001")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    messages = relationship("AIChatMessage", back_populates="session", cascade="all, delete-orphan")

class AIChatMessage(Base):
    __tablename__ = "ai_chat_messages"

    message_id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("ai_chat_sessions.session_id", ondelete="CASCADE"))
    role = Column(String(20), nullable=False) # user, assistant, system
    content = Column(Text, nullable=False)
    message_metadata = Column("metadata", JSON) # 참고 데이터 등
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    session = relationship("AIChatSession", back_populates="messages")

class AIConsultingBrief(Base):
    __tablename__ = "ai_consulting_briefs"

    brief_id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("ai_chat_sessions.session_id", ondelete="CASCADE"))
    proposed_strategy = Column(Text)
    recommended_items = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
