// components/FileUpload.tsx
import React, { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import type { DragEvent } from "react";
import type { UploadProgress } from "../types";
import { request } from "../utils/request";
// import SearchableSelect, { Option } from "./SearchableSelect";
import { api } from "../utils/api";

interface FileUploadProps {
  onUploadComplete?: (files: File[]) => void;
  onUploadError?: (error: string) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  uploadUrl?: string;
}

interface Company {
  id: string;
  company_name: string;
  company_address?: string;
  contact_person?: string;
  phone?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  onUploadError,
  maxFiles = 10,
  maxSize = 100,
  uploadUrl = "/api/upload",
}) => {
  const [selectedType, setSelectedType] = useState<string>("1");
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorType, setErrorType] = useState<"error" | "warning" | "success">(
    "success",
  );
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [loadingCompanies, setLoadingCompanies] = useState<boolean>(false);

  const fileTypeConfig: Record<
    string,
    {
      // 修改类型定义
      accept: string;
      description: string;
      icon: string;
    }
  > = {
    "1": {
      // 1 代表合同
      accept: ".pdf",
      description: "请上传PDF格式的文件",
      icon: "📄",
    },
    "2": {
      // 2 代表图纸
      accept: ".jpg,.jpeg,.png,.gif,.webp",
      description: "请上传图片格式的文件 (JPG, PNG, GIF, WEBP)",
      icon: "🖼️",
    },
  };

  const fileTypeDisplayMap: Record<string, string> = {
    "1": "合同",
    "2": "图纸",
  };

  // 加载公司列表
  useEffect(() => {
    const loadCompanies = async () => {
      setLoadingCompanies(true);
      try {
        // 构建查询参数
        const params: Record<string, any> = {
          page: 1,
          pageSize: 2000,
        };
        // 调用API获取公司列表
        const response = await api.get<{
          status: string;
          data: { companies: Company[] };
          message?: string;
        }>("/companies", params);

        console.log("公司列表响应:", response);

        if (response.status === "success" && response.data?.companies) {
          setCompanies(response.data.companies);
          // 如果有公司数据，默认选择第一个
          if (response.data.companies.length > 0) {
            setSelectedCompany(response.data.companies[0].id);
          }
        } else {
          setError("加载公司列表失败");
          setErrorType("error");
          setHasError(true);
        }
      } catch (error) {
        console.error("加载公司列表失败:", error);
        setError("加载公司列表失败，请稍后重试");
        setErrorType("error");
        setHasError(true);
      } finally {
        setLoadingCompanies(false);
      }
    };

    loadCompanies();
  }, []);

  const handleTypeChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    setSelectedType(e.target.value);
    setSelectedFiles([]);
    setUploadProgress({});
    setError("");
    setHasError(false);
    setErrorType("success");
  };

  const handleCompanyChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    setSelectedCompany(e.target.value);
  };

  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    const acceptedTypes = fileTypeConfig[selectedType].accept
      .split(",")
      .map((ext) => ext.trim());
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();

    if (!acceptedTypes.includes(fileExtension || "")) {
      return { isValid: false, error: `不支持的文件格式: ${fileExtension}` };
    }

    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return { isValid: false, error: `文件大小不能超过 ${maxSize}MB` };
    }

    return { isValid: true };
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (!files) return;
    processFiles(Array.from(files));
  };

  const processFiles = (files: File[]) => {
    setError("");
    setHasError(false);
    setErrorType("success");

    const validFiles: File[] = [];
    const duplicateFiles: string[] = [];
    const validationErrors: string[] = [];

    // 第一步：先检查重复文件和验证文件
    files.forEach((file) => {
      const isDuplicate = selectedFiles.some(
        (existingFile) =>
          existingFile.name.trim().toLowerCase() ===
            file.name.trim().toLowerCase() && existingFile.size === file.size,
      );

      if (isDuplicate) {
        duplicateFiles.push(file.name);
        return;
      }

      const validation = validateFile(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        validationErrors.push(`${file.name}: ${validation.error}`);
      }
    });

    // 第二步：检查"已达到最大上传数量限制"
    if (selectedFiles.length + validFiles.length > maxFiles) {
      const errorMsg = `已达到最大上传数量限制（${maxFiles} 个文件）`;
      setError(errorMsg);
      setHasError(true);
      setErrorType("error");
      setTimeout(() => setHasError(false), 2000);
      return;
    }

    // 处理验证错误
    if (validationErrors.length > 0) {
      const errorMsg = validationErrors.join("; ");

      if (duplicateFiles.length > 0) {
        const duplicateMsg = `重复文件: ${duplicateFiles
          .map((name) => `"${name}"`)
          .join("、")}`;
        setError(`${duplicateMsg}\n\n${errorMsg}`);
        setErrorType("error");
      } else {
        setError(errorMsg);
        setErrorType("error");
      }

      setHasError(true);
      setTimeout(() => setHasError(false), 2000);
      return;
    }

    // 处理重复文件警告
    if (duplicateFiles.length > 0) {
      let message = `以下文件已经存在: ${duplicateFiles
        .map((name) => `"${name}"`)
        .join("、")}`;

      if (validFiles.length > 0) {
        setSelectedFiles((prev) => [...prev, ...validFiles]);
        const successMsg =
          validFiles.length === 1
            ? `\n\n已成功添加文件: ${validFiles[0].name}`
            : `\n\n已成功添加 ${validFiles.length} 个文件`;
        message += successMsg;
        setErrorType("warning");
      } else {
        message += "\n\n没有新文件被添加";
        setErrorType("warning");
      }

      setError(message);
      setHasError(false);
      setTimeout(() => setError(""), 5000);
      return;
    }

    // 成功添加文件
    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
      const successMsg =
        validFiles.length === 1
          ? `已添加文件: ${validFiles[0].name}`
          : `已添加 ${validFiles.length} 个文件`;
      setError(successMsg);
      setHasError(false);
      setErrorType("success");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(false);
    setError("");
    setHasError(false);
    setErrorType("success");

    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleUpload = async (): Promise<void> => {
    if (selectedFiles.length === 0) {
      setError("请先选择文件");
      setHasError(true);
      setErrorType("error");
      return;
    }

    if (!selectedCompany) {
      setError("请先选择公司");
      setHasError(true);
      setErrorType("error");
      return;
    }

    if (hasError && errorType === "error") {
      return;
    }

    setIsUploading(true);

    // 初始化进度
    const newProgress: UploadProgress = {};
    selectedFiles.forEach((file) => {
      newProgress[file.name] = 0;
    });
    setUploadProgress(newProgress);

    const results = [];
    const errors = [];

    try {
      // 依次上传每个文件
      for (const file of selectedFiles) {
        try {
          setError(`正在上传: ${file.name}`);
          setErrorType("success");

          // 创建FormData
          const formData = new FormData();
          formData.append("file", file);
          formData.append("fileType", selectedType);
          formData.append("fileName", file.name);
          formData.append("uploadTime", new Date().toISOString());
          formData.append("companyId", selectedCompany);
          console.log("附加的公司ID:", selectedCompany);
          // console.log("上传的文件:", formData);
          // console.log("上传的URL:", uploadUrl);
          // console.log("上传的文件类型:", selectedType);
          // console.log("上传的文件名:", file.name);
          // console.log("上传的时间:", new Date().toISOString());

          // 使用封装的request.uploadFile方法真实上传
          const result = await request.uploadFile(
            uploadUrl,
            formData,
            (progress: number) => {
              // 更新上传进度
              setUploadProgress((prev) => ({
                ...prev,
                [file.name]: progress,
              }));
            },
          );

          results.push({ file, result });

          // 上传完成后设置为100%
          setUploadProgress((prev) => ({
            ...prev,
            [file.name]: 100,
          }));
        } catch (fileError) {
          console.error(`文件 ${file.name} 上传失败:`, fileError);
          const errorMessage =
            fileError instanceof Error ? fileError.message : "上传失败";
          errors.push({
            file: file.name,
            error: errorMessage,
          });

          // 标记上传失败
          setUploadProgress((prev) => ({
            ...prev,
            [file.name]: -1,
          }));
        }
      }

      // 处理上传结果
      if (errors.length > 0) {
        const errorMessage = `部分文件上传失败:\n${errors
          .map((e) => `• ${e.file}: ${e.error}`)
          .join("\n")}`;
        setError(errorMessage);
        setHasError(true);
        setErrorType("error");
        onUploadError?.(errorMessage);
      } else {
        const successMessage = `✅ 成功上传 ${results.length} 个文件！`;
        setError(successMessage);
        setHasError(false);
        setErrorType("success");
        onUploadComplete?.(selectedFiles);

        // 只有全部成功时才清空文件列表
        setTimeout(() => {
          setSelectedFiles([]);
          setUploadProgress({});
          setError("");
        }, 3000);
      }
    } catch (error) {
      const errorMessage = `上传过程出错: ${
        error instanceof Error ? error.message : "未知错误"
      }`;
      setError(errorMessage);
      setHasError(true);
      setErrorType("error");
      onUploadError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  // 重试上传单个文件
  const retryUpload = async (fileName: string): Promise<void> => {
    const file = selectedFiles.find((f) => f.name === fileName);
    if (!file) return;

    try {
      setError(`重新上传: ${fileName}`);
      setErrorType("success");

      // 创建FormData
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileType", selectedType);
      formData.append("fileName", file.name);
      formData.append("uploadTime", new Date().toISOString());
      formData.append("companyId", selectedCompany);

      // 重置进度
      setUploadProgress((prev) => ({
        ...prev,
        [fileName]: 0,
      }));

      const result = await request.uploadFile(
        uploadUrl,
        formData,
        (progress: number) => {
          setUploadProgress((prev) => ({
            ...prev,
            [fileName]: progress,
          }));
        },
      );

      // 上传成功
      setUploadProgress((prev) => ({
        ...prev,
        [fileName]: 100,
      }));

      setError(`✅ ${fileName} 重新上传成功`);
      setErrorType("success");
    } catch (error) {
      const errorMessage = `重新上传失败: ${
        error instanceof Error ? error.message : "未知错误"
      }`;
      setError(errorMessage);
      setHasError(true);
      setErrorType("error");
    }
  };

  const removeFile = (fileName: string): void => {
    setSelectedFiles((prev) => prev.filter((file) => file.name !== fileName));
    setUploadProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[fileName];
      return newProgress;
    });
    setError("");
    setHasError(false);
    setErrorType("success");
  };

  const clearAllFiles = (): void => {
    setSelectedFiles([]);
    setUploadProgress({});
    setError("");
    setHasError(false);
    setErrorType("success");
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const currentConfig = fileTypeConfig[selectedType];

  // 检查是否有文件正在上传
  const isUploadInProgress = Object.values(uploadProgress).some(
    (progress) => progress > 0 && progress < 100,
  );

  // 上传按钮的禁用条件
  const isUploadButtonDisabled =
    selectedFiles.length === 0 ||
    isUploadInProgress ||
    (hasError && errorType === "error");

  // 获取进度条颜色
  const getProgressBarColor = (progress: number) => {
    if (progress === -1) return "bg-red-500";
    if (progress === 100) return "bg-green-500";
    return "bg-gradient-to-r from-green-400 to-blue-500";
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mt-5! rounded-xl">
        {/* 文件类型选择 */}
        <div className="bg-gray-50 rounded-lg p-6! mb-6">
          <div className="space-y-6">
            {/* 公司选择 */}
            <div className="flex items-center mb-3!">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap w-24 mr-4">
                选择公司：
              </label>
              {loadingCompanies ? (
                <div className="w-[430px] px-4 py-3 bg-gray-100 rounded-lg animate-pulse">
                  加载公司列表中...
                </div>
              ) : companies.length === 0 ? (
                <div className="w-[430px] px-4 py-3 bg-yellow-50 text-yellow-700 rounded-lg">
                  暂无公司数据
                </div>
              ) : (
                <select
                  value={selectedCompany}
                  onChange={handleCompanyChange}
                  disabled={isUploading}
                  className="w-[430px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">请选择公司</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.company_name}
                      {company.contact_person && ` - ${company.contact_person}`}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex items-center">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap w-24 mr-4">
                选择文件类型：
              </label>
              <div className="flex items-center gap-4">
                <select
                  value={selectedType}
                  onChange={handleTypeChange}
                  disabled={isUploading}
                  className="w-[430px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="1">合同文档 (PDF)</option>
                  <option value="2">设计图纸 (图片)</option>
                </select>
                <span className="text-red-600 whitespace-nowrap">
                  ※：{currentConfig.description}
                </span>
              </div>
            </div>
          </div>

          {/* 错误/警告/成功提示 */}
          {error && (
            <div
              className={`border rounded-lg p-4 mt-6 ${
                errorType === "error"
                  ? "bg-red-50 border-red-200 text-red-800"
                  : errorType === "warning"
                    ? "bg-yellow-50 border-yellow-200 text-yellow-800"
                    : "bg-green-50 border-green-200 text-green-800"
              }`}
            >
              <div className="flex items-center space-x-2">
                <span>
                  {errorType === "error"
                    ? "❌"
                    : errorType === "warning"
                      ? "⚠️"
                      : "✅"}
                </span>
                <span className="font-medium whitespace-pre-line">{error}</span>
              </div>
            </div>
          )}
        </div>

        <div className="h-2"></div>

        {/* 上传区域 */}
        <div className="flex items-center justify-center min-h-[300px] rounded-lg p-8 mb-6 shadow-lg bg-gray-100">
          <div
            className={`w-full max-w-2xl border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
              isDragging
                ? "border-blue-400 bg-blue-50"
                : "border-gray-300 hover:border-gray-400 bg-white"
            } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={isUploading ? undefined : handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              accept={currentConfig.accept}
              onChange={handleFileChange}
              multiple
              disabled={isUploading}
              className="hidden"
            />
            <label
              htmlFor="file-upload"
              className={`cursor-pointer flex flex-col items-center ${
                isUploading ? "cursor-not-allowed" : ""
              }`}
            >
              <div className="text-6xl mb-6">📤</div>
              <div className="text-2xl font-semibold text-gray-700 mb-3">
                {isUploading
                  ? "文件上传中..."
                  : isDragging
                    ? "释放文件以上传"
                    : "点击选择文件或拖拽文件到这里"}
              </div>
              <div className="text-lg text-gray-600 mb-4">
                支持格式: {currentConfig.accept}
              </div>
              <div className="text-sm text-gray-500">
                单个文件不超过 {maxSize}MB，最多可上传 {maxFiles} 个文件
              </div>
            </label>
          </div>
        </div>

        {/* 文件列表 */}
        {selectedFiles.length > 0 && (
          <div className="mb-6 mt-8">
            <div className="flex justify-between items-center mb-4! mt-4!">
              <h3 className="text-lg font-medium text-gray-900">
                已选文件 ({selectedFiles.length})
                {isUploadInProgress && " - 上传中..."}
              </h3>
              <button
                onClick={clearAllFiles}
                disabled={isUploading}
                className="text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                清空全部
              </button>
            </div>

            <div className="space-y-3">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <span className="text-2xl">{currentConfig.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                          {uploadProgress[file.name] === 100 && (
                            <span className="ml-2 text-green-600 text-xs">
                              ✓ 完成
                            </span>
                          )}
                          {uploadProgress[file.name] === -1 && (
                            <span className="ml-2 text-red-600 text-xs">
                              ✗ 失败
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {uploadProgress[file.name] === -1 && (
                        <button
                          onClick={() => retryUpload(file.name)}
                          disabled={isUploading}
                          className="px-3 py-1 bg-blue-500! text-white text-sm rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          重试
                        </button>
                      )}
                      <button
                        onClick={() => removeFile(file.name)}
                        disabled={isUploading}
                        className="w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-900 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        title="删除文件"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {uploadProgress[file.name] !== undefined && (
                    <div className="w-full bg-gray-200 rounded-full h-2 relative">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ease-out ${getProgressBarColor(
                          uploadProgress[file.name],
                        )}`}
                        style={{
                          width: `${
                            uploadProgress[file.name] === -1
                              ? 100
                              : Math.max(0, uploadProgress[file.name])
                          }%`,
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-medium text-white">
                          {uploadProgress[file.name] === -1
                            ? "上传失败"
                            : `${uploadProgress[file.name]}%`}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex space-x-4 mt-2!">
          <button
            onClick={handleUpload}
            disabled={isUploadButtonDisabled}
            className="flex-1 bg-linear-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isUploadInProgress ? (
              <span className="flex items-center justify-center space-x-2">
                <span className="animate-spin">⏳</span>
                <span>
                  上传中... (
                  {
                    Object.values(uploadProgress).filter(
                      (p) => p > 0 && p < 100,
                    ).length
                  }
                  /{selectedFiles.length})
                </span>
              </span>
            ) : (
              `开始上传 (${selectedFiles.length} 个文件)`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
