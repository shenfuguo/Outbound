# controllers/__init__.py
# from .file_controller import file_bp
# from .health_controller import health_bp

# # 导出所有蓝图
# __all__ = ['file_bp', 'health_bp']

# 或者可以导出一个注册函数
def register_blueprints(app):
    from .file_controller import file_bp
    from .health_controller import health_bp
    
    app.register_blueprint(file_bp, url_prefix='/api')
    app.register_blueprint(health_bp, url_prefix='/api')