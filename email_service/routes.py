from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models, schemas
from database import get_db
from data_provider import get_customers_by_segment
from datetime import datetime

router = APIRouter()

# ---- TEMPLATES ----
@router.get("/templates", response_model=List[schemas.TemplateResponse])
def get_templates(db: Session = Depends(get_db)):
    return db.query(models.Template).all()

@router.post("/templates", response_model=schemas.TemplateResponse)
def create_template(template: schemas.TemplateCreate, db: Session = Depends(get_db)):
    db_item = models.Template(**template.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


# ---- CAMPAIGNS ----
@router.get("/campaigns", response_model=List[schemas.CampaignResponse])
def get_campaigns(db: Session = Depends(get_db)):
    return db.query(models.Campaign).all()

@router.post("/campaigns", response_model=schemas.CampaignResponse)
def create_campaign(campaign: schemas.CampaignCreate, db: Session = Depends(get_db)):
    # Validate segment
    if campaign.target_segment.upper() not in ["VIP", "AT-RISK", "INACTIVE", "NEW"]:
        raise HTTPException(status_code=400, detail="Invalid target segment")

    db_item = models.Campaign(
        **campaign.model_dump(),
        status=models.CampaignStatus.DRAFT if not campaign.scheduled_time else models.CampaignStatus.SCHEDULED
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.post("/campaigns/{campaign_id}/send")
def trigger_campaign(campaign_id: int, db: Session = Depends(get_db)):
    """Manually trigger a DRAFT campaign to RUN immediately."""
    campaign = db.query(models.Campaign).filter(models.Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    if campaign.status not in [models.CampaignStatus.DRAFT, models.CampaignStatus.SCHEDULED]:
        raise HTTPException(status_code=400, detail="Campaign is already running or completed")
    
    campaign.status = models.CampaignStatus.SCHEDULED
    campaign.scheduled_time = datetime.utcnow()
    db.commit()
    return {"message": "Campaign queued for sending"}

@router.get("/campaigns/{campaign_id}/logs", response_model=List[schemas.EmailLogResponse])
def get_campaign_logs(campaign_id: int, db: Session = Depends(get_db)):
    return db.query(models.EmailLog).filter(models.EmailLog.campaign_id == campaign_id).all()


# ---- SEGMENTS / AUDIENCE PREVIEW ----
@router.get("/segments/{segment_name}", response_model=List[schemas.SegmentPreviewResponse])
def preview_segment(segment_name: str):
    customers = get_customers_by_segment(segment_name)
    return customers
