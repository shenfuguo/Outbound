// src/pages/CompanyInfo.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../router/routes";
import { api, ApiError } from "../utils/api";

// 公司数据类型定义
interface Company {
  id: string;
  companyName: string;
  address: string;
  contact1: string;
  phone1: string;
  contact2?: string;
  phone2?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

// 分页数据类型定义
interface PaginationData {
  currentPage: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// 排序方向类型
type SortDirection = "asc" | "desc";

// 排序字段类型
type SortField = "updatedAt";

// API响应数据类型定义
interface CompaniesResponse {
  companies: Company[];
  total: number;
  currentPage: number;
  totalPages: number;
  pageSize?: number;
}

interface CompanyResponse {
  company: Company;
}

interface SuccessResponse {
  success: boolean;
  message: string;
  data?: any;
  status?: string;
}

const CompanyInfo: React.FC = () => {
  const navigate = useNavigate();

  // 状态管理
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [displayedCompanies, setDisplayedCompanies] = useState<Company[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    pageSize: 15,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // 排序状态
  const [sortField, setSortField] = useState<SortField>("updatedAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // 弹窗相关状态
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  // 消息状态
  const [message, setMessage] = useState({ type: "", text: "" });

  // 显示消息
  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  // 在前端对数据进行排序
  const sortCompanies = useCallback(
    (
      companies: Company[],
      field: SortField,
      direction: SortDirection
    ): Company[] => {
      return [...companies].sort((a, b) => {
        let valueA: any, valueB: any;

        if (field === "updatedAt") {
          valueA = new Date(a.updatedAt).getTime();
          valueB = new Date(b.updatedAt).getTime();
        }

        if (direction === "asc") {
          return valueA - valueB;
        } else {
          return valueB - valueA;
        }
      });
    },
    []
  );

  // 搜索公司
  const searchCompanies = useCallback(
    (companies: Company[], searchTerm: string): Company[] => {
      if (!searchTerm.trim()) return companies;

      const searchLower = searchTerm.toLowerCase();
      return companies.filter(
        (company) =>
          company.companyName.toLowerCase().includes(searchLower) ||
          company.address.toLowerCase().includes(searchLower) ||
          company.contact1.toLowerCase().includes(searchLower) ||
          company.phone1.toLowerCase().includes(searchLower) ||
          (company.contact2 &&
            company.contact2.toLowerCase().includes(searchLower)) ||
          (company.phone2 &&
            company.phone2.toLowerCase().includes(searchLower)) ||
          (company.remarks &&
            company.remarks.toLowerCase().includes(searchLower))
      );
    },
    []
  );

  // 更新显示的公司数据
  const updateDisplayedCompanies = useCallback(
    (page: number = 1) => {
      if (allCompanies.length === 0) {
        setDisplayedCompanies([]);
        setPagination((prev) => ({
          ...prev,
          currentPage: page,
          total: 0,
          totalPages: 0,
        }));
        return;
      }

      // 1. 先搜索
      const searchedCompanies = searchCompanies(allCompanies, searchTerm);

      // 2. 再排序
      const sortedCompanies = sortCompanies(
        searchedCompanies,
        sortField,
        sortDirection
      );

      // 3. 最后分页
      const startIndex = (page - 1) * pagination.pageSize;
      const endIndex = startIndex + pagination.pageSize;
      const paginatedCompanies = sortedCompanies.slice(startIndex, endIndex);

      console.log("前端处理结果:", {
        total: allCompanies.length,
        searchTerm,
        searchedCount: searchedCompanies.length,
        sortedCount: sortedCompanies.length,
        page,
        pageSize: pagination.pageSize,
        startIndex,
        endIndex,
        displayed: paginatedCompanies.length,
        sortDirection,
      });

      setDisplayedCompanies(paginatedCompanies);
      setPagination((prev) => ({
        ...prev,
        currentPage: page,
        total: searchedCompanies.length,
        totalPages: Math.ceil(searchedCompanies.length / prev.pageSize),
      }));
    },
    [
      allCompanies,
      searchTerm,
      sortField,
      sortDirection,
      pagination.pageSize,
      searchCompanies,
      sortCompanies,
    ]
  );

  // 加载公司列表
  const loadCompanies = async (page: number = 1) => {
    setLoading(true);
    try {
      // 构建查询参数
      const params: Record<string, any> = {
        page: 1,
        pageSize: 1000,
      };

      console.log("加载参数:", params);

      // 使用 api.ts 工具类调用API
      const response = await api.get<
        SuccessResponse & { data: CompaniesResponse }
      >("/companies", params);

      if (response.status === "success") {
        const companiesData = response.data.companies || [];
        console.log("从API获取的数据量:", companiesData.length);

        // 保存所有数据
        setAllCompanies(companiesData);
      } else {
        showMessage("error", response.message || "加载失败");
      }
    } catch (error) {
      console.error("加载公司列表失败:", error);
      if (error instanceof ApiError) {
        showMessage("error", error.message || "API错误");
      } else {
        showMessage("error", "网络错误，请检查连接");
      }
    } finally {
      setLoading(false);
    }
  };

  // 获取单个公司详情
  const getCompanyDetail = async (
    companyId: string
  ): Promise<Company | null> => {
    try {
      const response = await api.get<
        SuccessResponse & { data: CompanyResponse }
      >(`/companies/${companyId}`);

      if (response.success) {
        return response.data.company;
      } else {
        showMessage("error", response.message || "获取公司详情失败");
        return null;
      }
    } catch (error) {
      console.error("获取公司详情失败:", error);
      if (error instanceof ApiError) {
        showMessage("error", error.message || "获取详情失败");
      }
      return null;
    }
  };

  // 初始化加载
  useEffect(() => {
    loadCompanies();
  }, []);

  // 当 allCompanies 更新时，重新计算显示数据
  useEffect(() => {
    updateDisplayedCompanies(1);
  }, [allCompanies, updateDisplayedCompanies]);

  // 搜索处理
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateDisplayedCompanies(1);
  };

  // 分页处理
  const handlePageChange = (page: number) => {
    updateDisplayedCompanies(page);
  };

  // 处理排序
  const handleSort = () => {
    // 切换排序方向
    const newDirection = sortDirection === "asc" ? "desc" : "asc";
    setSortDirection(newDirection);
  };

  // 排序状态变化时重新计算显示数据
  useEffect(() => {
    updateDisplayedCompanies(1);
  }, [sortDirection, updateDisplayedCompanies]);

  // 获取排序图标
  const getSortIcon = () => {
    return sortDirection === "asc" ? "⬆️" : "⬇️";
  };

  // 格式化时间
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // 打开详情弹窗
  const openCompanyDetail = async (company: Company) => {
    try {
      const latestCompany = await getCompanyDetail(company.id);
      if (latestCompany) {
        setSelectedCompany(latestCompany);
        setEditingCompany({ ...latestCompany });
      } else {
        setSelectedCompany(company);
        setEditingCompany({ ...company });
      }
      setIsModalOpen(true);
      setIsEditing(false);
    } catch (error) {
      console.error("打开详情弹窗失败:", error);
      setSelectedCompany(company);
      setEditingCompany({ ...company });
      setIsModalOpen(true);
      setIsEditing(false);
    }
  };

  // 关闭弹窗
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCompany(null);
    setEditingCompany(null);
    setIsEditing(false);
  };

  // 开始编辑
  const handleEdit = () => {
    setIsEditing(true);
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingCompany(selectedCompany ? { ...selectedCompany } : null);
    setIsEditing(false);
  };

  // 保存编辑
  const handleSave = async () => {
    if (!editingCompany) return;

    try {
      const updateData = {
        companyName: editingCompany.companyName,
        address: editingCompany.address,
        contact1: editingCompany.contact1,
        phone1: editingCompany.phone1,
        contact2: editingCompany.contact2 || "",
        phone2: editingCompany.phone2 || "",
        remarks: editingCompany.remarks || "",
      };

      const response = await api.put<SuccessResponse & { data: Company }>(
        `/companies/${editingCompany.id}`,
        updateData
      );

      if (response.status === "success") {
        const updatedCompany = response.data;
        console.log("更新后的公司数据:", updatedCompany);

        // 更新本地状态中的公司数据
        setAllCompanies((prev) =>
          prev.map((company) =>
            company.id === updatedCompany.id ? updatedCompany : company
          )
        );

        setSelectedCompany(updatedCompany);
        setEditingCompany({ ...updatedCompany });
        setIsEditing(false);
        showMessage("success", "公司信息更新成功");
      } else {
        showMessage("error", response.message || "更新失败");
      }
    } catch (error) {
      console.error("更新公司信息失败:", error);
      if (error instanceof ApiError) {
        showMessage("error", error.message || "更新失败");
      } else {
        showMessage("error", "网络错误，更新失败");
      }
    }
  };

  // 删除公司
  const handleDelete = async (companyId: string) => {
    if (!window.confirm("确定要删除这个公司吗？此操作不可撤销。")) {
      return;
    }

    try {
      const response = await api.delete<SuccessResponse>(
        `/companies/${companyId}`
      );

      if (response.status === "success") {
        showMessage("success", "公司删除成功");

        // 从本地状态中删除公司
        setAllCompanies((prev) =>
          prev.filter((company) => company.id !== companyId)
        );

        // 如果删除的是当前查看的公司，关闭弹窗
        if (selectedCompany?.id === companyId) {
          closeModal();
        }
      } else {
        showMessage("error", response.message || "删除失败");
      }
    } catch (error) {
      console.error("删除公司失败:", error);
      if (error instanceof ApiError) {
        showMessage("error", error.message || "删除失败");
      } else {
        showMessage("error", "网络错误，删除失败");
      }
    }
  };

  // 处理输入变化
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!editingCompany) return;

