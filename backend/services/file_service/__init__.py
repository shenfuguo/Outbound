# services/__init__.py
from .file_service import FileService
from .upload_service import UploadService

# 这样在其他地方可以这样导入：from services import FileService, UploadService
__all__ = ['FileService', 'UploadService']