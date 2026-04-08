import secrets
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from ..models.user import UserRegister, UserLogin, UserUpdate, PasswordReset, PasswordResetConfirm
from ..core.database import get_db
from ..core.security import hash_password, verify_password, create_access_token, get_current_user
from ..core.email import send_welcome_email, send_password_reset_email

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register")
async def register(data: UserRegister):
    db = get_db()
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_doc = {
        "name": data.name,
        "email": data.email,
        "password": hash_password(data.password),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    token = create_access_token(user_id, data.email)

    await send_welcome_email(data.email, data.name)

    return {
        "token": token,
        "user": {"id": user_id, "name": data.name, "email": data.email},
    }


@router.post("/login")
async def login(data: UserLogin):
    db = get_db()
    user = await db.users.find_one({"email": data.email})
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user_id = str(user["_id"])
    token = create_access_token(user_id, data.email)

    return {
        "token": token,
        "user": {"id": user_id, "name": user["name"], "email": user["email"]},
    }


@router.get("/me")
async def get_me(user=Depends(get_current_user)):
    return {"id": user["_id"], "name": user["name"], "email": user["email"]}


@router.put("/profile")
async def update_profile(data: UserUpdate, user=Depends(get_current_user)):
    db = get_db()
    update = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if data.name is not None:
        update["name"] = data.name
    await db.users.update_one({"_id": ObjectId(user["_id"])}, {"$set": update})
    return {"message": "Profile updated"}


@router.post("/forgot-password")
async def forgot_password(data: PasswordReset):
    db = get_db()
    user = await db.users.find_one({"email": data.email})
    if not user:
        return {"message": "If the email exists, a reset code has been sent"}

    reset_token = secrets.token_hex(3).upper()
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {
            "reset_token": reset_token,
            "reset_token_expiry": (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat(),
        }},
    )
    await send_password_reset_email(data.email, reset_token)
    return {"message": "If the email exists, a reset code has been sent"}


@router.post("/reset-password")
async def reset_password(data: PasswordResetConfirm):
    db = get_db()
    user = await db.users.find_one({"email": data.email, "reset_token": data.token})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid reset token")

    expiry = datetime.fromisoformat(user.get("reset_token_expiry", "2000-01-01T00:00:00"))
    if datetime.now(timezone.utc) > expiry.replace(tzinfo=timezone.utc):
        raise HTTPException(status_code=400, detail="Reset token expired")

    await db.users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {"password": hash_password(data.new_password)},
            "$unset": {"reset_token": "", "reset_token_expiry": ""},
        },
    )
    return {"message": "Password reset successful"}
