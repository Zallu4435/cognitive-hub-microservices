import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import structlog
from config import JWT_SECRET

log = structlog.get_logger()
security = HTTPBearer()

if not JWT_SECRET:
    log.error("jwt_secret_missing", detail="JWT_SECRET environment variable is not configured")

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not JWT_SECRET:
        raise HTTPException(status_code=500, detail="JWT_SECRET is not configured on the server")
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        return payload["sub"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
