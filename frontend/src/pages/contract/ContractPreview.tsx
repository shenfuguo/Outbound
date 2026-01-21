// src/pages/ContractPreview.tsx
import React, { useState, useEffect, useMemo } from "react";
import { api, ApiError } from "../../utils/api";

// 公司数据接口
interface CompanyData {
  id: string;
  companyName: string;
  address?: string;
  contact1: string;
  phone1: string;
  contact2?: string;
  phone2?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

// 文件数据接口
interface FileData {
  id: string;
  companyId: string;
  originalName: string;
  fileName: string;
  fileType: number;
  filePath: string;
  fileSize: number;
  fileSizeStr: string;
  mimeType: string;
  uploadedBy?: string;
  uploadedAt: string;
  remarks?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// 合同数据接口
interface ContractData {
  id: number;
  fileId: string;
  companyId: number;
  contractTitle?: string;
  contractAmount: number;
  paidAmount: number;
  startDate: string;
  endDate: string;
  finalPaymentDate?: string;
  finalPaymentAmount?: number;
  fileUrl?: string;
  fileName?: string;
  mainContent?: string;
  memo?: string;
  createdAt: string;
  updatedAt: string;
  companyName?: string;
}

// 预览模态框组件
interface PreviewModalProps {
  contract: ContractData | null;
  onClose: () => void;
}

// PDF预览模态框组件
interface PDFPreviewModalProps {
  fileId: string;
  companyId: string;
  fileName?: string;
  onClose: () => void;
}

// 文件预览信息接口
interface FilePreviewInfo {
  success: boolean;
  fileId: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  companyId: string;
  message?: string;
  status: string;
}

// 新合同数据接口
interface NewContractData {
  id?: number;
  contractTitle: string;
  mainContent: string;
  memo: string;
  contractAmount: string;
  paidAmount: string;
  startDate: string;
  endDate: string;
  finalPaymentDate: string;
  finalPaymentAmount: string;
  fileId: string;
  isNew: boolean; // 标记是否是新增的行
  isEditing: boolean; // 标记是否在编辑状态
}

interface ApiResponse<T> {
  data: T;
  message: string;
  status: string; // 或 success: boolean
  success?: boolean; // 有些API用这个字段
}

// 组合类型
type FilePreviewInfoResponse = ApiResponse<FilePreviewInfo>;

// 分页接口
interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ contract, onClose }) => {
  if (!contract) return null;

  return (
    // <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="fixed inset-0 backdrop-blur-sm bg-white/20 flex items-center justify-center z-50 p-4!">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 模态框头部 */}
        <div className="bg-linear-to-r from-blue-600! to-purple-700 px-6! py-3! text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">合同预览</h2>
            <p className="text-blue-100 text-sm">
              {contract.contractTitle || "无标题合同"}
            </p>
          </div>
          {/* <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl"
          >
            ✕
          </button> */}
        </div>

        {/* 模态框内容 */}
        <div className="flex-1 overflow-y-auto p-6!">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6! mb-6!">
            {/* 左侧信息 */}
            <div className="space-y-4">
              <div className="bg-gray-50 p-4! rounded-xl">
                <h3 className="font-semibold text-gray-700! mb-3! flex items-center">
                  <span className="mr-2!">📄</span> 合同信息
                </h3>
                <div className="space-y-2">
                  <div className="flex">
                    <span className="w-28! text-gray-600">合同标题：</span>
                    <span className="font-medium">
                      {contract.contractTitle || "未设置"}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-28! text-gray-600">合同编号：</span>
                    <span className="font-medium">
                      CONTRACT-{contract.id.toString().padStart(6, "0")}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-28! text-gray-600">公司名称：</span>
                    <span className="font-medium">
                      {contract.companyName || "未知公司"}
                    </span>
                  </div>
                </div>
              </div>

              {/* 金额信息 */}
              <div className="bg-blue-50 p-4! rounded-xl">
                <h3 className="font-semibold text-gray-700! mb-3! flex items-center">
                  <span className="mr-2!">💰</span> 金额信息
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600!">合同金额：</span>
                    <span className="font-semibold text-blue-600!">
                      ¥{contract.contractAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600!">已付金额：</span>
                    <span className="font-semibold text-green-600!">
                      ¥{contract.paidAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600!">未付金额：</span>
                    <span className="font-semibold text-red-600!">
                      ¥
                      {(
                        contract.contractAmount - contract.paidAmount
                      ).toLocaleString()}
                    </span>
                  </div>
                  {contract.finalPaymentAmount && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">尾款金额：</span>
                      <span className="font-semibold text-orange-600!">
                        ¥{contract.finalPaymentAmount.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 右侧信息 */}
            <div className="space-y-4">
              {/* 日期信息 */}
              <div className="bg-green-50 p-4! rounded-xl">
                <h3 className="font-semibold text-gray-700! mb-3! flex items-center">
                  <span className="mr-2!">📅</span> 日期信息
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">开始日期：</span>
                    <span className="font-medium">{contract.startDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">结束日期：</span>
                    <span className="font-medium">{contract.endDate}</span>
                  </div>
                  {contract.finalPaymentDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">尾款时间：</span>
                      <span className="font-medium text-orange-600!">
                        {contract.finalPaymentDate}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">创建时间：</span>
                    <span className="font-medium">
                      {new Date(contract.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* 文件信息 */}
              {contract.fileUrl && (
                <div className="bg-indigo-50 p-4! rounded-xl">
                  <h3 className="font-semibold text-gray-700! mb-3! flex items-center">
                    <span className="mr-2!">📁</span> 文件信息
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">文件：</span>
                      <a
                        href={contract.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600! hover:text-blue-800! underline text-sm"
                      >
                        {contract.fileName || "下载文件"}
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 主要内容 */}
          {contract.mainContent && (
            <div className="mb-6!">
              <h3 className="font-semibold text-gray-700 mb-3! flex items-center">
                <span className="mr-2!">📋</span> 主要内容
              </h3>
              <div className="bg-white border border-gray-200 rounded-xl p-4!">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {contract.mainContent}
                </p>
              </div>
            </div>
          )}

          {/* 备忘录 */}
          {contract.memo && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-3! flex items-center">
                <span className="mr-2!">📝</span> 备忘录
              </h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4!">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {contract.memo}
                </p>
              </div>
            </div>
          )}

          {/* 文件预览 */}
          {contract.fileUrl && contract.fileUrl.endsWith(".pdf") && (
            <div className="mt-6!">
              <h3 className="font-semibold text-gray-700 mb-3! flex items-center">
                <span className="mr-2!">👁️</span> 文件预览
              </h3>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <iframe
                  src={`${contract.fileUrl}#view=FitH`}
                  className="w-full h-[600px]"
                  title="合同预览"
                />
              </div>
            </div>
          )}
        </div>

        {/* 模态框底部 */}
        <div className="border-t border-gray-200! px-6! py-4! flex justify-end">
          <button
            onClick={onClose}
            className="px-6! py-2! bg-gray-200! text-gray-700 rounded-lg hover:bg-gray-300! transition-colors duration-200"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

// PDF预览模态框组件
const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  fileId,
  companyId,
  fileName = "PDF预览",
  onClose,
}) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<FilePreviewInfo | null>(null);

  useEffect(() => {
    const loadPDF = async () => {
      if (!fileId || !companyId) {
        setError("缺少文件信息");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // 1. 首先获取文件预览信息
        const fileDataResponse = await api.get<FilePreviewInfoResponse>(
          `/files/${fileId}/preview`,
          { companyId: companyId },
        );

        if (fileDataResponse && fileDataResponse.data) {
          const fileData = fileDataResponse.data;

          // 检查success字段是否存在
          if (fileDataResponse.status === "success") {
            setFileInfo(fileData);

            // 2. 获取PDF文件内容
            const pdfBlob = await api.get<Blob>(
              `/files/${fileId}/content`,
              { companyId }, // params对象
              { responseType: "blob" as any }, // 配置对象
            );

            if (pdfBlob) {
              const blob = new Blob([pdfBlob as BlobPart], {
                type: "application/pdf",
              });
              const url = window.URL.createObjectURL(blob);
              setPdfUrl(url);
            } else {
              setError("获取PDF文件内容失败");
            }
          } else {
            setError(fileData.message || "获取文件信息失败");
          }
        } else {
          setError("无效的响应格式");
        }
      } catch (err: any) {
        console.error("加载PDF失败:", err);
        if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError("加载PDF文件失败，请检查网络连接");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadPDF();

    // 清理函数
    return () => {
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl);
        console.log("PDF URL已清理");
      }
    };
  }, [fileId, companyId]);

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/50! flex items-center justify-center z-100 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* 头部 */}
        <div className="bg-linear-to-r from-blue-600! to-purple-600! px-6 py-4 text-white flex justify-between items-center">
          <div className="flex items-center">
            <div className="mr-3! text-2xl">📄</div>
            <div>
              <h2 className="text-xl font-bold">PDF预览 - {fileName}</h2>
              <p className="text-blue-100 text-sm">
                文件ID: {fileId} | 客户ID: {companyId}
              </p>
            </div>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-hidden p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin text-4xl text-blue-600! mb-4">
                  ⏳
                </div>
                <p className="text-gray-600">正在加载PDF文件...</p>
                <p className="text-sm text-gray-500 mt-2">请稍候</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-6xl text-red-500 mb-4">❌</div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">
                  加载失败
                </h3>
                <p className="text-gray-600! mb-4!">{error}</p>
                {fileInfo?.filePath && (
                  <p className="text-sm text-gray-500! mb-4!">
                    文件路径: {fileInfo.filePath}
                  </p>
                )}
                <button
                  onClick={onClose}
                  className="px-4! py-2! bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  关闭
                </button>
              </div>
            </div>
          ) : pdfUrl ? (
            <div className="h-full border border-gray-200 rounded-lg overflow-hidden">
              <iframe
                src={`${pdfUrl}#view=FitH&toolbar=1&navpanes=1&scrollbar=1`}
                className="w-full h-full"
                title={fileName}
                style={{ border: "none" }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-6xl text-gray-400 mb-4">📄</div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">
                  无法预览PDF
                </h3>
                <p className="text-gray-600 mb-4">
                  PDF文件加载失败，请尝试重新加载
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-600! text-white rounded-lg hover:bg-blue-700! transition-colors"
                >
                  重新加载
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 底部操作区 */}
        <div className="border-t border-gray-200! px-6! py-4! flex justify-between items-center bg-gray-50">
          <div className="text-sm text-gray-600">
            {fileInfo && (
              <>
                <span className="mr-4!">文件名: {fileInfo.fileName}</span>
                <span>大小: {formatFileSize(fileInfo.fileSize)}</span>
              </>
            )}
          </div>
          <div className="flex space-x-3">
            {pdfUrl && (
              <>
                <a
                  href={pdfUrl}
                  download={fileName}
                  className="px-4! py-2! bg-blue-600! text-white! rounded-lg hover:bg-blue-700! transition-colors flex items-center"
                >
                  <svg
                    className="w-4! h-4! mr-2!"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  下载
                </a>
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4! py-2! bg-green-600! text-white! rounded-lg hover:bg-green-700! transition-colors flex items-center"
                >
                  <svg
                    className="w-4! h-4! mr-2!"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  新窗口打开
                </a>
              </>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200! text-gray-700! rounded-lg hover:bg-gray-300! transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 公司服务
const companyService = {
  async getCompanies(): Promise<CompanyData[]> {
    const response = await api.get<any>("/companies");
    return response.data?.companies || [];
  },
  async getCompanyById(id: string): Promise<CompanyData> {
    const response = await api.get<any>(`/companies/${id}`);
    return response.data || response;
  },
};

// 文件服务
const fileService = {
  async getCompanyFiles(
    companyId: string,
    fileType: number = 1,
  ): Promise<FileData[]> {
    try {
      console.log(`获取公司ID ${companyId} 的文件，文件类型: ${fileType}`);
      const response = await api.get<any>("/files", {
        params: { companyId, fileType },
      });

      let filesData: FileData[] = [];

      if (response && response.data) {
        if (Array.isArray(response.data)) {
          filesData = response.data as FileData[];
        } else if (response.data.files && Array.isArray(response.data.files)) {
          filesData = response.data.files as FileData[];
        } else if (
          typeof response.data === "object" &&
          "data" in response.data &&
          Array.isArray((response.data as any).data)
        ) {
          filesData = (response.data as any).data as FileData[];
        }
      } else if (Array.isArray(response)) {
        filesData = response as FileData[];
      }

      return filesData;
    } catch (error: any) {
      console.error("获取文件列表失败:", error);
      throw error;
    }
  },

  // 新增：获取文件预览信息
  async getFilePreview(
    fileId: string,
    companyId: string,
  ): Promise<FilePreviewInfo> {
    try {
      const filePreviewData = await api.get<FilePreviewInfo>(
        `/files/${fileId}/preview`,
        { companyId: companyId },
      );
      return filePreviewData;
    } catch (error: any) {
      console.error("获取文件预览信息失败:", error);
      throw new Error(error.response?.data?.message || "获取文件信息失败");
    }
  },

  // 新增：获取文件内容
  async getFileContent(fileId: string, companyId: string): Promise<Blob> {
    try {
      const fileContentData = await api.get(`/files/${fileId}/content`, {
        params: { companyId },
        responseType: "blob" as any,
      });
      return fileContentData as Blob;
    } catch (error: any) {
      console.error("获取文件内容失败:", error);
      throw new Error(error.response?.data?.message || "获取文件内容失败");
    }
  },
};

// 合同服务
const contractService = {
  async getAllContracts(): Promise<ContractData[]> {
    const response = await api.get<any>("/contracts");
    let contractsData: ContractData[] = [];

    if (response && response.data) {
      if (Array.isArray(response.data)) {
        contractsData = response.data as ContractData[];
      } else if (
        response.data.contracts &&
        Array.isArray(response.data.contracts)
      ) {
        contractsData = response.data.contracts as ContractData[];
      } else if (
        typeof response.data === "object" &&
        "data" in response.data &&
        Array.isArray((response.data as any).data)
      ) {
        contractsData = (response.data as any).data as ContractData[];
      }
    } else if (Array.isArray(response)) {
      contractsData = response as ContractData[];
    }

    return contractsData;
  },

  async getCompanyContracts(companyId: string): Promise<ContractData[]> {
    const response = await api.get<any>("/contracts", { companyId: companyId });

    let contractsData: ContractData[] = [];

    if (response && response.data) {
      if (Array.isArray(response.data)) {
        contractsData = response.data as ContractData[];
      } else if (
        response.data.contracts &&
        Array.isArray(response.data.contracts)
      ) {
        contractsData = response.data.contracts as ContractData[];
      } else if (
        typeof response.data === "object" &&
        "data" in response.data &&
        Array.isArray((response.data as any).data)
      ) {
        contractsData = (response.data as any).data as ContractData[];
      }
    } else if (Array.isArray(response)) {
      contractsData = response as ContractData[];
    }

    return contractsData;
  },

  async getContractById(id: number): Promise<ContractData> {
    const response = await api.get<any>(`/contracts/${id}`);
    return response.data || response;
  },

  async createContract(contractData: any): Promise<ContractData> {
    const response = await api.post<any>("/contracts", contractData);
    return response.data || response;
  },

  async updateContract(id: number, contractData: any): Promise<ContractData> {
    const response = await api.put<any>(`/contracts/${id}`, contractData);
    return response.data || response;
  },
};

const ContractPreview: React.FC = () => {
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [allContracts, setAllContracts] = useState<ContractData[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<ContractData[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingContracts, setIsLoadingContracts] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [previewContract, setPreviewContract] = useState<ContractData | null>(
    null,
  );

  // PDF预览状态
  const [pdfPreview, setPdfPreview] = useState<{
    fileId: string;
    companyId: string;
    fileName: string;
  } | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // 文件列表状态
  const [files, setFiles] = useState<FileData[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 可编辑列表状态
  const [contractList, setContractList] = useState<
    (ContractData | NewContractData)[]
  >([]);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // 筛选和分页状态
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 15,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [filteredContractList, setFilteredContractList] = useState<
    (ContractData | NewContractData)[]
  >([]);

  // 计算剩余金额
  const calculateRemainingAmount = (
    contract: ContractData | NewContractData,
  ) => {
    const contractAmount =
      parseFloat(
        typeof contract.contractAmount === "string"
          ? contract.contractAmount
          : contract.contractAmount.toString(),
      ) || 0;
    const paidAmount =
      parseFloat(
        typeof contract.paidAmount === "string"
          ? contract.paidAmount
          : contract.paidAmount.toString(),
      ) || 0;
    return (contractAmount - paidAmount).toFixed(2);
  };

  // 加载公司列表
  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoading(true);
      try {
        const companiesData = await companyService.getCompanies();
        console.log("获取公司列表:", companiesData.length);
        setCompanies(companiesData);

        if (companiesData.length === 0) {
          setMessage({
            text: "暂无公司数据，请先添加公司",
            type: "info",
          });
        }
      } catch (error: any) {
        console.error("获取公司列表失败:", error);
        setMessage({
          text:
            error instanceof ApiError
              ? error.message
              : "网络连接失败，请检查网络设置",
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  // 首次加载时获取所有合同
  useEffect(() => {
    const fetchAllContracts = async () => {
      setIsLoadingContracts(true);
      try {
        const contractsData = await contractService.getAllContracts();
        setAllContracts(contractsData);
        setFilteredContracts(contractsData);
        setContractList(contractsData);

        // 初始分页设置
        const totalPages = Math.ceil(
          contractsData.length / pagination.pageSize,
        );
        setPagination((prev) => ({
          ...prev,
          totalItems: contractsData.length,
          totalPages,
          hasNextPage: totalPages > 1,
          hasPrevPage: false,
        }));

        if (contractsData.length > 0) {
          setMessage({
            text: `加载了 ${contractsData.length} 个合同`,
            type: "success",
          });
        } else {
          setMessage({
            text: "暂无合同数据",
            type: "info",
          });
        }
      } catch (error: any) {
        console.error("获取合同列表失败:", error);
        setMessage({
          text: error instanceof ApiError ? error.message : "获取合同列表失败",
          type: "error",
        });
      } finally {
        setIsLoadingContracts(false);
      }
    };

    fetchAllContracts();
  }, []);

  // 当选择公司时，加载该公司的文件
  useEffect(() => {
    if (!selectedCompany) {
      setFiles([]);
      return;
    }

    const fetchFiles = async () => {
      setIsLoadingFiles(true);
      try {
        const filesData = await fileService.getCompanyFiles(selectedCompany, 1);
        setFiles(filesData);
      } catch (error: any) {
        console.error("获取文件列表失败:", error);
      } finally {
        setIsLoadingFiles(false);
      }
    };

    fetchFiles();
  }, [selectedCompany]);

  // 处理公司选择变化
  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const companyId = e.target.value;
    console.log("选择公司ID:", companyId);
    setSelectedCompany(companyId);
    setIsAddingNew(false);

    // 筛选该公司的合同
    if (companyId) {
      const selectedCompanyData = companies.find((c) => c.id === companyId);
      const companyContracts = allContracts.filter(
        (contract) => contract.companyId.toString() === companyId,
      );

      setFilteredContracts(companyContracts);
      setContractList(companyContracts);

      const totalPages = Math.ceil(
        companyContracts.length / pagination.pageSize,
      );
      setPagination((prev) => ({
        ...prev,
        currentPage: 1,
        totalItems: companyContracts.length,
        totalPages,
        hasNextPage: totalPages > 1,
        hasPrevPage: false,
      }));

      if (companyContracts.length > 0) {
        setMessage({
          text: `筛选到 ${companyContracts.length} 个合同`,
          type: "success",
        });
      } else {
        setMessage({
          text: "该公司暂无合同数据",
          type: "info",
        });
      }
    } else {
      // 如果没有选择公司，显示所有合同
      setFilteredContracts(allContracts);
      setContractList(allContracts);

      const totalPages = Math.ceil(allContracts.length / pagination.pageSize);
      setPagination((prev) => ({
        ...prev,
        currentPage: 1,
        totalItems: allContracts.length,
        totalPages,
        hasNextPage: totalPages > 1,
        hasPrevPage: false,
      }));
    }
  };

  // 处理搜索变化
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (!term.trim()) {
      // 如果搜索词为空，恢复当前筛选结果
      if (selectedCompany) {
        const companyContracts = allContracts.filter(
          (contract) => contract.companyId.toString() === selectedCompany,
        );
        setFilteredContracts(companyContracts);
        setContractList(companyContracts);
      } else {
        setFilteredContracts(allContracts);
        setContractList(allContracts);
      }
    } else {
      // 执行模糊搜索
      const searchResults = (
        selectedCompany
          ? allContracts.filter(
              (contract) => contract.companyId.toString() === selectedCompany,
            )
          : allContracts
      ).filter((contract) => {
        const searchFields = [
          contract.contractTitle || "",
          contract.mainContent || "",
          contract.memo || "",
          contract.fileName || "",
        ];

        return searchFields.some((field) =>
          field.toLowerCase().includes(term.toLowerCase()),
        );
      });

      setFilteredContracts(searchResults);
      setContractList(searchResults);

      const totalPages = Math.ceil(searchResults.length / pagination.pageSize);
      setPagination((prev) => ({
        ...prev,
        currentPage: 1,
        totalItems: searchResults.length,
        totalPages,
        hasNextPage: totalPages > 1,
        hasPrevPage: false,
      }));

      if (searchResults.length > 0) {
        setMessage({
          text: `搜索到 ${searchResults.length} 个匹配的合同`,
          type: "success",
        });
      } else {
        setMessage({
          text: "没有找到匹配的合同",
          type: "info",
        });
      }
    }
  };

  // 分页计算
  const getPaginatedData = useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return contractList.slice(startIndex, endIndex);
  }, [contractList, pagination.currentPage, pagination.pageSize]);

  // 更新分页信息
  useEffect(() => {
    const totalPages = Math.ceil(contractList.length / pagination.pageSize);
    setPagination((prev) => ({
      ...prev,
      totalItems: contractList.length,
      totalPages,
      hasNextPage: pagination.currentPage < totalPages,
      hasPrevPage: pagination.currentPage > 1,
    }));

    // 如果当前页大于总页数，且总页数大于0，则跳转到最后一页
    if (pagination.currentPage > totalPages && totalPages > 0) {
      setPagination((prev) => ({ ...prev, currentPage: totalPages }));
    }
  }, [contractList, pagination.currentPage, pagination.pageSize]);

  // 处理分页变化
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;

    setPagination((prev) => ({
      ...prev,
      currentPage: newPage,
      hasNextPage: newPage < prev.totalPages,
      hasPrevPage: newPage > 1,
    }));
  };

  // 处理页码点击
  const handlePageClick = (pageNumber: number) => {
    handlePageChange(pageNumber);
  };

  // 生成页码按钮
  const generatePageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    const { currentPage, totalPages } = pagination;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }

    return pageNumbers;
  };

  // 打开预览模态框
  const handlePreview = (contract: ContractData) => {
    setPreviewContract(contract);
  };

  // 处理PDF预览
  const handlePreviewPDF = async (contract: ContractData) => {
    if (!contract.fileId) {
      setMessage({
        text: "该合同没有关联PDF文件",
        type: "warning",
      });
      return;
    }

    if (!contract.companyId) {
      setMessage({
        text: "无法获取客户信息",
        type: "error",
      });
      return;
    }

    try {
      setIsPreviewLoading(true);
      setMessage({ text: "正在准备PDF预览...", type: "info" });

      // 打开PDF预览模态框
      setPdfPreview({
        fileId: contract.fileId,
        companyId: contract.companyId.toString(),
        fileName: contract.fileName || contract.contractTitle || "合同文件",
      });
    } catch (error: any) {
      console.error("打开PDF预览失败:", error);
      setMessage({
        text: error.message || "打开PDF预览失败",
        type: "error",
      });
    } finally {
      setIsPreviewLoading(false);
    }
  };

  // 处理输入变化
  const handleInputChange = (
    index: number,
    field: keyof NewContractData,
    value: string,
  ) => {
    setContractList((prev) => {
      const newList = [...prev];
      const contract = { ...newList[index] } as NewContractData;
      (contract as any)[field] = value;
      newList[index] = contract;
      return newList;
    });
  };

  // 处理金额输入变化
  const handleAmountChange = (
    index: number,
    field: "contractAmount" | "paidAmount" | "finalPaymentAmount",
    value: string,
  ) => {
    // 验证是否为数字
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      handleInputChange(index, field, value);
    }
  };

  // 添加新行
  const handleAddNewRow = () => {
    const newRow: NewContractData = {
      contractTitle: "",
      mainContent: "",
      memo: "",
      contractAmount: "",
      paidAmount: "",
      startDate: "",
      endDate: "",
      finalPaymentDate: "",
      finalPaymentAmount: "",
      fileId: "",
      isNew: true,
      isEditing: true,
    };
    setContractList((prev) => [newRow, ...prev]);
    setIsAddingNew(true);
  };

  // 编辑行
  const handleEditRow = (index: number) => {
    setContractList((prev) => {
      const newList = [...prev];
      const contract = { ...newList[index] } as NewContractData;
      contract.isEditing = true;
      newList[index] = contract;
      return newList;
    });
  };

  // 保存行
  const handleSaveRow = async (index: number) => {
    const contractData = contractList[index] as NewContractData;

    if (!selectedCompany) {
      setMessage({
        text: "请先选择公司",
        type: "error",
      });
      return;
    }

    // 验证必填字段
    if (
      !contractData.contractAmount ||
      !contractData.startDate ||
      !contractData.endDate
    ) {
      setMessage({
        text: "请填写合同金额、开始日期和结束日期",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("发送数据:", selectedCompany);
      const dataToSend = {
        companyId: selectedCompany,
        contractTitle:
          contractData.contractTitle ||
          `合同-${new Date().toLocaleDateString()}`,
        contractAmount: parseFloat(contractData.contractAmount) || 0,
        paidAmount: parseFloat(contractData.paidAmount) || 0,
        startDate: contractData.startDate,
        endDate: contractData.endDate,
        finalPaymentAmount: contractData.finalPaymentAmount
          ? parseFloat(contractData.finalPaymentAmount)
          : undefined,
        finalPaymentDate: contractData.finalPaymentDate || undefined,
        mainContent: contractData.mainContent || undefined,
        memo: contractData.memo || undefined,
        fileId: contractData.fileId || undefined,
      };

      let result: ContractData;
      if (contractData.id) {
        // 更新现有合同
        result = await contractService.updateContract(
          contractData.id,
          dataToSend,
        );
        setMessage({
          text: "合同更新成功",
          type: "success",
        });
      } else {
        // 创建新合同
        result = await contractService.createContract(dataToSend);
        setMessage({
          text: "合同创建成功",
          type: "success",
        });
      }

      // 刷新所有合同列表
      const contractsData = await contractService.getAllContracts();
      setAllContracts(contractsData);

      // 更新筛选结果
      if (selectedCompany || searchTerm) {
        let updatedFiltered = contractsData;

        if (selectedCompany) {
          updatedFiltered = contractsData.filter(
            (contract) => contract.companyId.toString() === selectedCompany,
          );
        }

        if (searchTerm) {
          updatedFiltered = updatedFiltered.filter((contract) => {
            const searchFields = [
              contract.contractTitle || "",
              contract.mainContent || "",
              contract.memo || "",
              contract.fileName || "",
            ];

            return searchFields.some((field) =>
              field.toLowerCase().includes(searchTerm.toLowerCase()),
            );
          });
        }

        setFilteredContracts(updatedFiltered);
        setContractList(updatedFiltered);
      } else {
        setFilteredContracts(contractsData);
        setContractList(contractsData);
      }

      setIsAddingNew(false);
    } catch (error: any) {
      console.error("保存合同失败:", error);
      setMessage({
        text:
          error instanceof ApiError
            ? error.message
            : "保存合同失败，请稍后重试",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 取消编辑
  const handleCancelEdit = (index: number) => {
    const item = contractList[index];
    if ("isNew" in item && (item as NewContractData).isNew) {
      // 如果是新增行，直接删除
      setContractList((prev) => prev.filter((_, i) => i !== index));
      setIsAddingNew(false);
    } else {
      // 如果是编辑现有行，重置为原始数据
      setContractList((prev) => {
        const newList = [...prev];
        const originalContract = allContracts.find(
          (c) => c.id === (contractList[index] as any).id,
        );
        if (originalContract) {
          newList[index] = { ...originalContract, isEditing: false };
        }
        return newList;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* 头部装饰区域 */}
        <div className="bg-linear-to-r from-blue-600 to-purple-700 rounded-2xl px-6 sm:px-8 py-6 sm:py-8 text-white mb-6 sm:mb-8">
          <div className="flex items-center space-x-4">
            <div className="text-4xl sm:text-5xl">📄</div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold">合同管理</h1>
              <p className="text-blue-100 mt-2">查看和管理公司合同信息</p>
            </div>
          </div>
        </div>

        {/* 消息提示 */}
        {message.text && (
          <div
            className={`rounded-xl p-4 mb-6 ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : message.type === "info"
                  ? "bg-blue-50 border border-blue-200 text-blue-800"
                  : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center">
              <span className="mr-3">
                {message.type === "success"
                  ? "✅"
                  : message.type === "info"
                    ? "ℹ️"
                    : "❌"}
              </span>
              <span className="font-medium">{message.text}</span>
            </div>
          </div>
        )}

        {/* 筛选和操作区域 */}
        <div className="bg-white rounded-2xl shadow-xl px-6! mb-2!">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* 公司筛选 */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">🏢</span> 公司筛选
              </h2>
              <div className="relative">
                <select
                  value={selectedCompany}
                  onChange={handleCompanyChange}
                  disabled={isLoading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">全部公司</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.companyName} (ID: {company.id})
                    </option>
                  ))}
                </select>
                {isLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span className="animate-spin">⏳</span>
                  </div>
                )}
              </div>
            </div>

            {/* 搜索框 */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">🔍</span> 搜索合同
              </h2>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="搜索合同标题、内容、备忘录..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔍
                </div>
              </div>
            </div>

            {/* 新增按钮 */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-2! pt-4!"></span>
              </h2>
              <button
                onClick={handleAddNewRow}
                disabled={isAddingNew}
                className={`w-full inline-flex justify-center items-center px-4 py-2 bg-green-600! text-white text-sm font-medium rounded-lg hover:bg-green-700! focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 ${
                  isAddingNew ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  ></path>
                </svg>
                新增合同
              </button>
            </div>
          </div>

          {/* 统计信息 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {pagination.totalItems}
                </div>
                <div className="text-sm text-gray-600">合同总数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {filteredContracts.length}
                </div>
                <div className="text-sm text-gray-600">筛选结果</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {pagination.totalPages}
                </div>
                <div className="text-sm text-gray-600">总页数</div>
              </div>
            </div>
          </div>
        </div>

        {/* 合同表格区域 */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden px-6!">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <span className="mr-2">📊</span> 合同列表
                {selectedCompany && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    （共 {pagination.totalItems} 个合同，第{" "}
                    {pagination.currentPage} 页）
                  </span>
                )}
              </h2>
              <div className="text-sm text-gray-600">
                每页显示 {pagination.pageSize} 条
              </div>
            </div>
          </div>

          {isLoadingContracts ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="animate-spin text-4xl text-blue-600 mb-4">
                  ⏳
                </div>
                <p className="text-gray-600">正在加载合同列表...</p>
              </div>
            </div>
          ) : getPaginatedData.length === 0 ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="text-6xl mb-4 text-gray-400">📄</div>
                <h3 className="text-xl font-medium text-gray-600 mb-2">
                  {selectedCompany || searchTerm
                    ? "没有找到匹配的合同"
                    : "暂无合同数据"}
                </h3>
                <p className="text-gray-500">
                  {selectedCompany || searchTerm
                    ? "请尝试其他筛选条件"
                    : "请点击'新增合同'按钮添加合同"}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        合同标题
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        主要内容
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        备忘录
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        签约应付
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        已付金额
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        剩余未付
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        开始日期
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        结束日期
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        尾款时间
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        尾款金额
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getPaginatedData.map((contract, index) => {
                      const absoluteIndex =
                        (pagination.currentPage - 1) * pagination.pageSize +
                        index;
                      const isNewContract =
                        "isNew" in contract && contract.isNew;
                      const isEditing =
                        "isEditing" in contract && contract.isEditing;
                      const isExistingContract = !isNewContract;

                      return (
                        <tr
                          key={
                            isNewContract
                              ? `new-${absoluteIndex}`
                              : (contract as ContractData).id
                          }
                          className={`${
                            isNewContract
                              ? "bg-blue-50"
                              : isEditing
                                ? "bg-yellow-50"
                                : "hover:bg-gray-50"
                          } transition-colors duration-150`}
                        >
                          {/* 合同标题 */}
                          <td className="px-3 py-2">
                            {isEditing ? (
                              <input
                                type="text"
                                value={contract.contractTitle || ""}
                                onChange={(e) =>
                                  handleInputChange(
                                    absoluteIndex,
                                    "contractTitle",
                                    e.target.value,
                                  )
                                }
                                placeholder="合同标题"
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            ) : (
                              <div
                                className="text-sm text-gray-900 font-medium truncate max-w-[120px]"
                                title={contract.contractTitle || "无标题"}
                              >
                                {contract.contractTitle || "无标题"}
                              </div>
                            )}
                          </td>

                          {/* 主要内容 */}
                          <td className="px-3 py-2">
                            {isEditing ? (
                              <input
                                type="text"
                                value={contract.mainContent || ""}
                                onChange={(e) =>
                                  handleInputChange(
                                    absoluteIndex,
                                    "mainContent",
                                    e.target.value,
                                  )
                                }
                                placeholder="主要内容"
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            ) : (
                              <div
                                className="text-sm text-gray-500 truncate max-w-[150px]"
                                title={contract.mainContent || "-"}
                              >
                                {contract.mainContent || "-"}
                              </div>
                            )}
                          </td>

                          {/* 备忘录 */}
                          <td className="px-3 py-2">
                            {isEditing ? (
                              <input
                                type="text"
                                value={contract.memo || ""}
                                onChange={(e) =>
                                  handleInputChange(
                                    absoluteIndex,
                                    "memo",
                                    e.target.value,
                                  )
                                }
                                placeholder="备忘录"
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            ) : (
                              <div
                                className="text-sm text-gray-500 truncate max-w-[120px]"
                                title={contract.memo || "-"}
                              >
                                {contract.memo || "-"}
                              </div>
                            )}
                          </td>

                          {/* 签约应付金额 */}
                          <td className="px-3 py-2 whitespace-nowrap">
                            {isEditing ? (
                              <div className="relative">
                                <input
                                  type="text"
                                  value={
                                    contract.contractAmount?.toString() || ""
                                  }
                                  onChange={(e) =>
                                    handleAmountChange(
                                      absoluteIndex,
                                      "contractAmount",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="0.00"
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                                  元
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm font-semibold text-blue-600">
                                ¥
                                {typeof contract.contractAmount === "number"
                                  ? contract.contractAmount.toLocaleString()
                                  : parseFloat(
                                      contract.contractAmount || "0",
                                    ).toLocaleString()}
                              </span>
                            )}
                          </td>

                          {/* 已付金额 */}
                          <td className="px-3 py-2 whitespace-nowrap">
                            {isEditing ? (
                              <div className="relative">
                                <input
                                  type="text"
                                  value={contract.paidAmount?.toString() || ""}
                                  onChange={(e) =>
                                    handleAmountChange(
                                      absoluteIndex,
                                      "paidAmount",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="0.00"
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                                  元
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm font-semibold text-green-600">
                                ¥
                                {typeof contract.paidAmount === "number"
                                  ? contract.paidAmount.toLocaleString()
                                  : parseFloat(
                                      contract.paidAmount || "0",
                                    ).toLocaleString()}
                              </span>
                            )}
                          </td>

                          {/* 剩余未付金额 */}
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className="text-sm font-semibold text-red-600">
                              ¥{calculateRemainingAmount(contract)}
                            </span>
                          </td>

                          {/* 开始日期 */}
                          <td className="px-3 py-2 whitespace-nowrap">
                            {isEditing ? (
                              <input
                                type="date"
                                value={contract.startDate || ""}
                                onChange={(e) =>
                                  handleInputChange(
                                    absoluteIndex,
                                    "startDate",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            ) : (
                              <span className="text-sm text-gray-600">
                                {contract.startDate}
                              </span>
                            )}
                          </td>

                          {/* 结束日期 */}
                          <td className="px-3 py-2 whitespace-nowrap">
                            {isEditing ? (
                              <input
                                type="date"
                                value={contract.endDate || ""}
                                onChange={(e) =>
                                  handleInputChange(
                                    absoluteIndex,
                                    "endDate",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            ) : (
                              <span className="text-sm text-gray-600">
                                {contract.endDate}
                              </span>
                            )}
                          </td>

                          {/* 尾款时间 */}
                          <td className="px-3 py-2 whitespace-nowrap">
                            {isEditing ? (
                              <input
                                type="date"
                                value={contract.finalPaymentDate || ""}
                                onChange={(e) =>
                                  handleInputChange(
                                    absoluteIndex,
                                    "finalPaymentDate",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            ) : (
                              <span className="text-sm text-gray-600">
                                {contract.finalPaymentDate || "-"}
                              </span>
                            )}
                          </td>

                          {/* 尾款金额 */}
                          <td className="px-3 py-2 whitespace-nowrap">
                            {isEditing ? (
                              <div className="relative">
                                <input
                                  type="text"
                                  value={
                                    contract.finalPaymentAmount?.toString() ||
                                    ""
                                  }
                                  onChange={(e) =>
                                    handleAmountChange(
                                      absoluteIndex,
                                      "finalPaymentAmount",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="0.00"
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                                  元
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm font-semibold text-orange-600">
                                {contract.finalPaymentAmount
                                  ? `¥${
                                      typeof contract.finalPaymentAmount ===
                                      "number"
                                        ? contract.finalPaymentAmount.toLocaleString()
                                        : parseFloat(
                                            contract.finalPaymentAmount || "0",
                                          ).toLocaleString()
                                    }`
                                  : "-"}
                              </span>
                            )}
                          </td>

                          {/* 操作列 */}
                          <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                            {isEditing ? (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleSaveRow(absoluteIndex)}
                                  disabled={isSubmitting}
                                  className={`px-3 py-1 bg-blue-600! text-white text-xs rounded hover:bg-blue-700 transition-colors duration-200 flex items-center ${
                                    isSubmitting
                                      ? "opacity-70 cursor-not-allowed"
                                      : ""
                                  }`}
                                >
                                  {isSubmitting ? (
                                    <span className="animate-spin text-xs mr-1">
                                      ⏳
                                    </span>
                                  ) : null}
                                  保存
                                </button>
                                <button
                                  onClick={() =>
                                    handleCancelEdit(absoluteIndex)
                                  }
                                  className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 transition-colors duration-200"
                                >
                                  取消
                                </button>
                              </div>
                            ) : isExistingContract ? (
                              <div className="flex space-x-2">
                                {/* 合同详情预览按钮 */}
                                <button
                                  onClick={() =>
                                    handlePreview(contract as ContractData)
                                  }
                                  className="px-3 py-1 bg-blue-600! text-white text-xs rounded hover:bg-blue-700! transition-colors duration-200 flex items-center"
                                  title="查看合同详情"
                                >
                                  <svg
                                    className="w-3 h-3 mr-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    ></path>
                                  </svg>
                                  详情
                                </button>

                                {/* PDF预览按钮 */}
                                <button
                                  onClick={() =>
                                    handlePreviewPDF(contract as ContractData)
                                  }
                                  disabled={
                                    isPreviewLoading ||
                                    !(contract as ContractData).fileId
                                  }
                                  className={`px-3 py-1 bg-purple-600! text-white text-xs rounded hover:bg-purple-700! transition-colors duration-200 flex items-center ${
                                    !(contract as ContractData).fileId
                                      ? "opacity-50 cursor-not-allowed"
                                      : ""
                                  }`}
                                  title="预览PDF文件"
                                >
                                  {isPreviewLoading ? (
                                    <span className="animate-spin text-xs mr-1">
                                      ⏳
                                    </span>
                                  ) : (
                                    <svg
                                      className="w-3 h-3 mr-1"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                      ></path>
                                    </svg>
                                  )}
                                  PDF预览
                                </button>

                                {/* 编辑按钮 */}
                                <button
                                  onClick={() => handleEditRow(absoluteIndex)}
                                  className="px-3 py-1 bg-yellow-600! text-white text-xs rounded hover:bg-yellow-700! transition-colors duration-200 flex items-center"
                                  title="编辑合同"
                                >
                                  <svg
                                    className="w-3 h-3 mr-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    ></path>
                                  </svg>
                                  编辑
                                </button>
                              </div>
                            ) : (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleSaveRow(absoluteIndex)}
                                  disabled={isSubmitting}
                                  className={`px-3 py-1 bg-green-600! text-white text-xs rounded hover:bg-green-700! transition-colors duration-200 flex items-center ${
                                    isSubmitting
                                      ? "opacity-70 cursor-not-allowed"
                                      : ""
                                  }`}
                                >
                                  {isSubmitting ? (
                                    <span className="animate-spin text-xs mr-1">
                                      ⏳
                                    </span>
                                  ) : null}
                                  保存
                                </button>
                                <button
                                  onClick={() =>
                                    handleCancelEdit(absoluteIndex)
                                  }
                                  className="px-3 py-1 bg-gray-200! text-gray-700 text-xs rounded hover:bg-gray-300! transition-colors duration-200"
                                >
                                  取消
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* 分页控件 */}
              {pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      显示第{" "}
                      {(pagination.currentPage - 1) * pagination.pageSize + 1}{" "}
                      到{" "}
                      {Math.min(
                        pagination.currentPage * pagination.pageSize,
                        pagination.totalItems,
                      )}{" "}
                      条， 共 {pagination.totalItems} 条
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* 上一页按钮 */}
                      <button
                        onClick={() =>
                          handlePageChange(pagination.currentPage - 1)
                        }
                        disabled={!pagination.hasPrevPage}
                        className={`px-3 py-1 text-sm rounded border ${
                          pagination.hasPrevPage
                            ? "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                        }`}
                      >
                        上一页
                      </button>

                      {/* 页码按钮 */}
                      {generatePageNumbers().map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => handlePageClick(pageNum)}
                          className={`px-3! py-1! text-sm rounded ${
                            pageNum === pagination.currentPage
                              ? "bg-gray-300! text-white"
                              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}

                      {/* 下一页按钮 */}
                      <button
                        onClick={() =>
                          handlePageChange(pagination.currentPage + 1)
                        }
                        disabled={!pagination.hasNextPage}
                        className={`px-3 py-1 text-sm rounded border ${
                          pagination.hasNextPage
                            ? "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                        }`}
                      >
                        下一页
                      </button>

                      {/* 跳转输入 */}
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600!">跳至</span>
                        <input
                          type="number"
                          min="1"
                          max={pagination.totalPages}
                          value={pagination.currentPage}
                          onChange={(e) => {
                            const newPage = parseInt(e.target.value);
                            if (!isNaN(newPage)) {
                              handlePageChange(newPage);
                            }
                          }}
                          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600!">页</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 合同详情预览模态框 */}
      {previewContract && (
        <PreviewModal
          contract={previewContract}
          onClose={() => setPreviewContract(null)}
        />
      )}

      {/* PDF预览模态框 */}
      {pdfPreview && (
        <PDFPreviewModal
          fileId={pdfPreview.fileId}
          companyId={pdfPreview.companyId}
          fileName={pdfPreview.fileName}
          onClose={() => setPdfPreview(null)}
        />
      )}
    </div>
  );
};

export default ContractPreview;
