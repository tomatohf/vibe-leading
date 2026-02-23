import os
from typing import Generator
from dotenv import load_dotenv
from sqlmodel import create_engine, Session

# 加载环境变量
load_dotenv()

# 数据库连接配置（从环境变量读取，避免硬编码）
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+mysqlconnector://root:root@localhost:3306/vibe_leading"
)

# 创建引擎（只读场景优化参数）
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # 检查连接可用性
    pool_recycle=3600,   # 1小时回收连接，避免超时
    echo=False,          # 生产环境关闭SQL日志
    connect_args={
        "read_timeout": 10,  # 读取超时
        "charset": "utf8mb4" # 支持全UTF-8字符
    }
)

# 依赖项：获取数据库会话（FastAPI专用）
def get_db() -> Generator[Session, None, None]:
    with Session(engine) as session:
        try:
            yield session
        finally:
            session.close()
