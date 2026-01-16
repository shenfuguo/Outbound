# test_actual_import.py
import sys
import os

print("=== 测试 Flask-SQLAlchemy 导入 ===")
print(f"Python 路径: {sys.executable}")
print(f"工作目录: {os.getcwd()}")

# 测试不同的导入方式
import_methods = [
    # 标准方式
    "from flask_sqlalchemy import SQLAlchemy",
    # 模块导入
    "import flask_sqlalchemy",
    # 检查模块属性
    "import flask_sqlalchemy; print(dir(flask_sqlalchemy))",
]

for method in import_methods:
    print(f"\n尝试: {method}")
    try:
        exec(method)
        print("✓ 成功")
    except Exception as e:
        print(f"✗ 失败: {e}")

# 检查模块是否存在
print("\n=== 检查模块路径 ===")
try:
    import flask_sqlalchemy
    print(f"模块文件: {flask_sqlalchemy.__file__}")
    print(f"模块内容: {[x for x in dir(flask_sqlalchemy) if not x.startswith('_')]}")
except Exception as e:
    print(f"模块检查失败: {e}")

# 检查 SQLAlchemy 类是否存在
print("\n=== 检查 SQLAlchemy 类 ===")
try:
    import flask_sqlalchemy
    if hasattr(flask_sqlalchemy, 'SQLAlchemy'):
        print("✓ SQLAlchemy 类存在")
        print(f"SQLAlchemy 类型: {type(flask_sqlalchemy.SQLAlchemy)}")
    else:
        print("✗ SQLAlchemy 类不存在")
        print(f"可用属性: {[x for x in dir(flask_sqlalchemy) if not x.startswith('_')]}")
except Exception as e:
    print(f"类检查失败: {e}")