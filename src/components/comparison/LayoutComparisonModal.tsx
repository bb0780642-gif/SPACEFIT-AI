import React, { useState, useMemo } from 'react'
import {
  Check,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import { RoomFloorplanSVG } from '@/components/blueprint/RoomFloorplanSVG'
import type { RoomConfiguration } from '@/types/geometry'
import type { PlacedFurniture } from '@/types/furniture'
import type { CandidateLayout } from '@/types/optimizer'
import type { LayoutVersion } from '@/types/comparison'
import { computeLayoutStats, compareLayouts } from '@/utils/analytics/layoutMetrics'

interface LayoutComparisonModalProps {
  isOpen: boolean
  onClose: () => void
  currentFurniture: PlacedFurniture[]
  roomConfig: RoomConfiguration
  candidates: CandidateLayout[]
  savedVersions: LayoutVersion[]
  unit?: 'metres' | 'feet'
  onApplyLayout: (furniture: PlacedFurniture[], layoutTitle: string) => void
}

interface LayoutOption {
  id: string
  title: string
  subtitle: string
  furniture: PlacedFurniture[]
  source: 'current' | 'candidate' | 'version'
}

export const LayoutComparisonModal: React.FC<LayoutComparisonModalProps> = ({
  isOpen,
  onClose,
  currentFurniture,
  roomConfig,
  candidates,
  savedVersions,
  unit = 'metres',
  onApplyLayout,
}) => {
  // Build list of selectable layout options
  const layoutOptions: LayoutOption[] = useMemo(() => {
    const list: LayoutOption[] = [
      {
        id: 'opt-current',
        title: 'Current Canvas Layout',
        subtitle: `${currentFurniture.length} items (Active)`,
        furniture: currentFurniture,
        source: 'current',
      },
    ]

    candidates.forEach((c) => {
      list.push({
        id: `opt-cand-${c.id}`,
        title: c.title,
        subtitle: `Optimizer (${c.strategyLabel})`,
        furniture: c.furniture,
        source: 'candidate',
      })
    })

    savedVersions.forEach((v) => {
      list.push({
        id: `opt-ver-${v.id}`,
        title: v.name,
        subtitle: `Saved Version (${new Date(v.createdAt).toLocaleDateString()})`,
        furniture: v.furniture,
        source: 'version',
      })
    })

    return list
  }, [currentFurniture, candidates, savedVersions])

  // Selected IDs for comparison: Layout A (baseline) vs Layout B (target)
  const [selectedAId, setSelectedAId] = useState<string>('opt-current')
  const [selectedBId, setSelectedBId] = useState<string>(
    candidates.length > 0 ? `opt-cand-${candidates[0].id}` : 'opt-current'
  )

  const optionA = layoutOptions.find((o) => o.id === selectedAId) || layoutOptions[0]
  const optionB = layoutOptions.find((o) => o.id === selectedBId) || layoutOptions[1] || layoutOptions[0]

  // Compute stats and comparison deltas mathematically
  const statsA = useMemo(() => {
    return computeLayoutStats(optionA.furniture, roomConfig, optionA.title, optionA.id)
  }, [optionA, roomConfig])

  const statsB = useMemo(() => {
    return computeLayoutStats(optionB.furniture, roomConfig, optionB.title, optionB.id)
  }, [optionB, roomConfig])

  const comparison = useMemo(() => {
    return compareLayouts(statsA, statsB)
  }, [statsA, statsB])

  const { deltas } = comparison

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Layout Comparison & Trade-Off Engine"
      size="xl"
    >
      <div className="space-y-6">
        {/* Top Control Bar: Selectors for A and B */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2">
              Layout A (Baseline)
            </label>
            <select
              value={selectedAId}
              onChange={(e) => setSelectedAId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              {layoutOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.title} — {opt.subtitle}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">
              Layout B (Comparison Target)
            </label>
            <select
              value={selectedBId}
              onChange={(e) => setSelectedBId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              {layoutOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.title} — {opt.subtitle}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quantitative Comparative Delta Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-center">
            <span className="text-xs text-slate-400 block mb-1">Open Floor Area</span>
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-lg font-bold text-slate-100">
                {statsB.unoccupiedAreaMeters} m²
              </span>
              <span
                className={`text-xs font-semibold ${
                  deltas.occupiedAreaDiffMeters <= 0 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                ({deltas.occupiedAreaDiffMeters <= 0 ? '+' : ''}
                {Math.abs(deltas.occupiedAreaDiffMeters)} m²)
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-center">
            <span className="text-xs text-slate-400 block mb-1">Boundary Violations</span>
            <div className="flex items-center justify-center gap-1.5">
              <span
                className={`text-lg font-bold ${
                  statsB.hardViolationsCount === 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {statsB.hardViolationsCount} errors
              </span>
              {deltas.hardViolationsDiff !== 0 && (
                <span
                  className={`text-xs font-semibold ${
                    deltas.hardViolationsDiff < 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  ({deltas.hardViolationsDiff < 0 ? '' : '+'}
                  {deltas.hardViolationsDiff})
                </span>
              )}
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-center">
            <span className="text-xs text-slate-400 block mb-1">Walking Route</span>
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-lg font-bold text-cyan-400">
                {statsB.movementPath?.lengthMeters ?? 0} m
              </span>
              <span className="text-xs text-slate-400">
                ({statsB.movementPath?.status === 'feasible' ? 'Clear' : 'Tight'})
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-center">
            <span className="text-xs text-slate-400 block mb-1">SpaceFit Score</span>
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-lg font-bold text-indigo-400">
                {statsB.score?.overallScore ?? 0} pts
              </span>
              {deltas.overallScoreDiff !== 0 && (
                <span
                  className={`text-xs font-semibold ${
                    (deltas.overallScoreDiff ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  ({(deltas.overallScoreDiff ?? 0) >= 0 ? '+' : ''}
                  {deltas.overallScoreDiff})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Side-by-Side Synchronized 2D Top-Down Blueprints */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Blueprint A */}
          <div className="bg-slate-900/70 border border-cyan-500/30 rounded-2xl p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Badge variant="cyan">
                  Layout A
                </Badge>
                <h4 className="font-semibold text-slate-100 text-sm">{optionA.title}</h4>
              </div>
              <span className="text-xs text-slate-400">{statsA.furnitureCount} furniture items</span>
            </div>

            <div className="flex-1 min-h-[340px] bg-slate-950/80 rounded-xl overflow-hidden border border-slate-800/80 p-2 flex items-center justify-center">
              <RoomFloorplanSVG
                configuration={roomConfig}
                furniture={optionA.furniture}
                movementPath={statsA.movementPath}
                unit={unit}
              />
            </div>

            <div className="mt-3 text-xs text-slate-400 flex items-center justify-between">
              <span>Free Floor: {statsA.unoccupiedPercent}%</span>
              <span>Violations: {statsA.hardViolationsCount}</span>
              <span>Score: {statsA.score?.overallScore} / 100</span>
            </div>
          </div>

          {/* Blueprint B */}
          <div className="bg-slate-900/70 border border-indigo-500/30 rounded-2xl p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Badge variant="violet">
                  Layout B
                </Badge>
                <h4 className="font-semibold text-slate-100 text-sm">{optionB.title}</h4>
              </div>
              <span className="text-xs text-slate-400">{statsB.furnitureCount} furniture items</span>
            </div>

            <div className="flex-1 min-h-[340px] bg-slate-950/80 rounded-xl overflow-hidden border border-slate-800/80 p-2 flex items-center justify-center">
              <RoomFloorplanSVG
                configuration={roomConfig}
                furniture={optionB.furniture}
                movementPath={statsB.movementPath}
                unit={unit}
              />
            </div>

            <div className="mt-3 text-xs text-slate-400 flex items-center justify-between">
              <span>Free Floor: {statsB.unoccupiedPercent}%</span>
              <span>Violations: {statsB.hardViolationsCount}</span>
              <span>Score: {statsB.score?.overallScore} / 100</span>
            </div>
          </div>
        </div>

        {/* Computed Trade-Offs & Qualitative Differences */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Trade-Off Analysis (Layout B vs. Layout A)
          </h4>
          <ul className="space-y-1.5">
            {deltas.tradeoffs.map((item, idx) => (
              <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <Button variant="outline" onClick={onClose}>
            Back to Editor
          </Button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="primary"
              className="w-full sm:w-auto gap-2"
              onClick={() => {
                onApplyLayout(optionB.furniture, optionB.title)
                onClose()
              }}
            >
              <Check className="w-4 h-4" />
              Apply {optionB.title} to Workspace
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
