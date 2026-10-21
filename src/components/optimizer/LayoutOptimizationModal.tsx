import React, { useState } from 'react'
import {
  Sparkles,
  Footprints,
  Maximize2,
  Heart,
  Briefcase,
  Compass,
  Check,
  Eye,
  AlertTriangle,
  Sliders,
  Sun
} from 'lucide-react'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import type {
  OptimizationMode,
  OptimizationPreferences,
  CandidateLayout,
  OptimizationResult
} from '@/types/optimizer'
import type { PlacedFurniture } from '@/types/furniture'
import type { RoomConfiguration } from '@/types/geometry'
import { generateOptimizedLayouts } from '@/utils/layoutOptimizer'

interface LayoutOptimizationModalProps {
  isOpen: boolean
  onClose: () => void
  furniture: PlacedFurniture[]
  configuration: RoomConfiguration
  onApplyLayout: (candidate: CandidateLayout) => void
  onPreviewLayout: (candidate: CandidateLayout | null) => void
  previewCandidateId: string | null
}

export const LayoutOptimizationModal: React.FC<LayoutOptimizationModalProps> = ({
  isOpen,
  onClose,
  furniture,
  configuration,
  onApplyLayout,
  onPreviewLayout,
  previewCandidateId,
}) => {
  const [mode, setMode] = useState<OptimizationMode>('balanced')
  const [deskNearWindow, setDeskNearWindow] = useState(true)
  const [bedPlacement, setBedPlacement] = useState<'against-wall' | 'corner' | 'open'>('against-wall')
  const [clearEntranceBuffer, setClearEntranceBuffer] = useState(0.8)
  const [minWalkingClearance, setMinWalkingClearance] = useState(0.7)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const [result, setResult] = useState<OptimizationResult | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const strategies: {
    id: OptimizationMode
    title: string
    desc: string
    icon: React.ReactNode
  }[] = [
    {
      id: 'movement-first',
      title: 'Movement First',
      desc: 'Maximizes unobstructed walking spines, perimeter alignment, and wide circulation lines.',
      icon: <Footprints className="w-4 h-4 text-emerald-400" />,
    },
    {
      id: 'space-saver',
      title: 'Space Saver',
      desc: 'Clusters functional zones into corners to unlock the largest single continuous open floor area.',
      icon: <Maximize2 className="w-4 h-4 text-cyan-400" />,
    },
    {
      id: 'comfort-focus',
      title: 'Comfort Focus',
      desc: 'Prioritizes generous side bed clearances, deep lounge vistas, and restful focal zoning.',
      icon: <Heart className="w-4 h-4 text-pink-400" />,
    },
    {
      id: 'study-productivity',
      title: 'Study & Productivity',
      desc: 'Aligns desks with natural window daylight while keeping work zones quiet and ergonomic.',
      icon: <Briefcase className="w-4 h-4 text-purple-400" />,
    },
    {
      id: 'balanced',
      title: 'Balanced Layout',
      desc: 'Harmonious balance between walking pathways, visual symmetry, and functional zoning.',
      icon: <Compass className="w-4 h-4 text-blue-400" />,
    },
  ]

  const handleGenerate = () => {
    setIsGenerating(true)
    const preferences: OptimizationPreferences = {
      mode,
      deskNearWindow,
      bedPlacement,
      clearEntranceBuffer,
      minWalkingClearance,
    }

    // Run deterministic calculation
    setTimeout(() => {
      const optResult = generateOptimizedLayouts(furniture, configuration, preferences)
      setResult(optResult)
      setIsGenerating(false)
    }, 150)
  }

  const handleClose = () => {
    onPreviewLayout(null)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Intelligent Room Layout Optimization"
      description="Computational constraint-based engine generating viable furniture coordinates & orientations."
      size="xl"
    >
      <div className="space-y-6 font-mono text-xs">
        {/* Section 1: Optimization Strategy Selection */}
        <div className="space-y-3">
          <label className="text-white font-bold text-sm block flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Choose Layout Goal</span>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {strategies.map((strat) => (
              <button
                key={strat.id}
                type="button"
                onClick={() => setMode(strat.id)}
                className={`p-3.5 rounded-2xl text-left border transition-all flex flex-col justify-between gap-2 ${
                  mode === strat.id
                    ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/20'
                    : 'bg-[#090E1A] border-blue-500/15 hover:border-blue-500/35 hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-white text-xs">
                    {strat.icon}
                    <span>{strat.title}</span>
                  </div>
                  {mode === strat.id && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  {strat.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Section 2: Spatial Preferences */}
        <div className="p-4 rounded-2xl bg-[#090E1A] border border-blue-500/15 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white font-bold text-xs flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-blue-400" />
              <span>Spatial Placement Preferences</span>
            </span>

            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              {showAdvanced ? 'Hide Options' : 'Fine-Tune Preferences'}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            {/* Window Proximity Toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={deskNearWindow}
                onChange={(e) => setDeskNearWindow(e.target.checked)}
                className="w-4 h-4 rounded border-blue-500/30 text-blue-600 focus:ring-0 bg-slate-900"
              />
              <span className="text-slate-300 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                Align desk near natural window daylight
              </span>
            </label>
          </div>

          {showAdvanced && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800">
              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Bed Positioning</label>
                <select
                  value={bedPlacement}
                  onChange={(e) => setBedPlacement(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-blue-500/20 text-white text-xs font-mono"
                >
                  <option value="against-wall">Against Solid Wall</option>
                  <option value="corner">Corner Nested</option>
                  <option value="open">Open Center Focus</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Door Buffer ({clearEntranceBuffer}m)</label>
                <input
                  type="range"
                  min="0.5"
                  max="1.2"
                  step="0.1"
                  value={clearEntranceBuffer}
                  onChange={(e) => setClearEntranceBuffer(parseFloat(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Min Corridor ({minWalkingClearance}m)</label>
                <input
                  type="range"
                  min="0.5"
                  max="1.0"
                  step="0.05"
                  value={minWalkingClearance}
                  onChange={(e) => setMinWalkingClearance(parseFloat(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Generate Button */}
        <div className="flex justify-end">
          <Button
            variant="primary"
            size="md"
            onClick={handleGenerate}
            disabled={isGenerating || furniture.length === 0}
            leftIcon={<Sparkles className="w-4 h-4 text-cyan-300" />}
            className="glow-blue"
          >
            {isGenerating ? 'Computing Solvers...' : 'Generate 3 Candidate Layouts'}
          </Button>
        </div>

        {/* Section 3: Infeasibility Banner */}
        {result && !result.success && (
          <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/40 text-rose-300 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <span>Geometric Layout Infeasible</span>
            </div>
            <p className="text-xs text-rose-200/90 leading-relaxed">
              {result.infeasibleReason}
            </p>
            {result.suggestions && result.suggestions.length > 0 && (
              <div className="pt-2 border-t border-rose-500/20 space-y-1">
                <span className="text-[11px] font-bold text-rose-300 uppercase">Recommendations:</span>
                {result.suggestions.map((sug, i) => (
                  <p key={i} className="text-[11px] text-rose-200/80">
                    • {sug}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Section 4: Candidate Layouts Display */}
        {result && result.candidates.length > 0 && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-white font-bold text-sm">
                Generated Layout Candidates ({result.candidates.length})
              </span>
              <span className="text-slate-500 text-[11px]">Computed in {result.executionTimeMs}ms</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {result.candidates.map((cand) => {
                const isPreviewing = previewCandidateId === cand.id
                const score = cand.score

                return (
                  <div
                    key={cand.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3.5 ${
                      isPreviewing
                        ? 'bg-blue-950/40 border-cyan-400 shadow-xl shadow-cyan-500/20'
                        : 'bg-[#080D1A] border-blue-500/20 hover:border-blue-500/40'
                    }`}
                  >
                    <div>
                      {/* Title & Badges */}
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <Badge variant="blue" className="text-[10px] truncate">
                          {cand.strategyLabel}
                        </Badge>
                        <div className="flex items-center gap-1 font-mono font-bold text-emerald-400 text-xs">
                          <span>{score.overallScore}</span>
                          <span className="text-[10px] text-slate-500">/100</span>
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-white mb-2 leading-tight">
                        {cand.title}
                      </h4>

                      {/* Score Breakdown Pills */}
                      <div className="grid grid-cols-2 gap-1.5 text-[10px] mb-3">
                        <div className="p-1.5 rounded bg-slate-900 border border-slate-800 flex justify-between">
                          <span className="text-slate-400">Open Area:</span>
                          <span className="text-cyan-300 font-bold">{score.usableAreaPercent}%</span>
                        </div>
                        <div className="p-1.5 rounded bg-slate-900 border border-slate-800 flex justify-between">
                          <span className="text-slate-400">Circulation:</span>
                          <span className="text-emerald-300 font-bold">{score.circulationScore}%</span>
                        </div>
                      </div>

                      {/* Explanation */}
                      <p className="text-[11px] text-slate-300 leading-relaxed font-sans mb-3">
                        {score.explanation}
                      </p>

                      {/* Trade-offs */}
                      <div className="space-y-1 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 font-sans">
                        <span className="font-bold text-slate-300 block">Trade-Offs:</span>
                        {cand.tradeoffs.map((t, idx) => (
                          <div key={idx} className="flex items-start gap-1">
                            <span className="text-cyan-400">•</span>
                            <span>{t}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions: Preview & Apply */}
                    <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onPreviewLayout(isPreviewing ? null : cand)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isPreviewing
                            ? 'bg-cyan-600 text-white shadow'
                            : 'bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isPreviewing ? 'Previewing' : 'Preview 3D'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onApplyLayout(cand)
                          handleClose()
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Apply</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
