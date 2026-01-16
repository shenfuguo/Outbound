# controllers/company_controllers/company_controller.py
from flask import Blueprint, request, jsonify, current_app
from flask.views import MethodView
from services.company_service.company_service import CompanyService
from utils.response import success_200, error_400, error_500, error_404
from utils.db_helper import get_db
import csv
import io

# 创建蓝图
company_bp = Blueprint('company', __name__)

class CompanyAPI(MethodView):
    """客户API类"""
    
    def get(self, company_id=None):
        """获取客户信息"""
        try:
            db = get_db()
            company_service = CompanyService(db, current_app.config)
            
            if company_id:
                # 获取单个客户
                company = company_service.get_company(company_id)
                if company:
                    return success_200('获取客户信息成功', company)
                else:
                    return error_404('客户不存在')
            else:
                # 获取所有客户
                companies = company_service.get_all_companies()
                return success_200('获取客户列表成功', {
                    'companies': companies,
                    'total': len(companies)
                })
            
        except Exception as e:
            current_app.logger.error(f'获取客户信息错误: {str(e)}')
            return error_500(f'获取客户信息失败: {str(e)}')
    
    def post(self):
        """创建客户"""
        try:
            data = request.get_json()
            
            if not data:
                return error_400('请求数据不能为空')
            
            # 🌟 前端字段名到后端字段名的映射
            field_mapping = {
                'companyName': 'company_name',
                'companyAddress': 'company_address',  # 注意：前台是 address，后台是 company_address
                'address': 'company_address',  # 添加这个映射
                'contact1': 'customer_name1',
                'customerName1': 'customer_name1',
                'phone1': 'customer_phone1',
                'customerPhone1': 'customer_phone1',
                'contact2': 'customer_name2',
                'customerName2': 'customer_name2',
                'phone2': 'customer_phone2',
                'customerPhone2': 'customer_phone2',
                'remarks': 'remarks'
            }
            
            # 转换字段名
            backend_data = {}
            for frontend_key, value in data.items():
                if frontend_key in field_mapping:
                    backend_key = field_mapping[frontend_key]
                    backend_data[backend_key] = value
                else:
                    # 如果不在映射中，直接使用
                    backend_data[frontend_key] = value
            
            print(f"接收到的数据: {data}")
            print(f"转换后的数据: {backend_data}")
            
            db = get_db()
            company_service = CompanyService(db, current_app.config)
            
            result = company_service.create_company(backend_data)
            
            if result['success']:
                return success_200(result['message'], result.get('data'))
            else:
                return error_400(result['message'], result.get('errors', []))
            
        except Exception as e:
            current_app.logger.error(f'创建客户错误: {str(e)}')
            return error_500(f'创建客户失败: {str(e)}')
    
    def put(self, company_id):
        """更新客户"""
        try:
            data = request.get_json()
            print(f"解析后的更新数据: {data}")
            
            if not data:
                return error_400('请求数据不能为空')
            
            # 添加字段映射，确保前后端字段名一致
            field_mapping = {
                'companyName': 'company_name',
                'address': 'company_address',
                'contact1': 'customer_name1',
                'phone1': 'customer_phone1',
                'contact2': 'customer_name2',
                'phone2': 'customer_phone2',
                'remarks': 'remarks'
            }
            
            # 转换字段名
            backend_data = {}
            for frontend_key, value in data.items():
                if frontend_key in field_mapping:
                    backend_key = field_mapping[frontend_key]
                    backend_data[backend_key] = value
                else:
                    backend_data[frontend_key] = value
            
            print(f"PUT 接收到的数据: {data}")
            print(f"PUT 转换后的数据: {backend_data}")
            
            db = get_db()
            company_service = CompanyService(db, current_app.config)
            
            result = company_service.update_company(company_id, backend_data)
            
            if result['success']:
                return success_200(result['message'], result.get('data'))
            else:
                if '客户不存在' in result['message']:
                    return error_404(result['message'])
                return error_400(result['message'], result.get('errors', []))
            
        except Exception as e:
            current_app.logger.error(f'更新客户错误: {str(e)}')
            return error_500(f'更新客户失败: {str(e)}')
    
    def delete(self, company_id):
        """删除客户"""
        try:
            db = get_db()
            company_service = CompanyService(db, current_app.config)
            
            result = company_service.delete_company(company_id)
            
            if result['success']:
                return success_200(result['message'], result.get('data'))
            else:
                return error_404(result['message'])
            
        except Exception as e:
            current_app.logger.error(f'删除客户错误: {str(e)}')
            return error_500(f'删除客户失败: {str(e)}')

