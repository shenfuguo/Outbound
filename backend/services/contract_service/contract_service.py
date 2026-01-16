# services/contract_service/contract_service.py
from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime, date
from decimal import Decimal
import mimetypes
import os

from repositories.contract_repository.contract_repository import ContractRepository
from repositories.file_repositorie.file_repository import FileRepository
from models.file_upd_model import FileUpdModel

class ContractService:
    """合同服务"""
    
    def __init__(self, db, config=None):
        self.db = db
        self.config = config or {}
        self.contract_repo = ContractRepository(db, config)
        self.file_repo = FileRepository(db, config) if config else None
    
    def create_contract(self, data: Dict) -> Dict:
        """创建合同"""
        try:
            # 验证必填字段
            required_fields = ['companyId', 'contractAmount', 'startDate', 'endDate']
            missing_fields = [field for field in required_fields if field not in data or not data[field]]
            
            if missing_fields:
                return {
                    'success': False,
                    'message': f'缺少必填字段: {", ".join(missing_fields)}',
                    'errors': missing_fields
                }
            
            # 转换字段名
            backend_data = self._convert_to_backend_format(data)
            
            # 验证金额
            try:
                contract_amount = Decimal(str(backend_data.get('contract_amount', 0)))
                paid_amount = Decimal(str(backend_data.get('paid_amount', 0)))
                
                if contract_amount < 0 or paid_amount < 0:
                    return {
                        'success': False,
                        'message': '金额不能为负数',
                        'errors': ['金额格式错误']
                    }
                
                if paid_amount > contract_amount:
                    return {
                        'success': False,
                        'message': '已付金额不能大于合同金额',
                        'errors': ['金额逻辑错误']
                    }
                
                backend_data['contract_amount'] = contract_amount
                backend_data['paid_amount'] = paid_amount
                
            except (ValueError, TypeError) as e:
                return {
                    'success': False,
                    'message': f'金额格式错误: {str(e)}',
                    'errors': ['金额格式错误']
                }
            
            # 验证日期
            try:
                start_date = self._parse_date(backend_data.get('start_date'))
                end_date = self._parse_date(backend_data.get('end_date'))
                
                if start_date and end_date and start_date > end_date:
                    return {
                        'success': False,
                        'message': '开始日期不能晚于结束日期',
                        'errors': ['日期逻辑错误']
                    }
                
                if start_date:
                    backend_data['start_date'] = start_date
                if end_date:
                    backend_data['end_date'] = end_date
                
                # 验证尾款日期
                if backend_data.get('final_payment_date'):
                    final_payment_date = self._parse_date(backend_data['final_payment_date'])
                    if final_payment_date:
                        backend_data['final_payment_date'] = final_payment_date
                
            except (ValueError, TypeError) as e:
                return {
                    'success': False,
                    'message': f'日期格式错误: {str(e)}',
                    'errors': ['日期格式错误']
                }
            
            # 如果有文件ID，获取文件信息
            if backend_data.get('file_id'):
                file_info = self._get_file_info(backend_data['file_id'])
                if file_info:
                    backend_data['file_path'] = file_info.get('file_path')
                    backend_data['file_name'] = file_info.get('original_name')
            
            # 创建合同
            contract = self.contract_repo.create(**backend_data)
            
            if contract:
                return {
                    'success': True,
                    'message': '合同创建成功',
                    'data': contract.to_response_dict()
                }
            else:
                return {
                    'success': False,
                    'message': '合同创建失败',
                    'errors': ['创建失败']
                }
            
        except Exception as e:
            return {
                'success': False,
                'message': f'创建合同失败: {str(e)}',
                'errors': [str(e)]
            }
    
    def update_contract(self, contract_id: str, data: Dict) -> Dict:
        """更新合同"""
        try:
            # 检查合同是否存在
            contract = self.contract_repo.get_by_id(contract_id)
            
            if not contract:
                return {
                    'success': False,
                    'message': '合同不存在',
                    'errors': ['合同不存在']
                }
            
            # 转换字段名
            backend_data = self._convert_to_backend_format(data)
            
            # 验证金额
            if 'contract_amount' in backend_data or 'paid_amount' in backend_data:
                contract_amount = Decimal(str(backend_data.get('contract_amount', contract.contract_amount)))
                paid_amount = Decimal(str(backend_data.get('paid_amount', contract.paid_amount)))
                
                if contract_amount < 0 or paid_amount < 0:
                    return {
                        'success': False,
                        'message': '金额不能为负数',
                        'errors': ['金额格式错误']
                    }
                
                if paid_amount > contract_amount:
                    return {
                        'success': False,
                        'message': '已付金额不能大于合同金额',
                        'errors': ['金额逻辑错误']
                    }
                
                backend_data['contract_amount'] = contract_amount
                backend_data['paid_amount'] = paid_amount
            
            # 验证日期
            if 'start_date' in backend_data or 'end_date' in backend_data:
                start_date = self._parse_date(backend_data.get('start_date', contract.start_date))
                end_date = self._parse_date(backend_data.get('end_date', contract.end_date))
                
                if start_date and end_date and start_date > end_date:
                    return {
                        'success': False,
                        'message': '开始日期不能晚于结束日期',
                        'errors': ['日期逻辑错误']
                    }
                
                if start_date:
                    backend_data['start_date'] = start_date
                if end_date:
                    backend_data['end_date'] = end_date
            
            # 验证尾款日期
            if 'final_payment_date' in backend_data:
                if backend_data['final_payment_date']:
                    final_payment_date = self._parse_date(backend_data['final_payment_date'])
                    if final_payment_date:
                        backend_data['final_payment_date'] = final_payment_date
                else:
                    backend_data['final_payment_date'] = None
            
            # 如果有文件ID，获取文件信息
            if 'file_id' in backend_data and backend_data['file_id']:
                file_info = self._get_file_info(backend_data['file_id'])
                if file_info:
                    backend_data['file_path'] = file_info.get('file_path')
                    backend_data['file_name'] = file_info.get('original_name')
            
            # 更新合同
            if self.contract_repo.update(contract_id, **backend_data):
                updated_contract = self.contract_repo.get_by_id(contract_id)
                return {
                    'success': True,
                    'message': '合同更新成功',
                    'data': updated_contract.to_response_dict()
                }
            else:
                return {
                    'success': False,
                    'message': '合同更新失败',
                    'errors': ['更新失败']
                }
            
        except Exception as e:
            return {
                'success': False,
                'message': f'更新合同失败: {str(e)}',
                'errors': [str(e)]
            }
    
    def get_contract(self, contract_id: str) -> Optional[Dict]:
        """获取单个合同"""
        contract = self.contract_repo.get_by_id(contract_id)
        return contract.to_response_dict() if contract else None
    
    def get_company_contracts(self, company_id: str) -> List[Dict]:
        """获取公司合同列表"""
        contracts = self.contract_repo.get_by_company_id(company_id)
        return [contract.to_response_dict() for contract in contracts]
    
    def get_all_contracts(self) -> List[Dict]:
        """获取所有合同"""
        contracts = self.contract_repo.get_all()
        return [contract.to_response_dict() for contract in contracts]
    
    def search_contracts(self, keyword: str = None, company_id: str = None) -> List[Dict]:
        """搜索合同"""
        contracts = self.contract_repo.search_contracts(keyword, company_id)
        return [contract.to_response_dict() for contract in contracts]
    
    def delete_contract(self, contract_id: str) -> Dict:
        """删除合同"""
        try:
            success = self.contract_repo.delete(contract_id)
            return {
                'success': success,
                'message': '合同删除成功' if success else '合同不存在',
                'data': {'deleted_id': contract_id}
            }
        except Exception as e:
            return {
                'success': False,
                'message': f'删除合同失败: {str(e)}',
                'errors': [str(e)]
            }
    
    def get_contract_stats(self, company_id: str = None) -> Dict[str, Any]:
        """获取合同统计信息"""
        return self.contract_repo.get_contract_stats(company_id)
    
    def get_expiring_contracts(self, days: int = 30) -> List[Dict]:
        """获取即将到期的合同"""
        contracts = self.contract_repo.get_expiring_contracts(days)
        return [contract.to_response_dict() for contract in contracts]
    
    def get_overdue_contracts(self) -> List[Dict]:
        """获取已过期的合同"""
        contracts = self.contract_repo.get_overdue_contracts()
        return [contract.to_response_dict() for contract in contracts]
    
    def validate_contract_data(self, data: Dict) -> Tuple[bool, str, List[str]]:
        """验证合同数据"""
        errors = []
        
        # 验证必填字段
        required_fields = ['companyId', 'contractAmount', 'startDate', 'endDate']
        for field in required_fields:
            if field not in data or not data[field]:
                errors.append(f'{field}不能为空')
        
        # 验证金额
        try:
            contract_amount = Decimal(str(data.get('contractAmount', 0)))
            paid_amount = Decimal(str(data.get('paidAmount', 0)))
            
            if contract_amount < 0 or paid_amount < 0:
                errors.append('金额不能为负数')
            
            if paid_amount > contract_amount:
                errors.append('已付金额不能大于合同金额')
        except (ValueError, TypeError):
            errors.append('金额格式错误')
        
        # 验证日期
        try:
            start_date = self._parse_date(data.get('startDate'))
            end_date = self._parse_date(data.get('endDate'))
            
            if start_date and end_date and start_date > end_date:
                errors.append('开始日期不能晚于结束日期')
        except (ValueError, TypeError):
            errors.append('日期格式错误')
        
        is_valid = len(errors) == 0
        message = '验证通过' if is_valid else '数据验证失败'
        
        return is_valid, message, errors
    
    def _convert_to_backend_format(self, frontend_data: Dict) -> Dict:
        """前端字段名转换为后端字段名"""
        field_mapping = {
            'companyId': 'company_id',
            'contractTitle': 'contract_title',
            'contractAmount': 'contract_amount',
            'paidAmount': 'paid_amount',
            'startDate': 'start_date',
            'endDate': 'end_date',
            'finalPaymentDate': 'final_payment_date',
            'finalPaymentAmount': 'final_payment_amount',
            'fileId': 'file_id',
            'fileUrl': 'file_path',
            'fileName': 'file_name',
            'mainContent': 'main_content',
            'memo': 'memo',
            'status': 'status'
        }
        
        backend_data = {}
        for frontend_key, value in frontend_data.items():
            if frontend_key in field_mapping:
                backend_key = field_mapping[frontend_key]
                backend_data[backend_key] = value
            else:
                backend_data[frontend_key] = value
        
        return backend_data
    
    def _parse_date(self, date_str):
        """解析日期字符串"""
        if not date_str:
            return None
        
        if isinstance(date_str, date):
            return date_str
        
        try:
            return datetime.strptime(str(date_str), '%Y-%m-%d').date()
        except ValueError:
            try:
                return datetime.strptime(str(date_str), '%Y/%m/%d').date()
            except ValueError:
                return None
    
    def _get_file_info(self, file_id: str) -> Optional[Dict]:
        """获取文件信息"""
        if not self.file_repo:
            return None
        
        try:
            file = self.file_repo.get_by_id(file_id)
            if file:
                return {
                    'file_path': file.file_path,
                    'original_name': file.original_name
                }
        except Exception as e:
            return None
        
        return None
    
    # 新增：获取文件预览信息
    def get_file_preview(self, file_id: str, company_id: str) -> Dict[str, Any]:
        """获取文件预览信息"""
        try:
            # 1. 从repository层获取文件信息
            if not self.file_repo:
                return {
                    'success': False,
                    'message': '文件服务未初始化',
                    'data': None
                }
            
            file_record = self.file_repo.get_by_id(file_id)
            print(f"客户ID: {company_id}")
            print(f"文件记录: {file_record}")
            
            if not file_record:
                return {
                    'success': False,
                    'message': f'文件不存在: {file_id}',
                    'data': None
                }
            
            # 2. 验证客户ID是否匹配
            if file_record.company_id != company_id:
                return {
                    'success': False,
                    'message': '无权访问此文件',
                    'data': None
                }
            
            # 3. 检查物理文件是否存在
            if not os.path.exists(file_record.file_path):
                return {
                    'success': False,
                    'message': f'物理文件不存在: {file_record.file_path}',
                    'data': None
                }
            
            # 4. 检查是否为PDF文件
            is_pdf = self._is_pdf_file(file_record)
            if not is_pdf:
                return {
                    'success': False,
                    'message': '仅支持PDF文件预览',
                    'data': None
                }
            
            # 5. 构建返回数据
            file_info = {
                'success': True,
                'message': '获取文件信息成功',
                'data': {
                    'fileId': file_record.id,
                    'filePath': file_record.file_path,
                    'fileName': file_record.original_name,
                    'fileSize': file_record.file_size,
                    'mimeType': file_record.mime_type or 'application/pdf',
                    'companyId': file_record.company_id,
                    'isPdf': is_pdf,
                    'pageCount': file_record.page_count or 0,
                    'uploadTime': file_record.upload_time.isoformat() if file_record.upload_time else None
                }
            }
            
            return file_info
            
        except Exception as e:
            error_msg = f'获取文件预览信息失败: {str(e)}'
            if self.config.get('logger'):
                self.config.get('logger').error(error_msg)
            return {
                'success': False,
                'message': error_msg,
                'data': None
            }
    
    # 新增：获取文件内容信息
    def get_file_content_info(self, file_id: str, company_id: str) -> Dict[str, Any]:
        """获取文件内容信息（用于下载/预览）"""
        try:
            # 1. 从repository层获取文件信息
            if not self.file_repo:
                return {
                    'success': False,
                    'message': '文件服务未初始化',
                    'data': None
                }
            
            file_record = self.file_repo.get_by_id(file_id)
            
            if not file_record:
                return {
                    'success': False,
                    'message': f'文件不存在: {file_id}',
                    'data': None
                }
            
            # 2. 验证客户ID是否匹配
            if file_record.company_id != company_id:
                return {
                    'success': False,
                    'message': '无权访问此文件',
                    'data': None
                }
            
            # 3. 检查物理文件是否存在
            if not os.path.exists(file_record.file_path):
                return {
                    'success': False,
                    'message': f'物理文件不存在: {file_record.file_path}',
                    'data': None
                }
            
            # 4. 获取MIME类型
            mime_type = self._get_file_mime_type(file_record)
            
            # 5. 返回文件信息
            return {
                'success': True,
                'message': '获取文件信息成功',
                'data': {
                    'file_path': file_record.file_path,
                    'file_name': file_record.original_name,
                    'mime_type': mime_type,
                    'file_size': file_record.file_size
                }
            }
            
        except Exception as e:
            error_msg = f'获取文件内容信息失败: {str(e)}'
            if self.config.get('logger'):
                self.config.get('logger').error(error_msg)
            return {
                'success': False,
                'message': error_msg,
                'data': None
            }
    
    # 新增：获取公司文件列表
    def get_company_files(self, company_id: str, file_type: str = None) -> Dict[str, Any]:
        """获取公司的文件列表"""
        try:
            if not self.file_repo:
                return {
                    'success': False,
                    'message': '文件服务未初始化',
                    'data': None
                }
            
            # 从repository层获取文件列表
            files = self.file_repo.get_by_company_id(company_id, file_type)
            
            # 转换为前端需要的格式
            file_list = []
            for file_record in files:
                file_list.append({
                    'id': file_record.id,
                    'fileName': file_record.original_name,
                    'fileSize': file_record.file_size,
                    'fileType': file_record.file_type,
                    'uploadTime': file_record.upload_time.isoformat() if file_record.upload_time else None,
                    'mimeType': file_record.mime_type or 'application/octet-stream',
                    'isPdf': self._is_pdf_file(file_record)
                })
            
            return {
                'success': True,
                'message': '获取文件列表成功',
                'data': {
                    'files': file_list,
                    'total': len(file_list)
                }
            }
            
        except Exception as e:
            error_msg = f'获取公司文件列表失败: {str(e)}'
            if self.config.get('logger'):
                self.config.get('logger').error(error_msg)
            return {
                'success': False,
                'message': error_msg,
                'data': None
            }
    
    # 新增：搜索文件
    def search_files(self, keyword: str, company_id: str = None, file_type: str = None) -> Dict[str, Any]:
        """搜索文件"""
        try:
            if not self.file_repo:
                return {
                    'success': False,
                    'message': '文件服务未初始化',
                    'data': None
                }
            
            # 从repository层搜索文件
            files = self.file_repo.search_files(keyword, file_type, company_id)
            
            # 转换为前端需要的格式
            file_list = []
            for file_record in files:
                file_list.append({
                    'id': file_record.id,
                    'fileName': file_record.original_name,
                    'companyId': file_record.company_id,
                    'fileSize': file_record.file_size,
                    'fileType': file_record.file_type,
                    'uploadTime': file_record.upload_time.isoformat() if file_record.upload_time else None,
                    'mimeType': file_record.mime_type or 'application/octet-stream',
                    'isPdf': self._is_pdf_file(file_record)
                })
            
            return {
                'success': True,
                'message': '搜索文件成功',
                'data': {
                    'files': file_list,
                    'total': len(file_list),
                    'keyword': keyword
                }
            }
            
        except Exception as e:
            error_msg = f'搜索文件失败: {str(e)}'
            if self.config.get('logger'):
                self.config.get('logger').error(error_msg)
            return {
                'success': False,
                'message': error_msg,
                'data': None
            }
    
    # 辅助方法
    def _is_pdf_file(self, file_record: FileUpdModel) -> bool:
        """检查是否为PDF文件"""
        if file_record.mime_type:
            return file_record.mime_type.lower() == 'application/pdf'
        elif file_record.original_name:
            return file_record.original_name.lower().endswith('.pdf')
        return False
    
    def _get_file_mime_type(self, file_record: FileUpdModel) -> str:
        """获取文件MIME类型"""
        if file_record.mime_type:
            return file_record.mime_type
        
        # 根据文件名猜测MIME类型
        mime_type, _ = mimetypes.guess_type(file_record.original_name)
        if mime_type:
            return mime_type
        
        # 默认返回PDF类型
        return 'application/pdf'
    
    def validate_file_access(self, file_id: str, company_id: str) -> Tuple[bool, Optional[FileUpdModel], str]:
        """验证文件访问权限"""
        try:
            if not self.file_repo:
                return False, None, '文件服务未初始化'
            
            file_record = self.file_repo.get_by_id(file_id)
            
            if not file_record:
                return False, None, '文件不存在'
            
            if file_record.company_id != company_id:
                return False, file_record, '无权访问此文件'
            
            if not os.path.exists(file_record.file_path):
                return False, file_record, '物理文件不存在'
            
            return True, file_record, '验证通过'
            
        except Exception as e:
            return False, None, f'验证失败: {str(e)}'