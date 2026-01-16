# repositories/base_repository.py
from typing import List, Optional, TypeVar, Generic
from flask_sqlalchemy import SQLAlchemy
from models.base_model import BaseModel
from sqlalchemy.orm import Session

T = TypeVar('T', bound=BaseModel)

class BaseRepository(Generic[T]):
    """基础仓储类"""
    
    def __init__(self, model_class, db):
        self.model_class = model_class
        self.db = db
        
        # 设置 session
        if hasattr(db, 'session'):
            # 如果 db 是 Flask-SQLAlchemy 的实例
            self.session = db.session
        elif hasattr(db, 'query'):
            # 如果 db 本身就是 SQLAlchemy Session
            self.session = db
        else:
            # 其他情况，尝试将 db 作为 session
            self.session = db
    
    def get_by_id(self, id: str) -> Optional[T]:
        """根据ID获取记录"""
        return self.model_class.query.get(id)
    
    def get_all(self) -> List[T]:
        """获取所有记录"""
        return self.model_class.query.all()
    
    def create(self, **kwargs) -> T:
        """创建新记录"""
        instance = self.model_class(**kwargs)
        self.session.add(instance)
        self.session.commit()
        return instance
    
    def update(self, id: str, **kwargs) -> Optional[T]:
        """更新记录"""
        instance = self.get_by_id(id)
        if instance:
            for key, value in kwargs.items():
                setattr(instance, key, value)
            self.session.commit()
        return instance
    
    def delete(self, id: str) -> bool:
        """删除记录"""
        instance = self.get_by_id(id)
        if instance:
            self.session.delete(instance)
            self.session.commit()
            return True
        return False
    
    def filter_by(self, **filters) -> List[T]:
        """根据条件过滤记录"""
        return self.model_class.query.filter_by(**filters).all()