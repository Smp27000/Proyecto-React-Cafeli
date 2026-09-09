import { useState, useEffect } from 'react'
import './App.css'
import Navbar from './Components/Navbar'
import { AdminSidebar } from './Components/AdminSidebar'
import { CartDrawer } from './Components/CartDrawer'
import { Footer } from './Components/Footer'
import { WhatsAppButton } from './Components/WhatsAppButton'

import { Routes, Route, Navigate, useLocation } from 'react-router-dom'

import Principal from '../Pages/Index'
import { AboutUs } from '../Pages/AboutUs'
import { Contact } from '../Pages/Contact'
import { Register } from '../Pages/Register'
import { Login } from '../Pages/Login'
import { ResetPassword } from '../Pages/ResetPassword'
import { AdminPanel } from '../Pages/AdminPanel'
import { EmpleadoPanel } from '../Pages/EmpleadoPanel'
import { ClientePanel } from '../Pages/ClientePanel'

function App() {
  const [user, setUser] = useState(null)
  const [cart, setCart] = useState({ items: [], total_articulos: 0, total_precio: 0 })
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [adminActiveTab, setAdminActiveTab] = useState("usuarios")

  const location = useLocation()

  // Cargar usuario inicial
  useEffect(() => {
    const savedUser = localStorage.getItem("usuario")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  // Cargar estado del carrito si hay sesión activa
  const fetchCart = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      setCart({ items: [], total_articulos: 0, total_precio: 0 })
      return
    }

    try {
      const res = await fetch("http://localhost:3000/api/v1/carrito", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setCart(data)
      }
    } catch (err) {
      console.error("Error al obtener carrito:", err)
    }
  }

  useEffect(() => {
    fetchCart()
  }, [user])

  const handleLoginSuccess = (userData) => {
    setUser(userData)
    fetchCart()
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("usuario")
    setUser(null)
    setCart({ items: [], total_articulos: 0, total_precio: 0 })
  }

  // Operaciones de Carrito
  const handleUpdateCartQuantity = async (itemId, nuevaCantidad) => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      const res = await fetch(`http://localhost:3000/api/v1/carrito/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cantidad: nuevaCantidad }),
      })
      if (res.ok) fetchCart()
    } catch (err) {
      console.error(err)
    }
  }

  const handleRemoveCartItem = async (itemId) => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      const res = await fetch(`http://localhost:3000/api/v1/carrito/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) fetchCart()
    } catch (err) {
      console.error(err)
    }
  }

  const handleClearCart = async () => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      const res = await fetch("http://localhost:3000/api/v1/carrito", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) fetchCart()
    } catch (err) {
      console.error(err)
    }
  }

  const isAdmin = user && user.rol_nombre === "Administrador"

  return (
    <div className="min-h-screen flex flex-col bg-[#faf7f2] text-[#3b2a22]">
      {/* Si el usuario es Administrador, mostrar estructura con Sidebar Vertical */}
      {isAdmin ? (
        <div className="flex flex-1 min-h-screen w-full">
          {/* Sidebar Vertical para Administrador */}
          <AdminSidebar
            user={user}
            onLogout={handleLogout}
            activeTab={adminActiveTab}
            onTabChange={(tab) => setAdminActiveTab(tab)}
          />

          {/* Área de contenido del Administrador */}
          <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-stone-50">
            <Routes>
              <Route
                path="/admin"
                element={<AdminPanel activeTabFromSidebar={adminActiveTab} />}
              />
              <Route path="/" element={<Principal />} />
              <Route path="/nosotros" element={<AboutUs />} />
              <Route path="/contacto" element={<Contact />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </main>
        </div>
      ) : (
        /* Estructura para Clientes, Empleados y Visitantes con Navbar Horizontal */
        <>
          <Navbar
            user={user}
            onLogout={handleLogout}
            cartCount={cart?.total_articulos || 0}
            onOpenCart={() => setIsCartOpen(true)}
          />

          <main className="flex-1 w-full">
            <Routes>
              <Route path="/" element={<Principal />} />
              <Route path="/nosotros" element={<AboutUs />} />
              <Route path="/contacto" element={<Contact />} />
              <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
              <Route path="/register" element={<Register />} />
              <Route path="/resetpassword" element={<ResetPassword />} />

              {/* Rutas protegidas */}
              <Route
                path="/empleado"
                element={user && user.rol_nombre === "Empleado" ? <EmpleadoPanel /> : <Navigate to="/login" />}
              />
              <Route
                path="/cliente"
                element={
                  user && user.rol_nombre === "Cliente" ? (
                    <ClientePanel
                      onOpenCart={() => setIsCartOpen(true)}
                      onProductAdded={fetchCart}
                    />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route path="/admin" element={<Navigate to="/login" />} />
            </Routes>
          </main>

          <Footer />
          <WhatsAppButton />
        </>
      )}

      {/* Drawer flotante del Carrito de Compras */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onCheckoutSuccess={() => {
          fetchCart()
        }}
      />
    </div>
  )
}

export default App