    const { name, value } = e.target;
    setEditingCompany((prev) =>
      prev
        ? {
            ...prev,
            [name]: value,
          }
        : null
    );
  };

  // 渲染分页控件
  const renderPagination = () => {
    const pages = [];
    const { currentPage, totalPages } = pagination;

    if (totalPages <= 1) return null;

    // 显示页码逻辑
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 3) {
      endPage = Math.min(5, totalPages);
    } else if (currentPage >= totalPages - 2) {
      startPage = Math.max(1, totalPages - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded-lg ${
            i === currentPage
              ? "bg-blue-500! text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex items-center justify-center space-x-2 mt-6">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
        >
          上一页
        </button>

        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              1
            </button>
            {startPage > 2 && <span className="px-2">...</span>}
          </>
        )}

        {pages}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2">...</span>}
            <button
              onClick={() => handlePageChange(totalPages)}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
        >
          下一页
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-[95%] mx-auto mb-6">
        {/* 头部 */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden w-full">
          {/* <div className="bg-white rounded-xl shadow-lg overflow-hidden w-full mb-6"> */}
          <div
            className="
            bg-linear-to-r from-blue-500 to-purple-600 px-8! py-1!"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-1xl font-bold text-white">公司信息管理</h1>
                <p className="text-blue-100 mt-1!">查看和管理所有公司信息</p>
              </div>
            </div>
          </div>
        </div>

        {/* 消息提示 */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 border-l-4 border-green-500 text-green-800"
                : "bg-red-50 border-l-4 border-red-500 text-red-800"
            }`}
          >
            <div className="flex items-center">
              <span className="text-lg mr-2!">
                {message.type === "success" ? "✅" : "❌"}
              </span>
              {message.text}
            </div>
          </div>
        )}

        {/* 搜索栏和排序控制 */}
        <div className="bg-white rounded-xl shadow-lg p-3! mb-3! ml-24!">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <form onSubmit={handleSearch} className="flex gap-4 flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索公司名称、联系人、电话..."
                className="flex-1 px-4! py-2! border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSearch(e as any);
                  }
                }}
              />
              <button
                type="submit"
                className="px-6! py-2! bg-blue-500! text-white rounded-lg font-medium hover:bg-blue-600 transition-colors whitespace-nowrap"
              >
                搜索
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  updateDisplayedCompanies(1);
                }}
                className="px-6! py-2! bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors whitespace-nowrap"
              >
                重置
              </button>
            </form>

            {/* 排序控制 */}
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
              <span className="text-sm text-gray-700 font-medium whitespace-nowrap">
                排序方式:
              </span>
              <div className="flex gap-1">
                <button
                  onClick={handleSort}
                  className={`px-3! py-1! rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${"bg-blue-100 text-blue-700 border border-blue-300"}`}
                >
                  更新时间 {getSortIcon()}
                </button>
              </div>
            </div>
          </div>

          {/* 状态显示 */}
          <div className="text-sm text-gray-600 flex items-center gap-4">
            {searchTerm && (
              <div className="flex items-center gap-2">
                <span>搜索关键词:</span>
                <span className="font-medium bg-yellow-50 px-2 py-1 rounded">
                  {searchTerm}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span>排序: 更新时间</span>
              <span className="font-medium">
                {sortDirection === "desc" ? "（最新优先）" : "（最早优先）"}
              </span>
            </div>
            <div className="text-gray-500">
              共 {pagination.total} 条，第 {pagination.currentPage}/
              {pagination.totalPages} 页
            </div>
          </div>
        </div>

        {/* 公司列表 */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden ml-24!">
          {/* 列表头部 */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                公司列表 {pagination.total > 0 && `(${pagination.total} 条)`}
              </h2>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  第 {pagination.currentPage} 页，共 {pagination.totalPages} 页
                </span>
              </div>
            </div>
          </div>

          {/* 加载状态 */}
          {loading && (
            <div className="p-8! text-center">
              <div className="animate-spin rounded-full h-8! w-8! border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-500 mt-2!">加载中...</p>
            </div>
          )}

          {/* 公司列表 */}
          {!loading && (
            <div className="divide-y divide-gray-200">
              {displayedCompanies.length === 0 ? (
                <div className="text-center py-12!">
                  <div className="text-6xl mb-4!">🏢</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2!">
                    {searchTerm ? "没有找到匹配的公司信息" : "暂无公司信息"}
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm ? "请尝试其他搜索关键词" : "请添加公司信息"}
                  </p>
                </div>
              ) : (
                displayedCompanies.map((company) => (
                  <div
                    key={company.id}
                    onClick={() => openCompanyDetail(company)}
                    className="p-3! hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2!">
                          {company.companyName}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">地址:</span>{" "}
                            {company.address}
                          </div>
                          <div>
                            <span className="font-medium">联系人:</span>{" "}
                            {company.contact1}
                          </div>
                          <div>
                            <span className="font-medium">电话:</span>{" "}
                            {company.phone1}
                          </div>
                          <div>
                            <span className="font-medium">更新时间:</span>{" "}
                            {formatDateTime(company.updatedAt)}
                          </div>
                        </div>
                        {company.remarks && (
                          <div className="mt-2!">
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2! py-1! rounded">
                              {company.remarks}
                            </span>
                          </div>
                        )}
                      </div>
                      {/* <div className="text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          正常
                        </span>
                      </div> */}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 分页 */}
          {!loading && displayedCompanies.length > 0 && renderPagination()}
        </div>
      </div>

      {/* 详情弹窗 */}
      {isModalOpen && selectedCompany && (
        <>
          {/* 背景层 */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={closeModal}
          />

          {/* 弹窗内容 */}
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <div
              className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 弹窗头部 */}
              <div className="bg-linear-to-r from-blue-500/90 to-purple-600/90 backdrop-blur px-8! py-4!">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">
                    {isEditing ? "编辑公司信息" : "公司详细信息"}
                  </h3>
                </div>
              </div>

              {/* 弹窗内容 */}
              <div className="p-6! overflow-y-auto max-h-[calc(90vh-120px)] bg-white/50">
                <div className="space-y-6">
                  {/* 公司名称 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2!">
                      公司名称
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="companyName"
                        value={editingCompany?.companyName || ""}
                        onChange={handleInputChange}
                        className="w-full px-3! py-2! border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="px-3! py-2! bg-gray-50 rounded-lg text-gray-900">
                        {selectedCompany.companyName}
                      </div>
                    )}
                  </div>

                  {/* 公司地址 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2!">
                      公司地址
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="address"
                        value={editingCompany?.address || ""}
                        onChange={handleInputChange}
                        className="w-full px-3! py-2! border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="px-3! py-2! bg-gray-50 rounded-lg text-gray-900">
                        {selectedCompany.address}
                      </div>
                    )}
                  </div>

                  {/* 联系人信息 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2!">
                        主要联系人
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="contact1"
                          value={editingCompany?.contact1 || ""}
                          onChange={handleInputChange}
                          className="w-full px-3! py-2! border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="px-3! py-2! bg-gray-50 rounded-lg text-gray-900">
                          {selectedCompany.contact1}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2!">
                        联系电话
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          name="phone1"
                          value={editingCompany?.phone1 || ""}
                          onChange={handleInputChange}
                          className="w-full px-3! py-2! border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="px-3! py-2! bg-gray-50 rounded-lg text-gray-900">
                          {selectedCompany.phone1}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 备用联系人信息 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2!">
                        备用联系人
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="contact2"
                          value={editingCompany?.contact2 || ""}
                          onChange={handleInputChange}
                          className="w-full px-3! py-2! border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="未填写"
                        />
                      ) : (
                        <div className="px-3! py-2! bg-gray-50 rounded-lg text-gray-900">
                          {selectedCompany.contact2 || "未填写"}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2!">
                        备用电话
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          name="phone2"
                          value={editingCompany?.phone2 || ""}
                          onChange={handleInputChange}
                          className="w-full px-3! py-2! border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="未填写"
                        />
                      ) : (
                        <div className="px-3! py-2! bg-gray-50 rounded-lg text-gray-900">
                          {selectedCompany.phone2 || "未填写"}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 备注 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2!">
                      备注
                    </label>
                    {isEditing ? (
                      <textarea
                        name="remarks"
                        value={editingCompany?.remarks || ""}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3! py-2! border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="请输入备注信息"
                      />
                    ) : (
                      <div className="px-3! py-2! bg-gray-50 rounded-lg text-gray-900 min-h-20">
                        {selectedCompany.remarks || "无备注"}
                      </div>
                    )}
                  </div>

                  {/* 时间信息 */}
                  {!isEditing && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4! border-t border-gray-200">
                      <div>
                        <span className="text-sm text-gray-500">创建时间:</span>
                        <p className="text-sm text-gray-900">
                          {formatDateTime(selectedCompany.createdAt)}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">更新时间:</span>
                        <p className="text-sm text-gray-900">
                          {formatDateTime(selectedCompany.updatedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 弹窗底部按钮 */}
              <div className="px-6 py-4 border-t border-gray-200/50 bg-white/50">
                <div className="flex justify-between items-center">
                  <div>
                    {!isEditing && (
                      <button
                        onClick={() => handleDelete(selectedCompany.id)}
                        className="px-4! py-2! text-white bg-red-500! rounded-lg hover:bg-red-600 transition-colors"
                      >
                        删除
                      </button>
                    )}
                  </div>
                  <div className="flex justify-end space-x-3">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleCancelEdit}
                          className="px-4! py-2! text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          取消
                        </button>
                        <button
                          onClick={handleSave}
                          className="px-4! py-2! text-white bg-green-500! rounded-lg hover:bg-green-600 transition-colors"
                        >
                          保存
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={handleEdit}
                          className="px-4! py-2! text-white bg-blue-500! rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          编辑
                        </button>
                        <button
                          onClick={closeModal}
                          className="px-4! py-2! text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          关闭
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CompanyInfo;
