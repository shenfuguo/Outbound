# models/file_upd_model.py
from .base_model import BaseModel
from . import get_db
from utils.time_utils import beijing_time  # 从工具导入
import re

# 从包中获取db实例
db = get_db()

class FileUpdModel(BaseModel):
    """文件上传模型 - 包含文件内容"""
    __tablename__ = 'file_upd'
    __table_args__ = {
        'comment': '文件上传表 - 存储上传的文件信息和内容'
    }
    
    # 自定义ID字段（覆盖BaseModel的id）
    id = db.Column(
        db.String(50), 
        primary_key=True,
        comment='文件ID'
    )

    # 新增：客户ID字段
    company_id = db.Column(
        db.String(50),
        nullable=False,
        comment='客户ID'
    )
    
    # 原始文件名
    original_name = db.Column(
        db.String(255), 
        nullable=False,
        comment='文件名'
    )
    
    # 存储文件名
    stored_name = db.Column(
        db.String(255), 
        nullable=False, 
        unique=True,
        comment='存储文件名'
    )
    
    # 文件类型
    file_type = db.Column(
        db.String(50), 
        nullable=False,
        comment='文件类型：合同、图纸等'
    )
    
    # 文件大小
    file_size = db.Column(
        db.Integer, 
        nullable=False,
        comment='文件大小（字节）'
    )
    
    # 文件路径
    file_path = db.Column(
        db.String(500), 
        nullable=False,
        comment='文件存储路径'
    )
    
    # MIME类型
    mime_type = db.Column(
        db.String(100),
        comment='文件MIME类型'
    )
    
    # 🌟 文件内容（二进制存储）
    file_content = db.Column(
        db.LargeBinary, 
        nullable=True,
        comment='文件二进制内容'
    )
    
    # 🌟 文件哈希
    file_hash = db.Column(
        db.String(64), 
        nullable=True,
        comment='文件SHA-256哈希值（用于去重）'
    )
    
    # 页数
    page_count = db.Column(
        db.Integer, 
        nullable=True,
        comment='文件页数（PDF等）'
    )
    
    # 文本内容
    text_content = db.Column(
        db.Text, 
        nullable=True,
        comment='文本内容'
    )
    
    # 是否OCR
    has_ocr = db.Column(
        db.Boolean, 
        default=False,
        comment='是否已进行OCR处理'
    )
    
    # OCR置信度
    ocr_confidence = db.Column(
        db.Float, 
        default=0.0,
        comment='OCR识别置信度'
    )
    # print(f"db column beijing_time: {beijing_time()}")
    # 上传时间（北京时间）
    upload_time = db.Column(
        db.DateTime, 
        nullable=False,
        default=lambda: beijing_time(),  # 使用工具中的函数
        comment='上传时间'
    )
    
    def __init__(self, **kwargs):
        # 生成自定义ID
        if 'id' not in kwargs or not kwargs['id']:
            kwargs['id'] = self.generate_file_id()
        
        # 确保upload_time是北京时间
        if 'upload_time' not in kwargs:
            # from utils.time_utils import beijing_time
            kwargs['upload_time'] = beijing_time()
        
        # 调用父类构造函数
        super().__init__(**kwargs)
    
    @classmethod
    def generate_file_id(cls):
        """生成文件ID：file_001, file_002, ..."""
        try:
            # 获取当前最大ID
            max_id_record = cls.query.with_entities(cls.id).order_by(cls.id.desc()).first()
            
            if not max_id_record:
                # 第一个文件
                return "file_001"
            else:
                # 提取数字部分
                max_id = max_id_record[0]
                match = re.search(r'file_(\d+)', max_id)
                
                if match:
                    # 提取数字并加1
                    next_num = int(match.group(1)) + 1
                else:
                    # 如果没有匹配到格式，从1开始
                    next_num = 1
                
                # 格式化为3位数字
                return f"file_{next_num:03d}"
        except Exception as e:
            # 如果查询失败（如表不存在），返回默认ID
            # print(f"生成ID时出错: {e}")
            return "file_001"
    
    @classmethod
    def get_next_file_id(cls):
        """获取下一个文件ID（不保存）"""
        return cls.generate_file_id()
    
    def to_response_dict(self):
        """返回给前端的字典格式"""
        from utils.time_utils import format_datetime
        
        return {
            'id': self.id,
            'companyId': self.company_id,
            'originalName': self.original_name,
            'filename': self.stored_name,
            'fileType': self.file_type,
            'size': self.file_size,
            'uploadTime': self.upload_time.isoformat() if self.upload_time else None,
            'mimeTimeFormatted': format_datetime(self.upload_time) if self.upload_time else None,
            'mimeType': self.mime_type,
            'url': f"/api/files/{self.id}/download",
            'hasContent': self.file_content is not None,
            'pageCount': self.page_count,
            'textExtracted': bool(self.text_content)
        }
    
    def get_file_size_formatted(self):
        """格式化文件大小"""
        if self.file_size == 0:
            return "0B"
        
        size_names = ["B", "KB", "MB", "GB"]
        i = 0
        size_bytes = float(self.file_size)
        while size_bytes >= 1024 and i < len(size_names) - 1:
            size_bytes /= 1024.0
            i += 1
        
        return f"{size_bytes:.2f} {size_names[i]}"
    
    def __repr__(self):
        """对象表示"""
        return f"<FileUpdModel(id={self.id}, company_id={self.company_id}, original_name={self.original_name}, file_type={self.file_type})>"