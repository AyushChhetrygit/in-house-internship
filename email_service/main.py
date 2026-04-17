import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import routes
from scheduler import start_scheduler, shutdown_scheduler

logging.basicConfig(level=logging.INFO)

# Create DB Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Email Automation API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Since it's for local/internal dashboard demo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes.router, prefix="/api/v1")

@app.on_event("startup")
async def on_startup():
    start_scheduler()
    
    # Pre-seed a default template for demo purposes if it doesn't exist
    from database import SessionLocal
    import models
    db = SessionLocal()
    if not db.query(models.Template).first():
        db.add(models.Template(
            name="Welcome Back - VIP",
            subject="Exclusive {{ DiscountPercentage }} Off Just For You, {{ CustomerName }}!",
            html_content="<h1>Hi {{ CustomerName }}!</h1><p>Because you are in our <strong>{{ SegmentName }}</strong> group, we are offering you <strong>{{ DiscountPercentage }}</strong> off your next order.</p><p>As someone who has spent over ${{ TotalSpend }}, we value your business!</p>"
        ))
        db.commit()
    db.close()

@app.on_event("shutdown")
async def on_shutdown():
    shutdown_scheduler()

@app.get("/health")
def health_check():
    return {"status": "ok"}
