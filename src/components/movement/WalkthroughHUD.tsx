import React from 'react'
import {
  Footprints,
  RotateCcw,
  LogOut,
  AlertTriangle,
  Compass
} from 'lucide-react'
import { Button } from '@/components/common/Button'

interface WalkthroughHUDProps {
  isActive: boolean
  onExit: () => void
  onResetToEntrance: () => void
  avatarPosition: [number, number, number]
  collidingWith?: string
  unit?: 'metres' | 'feet'
}

export const WalkthroughHUD: React.FC<WalkthroughHUDProps> = ({
  isActive,
  onExit,
  onResetToEntrance,
  avatarPosition,
  collidingWith,
}) => {
  if (!isActive) return null

  return (
    <div className="absolute inset-0 pointer-events-none z-30 font-mono text-xs select-none">
      {/* 1. Subtle Center Crosshair */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-5 h-5 flex items-center justify-center opacity-60">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <div className="absolute w-4 h-[1px] bg-cyan-400/60" />
          <div className="absolute h-4 w-[1px] bg-cyan-400/60" />
        </div>
      </div>

      {/* 2. Top Header Bar */}
      <div className="absolute top-4 inset-x-4 flex items-center justify-between gap-3 pointer-events-auto">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/85 border border-cyan-500/40 backdrop-blur-md shadow-2xl">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-extrabold text-white text-xs">First-Person Walkthrough</span>
          <span className="text-slate-500">•</span>
          <span className="text-cyan-300 text-[11px]">Eye Level: 1.60m</span>
        </div>

        {/* Collision Alert Pill */}
        {collidingWith && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/40 border border-rose-500/60 text-rose-200 text-xs backdrop-blur-md animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Boundary Contact: {collidingWith}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Reset to Entrance Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={onResetToEntrance}
            leftIcon={<RotateCcw className="w-3.5 h-3.5 text-cyan-300" />}
            className="text-xs bg-slate-900/90 hover:bg-slate-800 border-cyan-500/30"
          >
            Reset to Door
          </Button>

          {/* Exit Walkthrough Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={onExit}
            leftIcon={<LogOut className="w-3.5 h-3.5" />}
            className="text-xs glow-blue bg-gradient-to-r from-blue-600 to-cyan-600"
          >
            Exit Walkthrough (ESC)
          </Button>
        </div>
      </div>

      {/* 3. Bottom-Left Controls Help Overlay */}
      <div className="absolute bottom-4 left-4 p-3 rounded-2xl bg-slate-950/85 border border-blue-500/25 backdrop-blur-md shadow-2xl text-[11px] text-slate-300 space-y-1.5 pointer-events-auto max-w-xs">
        <div className="flex items-center gap-1.5 text-cyan-300 font-bold border-b border-blue-500/20 pb-1">
          <Footprints className="w-3.5 h-3.5" />
          <span>Walkthrough Controls</span>
        </div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
          <div><kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-white font-bold">W</kbd> <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-white font-bold">A</kbd> <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-white font-bold">S</kbd> <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-white font-bold">D</kbd> Move</div>
          <div><kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-white font-bold">Mouse</kbd> Look</div>
          <div><kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-white font-bold">Shift</kbd> Sprint</div>
          <div><kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-white font-bold">ESC</kbd> Exit</div>
        </div>
      </div>

      {/* 4. Bottom-Right Telemetry */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-blue-500/20 text-[11px] text-slate-400 backdrop-blur-md pointer-events-auto">
        <Compass className="w-3.5 h-3.5 text-cyan-400" />
        <span>Pos: ({avatarPosition[0].toFixed(2)}m, {avatarPosition[2].toFixed(2)}m)</span>
      </div>
    </div>
  )
}
