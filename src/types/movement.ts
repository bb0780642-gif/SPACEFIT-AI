import type { Point2D } from '@/utils/collision'

export interface PathWaypoint {
  x: number
  z: number
}

export type MovementFeasibilityStatus =
  | 'feasible'
  | 'bottleneck'
  | 'blocked'
  | 'same_point'

export interface MovementPathResult {
  isFeasible: boolean
  status: MovementFeasibilityStatus
  waypoints: PathWaypoint[]
  lengthMeters: number
  lengthFeet: number
  minClearanceMeters: number
  bottleneckPoint?: Point2D
  warningMessage?: string
  blockedReason?: string
  actionableSuggestion?: string
  startPoint: Point2D
  destinationPoint: Point2D
  startLabel: string
  destinationLabel: string
  configuredClearanceMeters: number
}

export type MovementPresetDestination =
  | 'door-to-bed'
  | 'door-to-desk'
  | 'door-to-wardrobe'
  | 'door-to-sofa'
  | 'bed-to-window'
  | 'custom'

export interface WalkthroughAvatarState {
  position: [number, number, number] // [x, y, z]
  rotationY: number // yaw
  pitch: number // look up/down
  eyeHeight: number // default 1.6m
  radius: number // default 0.28m
  isColliding: boolean
  lastCollidedWith?: string
}
