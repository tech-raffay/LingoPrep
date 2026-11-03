from uuid import UUID
import httpx
from fastapi import Header, HTTPException
from app.config import settings

class AuthenticatedUser:
    def __init__(self, user_id: str, email: str, full_name: str | None = None, token: str | None = None):
        self.id = user_id
        self.email = email
        self.full_name = full_name
        # The verified access token, so database calls can run as this user.
        self.token = token

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

    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization header format. Use 'Bearer <token>'."
        )

    token = parts[1]

    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        raise HTTPException(status_code=503, detail="Authentication service temporarily unavailable.")

    # Query Supabase Auth API
    url = f"{settings.SUPABASE_URL}/auth/v1/user"
    headers = {
        "apikey": settings.SUPABASE_KEY,
        "Authorization": f"Bearer {token}"
    }

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(url, headers=headers)
            if response.status_code not in (200, 401, 403):
                raise HTTPException(status_code=503, detail="Authentication service temporarily unavailable.")
            if response.status_code != 200:
                raise HTTPException(
                    status_code=401,
                    detail="Invalid or expired authentication token."
                )
            
            try:
                user_data = response.json()
                if not isinstance(user_data, dict):
                    raise ValueError()
                UUID(user_data.get("id", ""))
                if not isinstance(user_data.get("email"), str) or not user_data["email"].strip():
                    raise ValueError()
            except (ValueError, TypeError, AttributeError) as exc:
                raise HTTPException(status_code=503, detail="Authentication service returned an invalid response.") from exc
            user_id = user_data.get("id")
            email = user_data.get("email")
            user_metadata = user_data.get("user_metadata") or {}
            if not isinstance(user_metadata, dict):
                user_metadata = {}
            full_name = user_metadata.get("full_name")
            if not isinstance(full_name, str):
                full_name = None

            if not user_id or not email:
                raise HTTPException(
                    status_code=401,
                    detail="Token verification succeeded but user ID or email is missing."
                )

            return AuthenticatedUser(user_id=user_id, email=email, full_name=full_name, token=token)
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=503,
            detail="Authentication service temporarily unavailable."
        ) from e

async def get_optional_user(authorization: str | None = Header(None)) -> AuthenticatedUser | None:
    """
    Attempt to verify user JWT token if present.
    Only an absent header enables guest access. Invalid credentials are rejected.
    """
    if authorization is None:
        return None
    return await get_current_user(authorization)

