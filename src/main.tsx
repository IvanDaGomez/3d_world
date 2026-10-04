import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './routes/main/main'
import Layout from './components/Layout'
import Catalog from './routes/catalog/Catalog'
import NotFound from './routes/catalog/components/Error'
import PaymentResponse from './routes/paymentResponse/PaymentResponse'
import PaymentSuccesful from './routes/paymentSuccesful/PaymentSuccesful'
import AdminProducts from './routes/adminCreateProduts/AdminCreateProducts'
import OrdersAdmin from './routes/ordersAdmin/OrdersAdmin'

export default function App () {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Layout />}>
          <Route index element={<Home />} />
          <Route path='pagos/respuesta' element={<PaymentResponse />} />
          <Route path='payment-successful' element={<PaymentSuccesful />} />
          <Route path='publish' element={<AdminProducts />} />
          <Route path='orders' element={<OrdersAdmin />} />
          <Route path='catalog' element={<Catalog />} />
        </Route>
        <Route path='*' element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
