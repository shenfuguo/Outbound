// src/router/routes.tsx
import { RouteObject } from "react-router-dom";
import Home from "./../pages/Home";
import FileUpload from "../pages/FileUpload";
import FileList from "../pages/FileList";
import CompanyLogin from "../components/CompanyLogin";
import CompanyInfo from "../components/CompanyInfo";
import About from "../pages/About";
import NotFound from "../pages/NotFound";
import ContractPreview from "../contract/ContractPreview"; // 导入合同预览页面

// 路由配置数组
export const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
    handle: {
      title: "首页 - 文件管理系统",
      requiresAuth: false,
    },
  },
  {
    path: "/upload",
    element: <FileUpload />,
    handle: {
      title: "文件上传 - 文件管理系统",
      requiresAuth: true,
    },
  },
  {
    path: "/files",
    element: <FileList />,
    handle: {
      title: "文件管理 - 文件管理系统",
      requiresAuth: true,
    },
  },
  {
    path: "/company/login",
    element: <CompanyLogin />,
    handle: {
      title: "公司信息登录 - 文件管理系统",
      requiresAuth: false,
    },
  },
  {
    path: "/company/info",
    element: <CompanyInfo />,
    handle: {
      title: "公司信息 - 文件管理系统",
      requiresAuth: true,
    },
  },
  {
    path: "/contract/contract_info", // 合同信息管理
    element: <ContractPreview />, // 使用合同预览页面
    handle: {
      title: "合同信息管理 - 文件管理系统",
      requiresAuth: true,
    },
  },
  {
    path: "/contract/preview", // 合同预览页面
    element: <ContractPreview />,
    handle: {
      title: "合同预览 - 文件管理系统",
      requiresAuth: true,
    },
  },
  {
    path: "/about",
    element: <About />,
    handle: {
      title: "关于我们 - 文件管理系统",
      requiresAuth: false,
    },
  },
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
  COMPANY_LOGIN: "/company/login",
  COMPANY_INFO: "/company/info",
  CONTRACT_INFO: "/contract/contract_info",
  CONTRACT_PREVIEW: "/contract/preview", // 新增合同预览路径
  ABOUT: "/about",
} as const;

// 导航菜单配置
export const NAVIGATION_MENU = [
  { path: ROUTE_PATHS.HOME, label: "首页", icon: "🏠" },
  { path: ROUTE_PATHS.UPLOAD, label: "文件上传", icon: "📤" },
  { path: ROUTE_PATHS.FILES, label: "文件管理", icon: "📁" },
  { path: ROUTE_PATHS.COMPANY_LOGIN, label: "客户信息登录", icon: "🏢" },
  { path: ROUTE_PATHS.COMPANY_INFO, label: "客户信息管理", icon: "🏢" },
  { path: ROUTE_PATHS.CONTRACT_INFO, label: "合同信息管理", icon: "📄" },
  { path: ROUTE_PATHS.CONTRACT_PREVIEW, label: "合同预览", icon: "📄" }, // 新增菜单项
  { path: ROUTE_PATHS.ABOUT, label: "关于我们", icon: "ℹ️" },
] as const;
