import React from 'react'
import {
  Wand2,
  Plus,
  Trash2,
  RotateCw,
  Check,
  X,
  Eye,
  ShieldCheck,
  AlertTriangle,
  RotateCcw
} from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import type { ToolCall, SpatialToolContext } from '@/types/assistant'
import type { OptimizationResult, CandidateLayout } from '@/types/optimizer'

interface ActionPreviewCardProps {
  toolCall: ToolCall
  onConfirm: (toolCall: ToolCall) => void
  onCancel: (toolCall: ToolCall) => void
  onPreviewCandidate?: (candidate: CandidateLayout | null) => void
  context?: SpatialToolContext
}

export const ActionPreviewCard: React.FC<ActionPreviewCardProps> = ({
  toolCall,
  onConfirm,
  onCancel,
  onPreviewCandidate,
}) => {
  const isPending = toolCall.status === 'pending'
  const isExecuted = toolCall.status === 'executed'
  const isCancelled = toolCall.status === 'cancelled'
  const isFailed = toolCall.status === 'failed'

  const optResult = toolCall.resultData as OptimizationResult | undefined
  const topCandidate = optResult?.candidates?.[0]

  return (
    <div className="mt-3 p-3.5 rounded-xl bg-slate-900/90 border border-blue-500/30 font-mono text-xs shadow-lg space-y-3">
      {/* Header with tool type & status badge */}
      <div className="flex items-center justify-between gap-2 border-b border-blue-500/15 pb-2">
        <div className="flex items-center gap-2">
          {toolCall.tool === 'optimize_layout' && <Wand2 className="w-4 h-4 text-cyan-400" />}
          {toolCall.tool === 'add_furniture' && <Plus className="w-4 h-4 text-emerald-400" />}
          {toolCall.tool === 'remove_furniture' && <Trash2 className="w-4 h-4 text-rose-400" />}
          {toolCall.tool === 'rotate_furniture' && <RotateCw className="w-4 h-4 text-amber-400" />}
          {toolCall.tool === 'validate_geometry' && <ShieldCheck className="w-4 h-4 text-blue-400" />}
          {toolCall.tool === 'undo_last_action' && <RotateCcw className="w-4 h-4 text-purple-400" />}

          <span className="font-bold text-white capitalize">
            {toolCall.tool.replace(/_/g, ' ')}
          </span>
        </div>

        <Badge
          variant={
            isExecuted ? 'emerald' : isPending ? 'amber' : isFailed ? 'rose' : 'subtle'
          }
          className="text-[10px]"
        >
          {isExecuted
            ? 'Applied'
            : isPending
            ? 'Action Ready'
            : isCancelled
            ? 'Cancelled'
            : 'Failed'}
        </Badge>
      </div>

      {/* Description */}
      <p className="text-slate-300 leading-relaxed text-xs">
        {toolCall.description}
      </p>

      {/* Consequential Layout Optimization Preview Box */}
      {toolCall.tool === 'optimize_layout' && topCandidate && (
        <div className="p-3 rounded-lg bg-blue-950/60 border border-cyan-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-cyan-200">{topCandidate.title}</span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-[11px]">
              <span>Score:</span>
              <span>{topCandidate.score.overallScore}/100</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1 border-t border-cyan-500/20">
            <div>
              Usable Area:{' '}
              <span className="text-white font-semibold">
                {topCandidate.score.usableAreaMeters.toFixed(1)} m² ({topCandidate.score.usableAreaPercent.toFixed(0)}%)
              </span>
            </div>
            <div>
              Circulation:{' '}
              <span className="text-white font-semibold">
                {topCandidate.score.circulationScore}/100
              </span>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 italic">
            Trade-off: {topCandidate.tradeoffs[0] || 'Optimized for spatial flow'}
          </div>
        </div>
      )}

      {/* Collision Failure Message */}
      {toolCall.errorMessage && (
        <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
          <span>{toolCall.errorMessage}</span>
        </div>
      )}

      {/* Interactive Confirmation & Preview Actions */}
      {isPending && (
        <div className="flex flex-wrap items-center justify-end gap-2 pt-1 border-t border-blue-500/15">
          {toolCall.tool === 'optimize_layout' && topCandidate && onPreviewCandidate && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPreviewCandidate(topCandidate)}
              leftIcon={<Eye className="w-3.5 h-3.5 text-cyan-400" />}
              className="text-xs"
            >
              Preview 3D
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCancel(toolCall)}
            leftIcon={<X className="w-3.5 h-3.5" />}
            className="text-xs text-slate-400 hover:text-white"
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => onConfirm(toolCall)}
            leftIcon={<Check className="w-3.5 h-3.5" />}
            className="text-xs glow-blue bg-gradient-to-r from-blue-600 to-cyan-600"
          >
            {toolCall.tool === 'optimize_layout'
              ? 'Apply Layout'
              : toolCall.tool === 'remove_furniture'
              ? 'Confirm Remove'
              : 'Confirm & Apply'}
          </Button>
        </div>
      )}
    </div>
  )
}
