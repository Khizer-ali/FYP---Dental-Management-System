import os
import re
from datetime import datetime, timedelta, timezone
from typing import Tuple, Dict, Any, Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from functools import wraps
from flask import request, jsonify
from database import User, UserRole

# Password configuration
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT configuration
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 120  # 2 hours

def get_secret_key() -> str:
    secret = os.getenv("AUTH_SECRET_KEY") or os.getenv("SECRET_KEY")
    if not secret:
        # Fallback for development if not set in .env
        secret = "dev-secret-key-change-in-production"
    return secret

# Password utilities
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def validate_password_strength(password_value: str) -> Tuple[bool, str]:
    if len(password_value) < 8:
        return False, "Password must be at least 8 characters long."
    if not re.search(r"[A-Za-z]", password_value):
        return False, "Password must contain at least one letter."
    if not re.search(r"\d", password_value):
        return False, "Password must contain at least one digit."
    if not re.search(r"[^\w\s]", password_value):
        return False, "Password must contain at least one special character."
    return True, ""

# JWT utilities
def create_access_token(subject: int, role: str, expires_delta: Optional[timedelta] = None) -> Dict[str, Any]:
    if expires_delta is None:
        expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode = {
        "sub": str(subject),
        "role": role,
        "exp": int(expire.timestamp()),
    }
    encoded_jwt = jwt.encode(to_encode, get_secret_key(), algorithm=JWT_ALGORITHM)
    return {"access_token": encoded_jwt, "expires_at": expire}

def decode_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        payload = jwt.decode(token, get_secret_key(), algorithms=[JWT_ALGORITHM])
        return payload
    except Exception:
        return None

# Flask Decorators for Auth
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(" ")[1]
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        payload = decode_token(token)
        if not payload:
            return jsonify({'message': 'Token is invalid!'}), 401
        
        current_user = User.query.get(int(payload['sub']))
        if not current_user:
            return jsonify({'message': 'User not found!'}), 401
        
        if not current_user.is_active:
            return jsonify({'message': 'User is inactive!'}), 403
            
        return f(current_user, *args, **kwargs)
    
    return decorated

def admin_required(f):
    @wraps(f)
    @token_required
    def decorated(current_user, *args, **kwargs):
        if current_user.role != UserRole.ADMIN:
            return jsonify({'message': 'Admin privileges required!'}), 403
        return f(current_user, *args, **kwargs)
    return decorated

def doctor_required(f):
    @wraps(f)
    @token_required
    def decorated(current_user, *args, **kwargs):
        if current_user.role != UserRole.DOCTOR:
            return jsonify({'message': 'Doctor privileges required!'}), 403
        return f(current_user, *args, **kwargs)
    return decorated
