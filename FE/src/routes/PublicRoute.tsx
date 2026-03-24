import { Navigate, Outlet } from 'react-router-dom';
import { PATHS } from './paths';
import { useAuthStore } from '@/stores/useAuthStore';
import { UserRole } from '@/types';

export const PublicRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  if (isAuthenticated && user) {
    // Role-based redirect: admin/branch_manager → dashboard, shop_owner → shop, staff → orders, customer → home
    switch (user.role) {
      case UserRole.PLATFORM_ADMIN:
      case UserRole.BRANCH_MANAGER:
        return <Navigate to={PATHS.DASHBOARD} replace />;
      case UserRole.SHOP_OWNER:
        return <Navigate to={PATHS.SHOP} replace />;
      case UserRole.STAFF:
        return <Navigate to={PATHS.ORDERS} replace />;
      default:
        return <Navigate to={PATHS.HOME} replace />;
    }
  }

  return <Outlet />;
};

