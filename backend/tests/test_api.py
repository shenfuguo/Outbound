# test_api.py
import requests
import time

def test_api_endpoints():
    """测试API端点"""
    base_url = "http://localhost:5000"
    
    endpoints = [
        # 调试端点
        ("/api/debug/ping", "GET", "基本连接测试"),
        ("/api/debug/routes", "GET", "查看所有路由"),
        
        # 健康检查
        ("/api/health", "GET", "健康检查"),
        
        # 文件相关端点
        ("/api/upload", "GET", "上传页面（GET）"),
        ("/api/upload", "POST", "上传文件（POST）"),
        ("/api/files", "GET", "文件列表"),
        ("/api/files/stats", "GET", "文件统计"),
    ]
    
    print("🧪 开始测试API端点...")
    print("="*70)
    
    for endpoint, method, description in endpoints:
        try:
            if method == "GET":
                response = requests.get(f"{base_url}{endpoint}", timeout=5)
            elif method == "POST":
                response = requests.post(f"{base_url}{endpoint}", timeout=5)
            
            status = "✅" if response.status_code in [200, 201] else "❌"
            print(f"{status} {method:6s} {endpoint:30s} ({description})")
            print(f"    状态码: {response.status_code}")
            
            if response.status_code != 200:
                print(f"    响应: {response.text[:100]}...")
            
        except requests.exceptions.ConnectionError:
            print(f"❌ 连接失败: {endpoint} - 请确保应用正在运行")
        except Exception as e:
            print(f"❌ 错误: {endpoint} - {e}")
        
        print()
    
    print("="*70)
    print("测试完成")

if __name__ == "__main__":
    # 等待应用启动
    time.sleep(2)
    test_api_endpoints()