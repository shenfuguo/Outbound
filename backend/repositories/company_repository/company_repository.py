# repositories/company_repository/company_repository.py
from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy import func, desc, asc, or_
from ..base_repository import BaseRepository
from models.company_mst_model import CompanyMstModel
import re

class CompanyRepository(BaseRepository[CompanyMstModel]):
    """客户信息仓储类"""
    
    def __init__(self, db, config=None):
        super().__init__(CompanyMstModel, db)
        self.config = config or {}
    
    def validate_company_data(self, data: Dict) -> Tuple[bool, str, List[str]]:
        """验证客户数据"""
        errors = []
        
        # 必填字段检查
        required_fields = [
            'company_name',  # 公司名称
            'contact_person',  # 联系人姓名
            'phone',  # 联系电话
            'tax_id',  # 新增：公司税号
            'bank_name',  # 新增：开户银行名称
            'bank_account',  # 新增：银行账户
            'bank_code',  # 新增：银行行号
            # 'accountHolder'  # 新增：账户持有人
        ]
        
        for field in required_fields:
            field_value = data.get(field)
            if not field_value or (isinstance(field_value, str) and not field_value.strip()):
                errors.append(f"{self._get_field_display_name(field)}不能为空")
        
        # 公司名称唯一性检查
        # if data.get('company_name'):
        #     existing = self.filter_by(company_name=data['company_name'])
        #     if existing and (not data.get('id') or existing[0].id != data.get('id')):
        #         errors.append(f"公司名称 '{data['company_name']}' 已存在")
        
        # 税号验证
        if data.get('tax_id'):
            tax_id = data['tax_id'].strip()
            if len(tax_id) < 5:
                errors.append("公司税号至少5个字符")
        
        # 电话号码格式验证
        if data.get('phone'):
            if not self._validate_phone_format(data['phone']):
                errors.append("联系人电话格式不正确")
        
        # if data.get('customer_phone2'):
        #     if not self._validate_phone_format(data['customer_phone2']):
        #         errors.append("备用联系人电话格式不正确")
        
        # # 邮箱格式验证
        # if data.get('email') and data['email'].strip():
        #     if not self._validate_email_format(data['email']):
        #         errors.append("邮箱格式不正确")
        
        # 银行账户验证
        if data.get('bank_account'):
            if not re.match(r'^\d{1,30}$', data['bank_account'].strip()):
                errors.append("银行账户应为数字")
        
        # 银行行号验证
        if data.get('bank_code'):
            bank_code = data['bank_code'].strip()
            if not re.match(r'^\d{12}$', bank_code):
                errors.append("银行行号应为12位数字")
        
        is_valid = len(errors) == 0
        message = "验证通过" if is_valid else "存在验证错误"
        
        return is_valid, message, errors
    
    def _get_field_display_name(self, field_name: str) -> str:
        """获取字段显示名称"""
        field_names = {
            'company_name': '公司名称',
            'tax_id': '公司税号',
            'company_address': '公司地址',
            'contact_person': '联系人姓名',
            'phone': '联系电话',
            # 'email': '邮箱地址',
            # 'website': '公司网站',
            # 'industry': '所属行业',
            # 'customer_name2': '备用联系人姓名',
            # 'customer_phone2': '备用联系人电话',
            'remarks': '备注',
            'bank_name': '开户银行名称',
            'bank_account': '银行账户',
            'bank_code': '开户银行行号',
            # 'accountHolder': '账户持有人',
            # 'bankProvince': '开户行省份',
            # 'bankCity': '开户行城市',
            # 'bankBranch': '开户支行'
        }
        return field_names.get(field_name, field_name)
    
    def _validate_phone_format(self, phone: str) -> bool:
        """验证电话号码格式"""
        # 支持手机号和座机
        phone_pattern = r'^1[3-9]\d{9}$|^\d{3,4}-\d{7,8}$'
        return bool(re.match(phone_pattern, phone.strip()))
    
    # def _validate_email_format(self, email: str) -> bool:
    #     """验证邮箱格式"""
    #     email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    #     return bool(re.match(email_pattern, email.strip()))
    
    def _map_data_to_model_fields(self, data: Dict) -> Dict:
        """将前端字段名映射到模型字段名"""
        field_mapping = {
            # 公司基本信息
            'company_name': 'company_name',
            'tax_id': 'tax_id',
            'company_address': 'company_address',
            'contact_person': 'contact_person',  # 映射到 contact_person
            'phone': 'phone',  # 映射到 phone
            # 'email': 'email',
            # 'website': 'website',
            # 'industry': 'industry',
            
            # 备用联系人
            # 'contact2': 'customer_name2',
            # 'phone2': 'customer_phone2',
            
            # 银行信息
            'bank_name': 'bank_name',
            'bank_account': 'bank_account',
            'bank_code': 'bank_code',
            # 'accountHolder': 'account_holder',
            # 'bankProvince': 'bank_province',
            # 'bankCity': 'bank_city',
            # 'bankBranch': 'bank_branch',
            
            # 其他
            'remarks': 'remarks'
        }
        
        model_data = {}
        for frontend_field, model_field in field_mapping.items():
            if frontend_field in data:
                value = data[frontend_field]
                # 如果是字符串，去除首尾空格
                if isinstance(value, str):
                    value = value.strip()
                model_data[model_field] = value
        
        return model_data
    
    def create_company(self, data: Dict) -> Dict:
        """创建客户"""
        try:
            print(f"Creating company with data: {data}")
            
            # 验证数据
            is_valid, message, errors = self.validate_company_data(data)
            print(f"Validation result - is_valid: {is_valid}, message: {message}, errors: {errors}")
            if not is_valid:
                return {
                    'success': False,
                    'message': message,
                    'errors': errors
                }
            
            # 映射字段名
            model_data = self._map_data_to_model_fields(data)
            print(f"Mapped model data: {model_data}")
            
            # 生成ID（如果未提供）
            if 'id' not in model_data or not model_data.get('id'):
                model_data['id'] = CompanyMstModel.get_next_company_id()
            
            
            # 使用模型的验证方法
            temp_company = CompanyMstModel(**model_data)
            model_errors = temp_company.validate_all()
            if model_errors:
                return {
                    'success': False,
                    'message': '数据验证失败',
                    'errors': model_errors
                }
            
            # 创建记录
            print(f"Creating company with model data: {model_data}")
            company = self.create(**model_data)
            
            return {
                'success': True,
                'message': '客户创建成功',
                'data': company.to_response_dict()
            }
            
        except Exception as e:
            print(f"Error creating company: {str(e)}")
            return {
                'success': False,
                'message': f'创建客户失败: {str(e)}',
                'errors': [str(e)]
            }
    
    def update_company(self, company_id: str, data: Dict) -> Dict:
        """更新客户信息"""
        try:
            # 获取现有客户
            company = self.get_by_id(company_id)
            print(f"Updating company {company_id} with data: {data}")
            if not company:
                return {
                    'success': False,
                    'message': f'客户不存在: {company_id}',
                    'errors': ['客户不存在']
                }
            
            # 验证数据
            is_valid, message, errors = self.validate_company_data(data)
            print(f"验证结果 - is_valid: {is_valid}, message: {message}, errors: {errors}")
            if not is_valid:
                return {
                    'success': False,
                    'message': message,
                    'errors': errors
                }
            
            # 映射字段名
            model_data = self._map_data_to_model_fields(data)
            
            # 更新字段
            for key, value in model_data.items():
                if hasattr(company, key):
                    setattr(company, key, value)
            
            # 验证整个对象
            model_errors = company.validate_all()
            if model_errors:
                self.db.session.rollback()
                return {
                    'success': False,
                    'message': '数据验证失败',
                    'errors': model_errors
                }
            
            # 保存
            self.db.session.commit()
            print(f"Company updated successfully: {company_id}")
            
            return {
                'success': True,
                'message': '客户更新成功',
                'data': company.to_response_dict()
            }
            
        except Exception as e:
            self.db.session.rollback()
            print(f"Error updating company: {str(e)}")
            return {
                'success': False,
                'message': f'更新客户失败: {str(e)}',
                'errors': [str(e)]
            }
    
    def search_companies(self, keyword: str = None, page: int = 1, page_size: int = 20) -> Dict:
        """搜索客户"""
        query = self.session.query(CompanyMstModel)
        
        if keyword and keyword.strip():
            keyword = keyword.strip()
            search_conditions = []
            search_fields = [
                'company_name', 
                'company_address', 
                'contact_person',  # 主要联系人姓名
                'phone',  # 主要联系人电话
                # 'customer_name2',
                # 'customer_phone2',
                'tax_id',  # 新增：税号
                # 'email',  # 新增：邮箱
                # 'industry',  # 新增：行业
                'bank_name',  # 新增：开户银行
                'bank_account',  # 新增：银行账户
                # 'account_holder',  # 新增：账户持有人
                'remarks'
            ]
            
            for field in search_fields:
                if hasattr(CompanyMstModel, field):
                    field_attr = getattr(CompanyMstModel, field)
                    search_conditions.append(field_attr.ilike(f'%{keyword}%'))
            
            if search_conditions:
                query = query.filter(or_(*search_conditions))
        
        # 获取总数
        total = query.count()
        
        # 分页查询
        offset = (page - 1) * page_size
        companies = query.order_by(desc(CompanyMstModel.created_at))\
                         .offset(offset)\
                         .limit(page_size)\
                         .all()
        
        return {
            'companies': [company.to_response_dict() for company in companies],
            'total': total,
            'page': page,
            'page_size': page_size,
            'total_pages': (total + page_size - 1) // page_size
        }
    
    def get_companies_by_name(self, company_name: str) -> List[CompanyMstModel]:
        """根据公司名称获取客户"""
        return self.filter_by(company_name=company_name)
    
    def get_companies_by_tax_id(self, tax_id: str) -> List[CompanyMstModel]:
        """根据税号获取客户"""
        return self.filter_by(tax_id=tax_id)
    
    def get_companies_by_bank_account(self, bank_account: str) -> List[CompanyMstModel]:
        """根据银行账户获取客户"""
        return self.filter_by(bank_account=bank_account)
    
    def get_companies_stats(self) -> Dict[str, Any]:
        """获取客户统计信息"""
        stats = {}
        
        # 总客户数
        total_count = self.session.query(func.count(CompanyMstModel.id)).scalar()
        stats['total_companies'] = total_count
        
        # 按行业统计
        industry_stats = self.session.query(
            CompanyMstModel.industry,
            func.count(CompanyMstModel.id).label('count')
        ).filter(CompanyMstModel.industry.isnot(None))\
         .group_by(CompanyMstModel.industry)\
         .all()
        
        stats['industry_stats'] = [
            {'industry': industry, 'count': count}
            for industry, count in industry_stats
        ]
        
        # 最近创建
        recent_companies = self.session.query(CompanyMstModel)\
            .order_by(desc(CompanyMstModel.created_at))\
            .limit(5)\
            .all()
        
        stats['recent_companies'] = [
            company.to_simple_dict() for company in recent_companies
        ]
        
        return stats
    
    def export_companies_to_csv(self) -> str:
        """导出客户数据到CSV格式字符串"""
        import csv
        import io
        
        companies = self.get_all()
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # 写入表头
        headers = [
            '客户ID', '公司名称', '公司税号', '公司地址',
            '联系人', '联系电话', '邮箱', '公司网站', '所属行业',
            '备用联系人', '备用电话',
            '开户银行', '银行账户', '银行行号', '账户持有人',
            '开户行省份', '开户行城市', '开户支行',
            '备注', '创建时间', '更新时间'
        ]
        writer.writerow(headers)
        
        # 写入数据
        for company in companies:
            writer.writerow([
                company.id,
                company.company_name or '',
                company.tax_id or '',  # 新增
                company.company_address or '',
                company.contact_person or '',  # 联系人
                company.phone or '',  # 联系电话
                # company.email or '',  # 新增
                # company.website or '',  # 新增
                # company.industry or '',  # 新增
                # company.customer_name2 or '',
                # company.customer_phone2 or '',
                company.bank_name or '',  # 新增
                company.bank_account or '',  # 新增
                company.bank_code or '',  # 新增
                # company.account_holder or '',  # 新增
                # company.bank_province or '',  # 新增
                # company.bank_city or '',  # 新增
                # company.bank_branch or '',  # 新增
                company.remarks or '',
                company.created_at.strftime('%Y-%m-%d %H:%M:%S') if company.created_at else '',
                company.updated_at.strftime('%Y-%m-%d %H:%M:%S') if company.updated_at else ''
            ])
        
        return output.getvalue()
    
    def get_company_by_id_with_details(self, company_id: str) -> Optional[Dict]:
        """获取客户详细信息"""
        company = self.get_by_id(company_id)
        if not company:
            return None
        
        result = company.to_response_dict()
        
        # 添加额外信息
        result['contactInfo'] = company.get_contact_info()
        result['bankInfo'] = company.get_bank_info()
        
        return result
    
    def get_companies_for_dropdown(self) -> List[Dict]:
        """获取下拉选择框使用的客户列表"""
        companies = self.session.query(CompanyMstModel)\
            .order_by(asc(CompanyMstModel.company_name))\
            .all()
        
        return [
            {
                'id': company.id,
                'company_name': company.company_name,
                'tax_id': company.tax_id,
                'contact_person': company.contact_person,
                'phone': company.phone,
                'label': f"{company.company_name} ({company.tax_id})"  # 显示格式
            }
            for company in companies
        ]
    
    def delete_company(self, company_id: str) -> Dict:
        """删除客户"""
        try:
            company = self.get_by_id(company_id)
            if not company:
                return {
                    'success': False,
                    'message': f'客户不存在: {company_id}',
                    'errors': ['客户不存在']
                }
            
            # 检查是否有相关的合同记录
            from models.contract_mst_model import ContractMstModel
            contract_count = self.session.query(func.count(ContractMstModel.id))\
                .filter(ContractMstModel.company_id == company_id)\
                .scalar()
            
            if contract_count > 0:
                return {
                    'success': False,
                    'message': f'该客户有 {contract_count} 个相关合同，无法删除',
                    'errors': ['存在关联合同记录']
                }
            
            # 删除客户
            self.session.delete(company)
            self.session.commit()
            
            return {
                'success': True,
                'message': '客户删除成功',
                'data': {'id': company_id}
            }
            
        except Exception as e:
            self.session.rollback()
            return {
                'success': False,
                'message': f'删除客户失败: {str(e)}',
                'errors': [str(e)]
            }