import React from 'react'
import {
  Footprints,
  Sliders,
  AlertTriangle,
  XCircle,
  Eye,
  Info
} from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import type {
  MovementPathResult,
  MovementPresetDestination,
} from '@/types/movement'

interface MovementAnalysisPanelProps {
  selectedPreset: MovementPresetDestination
  onSelectPreset: (preset: MovementPresetDestination) => void
  configuredClearance: number
  onChangeClearance: (val: number) => void
  pathResult: MovementPathResult | null
  showPath3D: boolean
  onToggleShowPath3D: () => void
  onEnterWalkthrough: () => void
  unit?: 'metres' | 'feet'
}

export const MovementAnalysisPanel: React.FC<MovementAnalysisPanelProps> = ({
  selectedPreset,
  onSelectPreset,
  configuredClearance,
  onChangeClearance,
  pathResult,
  showPath3D,
  onToggleShowPath3D,
  onEnterWalkthrough,
  unit = 'metres',
}) => {
  const isFeasible = pathResult?.status === 'feasible' || pathResult?.status === 'same_point'
  const isBottleneck = pathResult?.status === 'bottleneck'
  const isBlocked = pathResult?.status === 'blocked'

  const walkingSpeed = 1.2 // m/s normal walking pace
  const walkingTimeSec = pathResult ? (pathResult.lengthMeters / walkingSpeed).toFixed(1) : '0'

  return (
    <div className="p-4 rounded-3xl bg-[#090E1A]/95 border border-blue-500/25 font-mono text-xs shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-blue-500/20 pb-3">
        <div className="flex items-center gap-2 text-cyan-300 font-extrabold text-sm">
          <Footprints className="w-4 h-4 text-cyan-400" />
          <span>Movement &amp; Walking Circulation</span>
        </div>

        {pathResult && (
          <Badge
            variant={isFeasible ? 'emerald' : isBottleneck ? 'amber' : 'rose'}
            className="text-[10px]"
          >
            {isFeasible
              ? 'Route Feasible'
              : isBottleneck
              ? 'Clearance Bottleneck'
              : 'Route Obstructed'}
          </Badge>
        )}
      </div>

      {/* 1. Destination Route Presets */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
          <span>Target Circulation Route:</span>
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: 'door-to-bed', label: 'Door → Bed' },
            { id: 'door-to-desk', label: 'Door → Desk' },
            { id: 'door-to-wardrobe', label: 'Door → Wardrobe' },
            { id: 'door-to-sofa', label: 'Door → Sofa' },
            { id: 'bed-to-window', label: 'Bed → Window' },
            { id: 'custom', label: 'Room Center' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectPreset(item.id as MovementPresetDestination)}
              className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold text-left transition-all ${
                selectedPreset === item.id
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/10'
                  : 'bg-slate-900/60 border-blue-500/20 text-slate-400 hover:text-white hover:border-blue-500/40'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Configured Clearance Slider */}
      <div className="space-y-1.5 p-3 rounded-2xl bg-blue-950/30 border border-blue-500/20">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-300 font-semibold flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Required Walking Clearance:</span>
          </span>
          <span className="text-cyan-300 font-bold">
            {configuredClearance.toFixed(2)}m
          </span>
        </div>
        <input
          type="range"
          min={0.4}
          max={0.9}
          step={0.05}
          value={configuredClearance}
          onChange={(e) => onChangeClearance(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
        <div className="flex justify-between text-[10px] text-slate-500">
          <span>0.40m (Tight)</span>
          <span>0.60m (Standard)</span>
          <span>0.90m (Accessible)</span>
        </div>
      </div>

      {/* 3. Computed Path Telemetry Cards */}
      {pathResult && (
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-blue-500/20">
            <div className="text-[10px] text-slate-400">Path Length</div>
            <div className="text-sm font-bold text-white mt-0.5">
              {unit === 'feet' ? `${pathResult.lengthFeet} ft` : `${pathResult.lengthMeters} m`}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-blue-500/20">
            <div className="text-[10px] text-slate-400">Min Clearance</div>
            <div
              className={`text-sm font-bold mt-0.5 ${
                isBottleneck ? 'text-amber-400' : 'text-cyan-300'
              }`}
            >
              {pathResult.minClearanceMeters.toFixed(2)}m
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-blue-500/20">
            <div className="text-[10px] text-slate-400">Est. Walk Time</div>
            <div className="text-sm font-bold text-emerald-300 mt-0.5">
              ~{walkingTimeSec}s
            </div>
          </div>
        </div>
      )}

      {/* 4. Warning / Blocked Diagnostics */}
      {isBottleneck && pathResult?.warningMessage && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Bottleneck Detected</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            {pathResult.warningMessage}
          </p>
        </div>
      )}

      {isBlocked && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <XCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Route Obstructed</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            {pathResult?.blockedReason || 'No continuous corridor connects start to destination.'}
          </p>
          {pathResult?.actionableSuggestion && (
            <p className="text-cyan-300 text-[10px] italic pt-1">
              Tip: {pathResult.actionableSuggestion}
            </p>
          )}
        </div>
      )}

      {/* 5. Actions */}
      <div className="flex flex-col gap-2 pt-2 border-t border-blue-500/20">
        <Button
          variant="primary"
          size="sm"
          onClick={onEnterWalkthrough}
          leftIcon={<Footprints className="w-3.5 h-3.5" />}
          className="w-full glow-blue bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 py-2.5 font-bold"
        >
          Enter 3D Walkthrough (First-Person)
        </Button>

        <button
          type="button"
          onClick={onToggleShowPath3D}
          className="flex items-center justify-center gap-2 py-1.5 rounded-xl border border-blue-500/20 text-slate-400 hover:text-cyan-300 hover:bg-slate-900 transition-colors text-[11px]"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{showPath3D ? 'Hide 3D Path Overlay' : 'Show 3D Path Overlay'}</span>
        </button>
      </div>

      {/* Disclaimer */}
      <div className="text-[9px] text-slate-500 leading-tight pt-1 flex items-start gap-1">
        <Info className="w-3 h-3 shrink-0 text-slate-600 mt-0.5" />
        <span>Geometric path clearance simulation based on room digital twin. Does not certify building code or accessibility compliance.</span>
      </div>
    </div>
  )
}
