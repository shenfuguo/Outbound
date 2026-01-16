from flask import Flask
from flask_cors import CORS
from .routes import init_routes

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    # 加载配置
    app.config.from_object('backend.config') 
    
    # 初始化路由
    init_routes(app)
    
    return app