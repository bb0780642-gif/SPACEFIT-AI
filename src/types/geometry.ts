export type WallId = 'North' | 'East' | 'South' | 'West'
export type SwingDirection = 'inward-left' | 'inward-right' | 'outward-left' | 'outward-right'

export interface WallDefinition {
  id: WallId
  name: string
  lengthMeters: number
  startPoint: { x: number; z: number }
  endPoint: { x: number; z: number }
  orientation: 'horizontal' | 'vertical'
}

export interface RoomDoor {
  id: string
  name: string
  wallId: WallId
  widthMeters: number
  heightMeters: number
  offsetMeters: number
  swingDirection: SwingDirection
}

export interface RoomWindow {
  id: string
  name: string
  wallId: WallId
  widthMeters: number
  heightMeters: number
  offsetMeters: number
  sillHeightMeters: number
}

export interface RoomValidationError {
  field?: string
  openingId?: string
  wallId?: WallId
  severity: 'error' | 'warning'
  code: string
  message: string
}

export interface RoomValidationResult {
  isValid: boolean
  errors: RoomValidationError[]
  warnings: RoomValidationError[]
}

export interface RoomConfiguration {
  schemaVersion: '3.0'
  shape: 'rectangular'
  widthMeters: number
  lengthMeters: number
  ceilingHeightMeters: number
  wallThicknessMeters: number
  doors: RoomDoor[]
  windows: RoomWindow[]
}
