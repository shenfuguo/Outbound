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
      (match) => (match.handle as any)?.requiresAuth !== undefined,
    );
    return (match?.handle as any)?.requiresAuth || false;
  };

  // 检查是否已登录（有公司信息）
  const isLoggedIn = (): boolean => {
    const companyInfo = localStorage.getItem("companyInfo");
    return !!companyInfo;
  };

  // 获取当前激活的菜单路径（用于高亮）
  const getActiveMenuKey = (): string => {
    // 返回当前路径，用于菜单高亮
    return location.pathname;
  };

  return {
    // 当前路由信息
    currentPath: location.pathname,
    params,
    matches,
    location, // 导出 location，方便使用

    // 路由元信息
    currentTitle: getCurrentTitle(),
    needsAuth: requiresAuth(),
    activeMenuKey: getActiveMenuKey(), // 新增：用于菜单高亮

    // 路由跳转方法
    navigateTo: (path: string, state?: any) => navigate(path, { state }),

    // 类型安全的跳转方法 - 更新所有路径
    goToHome: () => navigate(ROUTE_PATHS.HOME),
    goToUpload: () => navigate(ROUTE_PATHS.UPLOAD),
    goToFiles: () => navigate(ROUTE_PATHS.FILES),
    goToAbout: () => navigate(ROUTE_PATHS.ABOUT),
    // goToCompanyLogin: () => navigate(ROUTE_PATHS.COMPANY_LOGIN),
    // goToCompanyInfo: () => navigate(ROUTE_PATHS.COMPANY_INFO),
    goToContractInfo: () => navigate(ROUTE_PATHS.CONTRACT_INFO),

    // 新增的跳转方法
    goToTaskList: () => navigate(ROUTE_PATHS.TASK_LIST),
    goToProductionProgress: () => navigate(ROUTE_PATHS.PRODUCTION_PROGRESS),
    goToQualityInspection: () => navigate(ROUTE_PATHS.QUALITY_INSPECTION),
    goToProcurementList: () => navigate(ROUTE_PATHS.PROCUREMENT_LIST),
    goToContractAmount: () => navigate(ROUTE_PATHS.CONTRACT_AMOUNT),
    goToCostAccounting: () => navigate(ROUTE_PATHS.COST_ACCOUNTING),
    goToWarehouseList: () => navigate(ROUTE_PATHS.WAREHOUSE_LIST),
    goToProductInbound: () => navigate(ROUTE_PATHS.PRODUCT_INBOUND),
    goToProductOutbound: () => navigate(ROUTE_PATHS.PRODUCT_OUTBOUND),
    goToOutboundReceiptList: () => navigate(ROUTE_PATHS.OUTBOUND_RECEIPT_LIST),
    goToSparePartsContract: () => navigate(ROUTE_PATHS.SPARE_PARTS_CONTRACT),
    goToSparePartsList: () => navigate(ROUTE_PATHS.SPARE_PARTS_LIST),
    goToCustomerRegister: () => navigate(ROUTE_PATHS.COMPANY_LOGIN),
    goToCustomerManagement: () => navigate(ROUTE_PATHS.COMPANY_INFO),
    goToPermissionSetting: () => navigate(ROUTE_PATHS.PERMISSION_SETTING),
    goToPasswordChange: () => navigate(ROUTE_PATHS.PASSWORD_CHANGE),
    goToContractPreview: () => navigate(ROUTE_PATHS.CONTRACT_PREVIEW),

    // 历史记录操作
    goBack: () => navigate(-1),
    goForward: () => navigate(1),
    go: (delta: number) => navigate(delta),

    // 路径匹配检查
    isActive: (path: string) => location.pathname === path,
    isCurrentRoute: (path: string) => location.pathname === path,

    // 路径包含检查（用于子菜单高亮）
    isPathActive: (path: string) => location.pathname.startsWith(path),

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

    // 登出
    logout: () => {
      localStorage.removeItem("companyInfo");
      localStorage.removeItem("selectedCompanyId");
      navigate(ROUTE_PATHS.COMPANY_LOGIN);
    },
  };
};
