import type { PlacedFurniture, FurnitureValidationResult } from './furniture'
import type { LayoutScoreBreakdown } from './optimizer'
import type { MovementPathResult } from './movement'

export interface LayoutVersion {
  id: string
  name: string
  createdAt: string
  furniture: PlacedFurniture[]
  notes?: string
  source: 'manual' | 'optimized' | 'ai' | 'initial'
  strategy?: string
  score?: LayoutScoreBreakdown
}

export interface ComputedLayoutStats {
  id: string
  title: string
  furniture: PlacedFurniture[]
  furnitureCount: number
  totalRoomAreaMeters: number
  occupiedAreaMeters: number
  unoccupiedAreaMeters: number
  unoccupiedPercent: number
  hardViolationsCount: number
  validation: FurnitureValidationResult
  movementPath?: MovementPathResult | null
  score?: LayoutScoreBreakdown
}

export interface LayoutComparisonResult {
  layoutA: ComputedLayoutStats
  layoutB: ComputedLayoutStats
  deltas: {
    furnitureCountDiff: number
    occupiedAreaDiffMeters: number
    unoccupiedPercentDiff: number
    hardViolationsDiff: number
    pathLengthDiffMeters?: number
    overallScoreDiff?: number
    tradeoffs: string[]
    summary: string
  }
}
