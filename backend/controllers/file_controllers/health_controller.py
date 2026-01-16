# controllers/file_controllers/health_controller.py
from flask import Blueprint, jsonify
from flask.views import MethodView
from datetime import datetime

class HealthAPI(MethodView):
    """健康检查API类"""
    
    def get(self):
        """健康检查"""
        return jsonify({
            'status': 'healthy',
            'message': '文件管理服务运行正常',
            'service': 'file-service',
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'version': '1.0.0'
        })
    
    def post(self):
        """详细健康检查（包含数据库连接）"""
        try:
            from utils.db_helper import get_db
            db = get_db()
            
            # 测试数据库连接
            db.session.execute('SELECT 1')
            
            return jsonify({
                'status': 'healthy',
                'message': '服务运行正常，数据库连接正常',
                'database': 'connected',
                'timestamp': datetime.utcnow().isoformat() + 'Z'
            })
        except Exception as e:
            return jsonify({
                'status': 'unhealthy',
                'message': f'数据库连接失败: {str(e)}',
                'database': 'disconnected',
                'timestamp': datetime.utcnow().isoformat() + 'Z'
            }), 503

# 创建蓝图
health_bp = Blueprint('health', __name__)

# 将类视图注册到蓝图
health_view = HealthAPI.as_view('health_api')
health_bp.add_url_rule('/health', view_func=health_view, methods=['GET', 'POST'])
health_bp.add_url_rule('/health/db', view_func=health_view, methods=['POST'])  # 专门的数据库检查