import type { CandidateLayout } from './optimizer'
import type { FurnitureCatalogItem, PlacedFurniture, FurnitureValidationResult } from './furniture'
import type { RoomConfiguration } from './geometry'

export type SupportedLanguage = 'auto' | 'en' | 'ta' | 'thanglish' | 'hi'

export type DetectedLanguage = 'en' | 'ta' | 'thanglish' | 'hi' | 'unknown'

export type ToolName =
  | 'get_room_info'
  | 'list_furniture'
  | 'add_furniture'
  | 'move_furniture'
  | 'rotate_furniture'
  | 'remove_furniture'
  | 'validate_geometry'
  | 'optimize_layout'
  | 'apply_candidate_layout'
  | 'explain_warnings'
  | 'undo_last_action'
  | 'clear_all_furniture'
  | 'analyze_movement_path'
  | 'compare_layouts'
  | 'save_layout_version'
  | 'export_design_report'

export type ToolExecutionStatus =
  | 'pending'
  | 'confirmed'
  | 'executed'
  | 'cancelled'
  | 'failed'

export interface ToolCall {
  id: string
  tool: ToolName
  parameters: Record<string, unknown>
  description: string
  requiresConfirmation: boolean
  status: ToolExecutionStatus
  resultData?: unknown
  errorMessage?: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  detectedLanguage?: DetectedLanguage
  toolCalls?: ToolCall[]
  status?: 'sending' | 'thinking' | 'success' | 'error'
  source?: 'gemini_api' | 'local_parser'
}

export interface IntentRecognitionResult {
  intent: ToolName | 'general_chat' | 'clarification_needed'
  confidence: number
  language: DetectedLanguage
  parameters: Record<string, unknown>
  clarifyingQuestion?: string
}

export interface SpatialToolContext {
  projectId: string
  projectName: string
  roomConfiguration: RoomConfiguration
  furniture: PlacedFurniture[]
  validationResult: FurnitureValidationResult
  onAddFurniture: (catalogItem: FurnitureCatalogItem) => void
  onUpdateFurniture: (updated: PlacedFurniture) => void
  onRemoveFurniture: (furnitureId: string) => void
  onApplyOptimizedLayout: (candidate: CandidateLayout) => void
  onUndo: () => void
  onPreviewCandidate: (candidate: CandidateLayout | null) => void
  onOpenComparison?: () => void
  onSaveVersion?: (name: string) => void
  onOpenReport?: () => void
}

export interface AIAssistantState {
  isOpen: boolean
  messages: ChatMessage[]
  preferredLanguage: SupportedLanguage
  isThinking: boolean
  apiKey: string
  voiceActive: boolean
  voiceSupported: boolean
}
