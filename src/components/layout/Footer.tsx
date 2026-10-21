import React from 'react'
import { Link } from 'react-router-dom'
import { Box, ShieldCheck, Terminal, Compass, Layers, GitBranch } from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 border-t border-blue-500/15 bg-[#070B14]/90 backdrop-blur-md pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-blue-500/10">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 p-[1px]">
                <div className="w-full h-full bg-[#0A0F1D] rounded-[7px] flex items-center justify-center">
                  <Box className="w-4 h-4 text-blue-400" />
                </div>
              </div>
              <span className="text-lg font-extrabold tracking-tight text-white">
                SPACE<span className="text-blue-400">FIT</span> <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">AI</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Next-generation spatial intelligence platform engineered for 3D room digital twins, 
              automated layout optimization, collision physics analysis, and interactive movement simulation.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Phase 1 Architecture Active</span>
              </div>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-4 font-mono">
              Platform Routes
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  <Compass className="w-3.5 h-3.5 text-slate-500" />
                  <span>Landing Page</span>
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-slate-500" />
                  <span>Dashboard Workspace</span>
                </Link>
              </li>
              <li>
                <Link to="/design/new" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-slate-500" />
                  <span>New Room Studio</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Architectural Roadmaps */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-4 font-mono">
              Engineering Specs
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400 font-mono">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>React 19 + TypeScript</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>Tailwind CSS + Framer Motion</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>3D Spatial Geometry Prepared</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Reduced Motion Compliant</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} SpaceFit AI Inc. All rights reserved. Built with precision for interior intelligence.</p>
          <div className="flex items-center gap-6">
            <span className="text-slate-400">Phase 1 Foundation</span>
            <span className="text-slate-400">Design System v1.0</span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-white transition-colors"
              aria-label="GitHub Repository"
            >
              <GitBranch className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
