export type FurnitureCategory =
  | 'beds'
  | 'seating'
  | 'tables'
  | 'storage'
  | 'dining'
  | 'decor'

export interface FurnitureDimensions {
  widthMeters: number // local X dimension
  lengthMeters: number // local Z dimension (depth)
  heightMeters: number // local Y dimension (vertical)
}

export interface DimensionLimits {
  minWidth: number
  maxWidth: number
  minLength: number
  maxLength: number
  minHeight: number
  maxHeight: number
}

export interface ClearanceRequirement {
  frontMeters: number // access in front of item (e.g. wardrobe doors, desk chair)
  sidesMeters: number // side walking clearance (e.g. bed sides)
  rearMeters: number // rear distance (usually 0 for wall-backed)
}

export interface FurnitureCatalogItem {
  id: string
  name: string
  category: FurnitureCategory
  meshType: string
  description: string
  defaultDimensions: FurnitureDimensions
  dimensionLimits: DimensionLimits
  defaultColor: string
  allowedColors: string[]
  clearance: ClearanceRequirement
  tags: string[]
}

export interface PlacedFurniture {
  id: string
  catalogId: string
  name: string
  category: FurnitureCategory
  meshType: string
  color: string
  dimensions: FurnitureDimensions
  position: [x: number, y: number, z: number] // Y is on floor (0), X and Z in centered room space
  rotationY: number // rotation in radians around vertical Y axis
}

export type CollisionSeverity = 'error' | 'warning'

export type CollisionCode =
  | 'out_of_bounds'
  | 'furniture_collision'
  | 'wall_collision'
  | 'door_obstruction'
  | 'insufficient_clearance'

export interface FurnitureCollisionIssue {
  id: string
  furnitureId: string
  furnitureName: string
  severity: CollisionSeverity
  code: CollisionCode
  message: string
  conflictingId?: string
  conflictingName?: string
}

export interface FurnitureValidationResult {
  isValid: boolean
  hasWarnings: boolean
  errors: FurnitureCollisionIssue[]
  warnings: FurnitureCollisionIssue[]
  collisionCountsByItem: Record<string, number>
}
