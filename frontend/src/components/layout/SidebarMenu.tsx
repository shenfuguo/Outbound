// src/components/layout/SidebarMenu.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // 添加 useNavigate 和 useLocation
import { MENU_CONFIG, MenuItem } from "../../router/routes";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  FileOutlined,
  FolderOutlined,
  ContainerOutlined,
  AccountBookOutlined,
  ShopOutlined,
  ToolOutlined,
  TeamOutlined,
  LockOutlined,
  UserOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Button, theme } from "antd";

const { Sider } = Layout;

interface SidebarMenuProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ collapsed, onCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([
    location.pathname,
  ]);

  // 当路由变化时更新选中的菜单项
  useEffect(() => {
    setSelectedKeys([location.pathname]);

    // 自动展开当前路由的父菜单
    const currentPath = location.pathname;
    const openMenuKeys: string[] = [];

    // 查找当前路径对应的父菜单
    const findParentKey = (items: MenuItem[]): string | null => {
      for (const item of items) {
        if (item.path === currentPath && item.children) {
          return item.key;
        }
        if (item.children) {
          const parentKey = findParentKey(item.children);
          if (parentKey) {
            openMenuKeys.push(item.key);
            return parentKey;
          }
        }
      }
      return null;
    };

    findParentKey(MENU_CONFIG);
    if (openMenuKeys.length > 0) {
      setOpenKeys(openMenuKeys);
    }
  }, [location.pathname]);

  const iconMap: Record<string, React.ReactNode> = {
    "🏠": <HomeOutlined />,
    "📁": <FolderOutlined />,
    "📤": <FileOutlined />,
    "📄": <FileOutlined />,
    "📋": <ContainerOutlined />,
    "📃": <FileOutlined />,
    "⚙️": <AccountBookOutlined />,
    "✅": <AccountBookOutlined />,
    "🛒": <AccountBookOutlined />,
    "💰": <AccountBookOutlined />,
    "💵": <AccountBookOutlined />,
    "🧮": <AccountBookOutlined />,
    "🏪": <ShopOutlined />,
    "📦": <ContainerOutlined />,
    "📥": <FileOutlined />,
    "🧾": <FileOutlined />,
    "🔧": <ToolOutlined />,
    "🔩": <ToolOutlined />,
    "👥": <TeamOutlined />,
    "➕": <UserOutlined />,
    "👤": <UserOutlined />,
    "🔐": <LockOutlined />,
    "🔑": <LockOutlined />,
    ℹ️: <InfoCircleOutlined />,
  };

  // 递归处理菜单项
  const processMenuItems = (items: MenuItem[], level: number = 0): any[] => {
    return items.map((item) => {
      const menuItem: any = {
        key: item.path || item.key, // 使用 path 作为 key，如果没有 path 则用 key
        icon: iconMap[item.icon || ""] || null,
        label: item.label,
        style: {
          paddingLeft: level * 24 + 16,
          fontWeight: level === 0 ? 600 : 400,
        },
      };

      if (item.path) {
        menuItem.onClick = () => {
          if (item.path) {
            navigate(item.path);
          }
        };
      }

      if (item.children && item.children.length > 0) {
        menuItem.children = processMenuItems(item.children, level + 1);
      }

      return menuItem;
    });
  };

  const menuItems = processMenuItems(MENU_CONFIG);

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={280}
      style={{
        overflow: "auto",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        background: token.colorBgContainer,
        borderRight: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <div
        style={{
          padding: collapsed ? "16px 8px" : "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          minHeight: "64px",
        }}
      >
        {!collapsed && (
          <div style={{ fontSize: "18px", fontWeight: "bold" }}>
            文件管理系统
          </div>
        )}
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => onCollapse(!collapsed)}
          style={{ fontSize: "16px" }}
        />
      </div>

      <Menu
        mode="inline"
        selectedKeys={selectedKeys}
        openKeys={openKeys}
        onOpenChange={handleOpenChange}
        items={menuItems}
        style={{
          borderRight: 0,
          padding: "8px 0",
        }}
        theme="light"
      />
    </Sider>
  );
};

export default SidebarMenu;
