# models/base_model.py
import uuid
from . import get_db
from utils.time_utils import beijing_time  # 从工具导入

# 从包中获取db实例
db = get_db()

class BaseModel(db.Model):
    """基础模型类"""
    __abstract__ = True
    
    # # 主键ID
    # id = db.Column(
    #     db.String(36), 
    #     primary_key=True, 
    #     default=lambda: str(uuid.uuid4()),
    #     comment='主键ID（UUID）'
    # )
    
    # 创建时间（北京时间）
    created_at = db.Column(
        db.DateTime, 
        nullable=False,
        default=beijing_time,
        comment='登录时间'
    )
    
    # 更新时间（北京时间）
    updated_at = db.Column(
        db.DateTime, 
        default=beijing_time, 
        onupdate=beijing_time,
        comment='更新时间'
    )
    
    # 添加静态方法，便于其他模型使用
    @staticmethod
    def get_beijing_time():
        """获取北京时间的静态方法"""
        from utils.time_utils import beijing_time
        return beijing_time()
    
    def to_dict(self):
        """将模型转换为字典"""
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}
    
    def get_field_comments(self):
        """获取字段注释信息"""
        comments = {}
        for column in self.__table__.columns:
            if hasattr(column, 'comment') and column.comment:
                comments[column.name] = column.comment
        return comments