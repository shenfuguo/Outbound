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
        required_fields = ['company_name', 'customer_name1', 'customer_phone1']
        for field in required_fields:
            if not data.get(field):
                errors.append(f"{self._get_field_display_name(field)}不能为空")
        
        # 公司名称唯一性检查
        if data.get('company_name'):
            existing = self.filter_by(company_name=data['company_name'])
            if existing and (not data.get('id') or existing[0].id != data.get('id')):
                errors.append(f"公司名称 '{data['company_name']}' 已存在")
        
        # 电话号码格式验证
        if data.get('customer_phone1'):
            if not self._validate_phone_format(data['customer_phone1']):
                errors.append("主要联系人电话格式不正确")
        
        if data.get('customer_phone2'):
            if not self._validate_phone_format(data['customer_phone2']):
                errors.append("备用联系人电话格式不正确")
        
        is_valid = len(errors) == 0
        message = "验证通过" if is_valid else "存在验证错误"
        
        return is_valid, message, errors
    
    def _get_field_display_name(self, field_name: str) -> str:
        """获取字段显示名称"""
        field_names = {
            'company_name': '公司名称',
            'company_address': '公司地址',
            'customer_name1': '主要联系人姓名',
            'customer_phone1': '主要联系人电话',
            'customer_name2': '备用联系人姓名',
            'customer_phone2': '备用联系人电话',
            'remarks': '备注'
        }
        return field_names.get(field_name, field_name)
    
    def _validate_phone_format(self, phone: str) -> bool:
        """验证电话号码格式"""
        import re
        # 支持手机号和座机
        phone_pattern = r'^1[3-9]\d{9}$|^\d{3,4}-\d{7,8}$'
        return bool(re.match(phone_pattern, phone))
    
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
            
            # 生成ID（如果未提供）
            if 'id' not in data or not data['id']:
                data['id'] = CompanyMstModel.get_next_company_id()
            
            # 创建记录
            company = self.create(**data)
            
            return {
                'success': True,
                'message': '客户创建成功',
                'data': company.to_response_dict()
            }
            
        except Exception as e:
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
            print(f"公司数据: {company}")
            if not company:
                return {
                    'success': False,
                    'message': f'客户不存在: {company_id}',
                    'errors': ['客户不存在']
                }
            
            # 验证数据
            data_with_id = {**data, 'id': company_id}
            print(f"验证数据: {data_with_id}")
            is_valid, message, errors = self.validate_company_data(data_with_id)
            print(f"验证结果 - is_valid: {is_valid}, message: {message}, errors: {errors}")
            if not is_valid:
                return {
                    'success': False,
                    'message': message,
                    'errors': errors
                }
            
            # 更新字段
            print(f"更新前公司数据: {data.items()}")
            for key, value in data.items():
                if hasattr(company, key):
                    setattr(company, key, value)
            
            # 保存
            self.db.session.commit()
            
            return {
                'success': True,
                'message': '客户更新成功',
                'data': company.to_response_dict()
            }
            
        except Exception as e:
            self.db.session.rollback()
            return {
                'success': False,
                'message': f'更新客户失败: {str(e)}',
                'errors': [str(e)]
            }
    
    def search_companies(self, keyword: str = None) -> List[CompanyMstModel]:
        """搜索客户"""
        query = self.session.query(CompanyMstModel)
        
        if keyword:
            search_conditions = []
            search_fields = [
                'company_name', 
                'company_address', 
                'customer_name1', 
                'customer_phone1',
                'customer_name2',
                'customer_phone2',
                'remarks'
            ]
            
            for field in search_fields:
                if hasattr(CompanyMstModel, field):
                    field_attr = getattr(CompanyMstModel, field)
                    search_conditions.append(field_attr.ilike(f'%{keyword}%'))
            
            if search_conditions:
                query = query.filter(or_(*search_conditions))
        
        return query.order_by(CompanyMstModel.company_name).all()
    
    def get_companies_by_name(self, company_name: str) -> List[CompanyMstModel]:
        """根据公司名称获取客户"""
        return self.filter_by(company_name=company_name)
    
    def get_companies_stats(self) -> Dict[str, Any]:
        """获取客户统计信息"""
        stats = {}
        
        # 总客户数
        total_count = self.session.query(func.count(CompanyMstModel.id)).scalar()
        stats['total_companies'] = total_count
        
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
            '客户ID', '公司名称', '公司地址', 
            '主要联系人', '主要电话', 
            '备用联系人', '备用电话', 
            '备注', '创建时间', '更新时间'
        ]
        writer.writerow(headers)
        
        # 写入数据
        for company in companies:
            writer.writerow([
                company.id,
                company.company_name or '',
                company.company_address or '',
                company.customer_name1 or '',
                company.customer_phone1 or '',
                company.customer_name2 or '',
                company.customer_phone2 or '',
                company.remarks or '',
                company.created_at.strftime('%Y-%m-%d %H:%M:%S') if company.created_at else '',
                company.updated_at.strftime('%Y-%m-%d %H:%M:%S') if company.updated_at else ''
            ])
        
        return output.getvalue()