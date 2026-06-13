import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { PageLoader } from '@/components/PageLoader'
import { usePageLoader } from '@/store/usePageLoader'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Landing from '@/pages/Landing'
import Cart from '@/pages/Cart'
import Checkout from '@/pages/Checkout'
import Orders from '@/pages/Orders'
import OrderDetail from '@/pages/OrderDetail'
import ChangePassword from '@/pages/ChangePassword'
import Articles from '@/pages/Articles'
import ArticleDetail from '@/pages/ArticleDetail'
import StaticPage from '@/pages/StaticPage'
import CmsDashboard from '@/pages/cms/CmsDashboard'
import Inquiries from '@/pages/cms/Inquiries'
import Products from '@/pages/cms/Products'
import ApplicationAreas from '@/pages/cms/ApplicationAreas'
import CaseStudies from '@/pages/cms/CaseStudies'
import Pipeline from '@/pages/cms/Pipeline'
import Documents from '@/pages/cms/Documents'
import BlogArticles from '@/pages/cms/BlogArticles'
import PageSettings from '@/pages/cms/PageSettings'
import GeneralSettings from '@/pages/cms/GeneralSettings'
import AdminUsers from '@/pages/cms/AdminUsers'
import ClientUsers from '@/pages/cms/ClientUsers'
import InternalUsers from '@/pages/cms/InternalUsers'
import CmsOrders from '@/pages/cms/Orders'
import CmsOrderDetail from '@/pages/cms/OrderDetail'
import { AdminRoute, CustomerRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/store/useAuth'
import { Toaster } from 'sonner'

function RouteChangeTracker() {
  const location = useLocation()
  const push = usePageLoader((s) => s.push)
  const pop = usePageLoader((s) => s.pop)

  useEffect(() => {
    push()
    const t = setTimeout(pop, 600)
    return () => { clearTimeout(t); pop() }
  }, [location.pathname, push, pop])

  return null
}

export default function App() {
  const isAuthenticated = useAuth((state) => state.isAuthenticated)

  return (
    <>
      <Toaster theme="light" position="top-right" richColors closeButton />
      <BrowserRouter>
      <PageLoader />
      <RouteChangeTracker />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/articles/:slug" element={<ArticleDetail />} />
        <Route path="/page/:slug" element={<StaticPage />} />

        {/* Auth */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Register />}
        />

        {/* Customer — authenticated */}
        <Route element={<CustomerRoute />}>
          <Route path="/cart"            element={<Cart />} />
          <Route path="/checkout"        element={<Checkout />} />
          <Route path="/orders"          element={<Orders />} />
          <Route path="/orders/:id"      element={<OrderDetail />} />
          <Route path="/change-password" element={<ChangePassword />} />
        </Route>

        {/* CMS — admin only */}
        <Route element={<AdminRoute />}>
          <Route path="/cms"                       element={<CmsDashboard />} />
          <Route path="/cms/inquiries"             element={<Inquiries />} />
          <Route path="/cms/products"              element={<Products />} />
          <Route path="/cms/application-areas"     element={<ApplicationAreas />} />
          <Route path="/cms/case-studies"          element={<CaseStudies />} />
          <Route path="/cms/pipeline"              element={<Pipeline />} />
          <Route path="/cms/documents"             element={<Documents />} />
          <Route path="/cms/articles"              element={<BlogArticles />} />
          <Route path="/cms/page-settings"         element={<PageSettings />} />
          <Route path="/cms/general-settings"      element={<GeneralSettings />} />
          <Route path="/cms/admin-users"           element={<AdminUsers />} />
          <Route path="/cms/users"                 element={<ClientUsers />} />
          <Route path="/cms/internal-users"        element={<InternalUsers />} />
          <Route path="/cms/orders"               element={<CmsOrders />} />
          <Route path="/cms/orders/:id"           element={<CmsOrderDetail />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </>
  )
}
