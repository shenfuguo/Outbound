import React from 'react';
import { useRoutes } from 'react-router-dom';
import { routes } from './routes';

const AppRouter: React.FC = () => {
  const routing = useRoutes(routes);
  return routing;
};

export default AppRouter;