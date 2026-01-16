// src/router/useRouter.tsx
import {
  useNavigate,
  useLocation,
  useParams,
  useMatches,
} from "react-router-dom";
import { ROUTE_PATHS } from "./routes";

export const useRouter = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  let matches: ReturnType<typeof useMatches> = [];
  try {
    matches = useMatches();
  } catch (error) {
    matches = [] as ReturnType<typeof useMatches>;
  }

  // 获取当前路由的标题
  const getCurrentTitle = (): string => {
    const match = matches.find((match) => (match.handle as any)?.title);
    return (match?.handle as any)?.title || "文件管理系统";
  };

  // 检查是否需要认证
  const requiresAuth = (): boolean => {
    const match = matches.find(
      (match) => (match.handle as any)?.requiresAuth !== undefined
    );
    return (match?.handle as any)?.requiresAuth || false;
  };

  // 检查是否已登录（有公司信息）
  const isLoggedIn = (): boolean => {
    const companyInfo = localStorage.getItem("companyInfo");
    return !!companyInfo;
  };

  return {
    // 当前路由信息
    currentPath: location.pathname,
    params,
    matches,

    // 路由元信息
    currentTitle: getCurrentTitle(),
    needsAuth: requiresAuth(),

    // 路由跳转方法
    navigateTo: (path: string, state?: any) => navigate(path, { state }),

    // 类型安全的跳转方法
    goToHome: () => navigate(ROUTE_PATHS.HOME),
    goToUpload: () => navigate(ROUTE_PATHS.UPLOAD),
    goToFiles: () => navigate(ROUTE_PATHS.FILES),
    goToAbout: () => navigate(ROUTE_PATHS.ABOUT),
    goToCompanyLogin: () => navigate(ROUTE_PATHS.COMPANY_LOGIN),
    goToCompanyInfo: () => navigate(ROUTE_PATHS.COMPANY_INFO),
    goToContractInfo: () => navigate(ROUTE_PATHS.CONTRACT_INFO),

    // 历史记录操作
    goBack: () => navigate(-1),
    goForward: () => navigate(1),
    go: (delta: number) => navigate(delta),

    // 路径匹配检查
    isActive: (path: string) => location.pathname === path,
    isCurrentRoute: (path: string) => location.pathname === path,

    // 获取保存的公司信息
    getCompanyInfo: () => {
      const info = localStorage.getItem("companyInfo");
      return info ? JSON.parse(info) : null;
    },

    // 保存公司信息
    saveCompanyInfo: (companyInfo: any) => {
      localStorage.setItem("companyInfo", JSON.stringify(companyInfo));
    },

    // 清除公司信息
    clearCompanyInfo: () => {
      localStorage.removeItem("companyInfo");
    },

    // 合同相关方法
    getContractInfo: () => {
      const info = localStorage.getItem("contractInfo");
      return info ? JSON.parse(info) : null;
    },

    saveContractInfo: (contractInfo: any) => {
      localStorage.setItem("contractInfo", JSON.stringify(contractInfo));
    },

    clearContractInfo: () => {
      localStorage.removeItem("contractInfo");
    },

    // 获取选中的公司ID
    getSelectedCompanyId: () => {
      return localStorage.getItem("selectedCompanyId");
    },

    setSelectedCompanyId: (companyId: string) => {
      localStorage.setItem("selectedCompanyId", companyId);
    },

    clearSelectedCompanyId: () => {
      localStorage.removeItem("selectedCompanyId");
    },
  };
};
