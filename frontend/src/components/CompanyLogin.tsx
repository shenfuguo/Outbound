// src/pages/CompanyLogin.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../router/routes";
import { api, ApiError } from "../utils/api";

// 公司数据接口
interface CompanyData {
  company_name: string; // 公司名称
  tax_id: string; // 新增：公司税号
  company_address?: string; // 公司地址
  contact_person: string; // 联系人
  phone: string; // 联系电话

  // 开户银行信息
  bank_name: string; // 开户银行名称
  bank_account: string; // 银行账户
  bank_code: string; // 开户银行行号
}

// 表单数据接口
interface FormData {
  // 公司基本信息
  company_name: string;
  tax_id: string;
  company_address: string;
  contact_person: string;
  phone: string;

  // 开户银行信息
  bank_name: string;
  bank_account: string;
  bank_code: string;
}

// API响应接口
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

const CompanyLogin: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    // 公司基本信息
    company_name: "",
    tax_id: "",
    company_address: "",
    contact_person: "",
    phone: "",

    // 开户银行信息
    bank_name: "",
    bank_account: "",
    bank_code: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // 清除错误提示
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // 公司基本信息验证
    if (!formData.company_name.trim()) {
      newErrors.company_name = "请输入公司名称";
    } else if (formData.company_name.trim().length < 2) {
      newErrors.company_name = "公司名称至少2个字符";
    }

    if (!formData.tax_id.trim()) {
      newErrors.tax_id = "请输入公司税号";
    } else if (formData.tax_id.trim().length < 5) {
      newErrors.tax_id = "税号格式不正确";
    }

    if (!formData.contact_person.trim()) {
      newErrors.contact_person = "请输入联系人姓名";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "请输入联系电话";
    } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = "请输入正确的手机号码";
    }

    // 开户银行信息验证
    if (!formData.bank_name.trim()) {
      newErrors.bank_name = "请输入开户银行名称";
    }

    if (!formData.bank_account.trim()) {
      newErrors.bank_account = "请输入银行账户";
    } else if (!/^\d{1,30}$/.test(formData.bank_account.trim())) {
      newErrors.bank_account = "银行账户应为数字";
    }

    if (!formData.bank_code.trim()) {
      newErrors.bank_code = "请输入开户银行行号";
    } else if (!/^\d{12}$/.test(formData.bank_code.trim())) {
      newErrors.bank_code = "银行行号应为12位数字";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 保存公司信息到数据库的函数
  const saveCompanyInfo = async (
    companyData: CompanyData,
  ): Promise<ApiResponse> => {
    try {
      console.log("正在保存公司信息到API:", companyData);

      // 调用API保存到数据库
      const response = await api.post("/companies", companyData);

      console.log("API响应:", response);

      return {
        success: true,
        data: response,
        message: "公司信息保存成功",
      };
    } catch (error: any) {
      console.error("保存公司信息失败:", error);

      // 处理不同类型的错误
      let errorMessage = "保存失败，请稍后重试";

      if (error instanceof ApiError) {
        errorMessage = error.message;

        if (error.status === 400) {
          errorMessage = "数据格式错误，请检查输入信息";
        } else if (error.status === 409) {
          errorMessage = "公司信息已存在";
        } else if (error.status === 500) {
          errorMessage = "服务器内部错误，请联系管理员";
        }
      } else if (
        error.name === "TypeError" &&
        error.message.includes("Failed to fetch")
      ) {
        errorMessage = "网络连接失败，请检查网络设置";
      }

      return {
        success: false,
        error: errorMessage,
        message: errorMessage,
      };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage("正在保存到数据库...");
    setIsSuccess(false);

    try {
      // 准备要发送的数据
      const companyData: CompanyData = {
        company_name: formData.company_name.trim(),
        tax_id: formData.tax_id.trim(),
        company_address: formData.company_address.trim() || "",
        contact_person: formData.contact_person.trim(),
        phone: formData.phone.trim(),

        // 开户银行信息
        bank_name: formData.bank_name.trim(),
        bank_account: formData.bank_account.trim(),
        bank_code: formData.bank_code.trim(),
      };

      // 调用API保存到数据库
      const result = await saveCompanyInfo(companyData);

      if (result.success) {
        setIsSuccess(true);
        setSubmitMessage("公司信息已成功保存到数据库！");

        // 3秒后跳转到客户信息页面
        setTimeout(() => {
          navigate(ROUTE_PATHS.COMPANY_INFO);
        }, 3000);
      } else {
        setIsSuccess(false);
        setSubmitMessage(`${result.message || "保存失败"}`);
      }
    } catch (error: any) {
      console.error("保存公司信息时发生错误:", error);
      setIsSuccess(false);
      setSubmitMessage(`保存失败: ${error.message || "未知错误"}`);
    } finally {
      setIsSubmitting(false);

      // 5秒后清除消息
      setTimeout(() => {
        setSubmitMessage("");
      }, 5000);
    }
  };

  return (
    <div className="h-screen bg-linear-to-br from-blue-50 to-gray-100 overflow-hidden">
      <div className="bg-white shadow-xl h-full overflow-y-auto">
        {/* 头部装饰区域 */}
        <div className="bg-linear-to-r from-blue-600 to-purple-700 px-6! sm:px-8! lg:px-12! py-10! text-white w-full">
          <div className="flex items-center space-x-4 sm:space-x-6">
            <div className="text-4xl sm:text-5xl">🏢</div>
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold">客户信息登录</h1>
            </div>
          </div>
        </div>

        {/* 主内容区域 - 使用三列布局 */}
        <div className="px-4! sm:px-8! lg:px-12! py-6! sm:py-8! lg:py-12! w-full">
          <form
            className="max-w-7xl mx-auto space-y-6 sm:space-y-8"
            onSubmit={handleSubmit}
          >
            {/* 提交状态提示 */}
            {submitMessage && (
              <div
                className={`rounded-xl p-4 ${
                  isSuccess
                    ? "bg-green-50 border border-green-200 text-green-800"
                    : "bg-red-50 border border-red-200 text-red-800"
                }`}
              >
                <div className="flex items-center">
                  <span className="mr-3">{isSuccess ? "" : "❌"}</span>
                  <span className="font-medium">{submitMessage}</span>
                  {isSubmitting && (
                    <span className="ml-3 animate-spin">⏳</span>
                  )}
                </div>
                {isSuccess && (
                  <p className="mt-2 text-sm text-green-600">
                    3秒后自动跳转到客户信息页面...
                  </p>
                )}
              </div>
            )}

            {/* 三列布局容器 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* 第一列: 公司基本信息 */}
              <div className="lg:col-span-2">
                <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-2xl p-6 sm:p-8 shadow-lg h-full">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="text-3xl text-blue-600">🏢</div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-blue-800">
                      公司基本信息
                    </h3>
                    <span className="text-sm text-blue-600 bg-blue-200 px-2 py-1 rounded">
                      必填
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 公司名称 */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-800">
                        公司名称 <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="company_name"
                          value={formData.company_name}
                          onChange={handleChange}
                          placeholder="请输入公司全称"
                          disabled={isSubmitting}
                          className={`w-full px-4 py-3 text-base border-2 ${
                            errors.company_name
                              ? "border-red-400 focus:border-red-500"
                              : "border-gray-300 focus:border-blue-500"
                          } placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          🏢
                        </div>
                      </div>
                      {errors.company_name && (
                        <p className="mt-1 text-red-600 text-sm">
                          <span className="inline-flex items-center">
                            <span className="mr-1">⚠️</span>
                            {errors.company_name}
                          </span>
                        </p>
                      )}
                    </div>

                    {/* 公司税号 */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-800">
                        公司税号 <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="tax_id"
                          value={formData.tax_id}
                          onChange={handleChange}
                          placeholder="请输入公司税号"
                          disabled={isSubmitting}
                          className={`w-full px-4 py-3 text-base border-2 ${
                            errors.tax_id
                              ? "border-red-400 focus:border-red-500"
                              : "border-gray-300 focus:border-blue-500"
                          } placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          🔢
                        </div>
                      </div>
                      {errors.tax_id && (
                        <p className="mt-1 text-red-600 text-sm">
                          <span className="inline-flex items-center">
                            <span className="mr-1">⚠️</span>
                            {errors.tax_id}
                          </span>
                        </p>
                      )}
                    </div>

                    {/* 联系人 */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-800">
                        联系人 <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="contact_person"
                          value={formData.contact_person}
                          onChange={handleChange}
                          placeholder="联系人姓名"
                          disabled={isSubmitting}
                          className={`w-full px-4 py-3 text-base border-2 ${
                            errors.contact_person
                              ? "border-red-400 focus:border-red-500"
                              : "border-gray-300 focus:border-blue-500"
                          } placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          👤
                        </div>
                      </div>
                      {errors.contact_person && (
                        <p className="mt-1 text-red-600 text-sm">
                          <span className="inline-flex items-center">
                            <span className="mr-1">⚠️</span>
                            {errors.contact_person}
                          </span>
                        </p>
                      )}
                    </div>

                    {/* 联系电话 */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-800">
                        联系电话 <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="手机号码"
                          disabled={isSubmitting}
                          className={`w-full px-4 py-3 text-base border-2 ${
                            errors.phone
                              ? "border-red-400 focus:border-red-500"
                              : "border-gray-300 focus:border-blue-500"
                          } placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          📱
                        </div>
                      </div>
                      {errors.phone && (
                        <p className="mt-1 text-red-600 text-sm">
                          <span className="inline-flex items-center">
                            <span className="mr-1">⚠️</span>
                            {errors.phone}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 公司地址 */}
                  <div className="mt-6 space-y-2">
                    <label className="block text-sm font-medium text-gray-800">
                      公司地址
                    </label>
                    <div className="relative">
                      <textarea
                        name="company_address"
                        value={formData.company_address}
                        onChange={handleChange}
                        placeholder="请输入详细地址（可选）"
                        rows={3}
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 text-base border-2 border-gray-300 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 第二列: 开户银行信息 */}
              <div className="lg:col-span-1">
                <div className="bg-linear-to-br from-green-50 to-green-100 rounded-2xl p-6 sm:p-8 shadow-lg h-full">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="text-3xl text-green-600">🏦</div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-green-800">
                      开户银行信息
                    </h3>
                    <span className="text-sm text-green-600 bg-green-200 px-2 py-1 rounded">
                      必填
                    </span>
                  </div>

                  <div className="space-y-6">
                    {/* 开户银行名称 */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-800">
                        开户银行 <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="bank_name"
                          value={formData.bank_name}
                          onChange={handleChange}
                          placeholder="请输入开户银行名称"
                          disabled={isSubmitting}
                          className={`w-full px-4 py-3 text-base border-2 ${
                            errors.bank_name
                              ? "border-red-400 focus:border-red-500"
                              : "border-gray-300 focus:border-blue-500"
                          } placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          🏦
                        </div>
                      </div>
                      {errors.bank_name && (
                        <p className="mt-1 text-red-600 text-sm">
                          <span className="inline-flex items-center">
                            <span className="mr-1">⚠️</span>
                            {errors.bank_name}
                          </span>
                        </p>
                      )}
                    </div>

                    {/* 银行账户 */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-800">
                        银行账户 <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="bank_account"
                          value={formData.bank_account}
                          onChange={handleChange}
                          placeholder="请输入银行账户"
                          disabled={isSubmitting}
                          className={`w-full px-4 py-3 text-base border-2 ${
                            errors.bank_account
                              ? "border-red-400 focus:border-red-500"
                              : "border-gray-300 focus:border-blue-500"
                          } placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          💳
                        </div>
                      </div>
                      {errors.bank_account && (
                        <p className="mt-1 text-red-600 text-sm">
                          <span className="inline-flex items-center">
                            <span className="mr-1">⚠️</span>
                            {errors.bank_account}
                          </span>
                        </p>
                      )}
                    </div>

                    {/* 开户银行行号 */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-800">
                        银行行号 <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="bank_code"
                          value={formData.bank_code}
                          onChange={handleChange}
                          placeholder="请输入12位银行行号"
                          maxLength={12}
                          disabled={isSubmitting}
                          className={`w-full px-4 py-3 text-base border-2 ${
                            errors.bank_code
                              ? "border-red-400 focus:border-red-500"
                              : "border-gray-300 focus:border-blue-500"
                          } placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          🔢
                        </div>
                      </div>
                      {errors.bank_code && (
                        <p className="mt-1 text-red-600 text-sm">
                          <span className="inline-flex items-center">
                            <span className="mr-1">⚠️</span>
                            {errors.bank_code}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 温馨提示和按钮区域 */}
            <div className="lg:col-span-3 pt-6 sm:pt-8">
              <div className="bg-linear-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 border border-yellow-200">
                <div className="flex items-start space-x-4">
                  <div className="text-2xl sm:text-3xl text-yellow-600">💡</div>
                  <div className="flex-1">
                    <h4 className="text-lg sm:text-xl font-medium text-yellow-800 mb-3">
                      温馨提示
                    </h4>
                    <ul className="text-yellow-700 text-sm sm:text-base space-y-2">
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>带有红色星号(*)标记的为必填项</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>公司税号是必填项，用于发票开具</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>银行账户信息为必填项，用于付款结算</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>银行行号应为12位数字</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 justify-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full sm:w-48 bg-linear-to-r from-blue-600 to-purple-600 text-white text-lg sm:text-xl font-bold py-4 sm:py-5 px-6 sm:px-8 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center ${
                    isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <span className="mr-2 animate-spin">⏳</span>
                      保存中...
                    </>
                  ) : (
                    <>
                      <span className="mr-2 sm:mr-3">💾</span>
                      保存并继续
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompanyLogin;
