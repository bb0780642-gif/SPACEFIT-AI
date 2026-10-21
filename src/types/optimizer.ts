import type { PlacedFurniture } from './furniture'

export type OptimizationMode =
  | 'balanced'
  | 'movement-first'
  | 'space-saver'
  | 'comfort-focus'
  | 'study-productivity'

export interface OptimizationPreferences {
  mode: OptimizationMode
  deskNearWindow: boolean
  bedPlacement: 'against-wall' | 'corner' | 'open'
  clearEntranceBuffer: number // metres (e.g. 0.8)
  minWalkingClearance: number // metres (e.g. 0.6)
}

export interface LayoutScoreBreakdown {
  circulationScore: number // 0 - 100
  usableAreaMeters: number // square metres free
  usableAreaPercent: number // % of room area free
  preferenceScore: number // 0 - 100
  functionalGroupingScore: number // 0 - 100
  overallScore: number // 0 - 100
  explanation: string
}

export interface CandidateLayout {
  id: string
  title: string
  strategy: OptimizationMode
  strategyLabel: string
  description: string
  isFeasible: boolean
  score: LayoutScoreBreakdown
  tradeoffs: string[]
  furniture: PlacedFurniture[]
  warnings: string[]
  infeasibilityReasons?: string[]
}

export interface OptimizationResult {
  success: boolean
  candidates: CandidateLayout[]
  infeasibleReason?: string
  suggestions?: string[]
  executionTimeMs: number
}
