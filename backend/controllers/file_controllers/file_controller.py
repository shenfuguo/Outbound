# controllers/file_controllers/file_controller.py
from flask import Blueprint, request, jsonify, current_app, send_file
from flask.views import MethodView
from services.file_service.upload_service import UploadService
from services.file_service.file_service import FileService
from utils.response import success_200, error_400, error_500, error_404
from utils.db_helper import get_db
from utils.file_utils import format_file_size
from urllib.parse import quote
import os

# 创建蓝图
file_bp = Blueprint('file', __name__)

class FileUploadAPI(MethodView):
    """文件上传API类"""
    
    def post(self):
        """单文件上传"""
        try:
            # print("接收到文件上传请求", request.form)
            if 'file' not in request.files:
                return error_400('没有选择文件', 400)
            
            file = request.files['file']
            file_type = request.form.get('fileType', '1')
            original_filename = request.form.get('fileName', '')
            company_id = request.form.get('companyId')

            db = get_db()
            upload_service = UploadService(db, current_app.config)
            
            # 验证文件
            is_valid, message = upload_service.validate_upload(file, file_type)
            if not is_valid:
                return error_400(message, 400)
            
            # 保存文件
            file_info = upload_service.save_file(file, file_type, original_filename, company_id=company_id)
            
            return success_200('success', file_info)
            
        except Exception as e:
            current_app.logger.error(f'文件上传错误: {str(e)}')
            return error_500(f'上传失败: {str(e)}', 500)

class FileListAPI(MethodView):
    """文件列表API类（支持分页）"""
    
    def get(self):
        """获取文件列表（支持分页、搜索、类型过滤）"""
        try:
            # 获取查询参数
            file_type = request.args.get('type', '')
            search = request.args.get('search', '')
            page = request.args.get('page', 1, type=int)
            page_size = request.args.get('pageSize', 10, type=int)
            company_id = request.args.get('companyId', None) 
            
            # 验证分页参数
            if page < 1:
                page = 1
            if page_size < 1 or page_size > 100:
                page_size = 10
            
            db = get_db()
            from repositories.file_repositorie.file_repository import FileRepository
            
            file_repo = FileRepository(db, current_app.config)
            
            # 如果有关键字搜索，使用搜索方法
            if search:
                # 先搜索，然后手动分页
                upload_service = UploadService(db, current_app.config)
                all_files = upload_service.search_files(search, file_type if file_type else None)
                
                # 计算分页信息
                total = len(all_files)
                total_pages = (total + page_size - 1) // page_size
                start_index = (page - 1) * page_size
                end_index = min(start_index + page_size, total)
                
                if start_index < total:
                    paginated_files = all_files[start_index:end_index]
                else:
                    paginated_files = []
                
                file_list = [file.to_response_dict() for file in paginated_files]
                
            else:
                # 使用分页查询
                result = file_repo.get_paginated_files(
                    page=page,
                    page_size=page_size,
                    file_type=file_type if file_type else None,
                    company_id=company_id
                )

                # print(f"Paginated result from repo: {result}")
                
                file_list = [file.to_response_dict() for file in result['items']]
                total = result['total']
                total_pages = result['totalPages']
                print(f"Total files: {total}, Total pages: {total_pages}")
            
            return success_200('获取文件列表成功', {
                'items': file_list,
                'total': total,
                'page': page,
                'pageSize': page_size,
                'totalPages': total_pages
            })
            
        except Exception as e:
            current_app.logger.error(f'获取文件列表错误: {str(e)}')
            return error_500(f'获取文件列表失败: {str(e)}', 500)

class FileDetailAPI(MethodView):
    """文件详情API类"""
    
    def get(self, file_id):
        """获取文件详情"""
        try:
            db = get_db()
            upload_service = UploadService(db, current_app.config)
            
            file = upload_service.get_file_by_id(file_id)
            
            if not file:
                return error_404('文件不存在', 404)
            
            return success_200('获取文件信息成功', file.to_response_dict())
            
        except Exception as e:
            current_app.logger.error(f'获取文件信息错误: {str(e)}')
            return error_500(f'获取文件信息失败: {str(e)}', 500)
    
    def delete(self, file_id):
        """删除单个文件"""
        try:
            db = get_db()
            upload_service = UploadService(db, current_app.config)
            
            success = upload_service.delete_file(file_id)
            
            if success:
                return success_200('文件删除成功')
            else:
                return error_404('文件不存在', 404)
            
        except Exception as e:
            current_app.logger.error(f'删除文件错误: {str(e)}')
            return error_500(f'删除文件失败: {str(e)}', 500)

