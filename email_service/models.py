from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, Boolean
from sqlalchemy.orm import relationship
import enum
from datetime import datetime
from database import Base

class CampaignStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    SCHEDULED = "SCHEDULED"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class EmailStatus(str, enum.Enum):
    PENDING = "PENDING"
    SENT = "SENT"
    FAILED = "FAILED"

class Template(Base):
    __tablename__ = "templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    subject = Column(String)
    html_content = Column(Text) # Jinja2 compatible HTML
    created_at = Column(DateTime, default=datetime.utcnow)

class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    target_segment = Column(String) # VIP, At-Risk, Inactive, New
    template_id = Column(Integer, ForeignKey("templates.id"))
    status = Column(Enum(CampaignStatus), default=CampaignStatus.DRAFT)
    scheduled_time = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    template = relationship("Template")
    emails = relationship("EmailLog", back_populates="campaign")

class EmailLog(Base):
    __tablename__ = "email_logs"

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"))
    customer_email = Column(String, index=True)
    status = Column(Enum(EmailStatus), default=EmailStatus.PENDING)
    error_message = Column(Text, nullable=True)
    sent_at = Column(DateTime, nullable=True)

    campaign = relationship("Campaign", back_populates="emails")
