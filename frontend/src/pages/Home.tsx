import React from "react";
import { Link } from "react-router-dom";
import { ROUTE_PATHS } from "./../router/routes";

const Home: React.FC = () => {
  const features = [
    {
      icon: "🚀",
      title: "极速上传",
      description: "支持大文件分片上传，断点续传，确保上传稳定快速",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: "🔒",
      title: "安全可靠",
      description: "文件加密存储，多重备份，保障您的数据安全",
      color: "from-green-500 to-green-600",
    },
    {
      icon: "📱",
      title: "多端适配",
      description: "完美支持电脑、平板、手机等各种设备访问",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: "⚡",
      title: "高效管理",
      description: "智能文件分类，快速搜索，批量操作",
      color: "from-orange-500 to-orange-600",
    },
    {
      icon: "🔍",
      title: "精准搜索",
      description: "支持文件名、类型、时间等多维度搜索",
      color: "from-red-500 to-red-600",
    },
    {
      icon: "👥",
      title: "团队协作",
      description: "支持文件共享，多人协同编辑",
      color: "from-indigo-500 to-indigo-600",
    },
  ];

  const stats = [
    { number: "10,000+", label: "活跃用户" },
    { number: "500,000+", label: "上传文件" },
    { number: "99.9%", label: "服务可用性" },
    { number: "24/7", label: "技术支持" },
  ];

  return (
    <div className="min-h-screen w-full">
      {/* 英雄区域 */}
      <section className="bg-linear-to-br from-blue-50 via-white to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
              专业的
              <span className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}
                文件管理{" "}
              </span>
              解决方案
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              安全、高效、易用的文件上传和管理平台，支持多种文件格式，为个人和团队提供专业的文件管理服务
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to={ROUTE_PATHS.UPLOAD}
                className="bg-linear-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                🚀 立即开始上传
              </Link>
              <Link
                to={ROUTE_PATHS.ABOUT}
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:border-blue-500 hover:text-blue-600 transition-all duration-200"
              >
                ℹ️ 了解更多
              </Link>
            </div>
          </div>

          {/* 统计数据 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 特性介绍 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              为什么选择我们？
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              我们提供全方位的文件管理解决方案，满足您的各种需求
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-linear-to-br from-white to-gray-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-blue-200"
              >
                <div
                  className={`w-16 h-16 bg-linear-to-r ${feature.color} rounded-lg flex items-center justify-center text-2xl text-white mb-4`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 文件类型支持 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              支持的文件类型
            </h2>
            <p className="text-xl text-gray-600">全面支持各种常用文件格式</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="text-3xl mr-3">📄</span>
                  合同文档
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>PDF 文档 (.pdf)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>支持数字签名验证</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>自动OCR文字识别</span>
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="text-3xl mr-3">🖼️</span>
                  设计图纸
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>图片文件 (.jpg, .png, .gif)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>支持高分辨率图片</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>在线预览和标注</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 区域 */}
      <section className="py-20 bg-linear-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">立即开始使用</h2>
          <p className="text-xl mb-8 opacity-90">
            加入数千家企业的选择，体验专业的文件管理服务
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={ROUTE_PATHS.UPLOAD}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              免费开始使用
            </Link>
            <Link
              to={ROUTE_PATHS.ABOUT}
              className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              了解更多
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
