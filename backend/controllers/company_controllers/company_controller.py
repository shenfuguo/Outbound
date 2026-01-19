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
            
            print(f"控制器接收到的数据: {data}")
            
            # 这里不进行字段转换，直接传递原始数据给 service
            # service/repository 会处理字段映射
            db = get_db()
            company_service = CompanyService(db, current_app.config)
            
            result = company_service.create_company(data)

            print(f"创建客户结果: {result}")
            
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
            
            if not data:
                return error_400('请求数据不能为空')
            
            print(f"PUT 接收到的数据: {data}")
            
            db = get_db()
            company_service = CompanyService(db, current_app.config)
            
            result = company_service.update_company(company_id, data)
            
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
            page = request.args.get('page', 1, type=int)
            page_size = request.args.get('pageSize', 20, type=int)
            
            db = get_db()
            company_service = CompanyService(db, current_app.config)
            
            result = company_service.search_companies(keyword, page, page_size)
            
            return success_200('搜索完成', result)
            
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
            
            if result['success']:
                return success_200(result['message'], result.get('data'))
            else:
                return error_400(result['message'], result.get('errors', []))
            
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

# 客户详情
@company_bp.route('/companies/<company_id>/details', methods=['GET'])
def get_company_details(company_id):
    """获取客户详细信息"""
    try:
        db = get_db()
        company_service = CompanyService(db, current_app.config)
        
        result = company_service.get_company_with_details(company_id)
        
        if result:
            return success_200('获取客户详情成功', result)
        else:
            return error_404('客户不存在')
        
    except Exception as e:
        current_app.logger.error(f'获取客户详情错误: {str(e)}')
        return error_500(f'获取客户详情失败: {str(e)}')

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

# 验证公司税号
@company_bp.route('/companies/validate/tax', methods=['POST'])
def validate_company_tax():
    """验证公司税号"""
    try:
        data = request.get_json()
        tax_id = data.get('taxId')
        
        if not tax_id:
            return error_400('请提供税号')
        
        db = get_db()
        company_service = CompanyService(db, current_app.config)
        
        result = company_service.validate_company_tax_id(tax_id)
        
        if result['valid']:
            return success_200('税号验证通过', {'exists': result['exists']})
        else:
            return error_400(result['message'])
        
    except Exception as e:
        current_app.logger.error(f'验证税号错误: {str(e)}')
        return error_500(f'验证税号失败: {str(e)}')

# 验证银行账户
@company_bp.route('/companies/validate/bank', methods=['POST'])
def validate_bank_account():
    """验证银行账户"""
    try:
        data = request.get_json()
        bank_account = data.get('bankAccount')
        company_id = data.get('companyId')
        
        if not bank_account:
            return error_400('请提供银行账户')
        
        db = get_db()
        company_service = CompanyService(db, current_app.config)
        
        result = company_service.validate_bank_account(bank_account, company_id)
        
        if result['valid']:
            return success_200('银行账户验证通过', {'exists': result['exists']})
        else:
            return error_400(result['message'])
        
    except Exception as e:
        current_app.logger.error(f'验证银行账户错误: {str(e)}')
        return error_500(f'验证银行账户失败: {str(e)}')

# 获取下拉选择列表
@company_bp.route('/companies/dropdown', methods=['GET'])
def get_companies_dropdown():
    """获取客户下拉选择列表"""
    try:
        db = get_db()
        company_service = CompanyService(db, current_app.config)
        
        companies = company_service.get_companies_for_dropdown()
        
        return success_200('获取客户列表成功', {
            'companies': companies,
            'total': len(companies)
        })
        
    except Exception as e:
        current_app.logger.error(f'获取客户下拉列表错误: {str(e)}')
        return error_500(f'获取客户下拉列表失败: {str(e)}')
        
    except Exception as e:
        print(f"测试接口错误: {str(e)}")
        return jsonify({'success': False, 'message': f'测试接口错误: {str(e)}'}), 500