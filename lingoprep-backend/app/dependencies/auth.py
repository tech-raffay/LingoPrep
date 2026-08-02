import httpx
from fastapi import Header, HTTPException, Depends
from app.config import settings

class AuthenticatedUser:
    def __init__(self, user_id: str, email: str, full_name: str | None = None):
        self.id = user_id
        self.email = email
        self.full_name = full_name

async def get_current_user(authorization: str | None = Header(None)) -> AuthenticatedUser:
    """
    Verify the Supabase JWT token passed in the Authorization header.
    Queries Supabase's auth endpoint to get the authenticated user info.
    """
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authorization header missing."
        )

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization header format. Use 'Bearer <token>'."
        )

    token = authorization.split(" ")[1]

    # Query Supabase Auth API
    url = f"{settings.SUPABASE_URL}/auth/v1/user"
    headers = {
        "apikey": settings.SUPABASE_KEY,
        "Authorization": f"Bearer {token}"
    }

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(url, headers=headers)
            if response.status_code != 200:
                raise HTTPException(
                    status_code=401,
                    detail="Invalid or expired authentication token."
                )
            
            user_data = response.json()
            user_id = user_data.get("id")
            email = user_data.get("email")
            user_metadata = user_data.get("user_metadata", {})
            full_name = user_metadata.get("full_name")

            if not user_id or not email:
                raise HTTPException(
                    status_code=401,
                    detail="Token verification succeeded but user ID or email is missing."
                )

            return AuthenticatedUser(user_id=user_id, email=email, full_name=full_name)
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Authentication service temporarily unavailable: {str(e)}"
        )

async def get_optional_user(authorization: str | None = Header(None)) -> AuthenticatedUser | None:
    """
    Attempt to verify user JWT token if present.
    If absent or invalid, returns None (allowing guest access).
    """
    if not authorization or not authorization.startswith("Bearer "):
        return None
    try:
        return await get_current_user(authorization)
    except Exception:
        return None

