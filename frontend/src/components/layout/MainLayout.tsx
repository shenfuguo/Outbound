// src/components/layout/MainLayout.tsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Layout, theme } from "antd";
import SidebarMenu from "./SidebarMenu";

const { Header, Content } = Layout;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <SidebarMenu collapsed={collapsed} onCollapse={setCollapsed} />

      <Layout
        style={{
          marginLeft: collapsed ? 80 : 280,
          transition: "margin-left 0.2s",
        }}
      >
        <Header
          style={{
            padding: 0,
            background: token.colorBgContainer,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            position: "sticky",
            top: 0,
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingRight: "24px",
          }}
        >
          <div
            style={{ paddingLeft: "24px", fontSize: "16px", fontWeight: 500 }}
          >
            文件管理系统
          </div>
        </Header>

        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: token.colorBgContainer,
            borderRadius: token.borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
