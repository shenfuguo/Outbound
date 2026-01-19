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
        'comment': '客户信息主表'
    }
    
    # 自定义ID字段（覆盖BaseModel的id）
    id = db.Column(
        db.String(50), 
        primary_key=True,
        comment='客户ID（格式：company_00001）'
    )
    
    # 公司基本信息
    company_name = db.Column(
        db.String(200), 
        nullable=False,
        unique=True,
        comment='客户公司名称（唯一）'
    )
    
    # 新增：公司税号
    tax_id = db.Column(
        db.String(50), 
        nullable=False,
        comment='公司税号（必填）'
    )
    
    # 公司地址
    company_address = db.Column(
        db.String(500), 
        nullable=True,
        comment='客户公司地址'
    )
    
    # 主要联系人姓名
    contact_person = db.Column(
        db.String(100), 
        nullable=False,
        comment='主要联系人姓名'
    )
    
    # 主要联系人电话
    phone = db.Column(
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
    
    # 邮箱地址
    email = db.Column(
        db.String(100), 
        nullable=True,
        comment='邮箱地址'
    )
    
    # 公司网站
    website = db.Column(
        db.String(200), 
        nullable=True,
        comment='公司网站'
    )
    
    # 所属行业
    industry = db.Column(
        db.String(100), 
        nullable=True,
        comment='所属行业'
    )
    
    # 开户银行信息
    bank_name = db.Column(
        db.String(100), 
        nullable=False,
        comment='开户银行名称（必填）'
    )
    
    bank_account = db.Column(
        db.String(30), 
        nullable=False,
        comment='银行账户（必填）'
    )
    
    bank_code = db.Column(
        db.String(20), 
        nullable=False,
        comment='开户银行行号（必填）'
    )
    
    account_holder = db.Column(
        db.String(100), 
        nullable=True,
        comment='账户持有人'
    )
    
    bank_province = db.Column(
        db.String(50), 
        nullable=True,
        comment='开户行省份'
    )
    
    bank_city = db.Column(
        db.String(50), 
        nullable=True,
        comment='开户行城市'
    )
    
    bank_branch = db.Column(
        db.String(200), 
        nullable=True,
        comment='开户支行'
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
            'company_name': self.company_name,
            'tax_id': self.tax_id,  # 新增
            'address': self.company_address,
            'contact_person': self.contact_person,  # 改为 contact_person
            'phone': self.phone,  # 改为 phone
            # 'email': self.email,  # 新增
            # 'website': self.website,  # 新增
            # 'industry': self.industry,  # 新增
            # 'contact2': self.customer_name2,
            # 'phone2': self.customer_phone2,
            # 'remarks': self.remarks,
            
            # 银行信息
            'bank_name': self.bank_name,
            'bank_account': self.bank_account,
            'bank_code': self.bank_code,
            # 'account_holder': self.account_holder,
            # 'bankProvince': self.bank_province,
            # 'bankCity': self.bank_city,
            # 'bankBranch': self.bank_branch,
            
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def to_simple_dict(self):
        """简化的字典格式（用于下拉选择等）"""
        return {
            'id': self.id,
            'company_name': self.company_name,
            'tax_id': self.tax_id,  # 新增
            'contact_person': self.contact_person,  # 改为 contact_person
            'phone': self.phone,  # 改为 phone
            'bank_name': self.bank_name,  # 新增
            'bank_account': self.bank_account[:4] + '****' + self.bank_account[-4:] if self.bank_account and len(self.bank_account) > 8 else self.bank_account
        }
    
    def to_compact_dict(self):
        """更简化的格式（用于搜索建议等）"""
        return {
            'id': self.id,
            'company_name': self.company_name,
            'tax_id': self.tax_id,
            'contact_person': self.contact_person,
            'phone': self.phone
        }
    
    def get_contact_info(self):
        """获取联系信息"""
        contacts = []
        if self.contact_person and self.phone:
            contacts.append({
                'contact_person': self.contact_person,
                'phone': self.phone,
                'type': 'primary'
            })
        
        if self.customer_name2 and self.customer_phone2:
            contacts.append({
                'contact2': self.customer_name2,
                'phone2': self.customer_phone2,
                'type': 'secondary'
            })
        
        return contacts
    
    def get_bank_info(self):
        """获取银行信息"""
        bank_info = {
            'bank_name': self.bank_name,
            'bank_account': self.bank_account,
            'bank_code': self.bank_code,
            # 'account_holder': self.account_holder
        }
        
        if self.bank_province:
            bank_info['bankProvince'] = self.bank_province
        if self.bank_city:
            bank_info['bankCity'] = self.bank_city
        if self.bank_branch:
            bank_info['bankBranch'] = self.bank_branch
            
        return bank_info
    
    def validate_phone_numbers(self):
        """验证电话号码格式"""
        import re
        
        phone_pattern = r'^1[3-9]\d{9}$|^\d{3,4}-\d{7,8}$'  # 手机号或座机
        errors = []
        
        if self.phone and not re.match(phone_pattern, self.phone):
            errors.append(f"主要联系人电话格式错误: {self.phone}")
        
        if self.customer_phone2 and not re.match(phone_pattern, self.customer_phone2):
            errors.append(f"备用联系人电话格式错误: {self.customer_phone2}")
        
        return errors
    
    def validate_bank_info(self):
        """验证银行信息"""
        errors = []
        
        if not self.bank_name or len(self.bank_name.strip()) < 2:
            errors.append("开户银行名称不能为空且至少2个字符")
        
        if not self.bank_account or not re.match(r'^\d{1,30}$', self.bank_account):
            errors.append("银行账户应为数字")
        
        if not self.bank_code or not re.match(r'^\d{12}$', self.bank_code):
            errors.append("银行行号应为12位数字")
        
        # if not self.account_holder or len(self.account_holder.strip()) < 2:
        #     errors.append("账户持有人不能为空且至少2个字符")
        
        return errors
    
    def validate_tax_id(self):
        """验证税号格式"""
        errors = []
        
        if not self.tax_id or len(self.tax_id.strip()) < 5:
            errors.append("公司税号不能为空且至少5个字符")
        
        return errors
    
    def validate_all(self):
        """验证所有字段"""
        errors = []
        
        # 公司名称验证
        if not self.company_name or len(self.company_name.strip()) < 2:
            errors.append("公司名称不能为空且至少2个字符")
        
        # 税号验证
        errors.extend(self.validate_tax_id())
        
        # 联系人验证
        if not self.contact_person or len(self.contact_person.strip()) < 2:
            errors.append("联系人姓名不能为空且至少2个字符")
        
        if not self.phone:
            errors.append("联系电话不能为空")
        
        # 银行信息验证
        errors.extend(self.validate_bank_info())
        
        return errors
    
    def update_from_dict(self, data: dict):
        """从字典更新模型数据"""
        # 公司基本信息
        if 'company_name' in data:
            self.company_name = data['company_name']
        if 'tax_id' in data:
            self.tax_id = data['tax_id']
        if 'address' in data:
            self.company_address = data['address']
        if 'contact_person' in data:
            self.contact_person = data['contact_person']
        if 'phone' in data:
            self.phone = data['phone']
        # if 'email' in data:
        #     self.email = data['email']
        # if 'website' in data:
        #     self.website = data['website']
        # if 'industry' in data:
        #     self.industry = data['industry']
        
        # 备用联系人
        # if 'contact2' in data:
        #     self.customer_name2 = data['contact2']
        # if 'phone2' in data:
        #     self.customer_phone2 = data['phone2']
        
        # 银行信息
        if 'bank_name' in data:
            self.bank_name = data['bank_name']
        if 'bank_account' in data:
            self.bank_account = data['bank_account']
        if 'bank_code' in data:
            self.bank_code = data['bank_code']
        # if 'account_holder' in data:
        #     self.account_holder = data['account_holder']
        # if 'bankProvince' in data:
        #     self.bank_province = data['bankProvince']
        # if 'bankCity' in data:
        #     self.bank_city = data['bankCity']
        # if 'bankBranch' in data:
        #     self.bank_branch = data['bankBranch']
        
        if 'remarks' in data:
            self.remarks = data['remarks']
        
        return self
    
    def __repr__(self):
        """对象表示"""
        return f"<CompanyMstModel(id={self.id}, company_name={self.company_name}, tax_id={self.tax_id})>"