class FileDownloadAPI(MethodView):
    """文件下载API类"""
    
    def get(self, file_id):
        """下载文件"""
        try:
            db = get_db()
            upload_service = UploadService(db, current_app.config)
            
            file = upload_service.get_file_by_id(file_id)
            
            if not file or not os.path.exists(file.file_path):
                return error_404('文件不存在', 404)
            
            # 使用 send_file 生成响应后，显式设置 Content-Disposition 为 RFC5987 格式，
            # 以避免包含非 Latin-1 字符（例如中文）时导致底层 http.server 编码错误。
            resp = send_file(
                file.file_path,
                as_attachment=True,
                download_name=file.original_name,
                mimetype=file.mime_type
            )
            try:
                # 使用 filename* 指定 UTF-8 编码的文件名（仅包含 ASCII 字符）
                resp.headers['Content-Disposition'] = f"attachment; filename*=UTF-8''{quote(file.original_name)}"
            except Exception:
                # 如果设置失败，退回到不包含中文的简化文件名（安全兜底）
                safe_name = ''.join(c for c in file.original_name if ord(c) < 256)
                resp.headers['Content-Disposition'] = f'attachment; filename="{safe_name}"'

            return resp
            
        except Exception as e:
            current_app.logger.error(f'下载文件错误: {str(e)}')
            return error_500(f'下载文件失败: {str(e)}', 500)

class FileBatchAPI(MethodView):
    """批量文件操作API类"""
    
    def post(self):
        """批量上传文件"""
        try:
            if 'files' not in request.files:
                return error_400('没有选择文件', 400)
            
            files = request.files.getlist('files')
            file_type = request.form.get('fileType', '1')
            
            if not files:
                return error_400('文件列表为空', 400)
            
            db = get_db()
            upload_service = UploadService(db, current_app.config)
            
            # 使用Repository的批量上传方法
            results = upload_service.batch_upload(files, file_type)
            
            return success_200('批量上传完成', results)
            
        except Exception as e:
            current_app.logger.error(f'批量上传错误: {str(e)}')
            return error_500(f'批量上传失败: {str(e)}', 500)
    
    def delete(self):
        """批量删除文件"""
        try:
            file_ids = request.json.get('file_ids', [])
            
            if not file_ids:
                return error_400('请提供要删除的文件ID列表', 400)
            
            db = get_db()
            upload_service = UploadService(db, current_app.config)
            
            # 使用Repository的批量删除方法
            results = upload_service.batch_delete(file_ids)
            
            return success_200('批量删除完成', results)
            
        except Exception as e:
            current_app.logger.error(f'批量删除错误: {str(e)}')
            return error_500(f'批量删除失败: {str(e)}', 500)

# 创建视图实例
file_upload_view = FileUploadAPI.as_view('file_upload_api')
file_list_view = FileListAPI.as_view('file_list_api')
file_detail_view = FileDetailAPI.as_view('file_detail_api')
file_download_view = FileDownloadAPI.as_view('file_download_api')
file_batch_view = FileBatchAPI.as_view('file_batch_api')

# 注册路由
file_bp.add_url_rule(
    '/upload',
    view_func=file_upload_view,
    methods=['POST']
)

file_bp.add_url_rule(
    '/files',
    view_func=file_list_view,
    methods=['GET']
)

file_bp.add_url_rule(
    '/files/batch',
    view_func=file_batch_view,
    methods=['POST', 'DELETE']
)

file_bp.add_url_rule(
    '/files/<file_id>',
    view_func=file_detail_view,
    methods=['GET', 'DELETE']
)

