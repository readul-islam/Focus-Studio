import React from 'react';
import { Navigate, Outlet } from '@/lib/navigation';
import useUser from '@/hooks/userUser';

const PrivateRoute = () => {
  const { user } = useUser()  
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
