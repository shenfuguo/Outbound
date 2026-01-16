# utils/file_utils.py
import os

def allowed_file(filename, file_type, config=None):
    """检查文件类型是否允许"""
    if not filename or '.' not in filename:
        return False
    
    ext = filename.rsplit('.', 1)[1].lower()
    
    # 支持从config或使用默认配置
    if config and 'ALLOWED_EXTENSIONS' in config:
        allowed_exts = config['ALLOWED_EXTENSIONS'].get(file_type, [])
    else:
        # 默认的文件类型映射
        default_extensions = {
            '1': ['pdf'],
            '2': ['jpg', 'jpeg', 'png', 'gif', 'webp']
        }
        allowed_exts = default_extensions.get(file_type, [])
    
    return ext in allowed_exts

def format_file_size(size_bytes):
    """格式化文件大小显示"""
    if size_bytes == 0:
        return "0B"
    
    size_names = ["B", "KB", "MB", "GB"]
    i = 0
    while size_bytes >= 1024 and i < len(size_names) - 1:
        size_bytes /= 1024.0
        i += 1
    
    return f"{size_bytes:.2f} {size_names[i]}"

# # 测试函数
# if __name__ == "__main__":
#     # 测试代码
#     print(allowed_file("test.pdf", "1")) 
#     print(allowed_file("test.jpg", "2")) 
#     print(format_file_size(1024))  