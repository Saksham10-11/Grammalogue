from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class User(BaseModel):
    id: Optional[str] = None
    username: str
    email: EmailStr
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None