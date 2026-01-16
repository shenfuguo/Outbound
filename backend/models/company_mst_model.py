# models/company_mst_model.py
from .base_model import BaseModel
from . import get_db
import re

# 从包中获取db实例
db = get_db()

class CompanyMstModel(BaseModel):
    """客户信息主表模型"""
    __tablename__ = 'company_mst'
    __table_args__ = {
        'comment': '客户信息主表 - 存储客户基本信息'
    }
    
    # 自定义ID字段（覆盖BaseModel的id）
    id = db.Column(
        db.String(50), 
        primary_key=True,
        comment='客户ID（格式：company_00001）'
    )
    
    # 公司名称
    company_name = db.Column(
        db.String(200), 
        nullable=False,
        unique=True,
        comment='客户公司名称（唯一）'
    )
    
    # 公司地址
    company_address = db.Column(
        db.String(500), 
        nullable=True,
        comment='客户公司地址'
    )
    
    # 主要联系人姓名
    customer_name1 = db.Column(
        db.String(100), 
        nullable=False,
        comment='主要联系人姓名'
    )
    
    # 主要联系人电话
    customer_phone1 = db.Column(
        db.String(20), 
        nullable=False,
        comment='主要联系人电话'
    )
    
    # 备用联系人姓名
    customer_name2 = db.Column(
        db.String(100), 
        nullable=True,
        comment='备用联系人姓名'
    )
    
    # 备用联系人电话
    customer_phone2 = db.Column(
        db.String(20), 
        nullable=True,
        comment='备用联系人电话'
    )
    
    # 备注字段
    remarks = db.Column(
        db.Text,
        nullable=True,
        comment='备注信息'
    )
    
    def __init__(self, **kwargs):
        # 生成自定义ID
        if 'id' not in kwargs or not kwargs['id']:
            kwargs['id'] = self.generate_company_id()
        
        # 调用父类构造函数
        super().__init__(**kwargs)
    
    @classmethod
    def generate_company_id(cls):
        """生成客户ID：company_00001, company_00002, ..."""
        try:
            # 获取当前最大ID
            max_id_record = cls.query.with_entities(cls.id).order_by(cls.id.desc()).first()
            
            if not max_id_record:
                # 第一个客户
                return "company_00001"
            else:
                # 提取数字部分
                max_id = max_id_record[0]
                match = re.search(r'company_(\d+)', max_id)
                
                if match:
                    # 提取数字并加1
                    next_num = int(match.group(1)) + 1
                else:
                    # 如果没有匹配到格式，从1开始
                    next_num = 1
                
                # 格式化为5位数字
                return f"company_{next_num:05d}"
        except Exception as e:
            # 如果查询失败（如表不存在），返回默认ID
            print(f"生成客户ID时出错: {e}")
            return "company_00001"
    
    @classmethod
    def get_next_company_id(cls):
        """获取下一个客户ID（不保存）"""
        return cls.generate_company_id()
    
    def to_response_dict(self):
        """返回给前端的字典格式"""
        return {
            'id': self.id,
            'companyName': self.company_name,
            'address': self.company_address,
            'contact1': self.customer_name1,
            'phone1': self.customer_phone1,
            'contact2': self.customer_name2,
            'phone2': self.customer_phone2,
            'remarks': self.remarks,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def to_simple_dict(self):
        """简化的字典格式（用于下拉选择等）"""
        return {
            'id': self.id,
            'companyName': self.company_name,
            'contact1': self.customer_name1,
            'phone1': self.customer_phone1
        }
    
    def get_contact_info(self):
        """获取联系信息"""
        contacts = []
        if self.customer_name1 and self.customer_phone1:
            contacts.append({
                'contact1': self.customer_name1,
                'phone1': self.customer_phone1,
                'type': 'primary'
            })
        
        if self.customer_name2 and self.customer_phone2:
            contacts.append({
                'contact2': self.customer_name2,
                'phone2': self.customer_phone2,
                'type': 'secondary'
            })
        
        return contacts
    
    def validate_phone_numbers(self):
        """验证电话号码格式"""
        import re
        
        phone_pattern = r'^1[3-9]\d{9}$|^\d{3,4}-\d{7,8}$'  # 手机号或座机
        errors = []
        
        if self.customer_phone1 and not re.match(phone_pattern, self.customer_phone1):
            errors.append(f"主要联系人电话格式错误: {self.customer_phone1}")
        
        if self.customer_phone2 and not re.match(phone_pattern, self.customer_phone2):
            errors.append(f"备用联系人电话格式错误: {self.customer_phone2}")
        
        return errors
    
    def __repr__(self):
        """对象表示"""
        return f"<CompanyMstModel(id={self.id}, company_name={self.company_name})>"