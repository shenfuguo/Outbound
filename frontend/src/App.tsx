// src/App.tsx
import React from "react";
import { useRoutes } from "react-router-dom";
import { ConfigProvider } from "antd";
import { routes } from "./router/routes";
import "./App.css";

const App: React.FC = () => {
  const element = useRoutes(routes);

  return <ConfigProvider>{element}</ConfigProvider>;
};

export default App;