class CompanySearchAPI(MethodView):
    """客户搜索API类"""
    
    def get(self):
        """搜索客户"""
        try:
            keyword = request.args.get('q', '')
            
            db = get_db()
            company_service = CompanyService(db, current_app.config)
            
            companies = company_service.search_companies(keyword)
            
            return success_200('搜索完成', {
                'keyword': keyword,
                'results': companies,
                'count': len(companies)
            })
            
        except Exception as e:
            current_app.logger.error(f'搜索客户错误: {str(e)}')
            return error_500(f'搜索客户失败: {str(e)}')

class CompanyBatchAPI(MethodView):
    """客户批量操作API类"""
    
    def delete(self):
        """批量删除客户"""
        try:
            company_ids = request.json.get('company_ids', [])
            
            if not company_ids:
                return error_400('请提供要删除的客户ID列表')
            
            db = get_db()
            company_service = CompanyService(db, current_app.config)
            
            result = company_service.batch_delete_companies(company_ids)
            
            return success_200(result['message'], result.get('data'))
            
        except Exception as e:
            current_app.logger.error(f'批量删除客户错误: {str(e)}')
            return error_500(f'批量删除客户失败: {str(e)}')

# 创建视图实例
company_view = CompanyAPI.as_view('company_api')
company_search_view = CompanySearchAPI.as_view('company_search_api')
company_batch_view = CompanyBatchAPI.as_view('company_batch_api')

# 注册路由
company_bp.add_url_rule(
    '/companies',
    view_func=company_view,
    methods=['GET', 'POST']
)

company_bp.add_url_rule(
    '/companies/<company_id>',
    view_func=company_view,
    methods=['GET', 'PUT', 'DELETE']
)

company_bp.add_url_rule(
    '/companies/search',
    view_func=company_search_view,
    methods=['GET']
)

company_bp.add_url_rule(
    '/companies/batch',
    view_func=company_batch_view,
    methods=['DELETE']
)

# 客户列表（简化版，用于下拉选择）
@company_bp.route('/companies/list', methods=['GET'])
def get_companies_list():
    """获取客户列表（简化版）"""
    try:
        db = get_db()
        company_service = CompanyService(db, current_app.config)
        
        companies = company_service.get_companies_list()
        
        return success_200('获取客户列表成功', {
            'companies': companies,
            'total': len(companies)
        })
        
    except Exception as e:
        current_app.logger.error(f'获取客户列表错误: {str(e)}')
        return error_500(f'获取客户列表失败: {str(e)}')

# 客户统计
@company_bp.route('/companies/stats', methods=['GET'])
def get_companies_stats():
    """获取客户统计"""
    try:
        db = get_db()
        company_service = CompanyService(db, current_app.config)
        
        stats = company_service.get_company_stats()
        
        return success_200('获取客户统计成功', stats)
        
    except Exception as e:
        current_app.logger.error(f'获取客户统计错误: {str(e)}')
        return error_500(f'获取客户统计失败: {str(e)}')

# 导出客户数据
@company_bp.route('/companies/export', methods=['GET'])
def export_companies():
    """导出客户数据"""
    try:
        db = get_db()
        company_service = CompanyService(db, current_app.config)
        
        result = company_service.export_companies()
        
        if result['success']:
            # 创建CSV响应
            csv_data = result['data']['content']
            filename = result['data']['filename']
            
            response = current_app.response_class(
                csv_data,
                mimetype='text/csv',
                headers={'Content-Disposition': f'attachment;filename={filename}'}
            )
            
            return response
        else:
            return error_400(result['message'], result.get('errors', []))
        
    except Exception as e:
        current_app.logger.error(f'导出客户数据错误: {str(e)}')
        return error_500(f'导出客户数据失败: {str(e)}')