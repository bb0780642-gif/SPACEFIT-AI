import React from 'react'
import { Eye, Check, RotateCcw } from 'lucide-react'
import type { CandidateLayout } from '@/types/optimizer'

interface LayoutPreviewBarProps {
  candidate: CandidateLayout
  onApply: () => void
  onCancel: () => void
}

export const LayoutPreviewBar: React.FC<LayoutPreviewBarProps> = ({
  candidate,
  onApply,
  onCancel,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-gradient-to-r from-blue-950/90 via-slate-950/90 to-blue-950/90 border border-cyan-500/40 backdrop-blur-xl shadow-2xl text-xs font-mono animate-fadeIn">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
          <Eye className="w-4 h-4 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-white font-bold">{candidate.title}</span>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
              Score: {candidate.score.overallScore}/100
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-sans">
            Interactive preview active in 3D scene. Inspect walking corridors before applying.
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restore Original</span>
        </button>

        <button
          type="button"
          onClick={onApply}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/30 transition-all hover:scale-105"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Apply Layout</span>
        </button>
      </div>
    </div>
  )
}
