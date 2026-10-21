import type { Point2D } from '@/utils/collision'
import type { RoomConfiguration } from '@/types/geometry'
import type { PlacedFurniture } from '@/types/furniture'
import { distancePointToFurnitureOBB } from './pathfinding'

export interface AvatarMoveResult {
  position: [number, number, number] // [x, y, z]
  isColliding: boolean
  collidedWith?: string
}

const AVATAR_RADIUS = 0.28 // 28cm radius (56cm shoulder/body width)

/**
 * Resolves avatar movement against room perimeter walls and placed furniture with sliding physics.
 */
export function resolveAvatarMovement(
  currentPos: [number, number, number],
  deltaMovement: [number, number], // [deltaX, deltaZ]
  config: RoomConfiguration,
  furniture: PlacedFurniture[],
  radius: number = AVATAR_RADIUS
): AvatarMoveResult {
  const [currX, currY, currZ] = currentPos
  const [dx, dz] = deltaMovement

  const halfW = config.widthMeters / 2
  const halfL = config.lengthMeters / 2

  let isColliding = false
  let collidedWith: string | undefined

  // Helper: check if a candidate point collides with any furniture
  const checkFurnitureCollision = (pt: Point2D): string | null => {
    for (const item of furniture) {
      const dist = distancePointToFurnitureOBB(pt, item)
      if (dist < radius) {
        return item.name
      }
    }
    return null
  }

  // 1. Try full movement (dx, dz)
  let candidateX = currX + dx
  let candidateZ = currZ + dz

  // Wall clamping
  if (candidateX < -halfW + radius) {
    candidateX = -halfW + radius
    isColliding = true
    collidedWith = 'Wall'
  } else if (candidateX > halfW - radius) {
    candidateX = halfW - radius
    isColliding = true
    collidedWith = 'Wall'
  }

  if (candidateZ < -halfL + radius) {
    candidateZ = -halfL + radius
    isColliding = true
    collidedWith = 'Wall'
  } else if (candidateZ > halfL - radius) {
    candidateZ = halfL - radius
    isColliding = true
    collidedWith = 'Wall'
  }

  // Check furniture at candidate
  let furnHit = checkFurnitureCollision({ x: candidateX, z: candidateZ })

  if (!furnHit) {
    // Clean movement!
    return {
      position: [candidateX, currY, candidateZ],
      isColliding,
      collidedWith,
    }
  }

  isColliding = true
  collidedWith = furnHit

  // 2. Sliding: Try moving only along X
  const candidateOnlyX = currX + dx
  if (
    candidateOnlyX >= -halfW + radius &&
    candidateOnlyX <= halfW - radius &&
    !checkFurnitureCollision({ x: candidateOnlyX, z: currZ })
  ) {
    return {
      position: [candidateOnlyX, currY, currZ],
      isColliding: true,
      collidedWith: furnHit,
    }
  }

  // 3. Sliding: Try moving only along Z
  const candidateOnlyZ = currZ + dz
  if (
    candidateOnlyZ >= -halfL + radius &&
    candidateOnlyZ <= halfL - radius &&
    !checkFurnitureCollision({ x: currX, z: candidateOnlyZ })
  ) {
    return {
      position: [currX, currY, candidateOnlyZ],
      isColliding: true,
      collidedWith: furnHit,
    }
  }

  // 4. Blocked in both directions: stay at current position
  return {
    position: [currX, currY, currZ],
    isColliding: true,
    collidedWith: furnHit,
  }
}
