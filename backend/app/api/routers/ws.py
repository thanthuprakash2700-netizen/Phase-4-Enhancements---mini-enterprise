import json
from typing import Dict, List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from sqlalchemy.orm import Session
from jose import JWTError, jwt

from app.db.session import get_db
from app.core.config import settings
from app.models.user import User

router = APIRouter(prefix="/ws", tags=["websocket"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}
        self.user_orgs: Dict[int, int] = {}

    async def connect(self, websocket: WebSocket, user_id: int, organization_id: int):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        self.user_orgs[user_id] = organization_id

    def disconnect(self, websocket: WebSocket, user_id: int):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
                if user_id in self.user_orgs:
                    del self.user_orgs[user_id]

    async def send_personal_message(self, message: dict, user_id: int):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_text(json.dumps(message))
                except Exception:
                    pass

    async def broadcast_to_org(self, message: dict, organization_id: int):
        for user_id, connections in self.active_connections.items():
            if self.user_orgs.get(user_id) == organization_id:
                for connection in connections:
                    try:
                        await connection.send_text(json.dumps(message))
                    except Exception:
                        pass

    async def broadcast(self, message: dict):
        # Fallback or system wide (e.g. system maintenance - keep but recommend broadcast_to_org)
        for connections in self.active_connections.values():
            for connection in connections:
                try:
                    await connection.send_text(json.dumps(message))
                except Exception:
                    pass

manager = ConnectionManager()

def get_user_from_token(token: str, db: Session) -> User:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            return None
        from sqlalchemy import select
        user = db.execute(select(User).where(User.id == int(user_id))).scalars().first()
        return user
    except JWTError:
        return None

@router.websocket("/")
async def websocket_endpoint(websocket: WebSocket, token: str = Query(...), db: Session = Depends(get_db)):
    user = get_user_from_token(token, db)
    if not user or not user.is_active:
        await websocket.close(code=1008)
        return

    await manager.connect(websocket, user.id, user.organization_id)
    try:
        while True:
            # Keep connection alive, wait for disconnect
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, user.id)
