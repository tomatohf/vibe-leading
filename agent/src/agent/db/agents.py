from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field
from sqlmodel import Session, select


# 映射已有数据库表（需与实际表结构完全一致）
class Agent(SQLModel, table=True):
    __tablename__ = "agents"
    
    # 示例字段（根据实际表结构修改）
    id: str = Field(primary_key=True)
    role: str = Field(index=True)
    goal: str
    backstory: str
    created_at: datetime
    updated_at: datetime


def get_agent_by_id(db: Session, agent_id: str) -> Optional[Agent]:
    statement = select(Agent).where(Agent.id == agent_id)
    return db.exec(statement).first()
