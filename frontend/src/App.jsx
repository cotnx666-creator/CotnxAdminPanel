import { lazy, Suspense } from 'react';
import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Loader2 } from 'lucide-react';

// Layout & Auth
const Layout = lazy(() => import('./components/Layout'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

// Main Pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Products = lazy(() => import('./pages/Products'));
const Categories = lazy(() => import('./pages/Categories'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Orders = lazy(() => import('./pages/Orders'));
const Customers = lazy(() => import('./pages/Customers'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));

// Finance Module
const FinanceDashboard = lazy(() => import('./pages/FinanceDashboard'));
const Partners = lazy(() => import('./pages/Partners'));
const Expenses = lazy(() => import('./pages/Expenses'));
const FinanceReports = lazy(() => import('./pages/FinanceReports'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
    <Loader2 className="animate-spin text-blue-600" size={40} />
  </div>
);

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingFallback />;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'Admin') return <Navigate to="/" />;

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route 
                path="categories" 
                element={
                  <ProtectedRoute adminOnly>
                    <Categories />
                  </ProtectedRoute>
                } 
              />
              <Route path="inventory" element={<Inventory />} />
              <Route path="orders" element={<Orders />} />
              <Route path="customers" element={<Customers />} />
              <Route 
                path="reports" 
                element={
                  <ProtectedRoute adminOnly>
                    <Reports />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="settings" 
                element={
                  <ProtectedRoute adminOnly>
                    <Settings />
                  </ProtectedRoute>
                } 
              />
              
              {/* Finance Module - Admin Only */}
              <Route 
                path="finance" 
                element={
                  <ProtectedRoute adminOnly>
                    <FinanceDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="finance/partners" 
                element={
                  <ProtectedRoute adminOnly>
                    <Partners />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="finance/expenses" 
                element={
                  <ProtectedRoute adminOnly>
                    <Expenses />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="finance/reports" 
                element={
                  <ProtectedRoute adminOnly>
                    <FinanceReports />
                  </ProtectedRoute>
                } 
              />
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
