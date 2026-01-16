import React from "react";
import { Link } from "react-router-dom";
import { ROUTE_PATHS } from "../router/routes";

const About: React.FC = () => {
  const teamMembers = [
    {
      name: "张明",
      role: "创始人 & CEO",
      avatar: "👨‍💼",
      description: "10年文件管理系统开发经验",
    },
    {
      name: "李华",
      role: "技术总监",
      avatar: "👩‍💻",
      description: "全栈开发专家",
    },
    {
      name: "王芳",
      role: "产品经理",
      avatar: "👩‍💼",
      description: "用户体验设计专家",
    },
    {
      name: "陈伟",
      role: "运维工程师",
      avatar: "👨‍🔧",
      description: "系统架构与运维",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">关于我们</h1>
          <p className="text-xl text-gray-600">
            致力于提供最好的文件管理解决方案
          </p>
        </div>

        {/* 公司介绍 */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              我们的故事
            </h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              文件管理系统成立于2020年，我们深知在现代数字化工作中，高效的文件管理对于个人和团队的重要性。
              我们的使命是通过技术创新，让文件管理变得简单、安全、高效。
            </p>
            <p className="text-gray-700 mb-6 leading-relaxed">
              经过多年的发展，我们已经为数千家企业提供了可靠的文件管理服务，涵盖了从个人用户到大型企业的各种需求场景。
            </p>
          </div>
        </div>

        {/* 团队介绍 */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">我们的团队</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className="text-4xl">{member.avatar}</div>
                <div>
                  <h3 className="font-semibold text-gray-900">{member.name}</h3>
                  <p className="text-blue-600 text-sm">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 联系方式 */}
        <div className="bg-linear-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">联系我们</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">联系信息</h3>
              <ul className="space-y-2">
                <li className="flex items-center space-x-3">
                  <span>📧</span>
                  <span>support@filemanager.com</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span>📞</span>
                  <span>400-123-4567</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span>📍</span>
                  <span>北京市朝阳区科技园区创新大厦A座1001</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">立即开始</h3>
              <p className="mb-4 opacity-90">
                准备好体验专业的文件管理服务了吗？
              </p>
              <Link
                to={ROUTE_PATHS.UPLOAD}
                className="inline-block bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                开始免费试用
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
