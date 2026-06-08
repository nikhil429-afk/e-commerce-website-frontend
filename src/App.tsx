import './App.css';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import ProtectedRoute from './auth/Protectedroute';
import Dashboard from '../src/store/dashboard';
import Register from './auth/register';
import Login from './auth/login';
import Products from './components/pages/products/products';
import Cart from '../src/components/pages/cart/cart';
import Wishlist from './components/pages/wishlist/wishlist';
import Aboutus from './components/pages/about/aboutus';
import Contact from './components/pages/contact/contact';
import Sofas from './components/pages/products/items/sofa';
import Tables from "./components/pages/products/items/table"
import Chairs from './components/pages/products/items/chair';
import Almirahs from './components/pages/products/items/almirahs';
import Dinings from './components/pages/products/items/dining';
import Beds from './components/pages/products/items/bed';
import Owner from './components/profiles/owner/owner';
import Decorate from './services/aidecorate';


function App() {
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/products" element={<Products />} >
          <Route path="/products/sofas" element={<Sofas />} />
          <Route path="/products/tables" element={<Tables />} />
          <Route path="/products/chairs" element={<Chairs />} />
          <Route path="/products/beds" element={<Beds />} />
          <Route path="/products/dinings" element={<Dinings />} />
          <Route path="/products/almirahs" element={<Almirahs />} />
        </Route>
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/about" element={<Aboutus />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/ai-decorate" element={<Decorate />} />
        <Route path="/owner" element={<ProtectedRoute allowedRole="owner"> <Owner /> </ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
    </>
  )
}


export default App
