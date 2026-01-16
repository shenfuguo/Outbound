# services/company_service/company_service.py
from typing import List, Optional, Dict, Any, Tuple
from repositories.company_repository.company_repository import CompanyRepository

class CompanyService:
    """客户信息服务"""
    
    def __init__(self, db, config=None):
        self.db = db
        self.config = config or {}
        self.company_repo = CompanyRepository(db, config)
    
    def create_company(self, data: Dict) -> Dict:
        """创建客户"""
        return self.company_repo.create_company(data)
    
    def update_company(self, company_id: str, data: Dict) -> Dict:
        """更新客户"""
        return self.company_repo.update_company(company_id, data)
    
    def get_company(self, company_id: str) -> Optional[Dict]:
        """获取单个客户"""
        company = self.company_repo.get_by_id(company_id)
        return company.to_response_dict() if company else None
    
    def get_all_companies(self) -> List[Dict]:
        """获取所有客户"""
        companies = self.company_repo.get_all()
        return [company.to_response_dict() for company in companies]
    
    def get_companies_list(self) -> List[Dict]:
        """获取客户列表（简化版，用于下拉选择）"""
        companies = self.company_repo.get_all()
        return [company.to_simple_dict() for company in companies]
    
    def search_companies(self, keyword: str = None) -> List[Dict]:
        """搜索客户"""
        companies = self.company_repo.search_companies(keyword)
        return [company.to_response_dict() for company in companies]
    
    def delete_company(self, company_id: str) -> Dict:
        """删除客户"""
        try:
            success = self.company_repo.delete(company_id)
            return {
                'success': success,
                'message': '客户删除成功' if success else '客户不存在',
                'data': {'deleted_id': company_id}
            }
        except Exception as e:
            return {
                'success': False,
                'message': f'删除客户失败: {str(e)}',
                'errors': [str(e)]
            }
    
    def batch_delete_companies(self, company_ids: List[str]) -> Dict:
        """批量删除客户"""
        results = {
            'success': [],
            'failed': []
        }
        
        for company_id in company_ids:
            try:
                success = self.company_repo.delete(company_id)
                if success:
                    results['success'].append(company_id)
                else:
                    results['failed'].append({
                        'id': company_id,
                        'error': '客户不存在'
                    })
            except Exception as e:
                results['failed'].append({
                    'id': company_id,
                    'error': str(e)
                })
        
        return {
            'success': len(results['success']) > 0,
            'message': f'批量删除完成，成功: {len(results["success"])}, 失败: {len(results["failed"])}',
            'data': results
        }
    
    def get_company_stats(self) -> Dict[str, Any]:
        """获取客户统计"""
        return self.company_repo.get_companies_stats()
    
    def validate_company_data(self, data: Dict) -> Tuple[bool, str, List[str]]:
        """验证客户数据"""
        return self.company_repo.validate_company_data(data)
    
    def export_companies(self) -> Dict:
        """导出客户数据"""
        try:
            csv_data = self.company_repo.export_companies_to_csv()
            return {
                'success': True,
                'message': '导出成功',
                'data': {
                    'format': 'csv',
                    'content': csv_data,
                    'filename': f'customers_export_{self._get_current_time()}.csv'
                }
            }
        except Exception as e:
            return {
                'success': False,
                'message': f'导出失败: {str(e)}',
                'errors': [str(e)]
            }
    
    def _get_current_time(self):
        """获取当前时间字符串"""
        from datetime import datetime
        return datetime.now().strftime('%Y%m%d_%H%M%S')