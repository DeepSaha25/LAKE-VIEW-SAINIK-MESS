# frontend/src/components/ui/skeleton.jsx

import os
import logging
from pathlib import Path
from typing import List, Optional
import uuid
from datetime import datetime, timezone

from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, ConfigDict

# --- Setup ---
ROOT_DIR = Path(__file__).parent
# Load environment variables (MONGO_URL, DB_NAME, CORS_ORIGINS)
from dotenv import load_dotenv
load_dotenv(ROOT_DIR / '.env') 

# MongoDB connection
try:
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    residents_collection = db['residents']
    admin_collection = db['admin']
except KeyError:
    raise RuntimeError("Missing one or more required environment variables (MONGO_URL, DB_NAME).")
except Exception as e:
    logging.error(f"MongoDB connection failed: {e}")
    raise

# Admin credentials from environment (or default to sample)
ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', 'admin')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')

# Initialize FastAPI app and router
app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBasic()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# --- Models ---

class Bill(BaseModel):
    month: str
    year: int
    rent: float
    electricity: float
    food: float
    other: float
    paidAmount: float = Field(default=0.0)  # NEW: Records partial payment
    # REMOVED: paid: bool
    dueDate: str
    paidDate: Optional[str] = None

class Resident(BaseModel):
    # This is the public model, exposing the data structure
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    room: str
    phone: str
    email: Optional[str] = None
    joinDate: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat().split('T')[0])
    bills: List[Bill] = []

    model_config = ConfigDict(
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "id": "1",
                "name": "Rahul Kumar",
                "room": "101",
                "phone": "9876543210",
                "email": "rahul@example.com",
                "joinDate": "2024-01-01",
                "bills": []
            }
        },
    )

class ResidentCreate(BaseModel):
    name: str
    room: str
    phone: str
    email: Optional[str] = None

# --- Utility Functions ---

def authenticate_admin(credentials: HTTPBasicCredentials = Depends(security)):
    if credentials.username == ADMIN_USERNAME and credentials.password == ADMIN_PASSWORD:
        return True
    raise HTTPException(
        status_code=401,
        detail="Incorrect username or password",
        headers={"WWW-Authenticate": "Basic"},
    )

def resident_to_dict(resident):
    # Convert MongoDB document (with '_id') to Pydantic-compatible dict
    resident['id'] = str(resident.pop('_id'))
    return resident

async def initialize_sample_data():
    # FIX: Changed 'from .sample_data import sample_residents' to direct import
    from sample_data import sample_residents 
    
    if await residents_collection.count_documents({}) == 0:
        logger.info("Initializing sample resident data.")
        
        # Prepare data for MongoDB insert
        mongo_residents = []
        for r in sample_residents:
            r['_id'] = r.pop('id') 
            mongo_residents.append(r)
        
        await residents_collection.insert_many(mongo_residents)
        
    if await admin_collection.count_documents({}) == 0:
        logger.info("Initializing admin credentials.")
        admin_data = {
            "username": ADMIN_USERNAME,
            "password": ADMIN_PASSWORD,
            "name": "Admin",
            "email": "admin@lakeviewsainik.com"
        }
        await admin_collection.insert_one(admin_data)

# --- Admin Routes ---

@api_router.get("/admin/credentials", tags=["Admin"], dependencies=[Depends(authenticate_admin)])
async def get_admin_credentials():
    return {
        "username": ADMIN_USERNAME,
        "password": ADMIN_PASSWORD,
        "name": "Admin",
        "email": "admin@lakeviewsainik.com"
    }

# --- Resident Routes ---

@api_router.get("/residents", response_model=List[Resident], tags=["Residents"])
async def get_all_residents():
    # Only expose residents; admin auth is NOT required for public access (for now)
    residents = await residents_collection.find().to_list(100)
    return [Resident(**resident_to_dict(r)) for r in residents]

@api_router.get("/residents/{resident_id}", response_model=Resident, tags=["Residents"])
async def get_resident(resident_id: str):
    resident = await residents_collection.find_one({"_id": resident_id})
    if resident:
        return Resident(**resident_to_dict(resident))
    raise HTTPException(status_code=404, detail="Resident not found")

@api_router.post("/residents", response_model=Resident, tags=["Residents"], dependencies=[Depends(authenticate_admin)])
async def create_resident(resident: ResidentCreate):
    new_resident = Resident(**resident.model_dump())
    new_resident_dict = new_resident.model_dump()
    new_resident_dict['_id'] = new_resident_dict.pop('id')
    
    await residents_collection.insert_one(new_resident_dict)
    return new_resident

@api_router.put("/residents/{resident_id}", response_model=Resident, tags=["Residents"], dependencies=[Depends(authenticate_admin)])
async def update_resident(resident_id: str, updates: ResidentCreate):
    updates_dict = updates.model_dump(exclude_unset=True)
    result = await residents_collection.update_one(
        {"_id": resident_id},
        {"$set": updates_dict}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Resident not found")
        
    updated_resident = await residents_collection.find_one({"_id": resident_id})
    return Resident(**resident_to_dict(updated_resident))

@api_router.delete("/residents/{resident_id}", status_code=204, tags=["Residents"], dependencies=[Depends(authenticate_admin)])
async def delete_resident(resident_id: str):
    result = await residents_collection.delete_one({"_id": resident_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Resident not found")
    return {"message": "Resident deleted"}


# --- Bill Routes ---

@api_router.post("/residents/{resident_id}/bills", response_model=Resident, tags=["Bills"], dependencies=[Depends(authenticate_admin)])
async def add_or_update_bill(resident_id: str, bill: Bill):
    bill_dict = bill.model_dump()
    
    # 1. Find resident
    resident = await residents_collection.find_one({"_id": resident_id})
    if not resident:
        raise HTTPException(status_code=404, detail="Resident not found")

    # 2. Check if bill exists
    existing_bill_index = -1
    for i, b in enumerate(resident.get('bills', [])):
        if b['month'] == bill.month and b['year'] == bill.year:
            existing_bill_index = i
            break
            
    if existing_bill_index != -1:
        # Update existing bill
        resident['bills'][existing_bill_index] = bill_dict
        # Ensure latest bill is at the front (for UI logic)
        resident['bills'].insert(0, resident['bills'].pop(existing_bill_index)) 
        
    else:
        # Add new bill to the beginning of the list (newest first)
        resident['bills'].insert(0, bill_dict)

    # 3. Save back to database
    await residents_collection.update_one(
        {"_id": resident_id},
        {"$set": {"bills": resident['bills']}}
    )

    return Resident(**resident_to_dict(resident))

# --- Application Setup ---

@app.on_event("startup")
async def startup_db_client():
    # Ensure indices if necessary
    # Example: await residents_collection.create_index([("room", 1)], unique=True)
    await initialize_sample_data()

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

# Include the router
app.include_router(api_router)

# Add CORS middleware
cors_origins = os.environ.get('CORS_ORIGINS', '*').split(',')
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)