import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { LandingPage } from '@/pages/LandingPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { NewDesignPlaceholderPage } from '@/pages/NewDesignPlaceholderPage'
import { RoomWorkspacePage } from '@/pages/RoomWorkspacePage'
import { RoomConfigurePage } from '@/pages/RoomConfigurePage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="design/new" element={<NewDesignPlaceholderPage />} />
          <Route path="design/:id" element={<RoomWorkspacePage />} />
          <Route path="design/:id/configure" element={<RoomConfigurePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
