import type { RoomConfiguration } from './geometry'
import type { PlacedFurniture } from './furniture'

export type RoomType = 'Bedroom' | 'Living Room' | 'Study Room' | 'Kitchen' | 'Other'
export type MeasurementUnit = 'metres' | 'feet'
export type ProjectStatus = 'Draft' | 'Optimized' | 'In Progress'

export interface RoomProject {
  id: string
  name: string
  roomType: RoomType
  width: number
  length: number
  ceilingHeight?: number
  unit: MeasurementUnit
  area: number // formatted area in current unit (sq m or sq ft)
  volume?: number // volume in current unit (cu m or cu ft)
  normalizedDimensions: {
    widthMeters: number
    lengthMeters: number
    areaMeters: number
    volumeMeters: number
  }
  efficiencyScore: number // e.g. 96
  clearanceRate: number // e.g. 98.2 (%)
  collisionsCount: number // 0
  status: ProjectStatus
  createdAt: string
  updatedAt: string
  notes?: string
  accentColor?: string
  configuration?: RoomConfiguration
  furniture?: PlacedFurniture[]
  savedVersions?: import('./comparison').LayoutVersion[]
}

export interface ProjectFormData {
  name: string
  roomType: RoomType
  width: number
  length: number
  ceilingHeight?: number
  unit: MeasurementUnit
  notes?: string
}
