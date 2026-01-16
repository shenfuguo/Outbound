// src/pages/FileList.tsx
import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { ROUTE_PATHS } from "../router/routes";
import { api } from "../utils/api";
import { formatFileSize } from "../utils/fileSizeUtils";
import { formatDateSmart } from "../utils/dateUtils";
import type { FileItem } from "../types";

// 类型定义
interface PaginationParams {
  page: number;
  pageSize: number;
  type?: string;
  search?: string;
  company?: string;
}

interface FileListResponse {
  data: {
    items?: FileItem[];
    total?: number;
    page?: number;
    pageSize?: number;
    totalPages?: number;
  };
}

interface StatsResponse {
  data?: {
    total: number;
    contracts: number;
    drawings: number;
  };
}

// 公司类型定义
interface Company {
  id: string;
  companyName: string;
  address?: string;
  contact1?: string;
  phone1?: string;
}

// 扩展的FileItem类型
interface ExtendedFileItem extends FileItem {
  companyId?: string;
  textContent?: string;
  textExtracted?: boolean;
  hasContent?: boolean;
  pageCount?: number;
  mimeTimeFormatted?: string;
}

const FileList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "合同" | "图纸">("all");
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [files, setFiles] = useState<ExtendedFileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [companies, setCompanies] = useState<Company[]>([]);
  const pageSize = 10;

  // 计算分页信息
  const totalPages = useMemo(
    () => Math.ceil(total / pageSize),
    [total, pageSize]
  );
  const startIndex = useMemo(
    () => (currentPage - 1) * pageSize,
    [currentPage, pageSize]
  );
  const endIndex = useMemo(
    () => Math.min(startIndex + pageSize, total),
    [startIndex, pageSize, total]
  );

  // 调试信息
  useEffect(() => {
    console.log("调试分页信息:", {
      total,
      pageSize,
      totalPages,
      currentPage,
      startIndex,
      endIndex,
      filesLength: files.length,
    });
  }, [total, totalPages, currentPage, files.length]);

  // 初始加载
  useEffect(() => {
    fetchFiles(1);
    fetchStats();
    fetchCompanies();
  }, []);

  // 监听筛选条件变化
  useEffect(() => {
    setCurrentPage(1);
    fetchFiles(1);
  }, [filterType, selectedCompany, searchTerm]);

  // 从API获取公司列表
  const fetchCompanies = async () => {
    setCompaniesLoading(true);
    try {
      const response = await api.get<{
        status: string;
        data: { companies: Company[] };
        message?: string;
      }>("/companies", {
        page: 1,
        pageSize: 10,
      });
      console.log("公司列表响应:", response);

      if (response.status === "success" && response.data?.companies) {
        setCompanies(response.data.companies);
      } else {
        console.error("获取公司列表失败:", response.message);
      }
    } catch (error) {
      console.error("加载公司列表失败:", error);
    } finally {
      setCompaniesLoading(false);
    }
  };

  // 获取文件数据 - 使用后端分页
  const fetchFiles = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params: PaginationParams = {
        page: page,
        pageSize: pageSize,
        ...(filterType !== "all" && {
          type: filterType === "合同" ? "1" : "2",
        }),
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCompany !== "all" && { companyId: selectedCompany }),
      };

      console.log("请求第", page, "页，参数:", params);

      const response = await api.get<FileListResponse>("/files", params);

      console.log("API响应:", {
        请求参数: params,
        响应数据: response,
        页码: page,
        本页数据: response?.data?.items?.length,
        总数: response?.data?.total,
        响应页码: response?.data?.page,
        总页数: response?.data?.totalPages,
      });

      const transformedFiles: ExtendedFileItem[] = (
        response?.data?.items || []
      ).map((file) => ({
        ...file,
        fileType:
          file.fileType === "1"
            ? "合同"
            : file.fileType === "2"
            ? "图纸"
            : file.fileType,
        companyId: file.companyId || "",
      }));

      setFiles(transformedFiles);
      setTotal(response?.data?.total || 0);
      setCurrentPage(response?.data?.page || page);
    } catch (err: any) {
      setError(err.message || "获取文件列表失败");
      console.error("Error fetching files:", err);
      setFiles([]);
      setTotal(0);
      setCurrentPage(1);
    } finally {
      setLoading(false);
    }
  };

  // 分页处理函数
  const handlePageChange = (page: number) => {
    console.log("切换到第", page, "页");
    setCurrentPage(page);
    fetchFiles(page);
  };

  // 生成分页按钮
  const renderPaginationButtons = () => {
    if (totalPages <= 1) return null;

    const buttons = [];

    // 上一页按钮
    buttons.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-4 py-2 rounded-lg ${
          currentPage === 1
            ? "bg-gray-100! text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
        }`}
      >
        上一页
      </button>
    );

    // 页码按钮
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        buttons.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`px-4 py-2 rounded-lg ${
              currentPage === i
                ? "bg-blue-500! text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            {i}
          </button>
        );
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        buttons.push(
          <span key={`ellipsis-${i}`} className="px-2 py-2 text-gray-500">
            ...
          </span>
        );
      }
    }

    // 下一页按钮
    buttons.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-4 py-2 rounded-lg ${
          currentPage === totalPages
            ? "bg-gray-100! text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
        }`}
      >
        下一页
      </button>
    );

    return <>{buttons}</>;
  };

  // 获取统计数据
  const fetchStats = async () => {
    try {
      const response = await api.get<StatsResponse>("/files/stats");
      setStats(response);
    } catch (err) {
      console.error("获取统计失败:", err);
    }
  };

  // 删除文件
  const handleDelete = async (id: number) => {
    if (window.confirm("确定要删除这个文件吗？")) {
      try {
        await api.delete(`/files/${id}`);
        // 重新获取当前页数据
        fetchFiles(currentPage);
        fetchStats();
        alert("删除成功！");
      } catch (err: any) {
        alert(`删除失败: ${err.message}`);
      }
    }
  };

  // 下载文件
  const handleDownload = async (file: ExtendedFileItem) => {
    try {
      const response = await fetch(
        `${api.getBaseURL()}/files/${file.id}/download`
      );

      if (!response.ok) {
        throw new Error("下载失败");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`下载失败: ${err.message}`);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchFiles(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const getFileTypeText = (typeCode: string): "合同" | "图纸" | string => {
    switch (typeCode) {
      case "1":
        return "合同";
      case "2":
        return "图纸";
      case "合同":
        return "合同";
      case "图纸":
        return "图纸";
      default:
        return typeCode;
    }
  };

  const getFileIcon = (type: string) => {
    const typeText = getFileTypeText(type);
    return typeText === "合同" ? "📄" : "🖼️";
  };

  const getTypeBadgeClass = (type: string) => {
    const typeText = getFileTypeText(type);
    return typeText === "合同"
      ? "bg-blue-100 text-blue-800"
      : "bg-green-100 text-green-800";
  };

  return (
    <div className="max-w-7xl mx-auto p-4 ml-24!">
      <div className="mt-5! rounded-xl">
        {/* 页面标题和操作 */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6!">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">文件管理</h1>
              <p className="text-gray-600 mt-1!">管理您上传的所有文件</p>
            </div>
            <Link
              to={ROUTE_PATHS.UPLOAD}
              className="mt-4! lg:mt-0! bg-linear-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-colors shadow-lg hover:shadow-xl inline-flex items-center"
            >
              <span className="mr-2!">📤</span>
              上传新文件
            </Link>
          </div>
          {/* 统计信息 */}
          {stats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6!">
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <div className="text-xl font-bold text-gray-800">
                  {stats?.data?.total || 0}
                </div>
                <div className="text-sm text-gray-600">总文件数</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <div className="text-xl font-bold text-blue-600">
                  {stats?.data?.contracts || 0}
                </div>
                <div className="text-sm text-gray-600">合同文档</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <div className="text-xl font-bold text-green-600">
                  {stats?.data?.drawings || 0}
                </div>
                <div className="text-sm text-gray-600">设计图纸</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <div className="text-xl font-bold text-purple-600">
                  {total || 0}
                </div>
                <div className="text-sm text-gray-600">当前显示</div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6!">
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <div className="text-xl font-bold text-gray-800">
                  {total || 0}
                </div>
                <div className="text-sm text-gray-600">总文件数</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <div className="text-xl font-bold text-blue-600">
                  {files?.filter((f) => f.fileType === "合同").length || 0}
                </div>
                <div className="text-sm text-gray-600">合同文档</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <div className="text-xl font-bold text-green-600">
                  {files?.filter((f) => f.fileType === "图纸").length || 0}
                </div>
                <div className="text-sm text-gray-600">设计图纸</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <div className="text-xl font-bold text-purple-600">
                  {files?.length || 0}
                </div>
                <div className="text-sm text-gray-600">筛选结果</div>
              </div>
            </div>
          )}
        </div>
        <div className="h-2"></div>
        {/* 搜索和过滤区域 */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6!">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 搜索框 */}
            <div className="md:col-span-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索文件名..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* 公司选择下拉框 */}
            <div>
              {companiesLoading ? (
                <div className="w-full px-4 py-3 bg-gray-100 rounded-lg animate-pulse text-center text-gray-500">
                  加载公司中...
                </div>
              ) : companies.length === 0 ? (
                <div className="w-full px-4 py-3 bg-yellow-50 text-yellow-700 rounded-lg text-center text-sm">
                  暂无公司数据
                </div>
              ) : (
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">所有公司</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.companyName}
                      {company.contact1 && ` - ${company.contact1}`}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* 文件类型过滤 */}
            <div>
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value as any);
                  // if (e.target.value === "all") {
                  //   setSelectedCompany("all");
                  // }
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">所有类型</option>
                <option value="合同">合同文档</option>
                <option value="图纸">设计图纸</option>
              </select>
            </div>
          </div>
        </div>
        {/* 加载状态 */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className="ml-4 text-gray-600">加载中...</span>
          </div>
        )}
        {/* 错误状态 */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6! text-center">
            <div className="text-4xl mb-4">❌</div>
            <h3 className="text-lg font-medium text-red-800 mb-2">加载失败</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => fetchFiles(currentPage)}
              className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
            >
              重试
            </button>
          </div>
        )}
        {/* 文件列表 */}
        {!loading && !error && (
          <>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* 表格头部 */}
              <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700">
                <div className="col-span-6 lg:col-span-5">文件名</div>
                <div className="col-span-2 hidden lg:block">类型</div>
                <div className="col-span-3 lg:col-span-2">大小</div>
                <div className="col-span-3 lg:col-span-2">上传日期</div>
                <div className="col-span-3 lg:col-span-1 text-right">操作</div>
              </div>

              {/* 文件列表 */}
              <div className="divide-y divide-gray-200">
                {files.length > 0 ? (
                  files.map((file) => (
                    <div
                      key={file.id}
                      className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="col-span-6 lg:col-span-5 flex items-center space-x-3">
                        <span className="text-2xl">
                          {getFileIcon(file.fileType)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-gray-900 truncate">
                            {file.originalName}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            ID: {file.id}
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2 hidden lg:flex items-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeBadgeClass(
                            file.fileType
                          )}`}
                        >
                          {file.fileType}
                        </span>
                      </div>
                      <div className="col-span-3 lg:col-span-2 flex items-center text-gray-600">
                        {formatFileSize(Number(file.size))}
                      </div>
                      <div className="col-span-3 lg:col-span-2 flex items-center text-gray-600">
                        {formatDateSmart(file.uploadTime)}
                      </div>
                      <div className="col-span-3 lg:col-span-1 flex items-center justify-end space-x-3">
                        <button
                          onClick={() => handleDownload(file)}
                          className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-200 hover:text-blue-800 transition-colors"
                          title="下载"
                        >
                          ⬇️
                        </button>
                        <button
                          onClick={() => handleDelete(file.id)}
                          className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 hover:text-red-800 transition-colors"
                          title="删除"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-12 text-center">
                    <div className="text-6xl mb-6!">📁</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      没有找到文件
                    </h3>
                    <p className="text-gray-600 mb-6!">
                      尝试调整搜索条件或上传新文件
                    </p>
                    <Link
                      to={ROUTE_PATHS.UPLOAD}
                      className="bg-linear-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-colors shadow-lg hover:shadow-xl inline-flex items-center"
                    >
                      <span className="mr-2!">📤</span>
                      立即上传文件
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* 分页信息 */}
            {files.length > 0 && (
              <div className="mt-6! text-sm text-gray-600 text-center">
                显示第 {startIndex + 1} - {Math.min(endIndex, total)} 条，共{" "}
                {total} 条记录
              </div>
            )}

            {/* 分页控件 */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-6! space-x-2">
                {renderPaginationButtons()}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FileList;
