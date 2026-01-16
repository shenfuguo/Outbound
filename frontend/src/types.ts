export interface FileTypeConfig {
  accept: string;
  description: string;
  icon: string;
}

export interface FileTypeConfigMap {
  [key: string]: FileTypeConfig;
}

export interface UploadProgress {
  [fileName: string]: number;
}

export interface FileItem {
  id: number;
  originalName: string;
  fileType: "合同" | "图纸" | "1" | "2" | string;
  size: string;
  uploadTime: string;
  url?: string;
  // 新增字段
  companyId?: string; // 添加这个
  textContent?: string; // 添加这个
  mimeTimeFormatted?: string; // 添加这个
  hasContent?: boolean; // 如果不存在就添加
  pageCount?: number; // 如果不存在就添加
  textExtracted?: boolean; // 如果不存在就添加
}

export interface Company {
  id: string;
  name: string;
  type: "合同" | "图纸" | "both"; // 公司支持的文件类型
}

export interface SelectOption {
  value: string;
  label: string;
  data?: Company; // 可选，存储原始数据
}
