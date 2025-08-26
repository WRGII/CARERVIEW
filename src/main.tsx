import './index.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import GetStarted from './pages/GetStarted'
import Admin from './pages/Admin'
import Caregiver from './pages/Caregiver'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/get-started" element={<GetStarted />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/caregiver" element={<Caregiver />} />
        <Route path="*" element={<Navigate to="/get-started" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)