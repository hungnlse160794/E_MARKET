import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { PATHS } from './paths';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { MainLayout } from '@/layouts/MainLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { PageLoading } from '@/components/premium/PageLoading';

// Lazy loading pages
const HomePage = lazy(() => import('@/features/shop/HomePage.tsx'));
const LoginPage = lazy(() => import('@/features/auth/components/LoginPage.tsx'));
const RegisterPage = lazy(() => import('@/features/auth/components/RegisterPage.tsx'));
const DashboardPage = lazy(() => import('@/features/admin/AdminDashboard.tsx'));
const ProductManagementPage = lazy(() => import('@/features/admin/ProductManagement.tsx'));
const OrderManagementPage = lazy(() => import('@/features/admin/OrderManagement.tsx'));
const CategoryManagementPage = lazy(() => import('@/features/product/CategoryManagement.tsx'));
const MarketingCenterPage = lazy(() => import('@/features/admin/MarketingCenter.tsx'));
const BranchManagementPage = lazy(() => import('@/features/branch/BranchManagementPage.tsx'));
const StaffManagementPage = lazy(() => import('@/features/staff/StaffManagementPage.tsx'));
const InventoryManagementPage = lazy(() => import('@/features/inventory/InventoryManagementPage.tsx'));
const ShopDashboardPage = lazy(() => import('@/features/shop/DashboardPage.tsx'));
const ShopManagementPage = lazy(() => import('@/features/admin/ShopManagementPage.tsx'));
const CartPage = lazy(() => import('@/features/cart/CartPage.tsx'));
const CheckoutPage = lazy(() => import('@/features/order/CheckoutPage.tsx'));
const ProductDetailPage = lazy(() => import('@/features/product/ProductDetailPage.tsx'));
const ProductListPage = lazy(() => import('@/features/product/ProductListPage.tsx'));
const BranchDetailPage = lazy(() => import('@/features/branch/BranchDetailPage.tsx'));
const RecoverPasswordPage = lazy(() => import('@/features/auth/components/RecoverPasswordPage.tsx'));
const ProfilePage = lazy(() => import('@/features/profile/ProfilePage.tsx'));
const WalletPage = lazy(() => import('@/features/wallet/WalletPage.tsx'));
const MyOrdersPage = lazy(() => import('@/features/order/OrderHistoryPage.tsx'));
const OrderDetailPage = lazy(() => import('@/features/order/OrderDetailPage.tsx'));
const VNPayResultPage = lazy(() => import('@/features/order/VNPayResultPage.tsx'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoading />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: PATHS.CART,
        element: (
          <Suspense fallback={<PageLoading />}>
            <CartPage />
          </Suspense>
        ),
      },
      {
        path: PATHS.PRODUCTS,
        element: (
          <Suspense fallback={<PageLoading />}>
            <ProductListPage />
          </Suspense>
        ),
      },
      {
        path: PATHS.PRODUCT_DETAIL,
        element: (
          <Suspense fallback={<PageLoading />}>
            <ProductDetailPage />
          </Suspense>
        ),
      },
      {
        path: PATHS.BRANCH_DETAIL,
        element: (
          <Suspense fallback={<PageLoading />}>
            <BranchDetailPage />
          </Suspense>
        ),
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: PATHS.DASHBOARD,
            element: (
              <Suspense fallback={<PageLoading />}>
                <DashboardPage />
              </Suspense>
            ),
          },
          {
            path: PATHS.SHOP,
            element: (
              <Suspense fallback={<PageLoading />}>
                <ShopDashboardPage />
              </Suspense>
            ),
          },
          {
            path: PATHS.SHOPS,
            element: (
              <Suspense fallback={<PageLoading />}>
                <ShopManagementPage />
              </Suspense>
            ),
          },
          {
            path: PATHS.CATALOG,
            element: (
              <Suspense fallback={<PageLoading />}>
                <ProductManagementPage />
              </Suspense>
            ),
          },
          {
            path: PATHS.ORDERS,
            element: (
              <Suspense fallback={<PageLoading />}>
                <OrderManagementPage />
              </Suspense>
            ),
          },
          {
            path: PATHS.CATEGORIES,
            element: (
              <Suspense fallback={<PageLoading />}>
                <CategoryManagementPage />
              </Suspense>
            ),
          },
          {
            path: PATHS.BRANCHES,
            element: (
              <Suspense fallback={<PageLoading />}>
                <BranchManagementPage />
              </Suspense>
            ),
          },
          {
            path: PATHS.STAFF,
            element: (
              <Suspense fallback={<PageLoading />}>
                <StaffManagementPage />
              </Suspense>
            ),
          },
          {
            path: PATHS.INVENTORY,
            element: (
              <Suspense fallback={<PageLoading />}>
                <InventoryManagementPage />
              </Suspense>
            ),
          },
          {
            path: PATHS.MARKETING,
            element: (
              <Suspense fallback={<PageLoading />}>
                <MarketingCenterPage />
              </Suspense>
            ),
          },
          {
            path: PATHS.CHECKOUT,
            element: (
              <Suspense fallback={<PageLoading />}>
                <CheckoutPage />
              </Suspense>
            ),
          },
          {
            path: PATHS.VNPAY_RESULT,
            element: (
              <Suspense fallback={<PageLoading />}>
                <VNPayResultPage />
              </Suspense>
            ),
          },
          {
            path: PATHS.PROFILE,
            element: (
              <Suspense fallback={<PageLoading />}>
                <ProfilePage />
              </Suspense>
            ),
          },
          {
            path: PATHS.WALLET,
            element: (
              <Suspense fallback={<PageLoading />}>
                <WalletPage />
              </Suspense>
            ),
          },
          {
            path: PATHS.FINANCES,
            element: (
              <Suspense fallback={<PageLoading />}>
                <WalletPage />
              </Suspense>
            ),
          },
          {
            path: PATHS.MY_ORDERS,
            element: (
              <Suspense fallback={<PageLoading />}>
                <MyOrdersPage />
              </Suspense>
            ),
          },
          {
            path: PATHS.ORDER_DETAIL,
            element: (
              <Suspense fallback={<PageLoading />}>
                <OrderDetailPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      {
        element: <PublicRoute />,
        children: [
          {
            path: 'login',
            element: (
              <Suspense fallback={<PageLoading />}>
                <LoginPage />
              </Suspense>
            ),
          },
          {
            path: 'register',
            element: (
              <Suspense fallback={<PageLoading />}>
                <RegisterPage />
              </Suspense>
            ),
          },
          {
             path: 'recover-password',
             element: (
                <Suspense fallback={<PageLoading />}>
                   <RecoverPasswordPage />
                </Suspense>
             ),
          }
        ],
      },
    ],
  },
  {
    path: PATHS.NOT_FOUND,
    element: <div>404 - Not Found</div>,
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
