import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { PATHS } from './paths';
import { useAuthStore } from '@/stores/useAuthStore';

export const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={PATHS.AUTH.LOGIN} state={{ from: location }} replace />;
  }

  return <Outlet />;
};

