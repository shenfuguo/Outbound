# app.py
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os
import sys
import urllib.parse

sys.path.insert(0, os.path.dirname(__file__))

# 不再在这里创建db实例
# db = SQLAlchemy()  # ❌ 删除这行

def create_app(config_name=None):
    """应用工厂函数"""
    
    # 确定配置名称
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'default')
        if config_name not in ['development', 'production', 'testing']:
            config_name = 'default'
    
    # print(f"正在加载配置: {config_name}")
    
    app = Flask(__name__)
    
    try:
        from config import config as config_dict
        config_class = config_dict[config_name]
        config_instance = config_class()
        
        for key in dir(config_instance):
            if not key.startswith('_') and not callable(getattr(config_instance, key)):
                value = getattr(config_instance, key)
                app.config[key] = value
        
        if not app.config.get('SQLALCHEMY_DATABASE_URI'):
            raise ValueError("数据库URI未设置")
        
        # print("✅ 配置加载成功")
        # print(f"   数据库URI: {app.config.get('SQLALCHEMY_DATABASE_URI')}")
            
    except Exception as e:
        app.config['SECRET_KEY'] = 'dev-secret-key'
        app.config['DEBUG'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
        app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
        # print(f"配置加载失败: {e}")
    
    # 🌟 关键：从模型包初始化db
    from models import init_app as init_models
    db = init_models(app)
    
    # 将db挂载到app
    app.db = db
    
    CORS(app, 
         origins=["http://localhost:5173", "http://127.0.0.1:5173"],
         supports_credentials=True,
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         allow_headers=["*"]
    )
    
    # 注册蓝图
    try:
        from controllers.file_controllers.file_controller import file_bp
        from controllers.file_controllers.health_controller import health_bp
        from controllers.company_controllers.company_controller import company_bp
        from controllers.contract_controllers.contract_controller import contract_bp
        
        # 文件上传
        app.register_blueprint(file_bp, url_prefix='/api')
        app.register_blueprint(health_bp, url_prefix='/api')
        # 公司管理
        app.register_blueprint(company_bp, url_prefix='/api')
        # 合同管理
        app.register_blueprint(contract_bp, url_prefix='/api')
        
        # print("✅ 蓝图注册成功")
        
    except ImportError as e:
        # print(f"❌ 蓝图导入失败: {e}")
        
        @app.route('/')
        def hello():
            return "Flask应用运行正常!"
        
        @app.route('/api/health')
        def health():
            return {"status": "healthy", "message": "应用运行中"}
    
    # 创建数据库表
    with app.app_context():
        try:
            db.create_all()
            print("✅ 数据库表创建成功")
        except Exception as e:
            print(f"❌ 数据库表创建失败: {e}")
    
    return app

# 创建应用实例
app = create_app()

if __name__ == '__main__':
    app.run(debug=app.config.get('DEBUG', True), host='0.0.0.0', port=5000)