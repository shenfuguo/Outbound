// src/router/routes.tsx
import { RouteObject } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import Home from "../pages/about/Home";
import NotFound from "../pages/about/NotFound";

// 文件管理模块
import FileUpload from "../pages/file-management/FileUpload";
import FileList from "../pages/file-management/FileList";

// 任务单模块
import TaskList from "../pages/task/TaskList";
import ProductionProgress from "../pages/task/ProductionProgress";
import QualityInspection from "../pages/task/QualityInspection";
import ProcurementList from "../pages/task/ProcurementList";

// 会计模块
import ContractAmount from "../pages/accounting/ContractAmount";
import CostAccounting from "../pages/accounting/CostAccounting";

// 库房模块
import WarehouseList from "../pages/warehouse/WarehouseList";
import ProductInbound from "../pages/warehouse/ProductInbound";
import ProductOutbound from "../pages/warehouse/ProductOutbound";
import OutboundReceiptList from "../pages/warehouse/OutboundReceiptList";

// 备品备件模块
import SparePartsContract from "../pages/spare-parts/SparePartsContract";
import SparePartsList from "../pages/spare-parts/SparePartsList";

// 客户信息模块
import CompanyInfo from "../pages/company/CompanyInfo";
import CompanyLogin from "../pages/company/CompanyLogin";

// 权限管理模块
import PermissionSetting from "../pages/permission/PermissionSetting";

// 用户管理模块
import PasswordChange from "../pages/user/PasswordChange";

// 合同模块
import ContractPreview from "../pages/contract/ContractPreview";

// 关于我们模块
import About from "../pages/about/About";

// 路由配置数组
export const routes: RouteObject[] = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
        handle: {
          title: "首页 - 文件管理系统",
          requiresAuth: false,
        },
      },
      // 文件管理相关
      {
        path: "upload",
        element: <FileUpload />,
        handle: {
          title: "文件上传 - 文件管理系统",
          requiresAuth: true,
        },
      },
      {
        path: "files",
        element: <FileList />,
        handle: {
          title: "文件上传一览 - 文件管理系统",
          requiresAuth: true,
        },
      },
      // 任务单相关
      {
        path: "task/list",
        element: <TaskList />,
        handle: {
          title: "任务单一览 - 文件管理系统",
          requiresAuth: true,
        },
      },
      {
        path: "task/production",
        element: <ProductionProgress />,
        handle: {
          title: "生产进度 - 文件管理系统",
          requiresAuth: true,
        },
      },
      {
        path: "task/quality",
        element: <QualityInspection />,
        handle: {
          title: "质检进度 - 文件管理系统",
          requiresAuth: true,
        },
      },
      {
        path: "task/procurement",
        element: <ProcurementList />,
        handle: {
          title: "采购一览 - 文件管理系统",
          requiresAuth: true,
        },
      },
      // 会计相关
      {
        path: "accounting/contract",
        element: <ContractAmount />,
        handle: {
          title: "合同金额 - 文件管理系统",
          requiresAuth: true,
        },
      },
      {
        path: "accounting/cost",
        element: <CostAccounting />,
        handle: {
          title: "成本核算 - 文件管理系统",
          requiresAuth: true,
        },
      },
      // 库房相关
      {
        path: "warehouse/list",
        element: <WarehouseList />,
        handle: {
          title: "现有库房一览 - 文件管理系统",
          requiresAuth: true,
        },
      },
      {
        path: "warehouse/inbound",
        element: <ProductInbound />,
        handle: {
          title: "成品入库 - 文件管理系统",
          requiresAuth: true,
        },
      },
      {
        path: "warehouse/outbound",
        element: <ProductOutbound />,
        handle: {
          title: "成品出库 - 文件管理系统",
          requiresAuth: true,
        },
      },
      {
        path: "warehouse/receipts",
        element: <OutboundReceiptList />,
        handle: {
          title: "出库回执单一览 - 文件管理系统",
          requiresAuth: true,
        },
      },
      // 备品备件相关
      {
        path: "spare-parts/contract",
        element: <SparePartsContract />,
        handle: {
          title: "备品备件合同上传 - 文件管理系统",
          requiresAuth: true,
        },
      },
      {
        path: "spare-parts/list",
        element: <SparePartsList />,
        handle: {
          title: "备品备件一览 - 文件管理系统",
          requiresAuth: true,
        },
      },
      // 客户信息相关
      {
        path: "company/login",
        element: <CompanyLogin />,
        handle: {
          title: "公司登录 - 文件管理系统",
          requiresAuth: false,
        },
      },
      {
        path: "company/info",
        element: <CompanyInfo />,
        handle: {
          title: "公司信息管理 - 文件管理系统",
          requiresAuth: true,
        },
      },
      // 权限管理相关
      {
        path: "permission/setting",
        element: <PermissionSetting />,
        handle: {
          title: "基本权限设定 - 文件管理系统",
          requiresAuth: true,
        },
      },
      // 用户管理相关
      {
        path: "user/password",
        element: <PasswordChange />,
        handle: {
          title: "密码修正 - 文件管理系统",
          requiresAuth: true,
        },
      },
      // 合同相关
      {
        path: "contract/contract_info",
        element: <ContractPreview />,
        handle: {
          title: "合同信息管理 - 文件管理系统",
          requiresAuth: true,
        },
      },
      {
        path: "contract/preview",
        element: <ContractPreview />,
        handle: {
          title: "合同预览 - 文件管理系统",
          requiresAuth: true,
        },
      },
      {
        path: "about",
        element: <About />,
        handle: {
          title: "关于我们 - 文件管理系统",
          requiresAuth: false,
        },
      },
    ],
  },
  // 独立路由（不需要侧边栏的页面）
  {
    path: "*",
    element: <NotFound />,
    handle: {
      title: "页面未找到 - 文件管理系统",
    },
  },
];