file_bp.add_url_rule(
    '/files/<file_id>/download',
    view_func=file_download_view,
    methods=['GET']
)

# 文件统计路由
@file_bp.route('/files/stats', methods=['GET'])
def get_file_stats():
    """获取文件统计信息（适配前端格式）"""
    try:
        db = get_db()
        session = db.session if hasattr(db, 'session') else db
        upload_service = UploadService(session, current_app.config)
        
        raw_stats = upload_service.get_file_stats()
        # print(f"Raw stats from service: {raw_stats}")
        
        # 重新计算统计数据，适配前端格式
        total_files = raw_stats.get('total_files', 0)
        
        # 计算合同和图纸的数量
        contracts_count = 0
        drawings_count = 0
        
        for type_stat in raw_stats.get('by_type', []):
            file_type = type_stat.get('file_type')
            count = type_stat.get('count', 0)
            
            # 这里需要根据你的文件类型标识来调整
            if file_type == '1' or file_type == '合同':  # 假设 '1' 表示合同
                contracts_count = count
            elif file_type == '2' or file_type == '图纸':  # 假设 '2' 表示图纸
                drawings_count = count
        
        # 返回前端期望的格式
        stats_response = {
            'total': total_files,
            'contracts': contracts_count,
            'drawings': drawings_count
        }
        
        return success_200('获取统计信息成功', stats_response)
    except Exception as e:
        current_app.logger.error(f'获取统计信息错误: {str(e)}')
        return error_500(f'获取统计信息失败: {str(e)}', 500)

# 文件搜索路由
@file_bp.route('/files/search', methods=['GET'])
def search_files():
    """搜索文件"""
    try:
        keyword = request.args.get('q', '')
        file_type = request.args.get('fileType', '')
        
        if not keyword:
            return error_400('请输入搜索关键词', 400)
        
        db = get_db()
        upload_service = UploadService(db, current_app.config)
        
        files = upload_service.search_files(keyword, file_type if file_type else None)
        
        file_list = [file.to_response_dict() for file in files]
        
        return success_200('搜索完成', {
            'keyword': keyword,
            'results': file_list,
            'count': len(file_list)
        })
        
    except Exception as e:
        current_app.logger.error(f'搜索文件错误: {str(e)}')
        return error_500(f'搜索失败: {str(e)}', 500)

# 获取最近文件路由
@file_bp.route('/files/recent', methods=['GET'])
def get_recent_files():
    """获取最近上传的文件"""
    try:
        limit = request.args.get('limit', 10, type=int)
        
        db = get_db()
        from repositories.file_repositorie.file_repository import FileRepository
        
        file_repo = FileRepository(db, current_app.config)
        recent_files = file_repo.get_recent_files(limit)
        
        file_list = [file.to_response_dict() for file in recent_files]
        
        return success_200('获取最近文件成功', {
            'files': file_list,
            'total': len(file_list)
        })
        
    except Exception as e:
        current_app.logger.error(f'获取最近文件错误: {str(e)}')
        return error_500(f'获取最近文件失败: {str(e)}', 500)

# 获取文件内容路由
@file_bp.route('/files/<file_id>/content', methods=['GET'])
def get_file_content(file_id):
    """获取文件二进制内容"""
    try:
        db = get_db()
        from repositories.file_repositorie.file_repository import FileRepository
        
        file_repo = FileRepository(db, current_app.config)
        content = file_repo.get_file_content(file_id)
        
        if not content:
            return error_404('文件内容不存在', 404)
        
        # 获取文件信息用于响应头
        file = file_repo.get_by_id(file_id)
        
        # 返回二进制内容时也要保证 Content-Disposition 不含非 Latin-1 字符
        try:
            cd = f"attachment; filename*=UTF-8''{quote(file.original_name)}"
        except Exception:
            safe_name = ''.join(c for c in file.original_name if ord(c) < 256)
            cd = f'attachment; filename="{safe_name}"'

        return content, 200, {
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': cd,
            'Content-Length': str(len(content))
        }
        
    except Exception as e:
        current_app.logger.error(f'获取文件内容错误: {str(e)}')
        return error_500(f'获取文件内容失败: {str(e)}', 500)