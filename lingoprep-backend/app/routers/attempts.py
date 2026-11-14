"""Retry persistence only; this endpoint never invokes grading or a provider."""
from uuid import UUID

from fastapi import APIRouter, Depends
from app.dependencies.auth import AuthenticatedUser, get_current_user
from app.services.reliable_routes import recover_checkpoint, finish, render
from app.services.resource_limits import private_actor, workload

router = APIRouter()


@router.post("/{attempt_key}/save")
async def retry_save(attempt_key: UUID, user: AuthenticatedUser = Depends(get_current_user)):
    principal = private_actor("user:" + user.id)
    key = str(attempt_key)
    async with workload("scoring", [principal]):
        await recover_checkpoint(principal, key)
        return render(await finish(principal, key))
