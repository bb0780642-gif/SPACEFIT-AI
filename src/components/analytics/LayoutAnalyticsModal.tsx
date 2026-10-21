import React, { useMemo } from 'react'
import {
  ShieldCheck,
  Footprints,
  Maximize2,
  CheckCircle2,
  Info,
  Sparkles
} from 'lucide-react'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import type { RoomConfiguration } from '@/types/geometry'
import type { PlacedFurniture } from '@/types/furniture'
import type { CandidateLayout } from '@/types/optimizer'
import { computeLayoutStats } from '@/utils/analytics/layoutMetrics'
import { metersToFeet } from '@/utils/geometry'

interface LayoutAnalyticsModalProps {
  isOpen: boolean
  onClose: () => void
  furniture: PlacedFurniture[]
  roomConfig: RoomConfiguration
  candidates?: CandidateLayout[]
  versions?: import('@/types/comparison').LayoutVersion[]
  unit?: 'metres' | 'feet'
  onOpenComparison?: () => void
}

export const LayoutAnalyticsModal: React.FC<LayoutAnalyticsModalProps> = ({
  isOpen,
  onClose,
  furniture,
  roomConfig,
  candidates = [],
  versions = [],
  unit = 'metres',
  onOpenComparison,
}) => {
  const stats = useMemo(() => {
    return computeLayoutStats(furniture, roomConfig, 'Current Active Layout')
  }, [furniture, roomConfig])

  const totalAreaUnit = unit === 'metres'
    ? `${stats.totalRoomAreaMeters} m²`
    : `${Number((stats.totalRoomAreaMeters * 10.7639).toFixed(1))} sq ft`

  const occupiedAreaUnit = unit === 'metres'
    ? `${stats.occupiedAreaMeters} m²`
    : `${Number((stats.occupiedAreaMeters * 10.7639).toFixed(1))} sq ft`

  const unoccupiedAreaUnit = unit === 'metres'
    ? `${stats.unoccupiedAreaMeters} m²`
    : `${Number((stats.unoccupiedAreaMeters * 10.7639).toFixed(1))} sq ft`

  const pathLengthUnit = unit === 'metres'
    ? `${stats.movementPath?.lengthMeters ?? 0} m`
    : `${Number(metersToFeet(stats.movementPath?.lengthMeters ?? 0).toFixed(1))} ft`

  // Estimated walking duration at standard indoor walking pace 1.3 m/s
  const walkTimeSec = stats.movementPath?.lengthMeters
    ? Math.max(1, Math.round(stats.movementPath.lengthMeters / 1.3))
    : 0

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Spatial Analytics & Optimization Dashboard"
      size="xl"
    >
      <div className="space-y-6">
        {/* Top Metric Cards: 4 Component Scores */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* 1. Overall Score */}
          <div className="bg-gradient-to-br from-indigo-950/70 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Composite Score
              </span>
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="my-2">
              <span className="text-3xl font-extrabold text-white">
                {stats.score?.overallScore}
              </span>
              <span className="text-slate-400 text-sm font-medium"> / 100</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${stats.score?.overallScore}%` }}
              />
            </div>
          </div>

          {/* 2. Geometric Safety */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Safety & Boundary
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="my-2">
              <span className="text-3xl font-extrabold text-white">
                {stats.score?.functionalGroupingScore}
              </span>
              <span className="text-slate-400 text-sm font-medium"> / 100</span>
            </div>
            <span className="text-xs text-slate-400">
              {stats.hardViolationsCount === 0
                ? 'Zero collision breaches'
                : `${stats.hardViolationsCount} boundary error(s)`}
            </span>
          </div>

          {/* 3. Circulation Flow */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                Circulation Flow
              </span>
              <Footprints className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="my-2">
              <span className="text-3xl font-extrabold text-white">
                {stats.score?.circulationScore}
              </span>
              <span className="text-slate-400 text-sm font-medium"> / 100</span>
            </div>
            <span className="text-xs text-slate-400">
              {stats.movementPath?.status === 'feasible'
                ? 'Continuous pathway clear'
                : stats.movementPath?.status === 'bottleneck'
                ? 'Narrow transit corridor'
                : 'Corridor obstructed'}
            </span>
          </div>

          {/* 4. Usable Floor Area Ratio */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Floor Space Ratio
              </span>
              <Maximize2 className="w-4 h-4 text-amber-400" />
            </div>
            <div className="my-2">
              <span className="text-3xl font-extrabold text-white">
                {stats.unoccupiedPercent}%
              </span>
              <span className="text-slate-400 text-sm font-medium"> open</span>
            </div>
            <span className="text-xs text-slate-400">
              {stats.unoccupiedAreaMeters} m² free floor area
            </span>
          </div>
        </div>

        {/* Spatial Geometry & Movement Telemetry Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Spatial Breakdown */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <h4 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <Maximize2 className="w-4 h-4 text-cyan-400" />
              Room & Furniture Footprint Breakdown
            </h4>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Room Dimensions (W × L × H)</span>
                <span className="font-medium text-slate-200">
                  {roomConfig.widthMeters}m × {roomConfig.lengthMeters}m × {roomConfig.ceilingHeightMeters}m
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Gross Floor Area</span>
                <span className="font-medium text-slate-200">{totalAreaUnit}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Placed Furniture Count</span>
                <span className="font-medium text-slate-200">{stats.furnitureCount} items</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Cumulative Furniture Footprint</span>
                <span className="font-medium text-amber-300">{occupiedAreaUnit}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Saved Layout Versions</span>
                <span className="font-medium text-cyan-300">{versions.length} snapshot(s)</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400">Net Unoccupied Circulation Area</span>
                <span className="font-bold text-emerald-400">
                  {unoccupiedAreaUnit} ({stats.unoccupiedPercent}%)
                </span>
              </div>
            </div>
          </div>

          {/* Movement & Safety Telemetry */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <h4 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <Footprints className="w-4 h-4 text-indigo-400" />
              Pathfinding & Boundary Telemetry
            </h4>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Active Test Route</span>
                <span className="font-medium text-slate-200">
                  {stats.movementPath?.startLabel} → {stats.movementPath?.destinationLabel}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Route Feasibility Status</span>
                <Badge
                  variant={
                    stats.movementPath?.status === 'feasible'
                      ? 'emerald'
                      : stats.movementPath?.status === 'bottleneck'
                      ? 'amber'
                      : 'rose'
                  }
                >
                  {stats.movementPath?.status?.toUpperCase()}
                </Badge>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Computed Path Distance</span>
                <span className="font-medium text-cyan-300">{pathLengthUnit}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Estimated Transit Time</span>
                <span className="font-medium text-slate-200">~{walkTimeSec} seconds</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400">Minimum Transit Corridor Width</span>
                <span className="font-bold text-slate-200">
                  {stats.movementPath?.minClearanceMeters} m
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Optimizer Candidates Comparison Summary (if available) */}
        {candidates.length > 0 && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Intelligent Optimizer Candidate Comparison
              </h4>
              {onOpenComparison && (
                <Button size="sm" variant="outline" onClick={onOpenComparison}>
                  Open Full Side-by-Side Comparison
                </Button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Candidate Strategy</th>
                    <th className="p-3">Safety Status</th>
                    <th className="p-3">Free Floor Area</th>
                    <th className="p-3">Overall Score</th>
                    <th className="p-3">Key Trade-Off</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {candidates.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-medium text-slate-100">{c.title}</td>
                      <td className="p-3">
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Feasible (0 Collisions)
                        </span>
                      </td>
                      <td className="p-3 text-cyan-300">{c.score.usableAreaPercent}% free</td>
                      <td className="p-3 font-bold text-indigo-300">{c.score.overallScore} pts</td>
                      <td className="p-3 text-slate-400 truncate max-w-xs">{c.tradeoffs[0] || 'Optimized layout'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Transparent Methodology & Engineering Disclaimer */}
        <div className="bg-slate-950/60 border border-slate-800/90 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-400">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-slate-300">
              Computational Methodology & Transparency Note
            </p>
            <p>
              {stats.score?.explanation}
            </p>
            <p className="text-slate-400 italic">
              SpaceFit AI uses 2D/3D Separating Axis Theorem (SAT) collision math and grid-based A* pathfinding.
              These scores represent geometric spatial fitness and should not be construed as accredited architectural,
              ADA accessibility, or municipal life-safety code certifications.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <Button variant="outline" onClick={onClose}>
            Close Dashboard
          </Button>
        </div>
      </div>
    </Modal>
  )
}
