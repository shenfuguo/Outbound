import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useRouter } from "../router/useRouter";
import { NAVIGATION_MENU, ROUTE_PATHS } from "../router/routes";
interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();

  // 动态设置页面标题
  useEffect(() => {
    document.title = router.currentTitle;
  }, [router.currentTitle]);

  const isActive = (path: string) => {
    return router.isActive(path)
      ? "text-blue-600 border-blue-600 bg-blue-50"
      : "text-gray-600 border-transparent hover:text-blue-500 hover:border-blue-300";
  };

  return (
    <div className="layout-container min-h-screen bg-gray-50 flex flex-col">
      {/* 导航栏 */}
      <nav className="bg-white shadow-lg sticky top-0 z-50 w-full">
        <div className="page-content-center">
          <div className="flex justify-between items-center h-16 w-full">
            {/* Logo */}
            <Link
              to={ROUTE_PATHS.HOME}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity shrink-0"
            ></Link>

            {/* 导航菜单 */}
            <div className="flex-1">
              <div className="hidden md:flex space-x-1 max-w-2xl mx-auto">
                {NAVIGATION_MENU.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 font-medium border-b-2 transition-all duration-200 rounded-lg ${isActive(
                      item.path
                    )} shrink-0`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容区域 - 固定高度，确保页脚位置固定 */}
      <main className={`flex-1 min-h-0 overflow-auto  `}>
        <div className={`py-6 h-full`}>{children}</div>
      </main>

      {/* 页脚 - 固定在底部 */}
      <footer className="bg-gray-800 text-white w-full shrink-0">
        <div className="page-content-center py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
            {/* 联系我们 */}
            <div className="w-full">
              <h4 className="font-semibold mb-4 text-lg">联系我们</h4>
              {/* 使用Flex布局替代Grid */}
              <div className="flex flex-col lg:flex-row lg:items-center gap-3 text-gray-400">
                <div className="flex items-center space-x-2 whitespace-nowrap">
                  <span>📧</span>
                  <span className="text-sm">support@filemanager.com</span>
                </div>
                <div className="flex items-center space-x-2 whitespace-nowrap">
                  <span>📞</span>
                  <span className="text-sm">400-123-4567</span>
                </div>
                <div className="flex items-center space-x-2 whitespace-nowrap">
                  <span>📍</span>
                  <span className="text-sm">北京市朝阳区科技园区</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
