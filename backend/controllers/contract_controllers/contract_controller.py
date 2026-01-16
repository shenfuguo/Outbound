# controllers/contract_controllers/contract_controller.py
from flask import Blueprint, request, jsonify, current_app, send_file, make_response
from flask.views import MethodView
import os
import mimetypes

from services.contract_service.contract_service import ContractService
from utils.response import success_200, error_400, error_500, error_404,error_403
from utils.db_helper import get_db

# 创建蓝图
contract_bp = Blueprint('contract', __name__)

class ContractAPI(MethodView):
    """合同API类"""
    
    def get(self, contract_id=None):
        """获取合同信息"""
        try:
            db = get_db()
            contract_service = ContractService(db, current_app.config)
            
            if contract_id:
                # 获取单个合同
                contract = contract_service.get_contract(contract_id)
                if contract:
                    return success_200('获取合同信息成功', contract)
                else:
                    return error_404('合同不存在')
            else:
                # 获取所有合同或根据公司ID筛选
                company_id = request.args.get('companyId')
                keyword = request.args.get('keyword')
                
                if company_id:
                    contracts = contract_service.get_company_contracts(company_id)
                elif keyword:
                    contracts = contract_service.search_contracts(keyword)
                else:
                    contracts = contract_service.get_all_contracts()
                
                return success_200('获取合同列表成功', {
                    'contracts': contracts,
                    'total': len(contracts)
                })
            
        except Exception as e:
            current_app.logger.error(f'获取合同信息错误: {str(e)}')
            return error_500(f'获取合同信息失败: {str(e)}')
    
    def post(self):
        """创建合同"""
        try:
            data = request.get_json()
            
            if not data:
                return error_400('请求数据不能为空')
            
            print(f"创建合同接收到的数据: {data}")
            
            db = get_db()
            contract_service = ContractService(db, current_app.config)
            
            result = contract_service.create_contract(data)
            
            if result['success']:
                return success_200(result['message'], result.get('data'))
            else:
                return error_400(result['message'], result.get('errors', []))
            
        except Exception as e:
            current_app.logger.error(f'创建合同错误: {str(e)}')
            return error_500(f'创建合同失败: {str(e)}')
    
    def put(self, contract_id):
        """更新合同"""
        try:
            data = request.get_json()
            
            if not data:
                return error_400('请求数据不能为空')
            
            db = get_db()
            contract_service = ContractService(db, current_app.config)
            
            result = contract_service.update_contract(contract_id, data)
            
            if result['success']:
                return success_200(result['message'], result.get('data'))
            else:
                if '合同不存在' in result['message']:
                    return error_404(result['message'])
                return error_400(result['message'], result.get('errors', []))
            
        except Exception as e:
            current_app.logger.error(f'更新合同错误: {str(e)}')
            return error_500(f'更新合同失败: {str(e)}')
    
    def delete(self, contract_id):
        """删除合同"""
        try:
            db = get_db()
            contract_service = ContractService(db, current_app.config)
            
            result = contract_service.delete_contract(contract_id)
            
            if result['success']:
                return success_200(result['message'], result.get('data'))
            else:
                return error_404(result['message'])
            
        except Exception as e:
            current_app.logger.error(f'删除合同错误: {str(e)}')
            return error_500(f'删除合同失败: {str(e)}')

class ContractSearchAPI(MethodView):
    """合同搜索API类"""
    
    def get(self):
        """搜索合同"""
        try:
            keyword = request.args.get('q', '')
            company_id = request.args.get('companyId')
            
            db = get_db()
            contract_service = ContractService(db, current_app.config)
            
            contracts = contract_service.search_contracts(keyword, company_id)
            
            return success_200('搜索完成', {
                'keyword': keyword,
                'results': contracts,
                'count': len(contracts)
            })
            
        except Exception as e:
            current_app.logger.error(f'搜索合同错误: {str(e)}')
            return error_500(f'搜索合同失败: {str(e)}')

class ContractStatsAPI(MethodView):
    """合同统计API类"""
    
    def get(self):
        """获取合同统计"""
        try:
            company_id = request.args.get('companyId')
            
            db = get_db()
            contract_service = ContractService(db, current_app.config)
            
            stats = contract_service.get_contract_stats(company_id)
            
            return success_200('获取合同统计成功', stats)
            
        except Exception as e:
            current_app.logger.error(f'获取合同统计错误: {str(e)}')
            return error_500(f'获取合同统计失败: {str(e)}')

class ContractExpiringAPI(MethodView):
    """合同到期提醒API类"""
    
    def get(self):
        """获取即将到期的合同"""
        try:
            days = int(request.args.get('days', 30))
            
            db = get_db()
            contract_service = ContractService(db, current_app.config)
            
            contracts = contract_service.get_expiring_contracts(days)
            
            return success_200('获取即将到期合同成功', {
                'contracts': contracts,
                'count': len(contracts),
                'days': days
            })
            
        except Exception as e:
            current_app.logger.error(f'获取即将到期合同错误: {str(e)}')
            return error_500(f'获取即将到期合同失败: {str(e)}')

class ContractOverdueAPI(MethodView):
    """合同过期API类"""
    
    def get(self):
        """获取已过期的合同"""
        try:
            db = get_db()
            contract_service = ContractService(db, current_app.config)
            
            contracts = contract_service.get_overdue_contracts()
            
            return success_200('获取已过期合同成功', {
                'contracts': contracts,
                'count': len(contracts)
            })
            
        except Exception as e:
            current_app.logger.error(f'获取已过期合同错误: {str(e)}')
            return error_500(f'获取已过期合同失败: {str(e)}')

