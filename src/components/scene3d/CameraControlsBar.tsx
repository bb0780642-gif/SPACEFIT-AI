/**
 * SPACEFIT AI — 3D HUD CAMERA CONTROLS BAR
 * 
 * Floating control bar offering camera viewpoints, cutaway modes,
 * dimension overlays toggle, wireframe toggle, and framing actions.
 */

import React from 'react'
import {
  Compass,
  Eye,
  Maximize2,
  RotateCcw,
  Ruler,
  Layers,
  Box,
  EyeOff
} from 'lucide-react'
import type { CameraViewMode, CutawayMode } from './types'

interface CameraControlsBarProps {
  cameraMode: CameraViewMode
  onCameraModeChange: (mode: CameraViewMode) => void
  cutawayMode: CutawayMode
  onCutawayModeChange: (mode: CutawayMode) => void
  showDimensions: boolean
  onToggleDimensions: () => void
  wireframe: boolean
  onToggleWireframe: () => void
  onResetCamera: () => void
  onFitToRoom: () => void
}

export const CameraControlsBar: React.FC<CameraControlsBarProps> = ({
  cameraMode,
  onCameraModeChange,
  cutawayMode,
  onCutawayModeChange,
  showDimensions,
  onToggleDimensions,
  wireframe,
  onToggleWireframe,
  onResetCamera,
  onFitToRoom,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-2xl glass-panel bg-slate-950/80 border border-blue-500/20 backdrop-blur-xl shadow-2xl text-xs font-mono">
      {/* 1. Camera View Preset Switchers */}
      <div className="flex items-center gap-1 bg-[#090E1A]/80 p-1 rounded-xl border border-blue-500/10">
        <button
          type="button"
          onClick={() => onCameraModeChange('perspective')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            cameraMode === 'perspective'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
          title="Perspective 3D Orbit View"
        >
          <Box className="w-3.5 h-3.5" />
          <span>3D Orbit</span>
        </button>

        <button
          type="button"
          onClick={() => onCameraModeChange('top-down')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            cameraMode === 'top-down'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
          title="Top-Down Plan View"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Plan</span>
        </button>

        <button
          type="button"
          onClick={() => onCameraModeChange('elevation-south')}
          className={`px-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            cameraMode === 'elevation-south'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
          title="South Elevation"
        >
          S-Elev
        </button>

        <button
          type="button"
          onClick={() => onCameraModeChange('elevation-west')}
          className={`px-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            cameraMode === 'elevation-west'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
          title="West Elevation"
        >
          W-Elev
        </button>
      </div>

      {/* 2. Cutaway & Wall Visibility Modes */}
      <div className="flex items-center gap-1 bg-[#090E1A]/80 p-1 rounded-xl border border-blue-500/10">
        <button
          type="button"
          onClick={() =>
            onCutawayModeChange(
              cutawayMode === 'none' ? 'half' : cutawayMode === 'half' ? 'transparent' : 'none'
            )
          }
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
            cutawayMode !== 'none'
              ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
          title={`Wall Visibility Mode: ${
            cutawayMode === 'none'
              ? 'Full Solid Walls'
              : cutawayMode === 'half'
              ? 'Cutaway Front Walls'
              : 'Transparent Ghost Walls'
          }`}
        >
          {cutawayMode === 'none' ? (
            <Eye className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <EyeOff className="w-3.5 h-3.5 text-indigo-400" />
          )}
          <span>
            {cutawayMode === 'none' ? 'Full Walls' : cutawayMode === 'half' ? 'Cutaway' : 'Ghost'}
          </span>
        </button>
      </div>

      {/* 3. Toggles: Dimensions & Wireframe */}
      <div className="flex items-center gap-1 bg-[#090E1A]/80 p-1 rounded-xl border border-blue-500/10">
        <button
          type="button"
          onClick={onToggleDimensions}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
            showDimensions
              ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
          title="Toggle 3D Dimension Overlays"
        >
          <Ruler className="w-3.5 h-3.5" />
          <span>Dims</span>
        </button>

        <button
          type="button"
          onClick={onToggleWireframe}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
            wireframe
              ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
          title="Toggle Wireframe CAD Mode"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Wire</span>
        </button>
      </div>

      {/* 4. Action Buttons: Fit & Reset */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onFitToRoom}
          className="p-2 rounded-xl glass-panel text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          title="Fit View to Room"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={onResetCamera}
          className="p-2 rounded-xl glass-panel text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          title="Reset Camera Angle"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