// 路径常量
export const ROUTE_PATHS = {
  HOME: "/",
  UPLOAD: "/upload",
  FILES: "/files",
  TASK_LIST: "/task/list",
  PRODUCTION_PROGRESS: "/task/production",
  QUALITY_INSPECTION: "/task/quality",
  PROCUREMENT_LIST: "/task/procurement",
  CONTRACT_AMOUNT: "/accounting/contract",
  COST_ACCOUNTING: "/accounting/cost",
  WAREHOUSE_LIST: "/warehouse/list",
  PRODUCT_INBOUND: "/warehouse/inbound",
  PRODUCT_OUTBOUND: "/warehouse/outbound",
  OUTBOUND_RECEIPT_LIST: "/warehouse/receipts",
  SPARE_PARTS_CONTRACT: "/spare-parts/contract",
  SPARE_PARTS_LIST: "/spare-parts/list",
  PERMISSION_SETTING: "/permission/setting",
  PASSWORD_CHANGE: "/user/password",
  COMPANY_LOGIN: "/company/login",
  COMPANY_INFO: "/company/info",
  CONTRACT_INFO: "/contract/contract_info",
  CONTRACT_PREVIEW: "/contract/preview",
  ABOUT: "/about",
} as const;

// 层级菜单配置
export interface MenuItem {
  key: string;
  label: string;
  path?: string;
  icon?: string;
  children?: MenuItem[];
  level?: number; // 层级，用于缩进显示
}

