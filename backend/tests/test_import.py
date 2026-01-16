import unittest
import sys
import os

# 添加项目根目录到 Python 路径
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

class TestFlaskSQLAlchemyImport(unittest.TestCase):
    """测试 Flask-SQLAlchemy 导入"""
    
    def test_import_flask_sqlalchemy(self):
        """测试能否导入 Flask-SQLAlchemy"""
        try:
            from flask_sqlalchemy import SQLAlchemy
            print("✓ Flask-SQLAlchemy 导入成功")
            self.assertTrue(True, "Flask-SQLAlchemy 导入成功")
        except ImportError as e:
            print(f"✗ Flask-SQLAlchemy 导入失败: {e}")
            # 添加详细的诊断信息
            self._diagnose_import_issue()
            self.fail(f"Flask-SQLAlchemy 导入失败: {e}")
        except Exception as e:
            print(f"✗ 其他错误: {e}")
            self.fail(f"其他错误: {e}")
    
    def _diagnose_import_issue(self):
        """诊断导入问题"""
        print("\n=== 开始诊断 ===")
        
        # 检查 Python 路径
        print(f"Python 路径: {sys.executable}")
        print(f"Python 版本: {sys.version}")
        
        # 检查 sys.path
        print("\nPython 路径列表:")
        for path in sys.path:
            print(f"  {path}")
        
        # 检查包安装情况
        try:
            import pkg_resources
            packages = ["Flask", "Flask-SQLAlchemy", "SQLAlchemy"]
            for pkg in packages:
                try:
                    dist = pkg_resources.get_distribution(pkg)
                    print(f"✓ {pkg} 已安装 - 版本: {dist.version}")
                except pkg_resources.DistributionNotFound:
                    print(f"✗ {pkg} 未安装")
        except ImportError:
            print("! pkg_resources 不可用")
        
        # 尝试导入相关模块
        modules_to_test = ["flask", "sqlalchemy", "flask_sqlalchemy"]
        for module in modules_to_test:
            try:
                __import__(module)
                print(f"✓ {module} 可以导入")
            except ImportError as e:
                print(f"✗ {module} 导入失败: {e}")

class TestBasicImports(unittest.TestCase):
    """测试基本导入"""
    
    def test_flask_import(self):
        """测试 Flask 导入"""
        try:
            import flask
            print("✓ Flask 导入成功")
            self.assertTrue(True)
        except ImportError as e:
            print(f"✗ Flask 导入失败: {e}")
            self.fail(f"Flask 导入失败: {e}")
    
    def test_sqlalchemy_import(self):
        """测试 SQLAlchemy 导入"""
        try:
            import sqlalchemy
            print("✓ SQLAlchemy 导入成功")
            self.assertTrue(True)
        except ImportError as e:
            print(f"✗ SQLAlchemy 导入失败: {e}")
            self.fail(f"SQLAlchemy 导入失败: {e}")