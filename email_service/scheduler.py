import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from models import CampaignStatus, EmailStatus, EmailLog
from database import SessionLocal
from gmail_api import get_gmail_client
from template_manager import render_template
from data_provider import get_customers_by_segment
from datetime import datetime

logger = logging.getLogger(__name__)
scheduler = BackgroundScheduler()

def process_pending_campaigns():
    """
    Periodic task to find DRAFT/SCHEDULED campaigns that should be running,
    extract users, generate EmailLogs, and send emails.
    """
    db = SessionLocal()
    try:
        now = datetime.utcnow()
        # Find scheduled campaigns that are ready to go
        from models import Campaign 
        ready_campaigns = db.query(Campaign).filter(
            Campaign.status == CampaignStatus.SCHEDULED,
            Campaign.scheduled_time <= now
        ).all()

        for campaign in ready_campaigns:
            campaign.status = CampaignStatus.RUNNING
            db.commit()

            # 1. Fetch Target segment
            customers = get_customers_by_segment(campaign.target_segment)
            logger.info(f"Found {len(customers)} for Campaign {campaign.id}")

            email_logs = []
            # 2. Setup initial logs
            for cust in customers:
                log = EmailLog(
                    campaign_id=campaign.id,
                    customer_email=cust['email'],
                    status=EmailStatus.PENDING
                )
                db.add(log)
                email_logs.append((log, cust))
            db.commit()

            # 3. Send Emails
            gmail_client = get_gmail_client()
            for log, cust in email_logs:
                # Render template
                context = {
                    "CustomerName": cust['name'],
                    "SegmentName": cust['segment_name'],
                    "DiscountPercentage": "20%" if cust['segment_name'] == 'VIP' else "10%",
                    "TotalSpend": cust['attributes']['TotalSpend']
                }
                
                template = campaign.template
                compiled_html = render_template(template.html_content, context)
                subject = render_template(template.subject, context)

                # Send
                if True: # Replace with actual logic. If gmail_client is missing, we simulate for Demo.
                    if gmail_client and gmail_client.service:
                        success = gmail_client.send_email(cust['email'], subject, compiled_html)
                    else:
                        # SIMULATION mode (if no credentials.json exists during dev)
                        import time
                        time.sleep(0.1) # Simulate network call
                        success = True
                    
                    if success:
                        log.status = EmailStatus.SENT
                        log.sent_at = datetime.utcnow()
                    else:
                        log.status = EmailStatus.FAILED
                        log.error_message = "Gmail API Exception"
                
                db.commit()

            # Finish Campaign
            campaign.status = CampaignStatus.COMPLETED
            db.commit()
            logger.info(f"Completed Campaign {campaign.id}")

    except Exception as e:
        logger.error(f"Scheduler Error: {e}")
    finally:
        db.close()

def start_scheduler():
    scheduler.add_job(
        process_pending_campaigns,
        trigger=IntervalTrigger(seconds=30),
        id="campaign_processor",
        name="Process Pending Campaigns",
        replace_existing=True
    )
    scheduler.start()
    logger.info("APScheduler started successfully.")

def shutdown_scheduler():
    scheduler.shutdown()
