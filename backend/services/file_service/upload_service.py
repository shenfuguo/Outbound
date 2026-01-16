# services/file_service/upload_service.py
from typing import Dict, Tuple
from repositories.file_repositorie.file_repository import FileRepository
from utils.db_helper import get_db

class UploadService:
    """文件上传服务 - 封装Repository的完整功能"""
    
    def __init__(self, db, config):
        self.db = db
        self.config = config
        self.file_repo = FileRepository(db, config)
        self.logger = config.get('logger')
    
    def validate_upload(self, file, file_type: str) -> Tuple[bool, str]:
        """验证上传文件 - 调用Repository的验证"""
        return self.file_repo.validate_upload(file, file_type)
    
    def save_file(self, file, file_type: str, original_name: str = None, company_id: str = None) -> Dict:
        """保存文件 - 调用Repository的保存方法"""
        return self.file_repo.save_uploaded_file(file, file_type, original_name, company_id=company_id)
    
    def batch_upload(self, files, file_type: str, company_id: str = None) -> Dict:
        """批量上传文件"""
        return self.file_repo.batch_upload_files(files, file_type, company_id=company_id)
    def get_file_stats(self) -> Dict:
        """获取文件统计信息"""
        return self.file_repo.get_file_stats()
    
    def search_files(self, keyword: str, file_type: str = None) -> list:
        """搜索文件"""
        return self.file_repo.search_files(keyword, file_type)
    
    def get_file_by_id(self, file_id: str):
        """根据ID获取文件"""
        return self.file_repo.get_by_id(file_id)
    
    def delete_file(self, file_id: str) -> bool:
        """删除文件"""
        return self.file_repo.delete_file_with_physical(file_id)
    
    def batch_delete(self, file_ids: list) -> Dict:
        """批量删除文件"""
        return self.file_repo.batch_delete_files(file_ids)