# repositories/contract_repository/contract_repository.py
from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy import func, desc, asc, or_, and_
from sqlalchemy.orm import joinedload

from models.contract_model import ContractModel
from ..base_repository import BaseRepository
from utils.time_utils import beijing_time

class ContractRepository(BaseRepository[ContractModel]):
    """合同仓储类"""
    
    def __init__(self, db, config=None):
        super().__init__(ContractModel, db)
        self.config = config or {}
    
    def get_by_company_id(self, company_id: str) -> List[ContractModel]:
        """根据公司ID获取合同列表"""
        return self.filter_by(company_id=company_id)
    
    def get_contracts_with_company(self, company_id: str = None) -> List[ContractModel]:
        """获取合同列表（可带公司信息）"""
        query = self.session.query(ContractModel)
        
        if company_id:
            query = query.filter(ContractModel.company_id == company_id)
        
        # 按更新时间倒序排列
        query = query.order_by(desc(ContractModel.updated_at))
        
        return query.all()
    
    def search_contracts(self, keyword: str = None, company_id: str = None) -> List[ContractModel]:
        """搜索合同"""
        query = self.session.query(ContractModel)
        
        # 按公司过滤
        if company_id:
            query = query.filter(ContractModel.company_id == company_id)
        
        # 关键字搜索
        if keyword:
            search_conditions = []
            search_fields = ['contract_title', 'main_content', 'memo', 'file_name']
            
            for field in search_fields:
                if hasattr(ContractModel, field):
                    field_attr = getattr(ContractModel, field)
                    search_conditions.append(field_attr.ilike(f'%{keyword}%'))
            
            if search_conditions:
                query = query.filter(or_(*search_conditions))
        
        return query.order_by(desc(ContractModel.updated_at)).all()
    
    def get_contract_stats(self, company_id: str = None) -> Dict[str, Any]:
        """获取合同统计信息"""
        query = self.session.query(
            func.count(ContractModel.id).label('total_contracts'),
            func.sum(ContractModel.contract_amount).label('total_amount'),
            func.sum(ContractModel.paid_amount).label('total_paid'),
            func.avg(ContractModel.contract_amount).label('avg_amount')
        )
        
        if company_id:
            query = query.filter(ContractModel.company_id == company_id)
        
        stats = query.first()
        
        return {
            'totalContracts': stats.total_contracts or 0,
            'totalAmount': float(stats.total_amount) if stats.total_amount else 0,
            'totalPaid': float(stats.total_paid) if stats.total_paid else 0,
            'totalRemaining': float(stats.total_amount - stats.total_paid) if stats.total_amount and stats.total_paid else 0,
            'avgAmount': float(stats.avg_amount) if stats.avg_amount else 0
        }
    
    def get_expiring_contracts(self, days: int = 30) -> List[ContractModel]:
        """获取即将到期的合同"""
        from datetime import datetime, timedelta
        from sqlalchemy import Date
        
        end_date = datetime.now().date() + timedelta(days=days)
        
        return self.session.query(ContractModel)\
            .filter(
                ContractModel.end_date <= end_date,
                ContractModel.end_date >= datetime.now().date(),
                ContractModel.status == 'active'
            )\
            .order_by(ContractModel.end_date)\
            .all()
    
    def get_overdue_contracts(self) -> List[ContractModel]:
        """获取已过期的合同"""
        from datetime import datetime
        
        return self.session.query(ContractModel)\
            .filter(
                ContractModel.end_date < datetime.now().date(),
                ContractModel.status == 'active'
            )\
            .order_by(ContractModel.end_date)\
            .all()
    
    def get_paginated_contracts(self, page=1, page_size=10, company_id=None, keyword=None):
        """获取分页合同列表"""
        try:
            query = self.session.query(ContractModel)
            
            # 应用公司ID过滤
            if company_id and company_id != "all":
                query = query.filter(ContractModel.company_id == company_id)
            
            # 应用关键字搜索
            if keyword:
                query = query.filter(
                    or_(
                        ContractModel.contract_title.ilike(f'%{keyword}%'),
                        ContractModel.main_content.ilike(f'%{keyword}%'),
                        ContractModel.memo.ilike(f'%{keyword}%')
                    )
                )
            
            # 计算总数
            total = query.count()
            
            # 计算分页
            total_pages = (total + page_size - 1) // page_size
            offset = (page - 1) * page_size
            
            # 获取当前页数据
            query = query.order_by(desc(ContractModel.updated_at))
            contracts = query.offset(offset).limit(page_size).all()
            
            return {
                'items': contracts,
                'total': total,
                'page': page,
                'pageSize': page_size,
                'totalPages': total_pages
            }
            
        except Exception as e:
            self.logger.error(f"获取分页合同列表错误: {str(e)}")
            raise
    
    def get_next_payment_date(self, contract_id: str):
        """获取下一个付款日期"""
        from datetime import datetime, timedelta
        
        contract = self.get_by_id(contract_id)
        if not contract:
            return None
        
        # 这里可以根据业务逻辑计算下一个付款日期
        # 例如：如果设置了final_payment_date，就返回它
        if contract.final_payment_date and contract.final_payment_date > datetime.now().date():
            return contract.final_payment_date
        
        return None
    
    def batch_update_contracts(self, contract_ids: List[str], data: Dict) -> Dict[str, List]:
        """批量更新合同"""
        results = {'success': [], 'failed': []}
        
        for contract_id in contract_ids:
            try:
                if self.update(contract_id, data):
                    results['success'].append(contract_id)
                else:
                    results['failed'].append({
                        'contract_id': contract_id,
                        'error': '合同不存在'
                    })
            except Exception as e:
                results['failed'].append({
                    'contract_id': contract_id,
                    'error': str(e)
                })
        
        return results
    
    def batch_delete_contracts(self, contract_ids: List[str]) -> Dict[str, List]:
        """批量删除合同"""
        results = {'deleted': [], 'failed': []}
        
        for contract_id in contract_ids:
            try:
                if self.delete(contract_id):
                    results['deleted'].append(contract_id)
                else:
                    results['failed'].append({
                        'contract_id': contract_id,
                        'error': '合同不存在'
                    })
            except Exception as e:
                results['failed'].append({
                    'contract_id': contract_id,
                    'error': str(e)
                })
        
        return results