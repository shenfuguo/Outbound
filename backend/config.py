# config.py
import os
import json
from datetime import timedelta

def load_database_config():
    """从JSON文件加载数据库配置"""
    try:
        with open('database.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}
    except json.JSONDecodeError as e:
        return {}

class Config:
    """基础配置"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-secret-key-here'
    DEBUG = False
    TESTING = False
    
    # 文件上传配置
    MAX_CONTENT_LENGTH = 100 * 1024 * 1024  # 100MB
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
    ALLOWED_EXTENSIONS = {
        '1': ['pdf'],
        '2': ['jpg', 'jpeg', 'png', 'gif', 'webp']
    }
    
    # 数据库配置 - 设置为None，在子类中设置
    SQLALCHEMY_DATABASE_URI = None
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    def __init__(self):
        # 确保上传目录存在
        if not os.path.exists(self.UPLOAD_FOLDER):
            os.makedirs(self.UPLOAD_FOLDER)
        
        # 在初始化时设置数据库URI
        self._setup_database()

    def _setup_database(self):
        """设置数据库配置"""
        # 这个方法在子类中重写
        pass

class DevelopmentConfig(Config):
    """开发环境配置"""
    DEBUG = True
    
    def _setup_database(self):
        """设置开发环境数据库配置"""
        # 加载数据库配置
        db_config_data = load_database_config()
        env = os.environ.get('FLASK_ENV', 'development')
        db_config = db_config_data.get(env, {})
        
        if db_config:
            # 从JSON文件构建连接字符串
            self.SQLALCHEMY_DATABASE_URI = (
                f"postgresql://{db_config['username']}:{db_config['password']}"
                f"@{db_config['host']}:{db_config['port']}/{db_config['database']}"
            )
        else:
            # 回退到环境变量或默认值
            self.SQLALCHEMY_DATABASE_URI = os.environ.get('DEV_DATABASE_URL') or \
                os.environ.get('DATABASE_URL') or \
                'postgresql://postgres:postgres@192.168.1.217:5432/out-bound'
        
        # 确保数据库URI不为空
        if not self.SQLALCHEMY_DATABASE_URI:
            raise ValueError("开发环境数据库URI未设置")
        
        self.SQLALCHEMY_TRACK_MODIFICATIONS = False

class ProductionConfig(Config):
    """生产环境配置"""
    
    def _setup_database(self):
        """设置生产环境数据库配置"""
        db_config_data = load_database_config()
        db_config = db_config_data.get('production', {})
        
        if db_config:
            self.SQLALCHEMY_DATABASE_URI = (
                f"postgresql://{db_config['username']}:{db_config['password']}"
                f"@{db_config['host']}:{db_config['port']}/{db_config['database']}"
            )
        else:
            self.SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
        
        if not self.SQLALCHEMY_DATABASE_URI:
            raise ValueError("生产环境必须设置DATABASE_URL环境变量")
        
        self.SQLALCHEMY_TRACK_MODIFICATIONS = False

class TestingConfig(Config):
    """测试环境配置"""
    TESTING = True
    
    def _setup_database(self):
        """设置测试环境数据库配置"""
        db_config_data = load_database_config()
        db_config = db_config_data.get('testing', {})
        
        if db_config:
            self.SQLALCHEMY_DATABASE_URI = (
                f"postgresql://{db_config['username']}:{db_config['password']}"
                f"@{db_config['host']}:{db_config['port']}/{db_config['database']}"
            )
        else:
            self.SQLALCHEMY_DATABASE_URI = os.environ.get('TEST_DATABASE_URL') or \
                'postgresql://postgres:password@192.168.1.217:5432/myapp_test'
        
        self.SQLALCHEMY_TRACK_MODIFICATIONS = False

# 配置映射
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}