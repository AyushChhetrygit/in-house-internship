from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from models import CampaignStatus, EmailStatus

class TemplateBase(BaseModel):
    name: str
    subject: str
    html_content: str

class TemplateCreate(TemplateBase):
    pass

class TemplateResponse(TemplateBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class CampaignBase(BaseModel):
    name: str
    target_segment: str
    template_id: int
    scheduled_time: Optional[datetime] = None

class CampaignCreate(CampaignBase):
    pass

class CampaignResponse(CampaignBase):
    id: int
    status: CampaignStatus
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class EmailLogResponse(BaseModel):
    id: int
    campaign_id: int
    customer_email: str
    status: EmailStatus
    error_message: Optional[str] = None
    sent_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class SegmentPreviewResponse(BaseModel):
    customer_id: str
    name: str
    email: str
    segment_name: str
    churn_risk: str
    attributes: dict # Extra variables like discount, recency, etc.
