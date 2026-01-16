import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Layout from "./components/Layout";
import AppRouter from "./router/AppRouter";
import "./App.css"; // 添加全局样式

const App: React.FC = () => {
  return (
    // <div className="app-container">
    // {/* 添加外层容器 */}
    <Router>
      <Layout>
        <AppRouter />
      </Layout>
    </Router>
    // </div>
  );
};

export default App;
