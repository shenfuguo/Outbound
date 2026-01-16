# repositories/file_repository/file_repository.py
import os
import uuid
import hashlib
import PyPDF2
from datetime import datetime
from typing import List, Optional, Dict, Any, Tuple
from werkzeug.utils import secure_filename
from PIL import Image
import io
from sqlalchemy import func, desc, asc, or_

from models.file_upd_model import FileUpdModel
from models.contract_model import ContractModel  # 导入合同模型
from ..base_repository import BaseRepository
from utils.file_utils import allowed_file, format_file_size
from utils.time_utils import beijing_time

class FileRepository(BaseRepository[FileUpdModel]):
    """文件仓储类 - 包含文件处理和数据访问逻辑"""
    
    def __init__(self, db, config=None):
        super().__init__(FileUpdModel, db)
        self.config = config or {}
    
    def validate_upload(self, file, file_type: str) -> Tuple[bool, str]:
        """验证上传文件 - Repository层验证"""
        if not file or file.filename == '':
            return False, '文件不能为空'
        
        if not allowed_file(file.filename, file_type, self.config):
            allowed_exts = self.config.get('ALLOWED_EXTENSIONS', {}).get(file_type, [])
            return False, f'不支持的文件格式。{file_type}类型支持: {", ".join(allowed_exts)}'
        
        # 检查文件大小
        file.seek(0, 2)  # 移动到文件末尾
        file_size = file.tell()
        file.seek(0)  # 重置文件指针
        
        max_size = self.config.get('MAX_CONTENT_LENGTH', 100 * 1024 * 1024)
        if file_size > max_size:
            return False, f'文件大小不能超过 {format_file_size(max_size)}'
        
        return True, '验证通过'
    
    def save_uploaded_file(self, file, file_type: str, original_name: str = None, 
                          company_id: str = None, contract_data: Dict = None) -> Dict:
        """保存上传的文件 - 完整的文件处理逻辑"""
        # 生成唯一文件名
        filename = secure_filename(file.filename)
        original_name = original_name or filename
        
        file_ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
        unique_filename = f"{uuid.uuid4().hex}.{file_ext}" if file_ext else str(uuid.uuid4().hex)
        
        # 创建存储目录
        type_folder = self._get_type_folder(file_type)
        upload_path = os.path.join(self.config.get('UPLOAD_FOLDER', 'uploads'), type_folder)
        
        if not os.path.exists(upload_path):
            os.makedirs(upload_path)
        
        # 保存物理文件
        file_path = os.path.join(upload_path, unique_filename)
        file.save(file_path)
        
        # 读取文件内容
        file.seek(0)
        file_data = file.read()
        file_size = len(file_data)
        mime_type = file.content_type
        
        # 计算文件哈希
        file_hash = hashlib.sha256(file_data).hexdigest()
        
        # 检查是否已存在相同文件
        existing_files = self.filter_by(file_hash=file_hash)
        # if existing_files:
        #     print(f"文件已存在: {existing_files[0].original_name}")
            # 可以选择跳过保存或创建引用
        
        # 提取文件元数据
        metadata = self._extract_file_metadata(file_data, filename, mime_type)
        
        # 提取文本内容
        text_content = self._extract_text_content(file_data, filename, mime_type)

        # 上传时间 - 使用北京时间
        beijing_time = self.get_beijing_time()
        
        # 创建文件数据库记录
        file_record = self.create(
            company_id=company_id,
            original_name=original_name,
            stored_name=unique_filename,
            file_type=file_type,
            file_size=file_size,
            file_path=file_path,
            mime_type=mime_type,
            file_content=file_data,
            file_hash=file_hash,
            page_count=metadata.get('page_count'),
            text_content=text_content,
            has_ocr=metadata.get('has_ocr', False),
            ocr_confidence=metadata.get('ocr_confidence', 0.0),
            upload_time=beijing_time
        )
        
        result = {
            'file': file_record.to_response_dict()
        }

        print(f"文件类型: {file_type},文件内容:{contract_data}")
        
        # 如果是合同文件，同时创建合同记录
        if file_type == "1":  # "1"代表合同类型:
            print(f"文件类型2: {file_type}")
            contract_info = self._create_contract_record(file_record,company_id)
            result['contract'] = contract_info
        
        return result
    
    def _create_contract_record(self, file_record,company_id: str) :
        """创建合同记录"""
        try:
            # 准备合同数据
            contract_defaults = {
                'file_id': file_record.id,  # 使用 file_upd 的 id
                'company_id': company_id,
                # 'file_path': file_record.file_path,
                # 'file_name': file_record.original_name,
                # 'contract_title': contract_data.get('contract_title') or file_record.original_name.split('.')[0],
                # 'contract_amount': contract_data.get('contract_amount', 0.00),
                # 'paid_amount': contract_data.get('paid_amount', 0.00),
                # 'start_date': contract_data.get('start_date'),
                # 'end_date': contract_data.get('end_date'),
                # 'final_payment_date': contract_data.get('final_payment_date'),
                # 'final_payment_amount': contract_data.get('final_payment_amount'),
                # 'main_content': contract_data.get('main_content') or file_record.text_content or '',
                # 'memo': contract_data.get('memo', ''),
                # 'status': contract_data.get('status', 'active')
            }
            print(f"创建合同记录: {contract_defaults}")
            # 创建合同记录
            contract = ContractModel(**contract_defaults)

            print(f"创建合同记录2: {contract_defaults}")
            
            # 使用当前 session
            if hasattr(self, 'session'):
                self.session.add(contract)
                self.session.commit()
            else:
                # 如果没有 session，使用 db.session
                from .. import db
                db.session.add(contract)
                db.session.commit()
            
            return contract.to_response_dict()
            
        except Exception as e:
            # 记录错误但不中断文件保存
            print(f"创建合同记录失败: {str(e)}")
            return None
    
    def get_beijing_time(self):
        """获取北京时间值"""
        from utils.time_utils import beijing_time
        return beijing_time()  # 🌟 注意：调用函数
    
    def _get_type_folder(self, file_type: str) -> str:
        """根据文件类型获取存储文件夹"""
        type_folders = {
            '合同': 'contracts',
            '图纸': 'designs'
        }
        return type_folders.get(file_type, 'others')
    
    def _extract_file_metadata(self, file_data: bytes, filename: str, mime_type: str) -> Dict:
        """提取文件元数据"""
        metadata = {'page_count': None, 'has_ocr': False, 'ocr_confidence': 0.0}
        
        try:
            # 处理PDF文件
            if mime_type == 'application/pdf' or filename.lower().endswith('.pdf'):
                metadata.update(self._extract_pdf_metadata(file_data))
            # 处理图片文件
            elif mime_type.startswith('image/'):
                metadata.update(self._extract_image_metadata(file_data))
        except Exception as e:
            # print(f"提取文件元数据失败: {e}")
            pass
        
        return metadata
    
    def _extract_pdf_metadata(self, file_data: bytes) -> Dict:
        """提取PDF文件元数据"""
        metadata = {'page_count': 0}
        try:
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_data))
            metadata['page_count'] = len(pdf_reader.pages)
        except Exception as e:
            # print(f"提取PDF元数据失败: {e}")
            pass
        return metadata
    
    def _extract_image_metadata(self, file_data: bytes) -> Dict:
        """提取图片元数据"""
        metadata = {}
        try:
            image = Image.open(io.BytesIO(file_data))
            metadata['image_width'] = image.width
            metadata['image_height'] = image.height
        except Exception as e:
            # print(f"提取图片元数据失败: {e}")
            pass
        return metadata
    
    def _extract_text_content(self, file_data: bytes, filename: str, mime_type: str) -> Optional[str]:
        """提取文件中的文本内容"""
        try:
            if mime_type == 'application/pdf' or filename.lower().endswith('.pdf'):
                return self._extract_pdf_text(file_data)
            elif mime_type.startswith('image/'):
                return self._extract_image_text(file_data)
        except Exception as e:
            # print(f"提取文本内容失败: {e}")
            pass
        return None
    
    def _extract_pdf_text(self, file_data: bytes) -> Optional[str]:
        """从PDF提取文本"""
        try:
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_data))
            text_content = []
            for page_num, page in enumerate(pdf_reader.pages, 1):
                try:
                    page_text = page.extract_text()
                    if page_text.strip():
                        text_content.append(page_text)
                except:
                    continue
            return "\n\n".join(text_content) if text_content else None
        except Exception as e:
            # print(f"提取PDF文本失败: {e}")
            return None
    
    def _extract_image_text(self, file_data: bytes) -> Optional[str]:
        """从图片提取文本（OCR）"""
        try:
            import pytesseract
            image = Image.open(io.BytesIO(file_data))
            text = pytesseract.image_to_string(image, lang='chi_sim+eng')
            return text if text.strip() else None
        except ImportError:
            # print("pytesseract未安装，跳过OCR")
            return None
        except Exception as e:
            # print(f"图片OCR失败: {e}")
            return None
    
    def get_by_filename(self, filename: str) -> Optional[FileUpdModel]:
        """根据文件名获取文件"""
        return self.session.query(FileUpdModel).filter_by(stored_name=filename).first()
    
    def get_by_file_type(self, file_type: str) -> List[FileUpdModel]:
        """根据文件类型获取文件列表"""
        return self.filter_by(file_type=file_type)
    
    def get_recent_files(self, limit: int = 10) -> List[FileUpdModel]:
        """获取最近上传的文件"""
        return self.session.query(FileUpdModel)\
            .order_by(desc(FileUpdModel.upload_time))\
            .limit(limit)\
            .all()
    
    def get_file_stats(self) -> Dict[str, Any]:
        """获取文件统计信息"""
        stats = {}
        
        # 总文件数
        total_count = self.session.query(func.count(FileUpdModel.id)).scalar()
        stats['total_files'] = total_count
        
        # 总文件大小
        total_size = self.session.query(func.sum(FileUpdModel.file_size)).scalar() or 0
        stats['total_size'] = total_size
        
        # 按类型统计
        type_stats = self.session.query(
            FileUpdModel.file_type,
            func.count(FileUpdModel.id).label('count'),
            func.sum(FileUpdModel.file_size).label('size')
        ).group_by(FileUpdModel.file_type).all()
        stats['by_type'] = [
            {
                'file_type': result.file_type,
                'count': result.count,
                'size': result.size or 0
            }
            for result in type_stats
        ]
        return stats
    
    def search_files(self, keyword: str, file_type: str = None) -> List[FileUpdModel]:
        """搜索文件"""
        query = self.session.query(FileUpdModel)
        
        # 在多个字段中搜索
        if keyword:
            search_conditions = []
            search_fields = ['original_name']
            
            for field in search_fields:
                if hasattr(FileUpdModel, field):
                    field_attr = getattr(FileUpdModel, field)
                    search_conditions.append(field_attr.ilike(f'%{keyword}%'))
            
            if search_conditions:
                query = query.filter(or_(*search_conditions))
        
        # 按类型过滤
        if file_type:
            query = query.filter_by(file_type=file_type)
        
        return query.all()
    
    def delete_file_with_physical(self, file_id: str) -> bool:
        """删除文件（包含物理文件）"""
        try:
            file = self.get_by_id(file_id)
            if not file:
                return False
            
            # 如果是合同文件，同时删除合同记录
            if file.file_type == '合同':
                contract = self.session.query(ContractModel).filter_by(
                    file_path=file.file_path
                ).first()
                if contract:
                    self.session.delete(contract)
            
            # 删除物理文件
            if os.path.exists(file.file_path):
                try:
                    os.remove(file.file_path)
                except OSError as e:
                    # print(f"删除物理文件失败: {e}")
                    pass
            
            # 删除数据库记录
            return self.delete(file_id)
            
        except Exception as e:
            # print(f"删除文件失败: {e}")
            return False
    
    def batch_delete_files(self, file_ids: List[str]) -> Dict[str, List]:
        """批量删除文件"""
        results = {'deleted': [], 'failed': []}
        
        for file_id in file_ids:
            try:
                if self.delete_file_with_physical(file_id):
                    results['deleted'].append(file_id)
                else:
                    results['failed'].append({
                        'file_id': file_id,
                        'error': '文件不存在'
                    })
            except Exception as e:
                results['failed'].append({
                    'file_id': file_id,
                    'error': str(e)
                })
        
        return results

    def batch_upload_files(self, files, file_type: str, company_id: str = None, 
                          contract_data_list: List[Dict] = None) -> Dict[str, List]:
        """批量上传文件"""
        results = {'success': [], 'failed': []}
        
        contract_data_list = contract_data_list or []
        
        for i, file in enumerate(files):
            try:
                # 验证文件
                is_valid, message = self.validate_upload(file, file_type)
                if not is_valid:
                    results['failed'].append({
                        'filename': file.filename,
                        'error': message
                    })
                    continue
                
                # 获取对应的合同数据
                contract_data = contract_data_list[i] if i < len(contract_data_list) else None

                # print(f" 合同数据: {contract_data}")
                
                # 保存文件
                file_info = self.save_uploaded_file(
                    file=file, 
                    file_type=file_type,
                    company_id=company_id,
                    contract_data=contract_data
                )
                results['success'].append(file_info)
                
            except Exception as e:
                results['failed'].append({
                    'filename': file.filename,
                    'error': str(e)
                })
        
        return results
    
    def get_file_content(self, file_id: str) -> Optional[bytes]:
        """获取文件内容"""
        try:
            file = self.get_by_id(file_id)
            if file and file.file_content:
                return file.file_content
        except Exception as e:
            # print(f"获取文件内容失败: {e}")
            pass
        return None
    
    def get_paginated_files(self, page=1, page_size=10, file_type=None, keyword=None, company_id=None):
        """获取分页文件列表"""
        try:
            
            # 确保 self.session 存在
            if not hasattr(self, 'session'):
                # 尝试从父类获取
                if hasattr(self, 'db') and hasattr(self.db, 'session'):
                    self.session = self.db.session
                elif hasattr(self, 'db') and hasattr(self.db, 'query'):
                    # 如果 self.db 本身就是 session
                    self.session = self.db
                else:
                    raise AttributeError("无法获取数据库 session")
            
            query = self.session.query(FileUpdModel)
            
            # 应用类型过滤
            if file_type:
                query = query.filter(FileUpdModel.file_type == file_type)

            # 应用公司ID过滤
            if company_id and company_id != "all":
                query = query.filter(FileUpdModel.company_id == company_id)
            
            # 应用关键字搜索
            if keyword:
                query = query.filter(
                    (FileUpdModel.original_name.ilike(f'%{keyword}%')) 
                )
            
            # 计算总数
            total = query.count()
            
            # 计算分页
            total_pages = (total + page_size - 1) // page_size
            offset = (page - 1) * page_size
            
            # 获取当前页数据
            query = query.order_by(FileUpdModel.upload_time.desc())
            files = query.offset(offset).limit(page_size).all()

            return {
                'items': files,
                'total': total,
                'page': page,
                'pageSize': page_size,
                'totalPages': total_pages
            }
            
        except Exception as e:
            self.logger.error(f"获取分页文件列表错误: {str(e)}")
            raise
    
    def get_contract_by_file_id(self, file_id: str) -> Optional[Dict]:
        """根据文件ID获取关联的合同信息"""
        try:
            file = self.get_by_id(file_id)
            if not file or file.file_type != '合同':
                return None
            
            contract = self.session.query(ContractModel).filter_by(
                file_path=file.file_path
            ).first()
            
            if contract:
                return contract.to_response_dict()
            return None
            
        except Exception as e:
            print(f"获取合同信息失败: {str(e)}")
            return None
    
    def get_by_company_id(self, company_id: str, file_type: str = None) -> List[FileUpdModel]:
        """根据客户ID获取文件列表"""
        try:
            query = self.session.query(FileUpdModel).filter_by(company_id=company_id)
            
            if file_type:
                query = query.filter_by(file_type=file_type)
            
            return query.order_by(desc(FileUpdModel.upload_time)).all()
        except Exception as e:
            if hasattr(self, 'logger') and self.logger:
                self.logger.error(f'获取公司文件列表失败 company_id={company_id}: {e}')
            return []
    
    def search_files(self, keyword: str, file_type: str = None, company_id: str = None) -> List[FileUpdModel]:
        """搜索文件"""
        try:
            query = self.session.query(FileUpdModel)
            
            # 应用公司ID过滤
            if company_id:
                query = query.filter(FileUpdModel.company_id == company_id)
            
            # 应用类型过滤
            if file_type:
                query = query.filter(FileUpdModel.file_type == file_type)
            
            # 关键字搜索
            if keyword and keyword.strip():
                search_conditions = []
                search_fields = ['original_name', 'text_content']
                
                for field in search_fields:
                    if hasattr(FileUpdModel, field):
                        field_attr = getattr(FileUpdModel, field)
                        search_conditions.append(field_attr.ilike(f'%{keyword}%'))
                
                if search_conditions:
                    query = query.filter(or_(*search_conditions))
            
            return query.order_by(desc(FileUpdModel.upload_time)).all()
            
        except Exception as e:
            if hasattr(self, 'logger') and self.logger:
                self.logger.error(f'搜索文件失败 keyword={keyword}: {e}')
            return []