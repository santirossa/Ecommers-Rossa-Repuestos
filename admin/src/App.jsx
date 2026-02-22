import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout     from './components/Layout';
import Login      from './pages/Login';
import Dashboard  from './pages/Dashboard';
import Products   from './pages/Products';
import Categories from './pages/Categories';
import Orders     from './pages/Orders';
import Users      from './pages/Users';
import './styles.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/"           element={<Dashboard />} />
            <Route path="/products"   element={<Products />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/orders"     element={<Orders />} />
            <Route path="/users"      element={<Users />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
