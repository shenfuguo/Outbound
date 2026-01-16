# services/file_service/file_service.py
from typing import List, Dict, Any, Optional
from flask import send_file
from urllib.parse import quote
import os

from repositories.file_repositorie.file_repository import FileRepository
from utils.file_utils import format_file_size

class FileService:
    """文件管理服务 - 主要协调业务流程"""
    
    def __init__(self, db, config=None):
        self.db = db
        self.config = config or {}
        self.file_repo = FileRepository(db, config)
    
    def upload_file(self, file, file_type: str, original_name: str = None) -> Dict:
        """上传单个文件"""
        try:
            # 验证文件
            is_valid, message = self.file_repo.validate_upload(file, file_type)
            if not is_valid:
                return {'success': False, 'error': message}
            
            # 保存文件
            file_info = self.file_repo.save_uploaded_file(file, file_type, original_name)
            return {'success': True, 'data': file_info}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def batch_upload(self, files, file_type: str) -> Dict:
        """批量上传文件"""
        try:
            results = self.file_repo.batch_upload_files(files, file_type)
            return {'success': True, 'data': results}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def get_files(self, file_type: str = None, keyword: str = None) -> Dict:
        """获取文件列表"""
        try:
            if keyword:
                files = self.file_repo.search_files(keyword, file_type)
            elif file_type:
                files = self.file_repo.get_by_file_type(file_type)
            else:
                files = self.file_repo.get_all()
            
            file_list = [file.to_response_dict() for file in files]
            return {
                'success': True,
                'data': {
                    'files': file_list,
                    'total': len(file_list)
                }
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def get_file_by_id(self, file_id: str) -> Dict:
        """根据ID获取文件"""
        try:
            file = self.file_repo.get_by_id(file_id)
            if file:
                return {'success': True, 'data': file.to_response_dict()}
            else:
                return {'success': False, 'error': '文件不存在'}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def delete_file(self, file_id: str) -> Dict:
        """删除文件"""
        try:
            success = self.file_repo.delete_file_with_physical(file_id)
            if success:
                return {'success': True, 'message': '文件删除成功'}
            else:
                return {'success': False, 'error': '文件不存在'}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def batch_delete(self, file_ids: List[str]) -> Dict:
        """批量删除文件"""
        try:
            results = self.file_repo.batch_delete_files(file_ids)
            return {
                'success': True,
                'data': results,
                'message': f"批量删除完成，成功{len(results['deleted'])}个，失败{len(results['failed'])}个"
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def download_file(self, file_id: str):
        """下载文件"""
        try:
            file = self.file_repo.get_by_id(file_id)
            if not file or not os.path.exists(file.file_path):
                return None
            
            resp = send_file(
                file.file_path,
                as_attachment=True,
                download_name=file.original_name,
                mimetype=file.mime_type
            )
            try:
                resp.headers['Content-Disposition'] = f"attachment; filename*=UTF-8''{quote(file.original_name)}"
            except Exception:
                safe_name = ''.join(c for c in file.original_name if ord(c) < 256)
                resp.headers['Content-Disposition'] = f'attachment; filename="{safe_name}"'

            return resp
        except Exception as e:
            # print(f"下载文件失败: {e}")
            return None
    
    def get_stats(self) -> Dict:
        """获取统计信息"""
        try:
            raw_stats = self.file_repo.get_file_stats()
            
            # 格式化统计信息
            formatted_stats = {
                'total_files': raw_stats.get('total_files', 0),
                'total_size': raw_stats.get('total_size', 0),
                'total_size_formatted': format_file_size(raw_stats.get('total_size', 0)),
                'by_type': []
            }
            
            for type_stat in raw_stats.get('by_type', []):
                formatted_stats['by_type'].append({
                    'file_type': type_stat.get('file_type'),
                    'count': type_stat.get('count', 0),
                    'size': type_stat.get('size', 0),
                    'size_formatted': format_file_size(type_stat.get('size', 0))
                })
            
            return {'success': True, 'data': formatted_stats}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def get_file_content(self, file_id: str) -> Dict:
        """获取文件内容"""
        try:
            content = self.file_repo.get_file_content(file_id)
            if content:
                return {'success': True, 'data': content}
            else:
                return {'success': False, 'error': '文件内容不存在'}
        except Exception as e:
            return {'success': False, 'error': str(e)}