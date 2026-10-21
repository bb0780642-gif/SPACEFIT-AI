import React from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { AnimatedBackground } from '@/components/background/AnimatedBackground'

interface AppLayoutProps {
  children?: React.ReactNode
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen flex flex-col bg-[#070B14] text-slate-100 overflow-x-hidden selection:bg-blue-600/30 selection:text-blue-200">
      {/* Dynamic Animated Ambient Background */}
      <AnimatedBackground intensity="normal" showGrid={true} showParticles={true} />

      {/* Global Application Navigation Bar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 pt-24 pb-12 w-full">
        {children || <Outlet />}
      </main>

      {/* Global Application Footer */}
      <Footer />
    </div>
  )
}
