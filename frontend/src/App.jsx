import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import FinanceDashboard from './pages/FinanceDashboard';
import Partners from './pages/Partners';
import Expenses from './pages/Expenses';
import FinanceReports from './pages/FinanceReports';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'Admin') return <Navigate to="/" />;

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
