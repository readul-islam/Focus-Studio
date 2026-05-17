import React from 'react';
import { Navigate, Outlet } from '@/lib/navigation';
import useUser from '@/hooks/userUser';

const PrivateRoute = () => {
  const { user, project } = useUser();
  if (!user) return <Navigate to="/login" replace />;
  if (!project) return <Navigate to="/select-project" replace />;
  return <Outlet />;
};

export default PrivateRoute;