class FilePreviewAPI(MethodView):
    """文件预览API类"""
    
    def get(self, file_id):
        """获取文件预览信息"""
        try:
            print(f"请求数据1: file_id={file_id}, args={request.args}")
            # 获取查询参数
            company_id = request.args.get('companyId')
            
            if not company_id:
                return error_400('缺少客户ID参数')
            
            db = get_db()
            contract_service = ContractService(db, current_app.config)
            
            # 调用service层获取文件预览信息
            result = contract_service.get_file_preview(file_id, company_id)
            
            if result['success']:
                return success_200(result['message'], result['data'])
            else:
                # 根据错误类型返回相应的状态码
                if '不存在' in result['message']:
                    return error_404(result['message'])
                elif '无权访问' in result['message']:
                    return error_403(result['message'])
                elif '不支持' in result['message']:
                    return error_400(result['message'])
                else:
                    return error_500(result['message'])
                
        except Exception as e:
            current_app.logger.error(f'获取文件预览信息错误: {str(e)}')
            return error_500(f'获取文件预览信息失败: {str(e)}')

class FileContentAPI(MethodView):
    """文件内容API类"""
    
    def get(self, file_id):
        """获取文件内容（用于预览）"""
        try:
            print(f"请求数据: file_id={file_id}, args={request.args}")
            # 获取查询参数
            company_id = request.args.get('companyId')
            
            if not company_id:
                return error_400('缺少客户ID参数')
            
            db = get_db()
            contract_service = ContractService(db, current_app.config)
            
            # 调用service层获取文件内容信息
            file_info = contract_service.get_file_content_info(file_id, company_id)
            
            if not file_info['success']:
                if '不存在' in file_info['message']:
                    return error_404(file_info['message'])
                elif '无权访问' in file_info['message']:
                    return error_403(file_info['message'])
                else:
                    return error_500(file_info['message'])
            
            # 获取文件数据
            file_data = file_info['data']
            
            # 发送文件
            response = make_response(send_file(
                file_data['file_path'],
                mimetype=file_data.get('mime_type', 'application/pdf'),
                as_attachment=False,  # 预览模式
                download_name=file_data.get('file_name', f'file_{file_id}')
            ))
            
            # 添加缓存控制头
            response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            response.headers['Pragma'] = 'no-cache'
            response.headers['Expires'] = '0'
            
            # 添加CORS头
            response.headers['Access-Control-Allow-Origin'] = '*'
            response.headers['Access-Control-Expose-Headers'] = 'Content-Disposition, Content-Type, Content-Length'
            
            return response
            
        except Exception as e:
            current_app.logger.error(f'获取文件内容错误: {str(e)}')
            return error_500(f'获取文件内容失败: {str(e)}')

@contract_bp.route('/<contract_id>/download', methods=['GET'])
def download_contract_file(contract_id):
    """下载合同文件"""
    try:
        db = get_db()
        contract_service = ContractService(db, current_app.config)
        
        contract = contract_service.get_contract(contract_id)
        if not contract:
            return error_404('合同不存在')
        
        file_path = contract.get('filePath')
        if not file_path or not os.path.exists(file_path):
            return error_404('合同文件不存在')
        
        # 获取文件名
        filename = contract.get('fileName', f'contract_{contract_id}')
        
        # 获取MIME类型
        mime_type, _ = mimetypes.guess_type(file_path)
        if not mime_type:
            mime_type = 'application/octet-stream'
        
        # 创建响应
        response = make_response(send_file(
            file_path,
            mimetype=mime_type,
            as_attachment=True,
            download_name=filename
        ))
        
        return response
        
    except Exception as e:
        current_app.logger.error(f'下载合同文件错误: {str(e)}')
        return error_500(f'下载合同文件失败: {str(e)}')

# 创建视图实例
contract_view = ContractAPI.as_view('contract_api')
contract_search_view = ContractSearchAPI.as_view('contract_search_api')
contract_stats_view = ContractStatsAPI.as_view('contract_stats_api')
contract_expiring_view = ContractExpiringAPI.as_view('contract_expiring_api')
contract_overdue_view = ContractOverdueAPI.as_view('contract_overdue_api')
file_preview_view = FilePreviewAPI.as_view('file_preview_api')
file_content_view = FileContentAPI.as_view('file_content_api')

# 注册路由
contract_bp.add_url_rule(
    '/contracts',
    view_func=contract_view,
    methods=['GET', 'POST']
)

contract_bp.add_url_rule(
    '/contracts/<contract_id>',
    view_func=contract_view,
    methods=['GET', 'PUT', 'DELETE']
)

contract_bp.add_url_rule(
    '/contracts/search',
    view_func=contract_search_view,
    methods=['GET']
)

contract_bp.add_url_rule(
    '/contracts/stats',
    view_func=contract_stats_view,
    methods=['GET']
)

contract_bp.add_url_rule(
    '/contracts/expiring',
    view_func=contract_expiring_view,
    methods=['GET']
)

contract_bp.add_url_rule(
    '/contracts/overdue',
    view_func=contract_overdue_view,
    methods=['GET']
)

# 在contract_bp中也注册路由（兼容性）
contract_bp.add_url_rule(
    '/files/<file_id>/preview',
    view_func=file_preview_view,
    methods=['GET']
)

contract_bp.add_url_rule(
    '/files/<file_id>/content',
    view_func=file_content_view,
    methods=['GET']
)