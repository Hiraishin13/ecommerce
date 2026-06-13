import type { ReactNode } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Spinner from '../components/ui/Spinner'
import ProtectedRoute from '../components/layout/ProtectedRoute'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import AccountLayout from '../components/layout/AccountLayout'
import AdminLayout from '../components/layout/AdminLayout'

// Public pages
const HomePage = lazy(() => import('../pages/HomePage'))
const CatalogPage = lazy(() => import('../pages/shop/CatalogPage'))
const ProductPage = lazy(() => import('../pages/shop/ProductPage'))
const SearchPage = lazy(() => import('../pages/shop/SearchPage'))
const LoginPage = lazy(() => import('../pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'))

// Cart & checkout
const CartPage = lazy(() => import('../pages/checkout/CartPage'))
const CheckoutPage = lazy(() => import('../pages/checkout/CheckoutPage'))
const OrderSuccessPage = lazy(() => import('../pages/checkout/OrderSuccessPage'))

// Account pages
const AccountDashboard = lazy(() => import('../pages/account/AccountDashboard'))
const OrdersPage = lazy(() => import('../pages/account/OrdersPage'))
const OrderDetailPage = lazy(() => import('../pages/account/OrderDetailPage'))
const ProfilePage = lazy(() => import('../pages/account/ProfilePage'))
const AddressesPage = lazy(() => import('../pages/account/AddressesPage'))
const WishlistPage = lazy(() => import('../pages/account/WishlistPage'))

// Admin pages
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'))
const AdminProductsPage = lazy(() => import('../pages/admin/AdminProductsPage'))
const AdminOrdersPage = lazy(() => import('../pages/admin/AdminOrdersPage'))
const AdminOrderDetailPage = lazy(() => import('../pages/admin/AdminOrderDetailPage'))
const AdminCustomersPage = lazy(() => import('../pages/admin/AdminCustomersPage'))
const AdminCategoriesPage = lazy(() => import('../pages/admin/AdminCategoriesPage'))

function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

function PageFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Spinner size="lg" />
    </div>
  )
}

export default function AppRouter() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
        <Route path="/products" element={<MainLayout><CatalogPage /></MainLayout>} />
        <Route path="/products/:slug" element={<MainLayout><ProductPage /></MainLayout>} />
        <Route path="/search" element={<MainLayout><SearchPage /></MainLayout>} />
        <Route path="/cart" element={<MainLayout><CartPage /></MainLayout>} />

        {/* Auth */}
        <Route path="/login" element={<MainLayout><LoginPage /></MainLayout>} />
        <Route path="/register" element={<MainLayout><RegisterPage /></MainLayout>} />
        <Route path="/forgot-password" element={<MainLayout><ForgotPasswordPage /></MainLayout>} />

        {/* Checkout (protected) */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <MainLayout><CheckoutPage /></MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-success/:id"
          element={
            <ProtectedRoute>
              <MainLayout><OrderSuccessPage /></MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Account (protected) */}
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <AccountLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AccountDashboard />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="addresses" element={<AddressesPage />} />
          <Route path="wishlist" element={<WishlistPage />} />
        </Route>

        {/* Admin (protected) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="orders/:id" element={<AdminOrderDetailPage />} />
          <Route path="customers" element={<AdminCustomersPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
