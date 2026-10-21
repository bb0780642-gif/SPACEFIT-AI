import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Box, 
  Footprints, 
  CheckCircle2, 
  ShieldAlert, 
  Sparkles, 
  Rotate3d, 
  Layers, 
  Compass
} from 'lucide-react'
import { Badge } from '@/components/common/Badge'

type ViewMode = 'twin' | 'clearance' | 'heatmap'
type RoomPreset = 'loft' | 'office' | 'bedroom'

export const InteractiveRoomPreview: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('twin')
  const [preset, setPreset] = useState<RoomPreset>('loft')
  const [hoveredObject, setHoveredObject] = useState<string | null>(null)

  const presetsData = {
    loft: {
      name: 'Modern Spatial Loft',
      dims: '6.4m × 4.8m',
      clearance: '96.2%',
      circScore: '98/100',
      clashes: 0,
    },
    office: {
      name: 'Executive Ergonomic Suite',
      dims: '5.2m × 4.0m',
      clearance: '94.8%',
      circScore: '95/100',
      clashes: 0,
    },
    bedroom: {
      name: 'Minimalist Master Studio',
      dims: '5.8m × 4.2m',
      clearance: '97.5%',
      circScore: '99/100',
      clashes: 0,
    },
  }

  const currentPreset = presetsData[preset]

  return (
    <div className="relative w-full max-w-5xl mx-auto rounded-3xl glass-panel-elevated p-4 sm:p-7 border border-blue-500/25 shadow-2xl overflow-hidden">
      {/* Top Ambient Glow Bar */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

      {/* Header controls bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-blue-500/15">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-medium text-slate-300 uppercase tracking-wider">
              Live Digital Twin Viewport
            </span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
            {currentPreset.dims}
          </span>
        </div>

        {/* Room Presets selector */}
        <div className="flex items-center gap-1.5 bg-[#0A0F1D]/80 p-1 rounded-xl border border-blue-500/15 text-xs font-medium">
          <button
            type="button"
            onClick={() => setPreset('loft')}
            className={`px-3 py-1 rounded-lg transition-all ${
              preset === 'loft'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Living Loft
          </button>
          <button
            type="button"
            onClick={() => setPreset('office')}
            className={`px-3 py-1 rounded-lg transition-all ${
              preset === 'office'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Office Suite
          </button>
          <button
            type="button"
            onClick={() => setPreset('bedroom')}
            className={`px-3 py-1 rounded-lg transition-all ${
              preset === 'bedroom'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Studio
          </button>
        </div>

        {/* Layer View Modes */}
        <div className="flex items-center gap-1 bg-[#0A0F1D]/80 p-1 rounded-xl border border-blue-500/15 text-xs font-medium">
          <button
            type="button"
            onClick={() => setViewMode('twin')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
              viewMode === 'twin'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Rotate3d className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">3D Twin</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('clearance')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
              viewMode === 'clearance'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Footprints className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clearance Path</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('heatmap')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
              viewMode === 'heatmap'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI Heatmap</span>
          </button>
        </div>
      </div>

      {/* Isometric 3D Room Canvas Representation */}
      <div className="relative mt-5 h-[340px] sm:h-[420px] w-full rounded-2xl bg-[#090E1A] border border-blue-500/20 overflow-hidden flex items-center justify-center">
        {/* Subtle Room Grid Lines */}
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(59, 130, 246, 0.15) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(59, 130, 246, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: '36px 36px',
          }}
        />

        {/* Ambient Glow Center */}
        <div className="absolute w-96 h-96 rounded-full bg-blue-500/10 blur-[80px] pointer-events-none" />
        <div className="absolute w-64 h-64 rounded-full bg-purple-500/10 blur-[70px] pointer-events-none right-10" />

        {/* Heatmap overlay */}
        {viewMode === 'heatmap' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_45%_50%,rgba(16,185,129,0.25)_0%,rgba(59,130,246,0.15)_40%,transparent_75%)]"
          />
        )}

        {/* Isometric 3D Room Box */}
        <div 
          className="relative w-[340px] sm:w-[460px] h-[260px] sm:h-[320px] transition-transform duration-700 ease-out"
          style={{
            transform: 'perspective(1200px) rotateX(46deg) rotateZ(-28deg)',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Room Floor Plane */}
          <div className="absolute inset-0 bg-[#0C1426] border-2 border-blue-500/40 rounded-xl shadow-2xl shadow-blue-900/30">
            {/* Architectural Grid within floor */}
            <div 
              className="absolute inset-0 opacity-25"
              style={{
                backgroundImage: 'linear-gradient(to right, #3B82F6 1px, transparent 1px), linear-gradient(to bottom, #3B82F6 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Walking Clearance Vectors (Visual green path) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M 40 280 Q 90 200, 160 180 T 320 140 T 400 60"
                fill="none"
                stroke={viewMode === 'clearance' ? '#10B981' : 'rgba(59, 130, 246, 0.4)'}
                strokeWidth={viewMode === 'clearance' ? '4' : '2'}
                strokeDasharray={viewMode === 'clearance' ? '6 4' : '4 4'}
                className="transition-colors duration-300"
              />
            </svg>

            {/* Furniture Node 1: Primary Spatial Anchor (Sofa / Modular Desk) */}
            <div
              onMouseEnter={() => setHoveredObject('Main Lounge Modular')}
              onMouseLeave={() => setHoveredObject(null)}
              className="absolute top-12 left-10 w-28 sm:w-36 h-16 sm:h-20 rounded-lg bg-gradient-to-br from-blue-700 to-indigo-800 border border-blue-400/50 shadow-lg cursor-pointer transition-transform hover:-translate-y-1 group"
            >
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-semibold text-blue-100">
                Lounge Modular
              </div>
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 text-white text-[9px] px-2 py-0.5 rounded border border-blue-500/40 whitespace-nowrap">
                Clearance: 1.2m
              </div>
            </div>

            {/* Furniture Node 2: Workspace Desk */}
            <div
              onMouseEnter={() => setHoveredObject('Executive Workstation')}
              onMouseLeave={() => setHoveredObject(null)}
              className="absolute top-10 right-8 w-20 sm:w-24 h-24 sm:h-28 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-500/50 shadow-lg cursor-pointer transition-transform hover:-translate-y-1 group"
            >
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-semibold text-slate-200">
                Workstation
              </div>
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 text-white text-[9px] px-2 py-0.5 rounded border border-cyan-500/40 whitespace-nowrap">
                Clearance: 0.95m
              </div>
            </div>

            {/* Furniture Node 3: Center Island / Coffee Area */}
            <div
              onMouseEnter={() => setHoveredObject('Center Spatial Table')}
              onMouseLeave={() => setHoveredObject(null)}
              className="absolute bottom-14 left-24 sm:left-32 w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-gradient-to-br from-violet-700 to-purple-800 border border-purple-400/50 shadow-lg cursor-pointer transition-transform hover:-translate-y-1 group flex items-center justify-center"
            >
              <div className="text-[9px] font-mono font-semibold text-purple-100 text-center">
                Center Accent
              </div>
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 text-white text-[9px] px-2 py-0.5 rounded border border-purple-500/40 whitespace-nowrap">
                Buffer: Safe
              </div>
            </div>

            {/* Furniture Node 4: Storage Credenza */}
            <div
              onMouseEnter={() => setHoveredObject('Acoustic Storage')}
              onMouseLeave={() => setHoveredObject(null)}
              className="absolute bottom-6 right-12 w-28 sm:w-32 h-10 rounded-lg bg-gradient-to-br from-cyan-900 to-blue-900 border border-cyan-500/40 shadow-lg cursor-pointer transition-transform hover:-translate-y-1 flex items-center justify-center"
            >
              <div className="text-[9px] font-mono font-semibold text-cyan-200">
                Acoustic Storage
              </div>
            </div>

            {/* Collision Analysis Pins */}
            <div className="absolute top-4 left-4 flex items-center gap-1.5 px-2 py-1 rounded bg-[#070B14]/90 border border-emerald-500/40 text-[9px] font-mono text-emerald-300">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Collision Free</span>
            </div>
          </div>
        </div>

        {/* Floating live metrics overlay card */}
        <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:left-4 glass-dropdown p-3.5 rounded-2xl border border-blue-500/25 max-w-sm flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-mono text-slate-400 flex items-center gap-1">
              <Compass className="w-3 h-3 text-blue-400" />
              Spatial Efficiency
            </span>
            <div className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <span>{currentPreset.circScore}</span>
              <span className="text-[10px] text-emerald-400 font-normal">Optimal Layout</span>
            </div>
          </div>
          <div className="h-7 w-px bg-blue-500/20" />
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-mono text-slate-400 flex items-center gap-1">
              <Footprints className="w-3 h-3 text-emerald-400" />
              Walk Clearance
            </span>
            <div className="text-sm font-bold text-emerald-300 font-mono">
              {currentPreset.clearance}
            </div>
          </div>
          <div className="h-7 w-px bg-blue-500/20" />
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-mono text-slate-400 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-cyan-400" />
              Clashes
            </span>
            <div className="text-sm font-bold text-cyan-300 font-mono">
              0 Active
            </div>
          </div>
        </div>

        {/* Hovered object inspector tag */}
        {hoveredObject && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 right-4 bg-[#0A0F1D]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-blue-400/40 text-xs font-mono text-blue-200 flex items-center gap-2 shadow-lg"
          >
            <Box className="w-3.5 h-3.5 text-blue-400" />
            <span>Target: {hoveredObject}</span>
          </motion.div>
        )}
      </div>

      {/* Footer Feature Badges */}
      <div className="mt-4 pt-4 border-t border-blue-500/15 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-400" />
          <span>Interactive 3D Digital Twin Visualizer (Foundation Mockup)</span>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="blue" className="text-[10px]">6DOF Ready</Badge>
          <Badge variant="violet" className="text-[10px]">NLP Multilingual Ready</Badge>
          <Badge variant="emerald" className="text-[10px]">Zero Collision Engine</Badge>
        </div>
      </div>
    </div>
  )
}
