import React from "react";
import { Link } from "react-router-dom";
import { useRouter } from "../router/useRouter";
import { ROUTE_PATHS } from "../router/routes";

const NotFound: React.FC = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12">
      <div className="max-w-md mx-auto text-center">
        {/* 404图标 */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-gray-300 mb-4">404</div>
          <div className="text-6xl mb-4">😕</div>
        </div>

        {/* 错误信息 */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">页面未找到</h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          抱歉，您访问的页面不存在或已被移动。
          请检查URL是否正确，或返回首页继续浏览。
        </p>

        {/* 操作按钮 */}
        <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
          <button
            onClick={() => router.goBack()}
            className="w-full sm:w-auto bg-white text-gray-700 px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-medium"
          >
            ↩️ 返回上页
          </button>
          <Link
            to={ROUTE_PATHS.HOME}
            className="w-full sm:w-auto bg-linear-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors font-medium inline-block"
          >
            🏠 返回首页
          </Link>
        </div>

        {/* 额外帮助 */}
        <div className="mt-8 p-4 bg-white rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">
            需要帮助？{" "}
            <Link
              to={ROUTE_PATHS.ABOUT}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              联系我们
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
