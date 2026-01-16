# models/contract_model.py
from .base_model import BaseModel
from . import get_db
from utils.time_utils import beijing_time
import re
from sqlalchemy import Column, String, Integer, Float, DateTime, Text, ForeignKey, Date, Numeric
from sqlalchemy.orm import relationship

db = get_db()

class ContractModel(BaseModel):
    """合同模型"""
    __tablename__ = 'contracts'
    __table_args__ = {
        'comment': '合同信息表'
    }
    
    # 自定义ID字段
    id = db.Column(
        db.String(50), 
        primary_key=True,
        nullable=True,
        comment='合同ID'
    )
    
    # 文件ID（新增字段）
    file_id = db.Column(
        db.String(50),
        nullable=False,  # 不能为空
        unique=True,  # 通常文件ID应该是唯一的
        comment='文件ID'
    )
    
    # 客户ID
    company_id = db.Column(
        db.String(50),
        db.ForeignKey('company_mst.id', ondelete='CASCADE'),
        # nullable=False,
        nullable=False,
        # primary_key=True,
        comment='客户ID'
    )
    
    # 合同标题
    contract_title = db.Column(
        db.String(500),
        nullable=True,
        comment='合同标题'
    )
    
    # 合同金额
    contract_amount = db.Column(
        db.Numeric(10, 2),
        # nullable=False,
        nullable=True,
        default=0.00,
        comment='合同金额'
    )
    
    # 已付金额
    paid_amount = db.Column(
        db.Numeric(10, 2),
        # nullable=False,
        nullable=True,
        default=0.00,
        comment='已付金额'
    )
    
    # 开始日期
    start_date = db.Column(
        db.Date,
        # nullable=False,
        nullable=True,
        comment='合同开始日期'
    )
    
    # 结束日期
    end_date = db.Column(
        db.Date,
        # nullable=False,
        nullable=True,
        comment='合同结束日期'
    )
    
    # 尾款日期
    final_payment_date = db.Column(
        db.Date,
        nullable=True,
        comment='尾款支付日期'
    )
    
    # 尾款金额
    final_payment_amount = db.Column(
        db.Numeric(10, 2),
        nullable=True,
        comment='尾款金额'
    )
    
    # 文件路径
    file_path = db.Column(
        db.String(500),
        nullable=True,
        comment='合同文件存储路径'
    )
    
    # 文件名
    file_name = db.Column(
        db.String(255),
        nullable=True,
        comment='合同文件名'
    )
    
    # 主要内容
    main_content = db.Column(
        db.Text,
        nullable=True,
        comment='合同主要内容'
    )
    
    # 备忘录
    memo = db.Column(
        db.Text,
        nullable=True,
        comment='备忘录'
    )
    
    # 状态
    status = db.Column(
        db.String(20),
        # nullable=False,
        nullable=True,
        default='active',
        comment='合同状态: active-有效, completed-已完成, terminated-已终止'
    )
    
    # 与公司的关联
    company = relationship('CompanyMstModel', backref='contracts', lazy='select')
    
    def __init__(self, **kwargs):

        # 检查是否提供了file_id
        if 'file_id' not in kwargs or not kwargs['file_id']:
            raise ValueError("file_id是必填字段，不能为空")
        
        # 检查是否提供了company_id
        if 'company_id' not in kwargs or not kwargs['company_id']:
            raise ValueError("company_id是必填字段，不能为空")
        
        # 生成自定义ID
        if 'id' not in kwargs or not kwargs['id']:
            kwargs['id'] = self.generate_contract_id()
        
        # 确保时间字段正确
        if 'created_at' not in kwargs:
            kwargs['created_at'] = beijing_time()
        if 'updated_at' not in kwargs:
            kwargs['updated_at'] = beijing_time()
        
        # 调用父类构造函数
        super().__init__(**kwargs)
    
    @classmethod
    def generate_contract_id(cls):
        """生成合同ID：contract_001, contract_002, ..."""
        try:
            # 获取当前最大ID
            max_id_record = cls.query.with_entities(cls.id).order_by(cls.id.desc()).first()
            
            if not max_id_record:
                # 第一个合同
                return "contract_001"
            else:
                # 提取数字部分
                max_id = max_id_record[0]
                match = re.search(r'contract_(\d+)', max_id)
                
                if match:
                    # 提取数字并加1
                    next_num = int(match.group(1)) + 1
                else:
                    # 如果没有匹配到格式，从1开始
                    next_num = 1
                
                # 格式化为3位数字
                return f"contract_{next_num:03d}"
        except Exception as e:
            # 如果查询失败（如表不存在），返回默认ID
            return "contract_001"
    
    def to_response_dict(self):
        """返回给前端的字典格式"""
        # 计算剩余金额
        remaining_amount = 0
        if self.contract_amount and self.paid_amount:
            remaining_amount = float(self.contract_amount - self.paid_amount)
        
        return {
            'id': self.id,
            'fileId': self.file_id,  # 新增字段
            'companyId': self.company_id,
            'contractTitle': self.contract_title,
            'contractAmount': float(self.contract_amount) if self.contract_amount else 0,
            'paidAmount': float(self.paid_amount) if self.paid_amount else 0,
            'startDate': self.start_date.strftime('%Y-%m-%d') if self.start_date else None,
            'endDate': self.end_date.strftime('%Y-%m-%d') if self.end_date else None,
            'finalPaymentDate': self.final_payment_date.strftime('%Y-%m-%d') if self.final_payment_date else None,
            'finalPaymentAmount': float(self.final_payment_amount) if self.final_payment_amount else None,
            'fileUrl': f"/api/contracts/{self.id}/download" if self.file_path else None,
            'filePath': self.file_path,
            'fileName': self.file_name,
            'mainContent': self.main_content,
            'memo': self.memo,
            'status': self.status,
            'remainingAmount': remaining_amount
        }
    
    def __repr__(self):
        """对象表示"""
        return f"<ContractModel(id={self.id}, file_id={self.file_id}, contract_title={self.contract_title}, company_id={self.company_id})>"