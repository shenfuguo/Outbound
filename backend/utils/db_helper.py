# utils/db_helper.py
from flask import current_app
from flask_sqlalchemy import SQLAlchemy
from typing import Optional

def get_db() -> Optional[SQLAlchemy]:
    """安全获取数据库实例"""
    try:
        # 方式1: 从app.db获取
        if hasattr(current_app, 'db'):
            return current_app.db
        
        # 方式2: 从Flask-SQLAlchemy扩展获取
        if 'sqlalchemy' in current_app.extensions:
            return current_app.extensions['sqlalchemy'].db
        
        # 方式3: 从app实例的属性获取
        for attr_name in ['db', '_db', 'database']:
            if hasattr(current_app, attr_name):
                db_instance = getattr(current_app, attr_name)
                if isinstance(db_instance, SQLAlchemy):
                    return db_instance
        
        # 如果都找不到，尝试从导入获取
        try:
            from app import db
            return db
        except ImportError:
            pass
        
        raise RuntimeError("无法获取数据库实例。请确保db已正确挂载到app上。")
        
    except RuntimeError as e:
        # 不在应用上下文中
        # print(f"警告: 不在Flask应用上下文中: {e}")
        return None
    except Exception as e:
        # print(f"获取数据库实例错误: {e}")
        return None

def get_db_session():
    """获取数据库会话"""
    db = get_db()
    if db:
        return db.session
    return None