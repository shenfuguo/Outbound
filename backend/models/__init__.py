# models/__init__.py
"""模型包初始化"""
from flask_sqlalchemy import SQLAlchemy

# 创建一个全局的db实例，但先不绑定到具体的app
_db = SQLAlchemy()

def get_db():
    """获取db实例"""
    return _db

def init_app(app):
    """初始化db并绑定到app"""
    _db.init_app(app)
    return _db