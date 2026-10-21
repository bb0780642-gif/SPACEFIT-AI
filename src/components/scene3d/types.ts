import type { WallId } from '@/types/geometry'

export type CameraViewMode = 'perspective' | 'top-down' | 'elevation-south' | 'elevation-north' | 'elevation-east' | 'elevation-west'

export type CutawayMode = 'none' | 'auto' | 'half' | 'transparent'

export interface Room3DViewSettings {
  cameraMode: CameraViewMode
  cutawayMode: CutawayMode
  showDimensions: boolean
  showGrid: boolean
  showFurnitureClearance: boolean
  wireframe: boolean
  activeUnit: 'metres' | 'feet'
}

export type SelectedItemType = 'room' | 'wall' | 'door' | 'window' | 'furniture' | null

export interface SelectedItemState {
  type: SelectedItemType
  id: string | null
  wallId?: WallId
  furnitureId?: string
}

export interface WallSegment {
  wallId: WallId
  x: number
  y: number
  z: number
  width: number
  height: number
  depth: number
  type: 'full' | 'sill' | 'lintel' | 'side'
}

export interface DoorMeshSpec {
  id: string
  name: string
  wallId: WallId
  position: [number, number, number]
  rotation: [number, number, number]
  width: number
  height: number
  depth: number
  swingDirection: string
}

export interface WindowMeshSpec {
  id: string
  name: string
  wallId: WallId
  position: [number, number, number]
  rotation: [number, number, number]
  width: number
  height: number
  depth: number
  sillHeight: number
}

export interface RoomGeometryData {
  width: number
  length: number
  ceilingHeight: number
  wallThickness: number
  wallSegments: WallSegment[]
  doors: DoorMeshSpec[]
  windows: WindowMeshSpec[]
  center: [number, number, number]
}
