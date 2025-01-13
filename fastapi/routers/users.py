from fastapi import APIRouter, HTTPException
from models.user import User
from config.database import db

router = APIRouter()

@router.get("/")
async def get_users():
    try:
        users = await db.users.find().to_list(1000)
        return users
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))