// src/pages/CompanyLogin.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../router/routes";
import { api, ApiError } from "../utils/api"; // 导入 api 和 ApiError

// 公司数据接口
interface CompanyData {
  companyName: string;
  address: string;
  contact1: string;
  phone1: string;
  contact2?: string;
  phone2?: string;
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
  const [formData, setFormData] = useState({
    companyName: "",
    address: "",
    contact1: "",
    phone1: "",
    contact2: "",
    phone2: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    if (!formData.companyName.trim()) {
      newErrors.companyName = "请输入公司名称";
    }

    // if (!formData.address.trim()) {
    //   newErrors.address = "请输入公司地址";
    // }

    if (!formData.contact1.trim()) {
      newErrors.contact1 = "请输入主要联系人 姓名";
    }

    if (!formData.phone1.trim()) {
      newErrors.phone1 = "请输入主要联系人 电话";
    } else if (!/^1[3-9]\d{9}$/.test(formData.phone1)) {
      newErrors.phone1 = "请输入正确的手机号码";
    }

    // 联系人2和电话2是可选的，但如果填写了联系人2，电话2也必须填写
    if (formData.contact2.trim() && !formData.phone2.trim()) {
      newErrors.phone2 = "请输入备用联系人 电话";
    } else if (
      formData.phone2.trim() &&
      !/^1[3-9]\d{9}$/.test(formData.phone2)
    ) {
      newErrors.phone2 = "请输入正确的手机号码";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 保存公司信息到数据库的函数
  const saveCompanyInfo = async (
    companyData: CompanyData
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
        // 使用自定义的错误消息
        errorMessage = error.message;

        // 可以根据状态码提供更具体的错误信息
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
        companyName: formData.companyName.trim(),
        address: formData.address.trim(),
        contact1: formData.contact1.trim(),
        phone1: formData.phone1.trim(),
        ...(formData.contact2.trim() && { contact2: formData.contact2.trim() }),
        ...(formData.phone2.trim() && { phone2: formData.phone2.trim() }),
      };

      // 调用API保存到数据库
      const result = await saveCompanyInfo(companyData);

      if (result.success) {
        // 同时保存到本地存储
        // localStorage.setItem("companyInfo", JSON.stringify(companyData));

        setIsSuccess(true);
        setSubmitMessage(" 公司信息已成功保存到数据库！");

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
      <div className="bg-white shadow-xl h-full overflow-y-hidden">
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
        <div className="pl-8! pr-4! sm:pl-12! sm:pr-6! lg:pl-16! lg:pr-8! py-6! sm:py-8! lg:py-12! w-full">
          <form
            className="max-w-6xl mx-auto space-y-6 sm:space-y-8"
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
              {/* 第一列: 公司信息 */}
              <div className="lg:col-span-1">
                <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-2xl p-6 sm:p-8 shadow-lg h-full">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="text-3xl text-blue-600">🏢</div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-blue-800">
                      公司信息
                    </h3>
                  </div>

                  <div className="space-y-6">
                    {/* 公司名称 */}
                    <div className="space-y-2">
                      <label className="block text-lg font-medium text-gray-800">
                        公司名称 <span className="text-red-500 text-xl">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleChange}
                          placeholder="请输入公司全称"
                          disabled={isSubmitting}
                          className={`w-full px-4 sm:px-5 py-3 sm:py-4 text-base sm:text-lg border-2 ${
                            errors.companyName
                              ? "border-red-400 focus:border-red-500"
                              : "border-gray-300 focus:border-blue-500"
                          } placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          🏢
                        </div>
                      </div>
                      {errors.companyName && (
                        <p className="mt-1 text-red-600 text-sm font-medium">
                          <span className="inline-flex items-center">
                            <span className="mr-1">⚠️</span>
                            {errors.companyName}
                          </span>
                        </p>
                      )}
                    </div>

                    {/* 公司地址 */}
                    <div className="space-y-2">
                      <label className="block text-lg font-medium text-gray-800">
                        公司地址
                      </label>
                      <div className="relative">
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleChange as any}
                          placeholder="请输入详细地址（可选）"
                          rows={3}
                          disabled={isSubmitting}
                          className={`w-full px-4 sm:px-5 py-3 sm:py-4 text-base sm:text-lg border-2 ${
                            errors.address
                              ? "border-red-400 focus:border-red-500"
                              : "border-gray-300 focus:border-blue-500"
                          } placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed`}
                        />
                      </div>
                      {/* {errors.address && (
                        <p className="mt-1 text-red-600 text-sm font-medium">
                          <span className="inline-flex items-center">
                            <span className="mr-1">⚠️</span>
                            {errors.address}
                          </span>
                        </p>
                      )} */}
                    </div>
                  </div>
                </div>
              </div>

              {/* 第二列: 主要联系人信息 */}
              <div className="lg:col-span-1">
                <div className="bg-linear-to-br from-green-50 to-green-100 rounded-2xl p-6 sm:p-8 shadow-lg h-full">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="text-3xl text-green-600">👥</div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-green-800">
                      主要联系人
                    </h3>
                  </div>

                  <div className="space-y-6">
                    {/* 主要联系人 */}
                    <div className="space-y-2">
                      <label className="block text-lg font-medium text-gray-800">
                        联系人姓名{" "}
                        <span className="text-red-500 text-xl">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="contact1"
                          value={formData.contact1}
                          onChange={handleChange}
                          placeholder="姓名"
                          disabled={isSubmitting}
                          className={`w-full px-4 sm:px-5 py-3 sm:py-4 text-base sm:text-lg border-2 ${
                            errors.contact1
                              ? "border-red-400 focus:border-red-500"
                              : "border-gray-300 focus:border-blue-500"
                          } placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          👤
                        </div>
                      </div>
                      {errors.contact1 && (
                        <p className="mt-1 text-red-600 text-sm font-medium">
                          <span className="inline-flex items-center">
                            <span className="mr-1">⚠️</span>
                            {errors.contact1}
                          </span>
                        </p>
                      )}
                    </div>

                    {/* 主要联系人电话 */}
                    <div className="space-y-2">
                      <label className="block text-lg font-medium text-gray-800">
                        联系电话 <span className="text-red-500 text-xl">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          name="phone1"
                          value={formData.phone1}
                          onChange={handleChange}
                          placeholder="手机号码"
                          disabled={isSubmitting}
                          className={`w-full px-4 sm:px-5 py-3 sm:py-4 text-base sm:text-lg border-2 ${
                            errors.phone1
                              ? "border-red-400 focus:border-red-500"
                              : "border-gray-300 focus:border-blue-500"
                          } placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          📱
                        </div>
                      </div>
                      {errors.phone1 && (
                        <p className="mt-1 text-red-600 text-sm font-medium">
                          <span className="inline-flex items-center">
                            <span className="mr-1">⚠️</span>
                            {errors.phone1}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 第三列: 备用联系人信息 */}
              <div className="lg:col-span-1">
                <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-2xl p-6 sm:p-8 shadow-lg h-full">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="text-3xl text-purple-600">👥</div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-purple-800">
                      备用联系人
                    </h3>
                    <span className="text-sm text-purple-600 bg-purple-200 px-2 py-1 rounded">
                      可选
                    </span>
                  </div>

                  <div className="space-y-6">
                    {/* 备用联系人 */}
                    <div className="space-y-2">
                      <label className="block text-lg font-medium text-gray-800">
                        联系人姓名
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="contact2"
                          value={formData.contact2}
                          onChange={handleChange}
                          placeholder="姓名（可选）"
                          disabled={isSubmitting}
                          className="w-full px-4 sm:px-5 py-3 sm:py-4 text-base sm:text-lg border-2 border-gray-300 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          👤
                        </div>
                      </div>
                    </div>

                    {/* 备用联系人电话 */}
                    <div className="space-y-2">
                      <label className="block text-lg font-medium text-gray-800">
                        联系电话
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          name="phone2"
                          value={formData.phone2}
                          onChange={handleChange}
                          placeholder="手机号码（可选）"
                          disabled={isSubmitting}
                          className={`w-full px-4 sm:px-5 py-3 sm:py-4 text-base sm:text-lg border-2 ${
                            errors.phone2
                              ? "border-red-400 focus:border-red-500"
                              : "border-gray-300 focus:border-blue-500"
                          } placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          📱
                        </div>
                      </div>
                      {errors.phone2 && (
                        <p className="mt-1 text-red-600 text-sm font-medium">
                          <span className="inline-flex items-center">
                            <span className="mr-1">⚠️</span>
                            {errors.phone2}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 温馨提示和按钮区域 - 占满三列 */}
            <div className="lg:col-span-3 pt-6 sm:pt-8">
              <div className="bg-linear-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 border border-yellow-200 mt-5!">
                <div className="flex items-start space-x-4">
                  <div className="text-2xl sm:text-3xl text-yellow-600">💡</div>
                  <div className="flex-1">
                    <h4 className="text-lg sm:text-xl font-medium text-yellow-800 mb-3">
                      温馨提示
                    </h4>
                    <ul className="text-yellow-700 text-sm sm:text-base space-y-2">
                      {/* <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>填写的信息将同时保存在服务器和本地浏览器中</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>您可以在"客户信息"页面随时修改这些信息</span>
                      </li> */}
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>带有红色星号(*)标记的为必填项</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>备用联系人信息为选填项，可根据需要填写</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 justify-center mt-5! mb-5!">
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