export const MENU_CONFIG: MenuItem[] = [
  {
    key: "home",
    label: "首页",
    path: ROUTE_PATHS.HOME,
    icon: "🏠",
  },
  {
    key: "file-management",
    label: "文件管理",
    icon: "📁",
    children: [
      {
        key: "upload",
        label: "文件上传",
        path: ROUTE_PATHS.UPLOAD,
        icon: "📤",
      },
      {
        key: "files",
        label: "文件上传一览",
        path: ROUTE_PATHS.FILES,
        icon: "📄",
      },
    ],
  },
  {
    key: "task",
    label: "任务单",
    icon: "📋",
    children: [
      {
        key: "task-list",
        label: "任务单一览",
        path: ROUTE_PATHS.TASK_LIST,
        icon: "📃",
      },
      {
        key: "production",
        label: "生产进度",
        path: ROUTE_PATHS.PRODUCTION_PROGRESS,
        icon: "⚙️",
      },
      {
        key: "quality",
        label: "质检进度",
        path: ROUTE_PATHS.QUALITY_INSPECTION,
        icon: "✅",
      },
      {
        key: "procurement",
        label: "采购一览",
        path: ROUTE_PATHS.PROCUREMENT_LIST,
        icon: "🛒",
      },
    ],
  },
  {
    key: "accounting",
    label: "会计",
    icon: "💰",
    children: [
      {
        key: "contract-amount",
        label: "合同金额",
        path: ROUTE_PATHS.CONTRACT_AMOUNT,
        icon: "💵",
      },
      {
        key: "cost-accounting",
        label: "成本核算",
        path: ROUTE_PATHS.COST_ACCOUNTING,
        icon: "🧮",
      },
    ],
  },
  {
    key: "warehouse",
    label: "库房",
    icon: "🏪",
    children: [
      {
        key: "warehouse-list",
        label: "现有库房一览",
        path: ROUTE_PATHS.WAREHOUSE_LIST,
        icon: "📦",
      },
      {
        key: "product-inbound",
        label: "成品入库",
        path: ROUTE_PATHS.PRODUCT_INBOUND,
        icon: "📥",
      },
      {
        key: "product-outbound",
        label: "成品出库",
        path: ROUTE_PATHS.PRODUCT_OUTBOUND,
        icon: "📤",
      },
      {
        key: "receipts",
        label: "出库回执单一览",
        path: ROUTE_PATHS.OUTBOUND_RECEIPT_LIST,
        icon: "🧾",
      },
    ],
  },
  {
    key: "spare-parts",
    label: "备品备件",
    icon: "🔧",
    children: [
      {
        key: "spare-contract",
        label: "备品备件合同上传",
        path: ROUTE_PATHS.SPARE_PARTS_CONTRACT,
        icon: "📄",
      },
      {
        key: "spare-list",
        label: "备品备件一览",
        path: ROUTE_PATHS.SPARE_PARTS_LIST,
        icon: "🔩",
      },
    ],
  },
  {
    key: "contract",
    label: "合同管理",
    icon: "📄",
    children: [
      {
        key: "contract-info",
        label: "合同信息管理",
        path: ROUTE_PATHS.CONTRACT_INFO,
        icon: "📊",
      },
      {
        key: "contract-preview",
        label: "合同预览",
        path: ROUTE_PATHS.CONTRACT_PREVIEW,
        icon: "👁️",
      },
    ],
  },
  {
    key: "company",
    label: "公司管理",
    icon: "🏢",
    children: [
      {
        key: "company-info",
        label: "公司信息管理",
        path: ROUTE_PATHS.COMPANY_INFO,
        icon: "🏢",
      },
    ],
  },
  {
    key: "customer",
    label: "客户管理",
    icon: "👥",
    children: [
      {
        key: "company-login",
        label: "公司登录",
        path: ROUTE_PATHS.COMPANY_LOGIN,
        icon: "🔐",
      },
    ],
  },
  {
    key: "permission",
    label: "权限管理",
    icon: "🔐",
    children: [
      {
        key: "permission-setting",
        label: "基本权限设定",
        path: ROUTE_PATHS.PERMISSION_SETTING,
        icon: "⚙️",
      },
    ],
  },
  {
    key: "user",
    label: "用户管理",
    icon: "👤",
    children: [
      {
        key: "password-change",
        label: "密码修正",
        path: ROUTE_PATHS.PASSWORD_CHANGE,
        icon: "🔑",
      },
    ],
  },
  {
    key: "about",
    label: "关于我们",
    path: ROUTE_PATHS.ABOUT,
    icon: "ℹ️",
  },
];
