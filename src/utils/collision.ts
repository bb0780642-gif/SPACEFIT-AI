/**
 * SPACEFIT AI — FURNITURE COLLISION & SPATIAL BOUNDARY ENGINE
 * 
 * Provides mathematical validation for 2D floor footprint interactions
 * using the Separating Axis Theorem (SAT) for Oriented Bounding Boxes (OBB).
 * 
 * Checks:
 * - Furniture-to-furniture intersection (SAT)
 * - Furniture-to-wall collision and room boundary containment
 * - Door clearance and swing arc obstruction
 * - Walking / functional access clearance zones (soft warnings)
 */

import type { PlacedFurniture, FurnitureCollisionIssue, FurnitureValidationResult } from '@/types/furniture'
import type { RoomConfiguration, RoomDoor } from '@/types/geometry'

export interface Point2D {
  x: number
  z: number
}

export interface OBB2D {
  center: Point2D
  halfWidth: number
  halfLength: number
  rotation: number // radians
  vertices: Point2D[]
  axes: Point2D[]
}

/**
 * Computes 4 vertices of a rotated 2D rectangle in world coordinates.
 */
export function getFurnitureOBB(item: PlacedFurniture): OBB2D {
  const [cx, , cz] = item.position
  const hw = item.dimensions.widthMeters / 2
  const hl = item.dimensions.lengthMeters / 2
  const rot = item.rotationY

  const cos = Math.cos(rot)
  const sin = Math.sin(rot)

  // Local corners: (-hw, -hl), (hw, -hl), (hw, hl), (-hw, hl)
  const localCorners: Point2D[] = [
    { x: -hw, z: -hl },
    { x: hw, z: -hl },
    { x: hw, z: hl },
    { x: -hw, z: hl },
  ]

  const vertices: Point2D[] = localCorners.map((pt) => ({
    x: cx + pt.x * cos - pt.z * sin,
    z: cz + pt.x * sin + pt.z * cos,
  }))

  // 2 orthogonal unit axes (normals to edges)
  const axes: Point2D[] = [
    { x: cos, z: sin }, // along local X
    { x: -sin, z: cos }, // along local Z
  ]

  return {
    center: { x: cx, z: cz },
    halfWidth: hw,
    halfLength: hl,
    rotation: rot,
    vertices,
    axes,
  }
}

/**
 * Projects all vertices of an OBB onto an axis and returns [min, max].
 */
function projectOntoAxis(vertices: Point2D[], axis: Point2D): [number, number] {
  let min = vertices[0].x * axis.x + vertices[0].z * axis.z
  let max = min

  for (let i = 1; i < vertices.length; i++) {
    const proj = vertices[i].x * axis.x + vertices[i].z * axis.z
    if (proj < min) min = proj
    if (proj > max) max = proj
  }

  return [min, max]
}

/**
 * Tests if two Oriented Bounding Boxes intersect using Separating Axis Theorem (SAT).
 * Tolerance allows 0.005m (5mm) grace for flush touching.
 */
export function checkOBBIntersection(obbA: OBB2D, obbB: OBB2D, tolerance = 0.008): boolean {
  // Test all 4 axes (2 from A, 2 from B)
  const axes = [...obbA.axes, ...obbB.axes]

  for (const axis of axes) {
    const [minA, maxA] = projectOntoAxis(obbA.vertices, axis)
    const [minB, maxB] = projectOntoAxis(obbB.vertices, axis)

    // Check for separation interval with tolerance
    if (maxA - tolerance < minB || maxB - tolerance < minA) {
      return false // Separating axis exists -> no intersection
    }
  }

  return true // Overlapping on all axes -> collision!
}

/**
 * Checks if a furniture OBB is completely contained within room boundaries.
 */
export function checkRoomBoundaryContainment(
  obb: OBB2D,
  roomWidth: number,
  roomLength: number,
  tolerance = 0.01
): { isContained: boolean; violatingVertices: Point2D[] } {
  const halfW = roomWidth / 2
  const halfL = roomLength / 2

  const violating: Point2D[] = []

  for (const v of obb.vertices) {
    if (
      v.x < -halfW - tolerance ||
      v.x > halfW + tolerance ||
      v.z < -halfL - tolerance ||
      v.z > halfL + tolerance
    ) {
      violating.push(v)
    }
  }

  return {
    isContained: violating.length === 0,
    violatingVertices: violating,
  }
}

/**
 * Generates an OBB representing the clearance/swing zone required in front of a door.
 */
export function getDoorClearanceOBB(door: RoomDoor, roomWidth: number, roomLength: number): OBB2D {
  const halfW = roomWidth / 2
  const halfL = roomLength / 2
  const buffer = 0.25 // 25cm extra human ingress buffer
  const depth = door.widthMeters + buffer

  let cx = 0
  let cz = 0
  const hw = door.widthMeters / 2
  const hl = depth / 2
  let rot = 0

  if (door.wallId === 'South') {
    // Offset measured from West (X = -halfW)
    cx = -halfW + door.offsetMeters + hw
    cz = -halfL + hl
    rot = 0
  } else if (door.wallId === 'North') {
    cx = -halfW + door.offsetMeters + hw
    cz = halfL - hl
    rot = 0
  } else if (door.wallId === 'West') {
    // Offset measured from South (Z = -halfL)
    cx = -halfW + hl
    cz = -halfL + door.offsetMeters + hw
    rot = Math.PI / 2
  } else if (door.wallId === 'East') {
    cx = halfW - hl
    cz = -halfL + door.offsetMeters + hw
    rot = Math.PI / 2
  }

  // Construct vertices for the door clearance box
  const cos = Math.cos(rot)
  const sin = Math.sin(rot)
  const localCorners: Point2D[] = [
    { x: -hw, z: -hl },
    { x: hw, z: -hl },
    { x: hw, z: hl },
    { x: -hw, z: hl },
  ]

  const vertices = localCorners.map((pt) => ({
    x: cx + pt.x * cos - pt.z * sin,
    z: cz + pt.x * sin + pt.z * cos,
  }))

  const axes: Point2D[] = [
    { x: cos, z: sin },
    { x: -sin, z: cos },
  ]

  return {
    center: { x: cx, z: cz },
    halfWidth: hw,
    halfLength: hl,
    rotation: rot,
    vertices,
    axes,
  }
}

/**
 * Generates the front functional clearance zone OBB for a piece of furniture
 * (e.g. space to open wardrobe doors or pull out desk chair).
 */
export function getFurnitureFrontClearanceOBB(item: PlacedFurniture, clearanceDepth = 0.6): OBB2D {
  const [cx, , cz] = item.position
  const hw = item.dimensions.widthMeters / 2
  const hl = item.dimensions.lengthMeters / 2
  const rot = item.rotationY

  // Front extends along local +Z axis
  const cos = Math.cos(rot)
  const sin = Math.sin(rot)

  const clearanceCenterLocalZ = hl + clearanceDepth / 2
  const clearanceHalfL = clearanceDepth / 2

  const center: Point2D = {
    x: cx - clearanceCenterLocalZ * sin,
    z: cz + clearanceCenterLocalZ * cos,
  }

  const localCorners: Point2D[] = [
    { x: -hw, z: -clearanceHalfL },
    { x: hw, z: -clearanceHalfL },
    { x: hw, z: clearanceHalfL },
    { x: -hw, z: clearanceHalfL },
  ]

  const vertices = localCorners.map((pt) => ({
    x: center.x + pt.x * cos - pt.z * sin,
    z: center.z + pt.x * sin + pt.z * cos,
  }))

  const axes: Point2D[] = [
    { x: cos, z: sin },
    { x: -sin, z: cos },
  ]

  return {
    center,
    halfWidth: hw,
    halfLength: clearanceHalfL,
    rotation: rot,
    vertices,
    axes,
  }
}

/**
 * Snaps a furniture item flush against the closest interior wall and rotates it inward.
 */
export function snapFurnitureToNearestWall(
  item: PlacedFurniture,
  roomWidth: number,
  roomLength: number
): { position: [number, number, number]; rotationY: number } {
  const [cx, cy, cz] = item.position
  const hl = item.dimensions.lengthMeters / 2

  const halfW = roomWidth / 2
  const halfL = roomLength / 2

  // Distances to 4 interior walls from center
  const distSouth = Math.abs(cz - (-halfL))
  const distNorth = Math.abs(cz - halfL)
  const distWest = Math.abs(cx - (-halfW))
  const distEast = Math.abs(cx - halfW)

  const minDist = Math.min(distSouth, distNorth, distWest, distEast)

  if (minDist === distSouth) {
    // Back to South wall, face North (rot = 0)
    return {
      position: [cx, cy, -halfL + hl],
      rotationY: 0,
    }
  } else if (minDist === distNorth) {
    // Back to North wall, face South (rot = Math.PI)
    return {
      position: [cx, cy, halfL - hl],
      rotationY: Math.PI,
    }
  } else if (minDist === distWest) {
    // Back to West wall, face East (rot = -Math.PI / 2)
    return {
      position: [-halfW + hl, cy, cz],
      rotationY: -Math.PI / 2,
    }
  } else {
    // Back to East wall, face West (rot = Math.PI / 2)
    return {
      position: [halfW - hl, cy, cz],
      rotationY: Math.PI / 2,
    }
  }
}

/**
 * Validates full furniture layout against room boundaries, doors, and other furniture.
 */
export function validateFurnitureLayout(
  furniture: PlacedFurniture[],
  config: RoomConfiguration
): FurnitureValidationResult {
  const errors: FurnitureCollisionIssue[] = []
  const warnings: FurnitureCollisionIssue[] = []
  const collisionCountsByItem: Record<string, number> = {}

  // Initialize collision counters
  furniture.forEach((f) => {
    collisionCountsByItem[f.id] = 0
  })

  const W = config.widthMeters
  const L = config.lengthMeters

  // Precompute OBBs
  const obbs = furniture.map((item) => ({
    item,
    obb: getFurnitureOBB(item),
  }))

  // 1. Check Room Boundary Containment
  obbs.forEach(({ item, obb }) => {
    const { isContained } = checkRoomBoundaryContainment(obb, W, L)
    if (!isContained) {
      errors.push({
        id: `err-bounds-${item.id}`,
        furnitureId: item.id,
        furnitureName: item.name,
        severity: 'error',
        code: 'out_of_bounds',
        message: `${item.name} extends outside room boundaries.`,
      })
      collisionCountsByItem[item.id]++
    }
  })

  // 2. Check Furniture-to-Furniture Intersections (Pairwise SAT)
  for (let i = 0; i < obbs.length; i++) {
    for (let j = i + 1; j < obbs.length; j++) {
      const a = obbs[i]
      const b = obbs[j]

      if (checkOBBIntersection(a.obb, b.obb)) {
        errors.push({
          id: `err-collision-${a.item.id}-${b.item.id}`,
          furnitureId: a.item.id,
          furnitureName: a.item.name,
          severity: 'error',
          code: 'furniture_collision',
          message: `${a.item.name} intersects with ${b.item.name}.`,
          conflictingId: b.item.id,
          conflictingName: b.item.name,
        })
        collisionCountsByItem[a.item.id]++
        collisionCountsByItem[b.item.id]++
      }
    }
  }

  // 3. Check Door Obstruction
  const doorOBBs = config.doors.map((d) => ({
    door: d,
    obb: getDoorClearanceOBB(d, W, L),
  }))

  obbs.forEach(({ item, obb }) => {
    doorOBBs.forEach(({ door, obb: doorObb }) => {
      if (checkOBBIntersection(obb, doorObb)) {
        errors.push({
          id: `err-door-${item.id}-${door.id}`,
          furnitureId: item.id,
          furnitureName: item.name,
          severity: 'error',
          code: 'door_obstruction',
          message: `${item.name} obstructs doorway clearance for ${door.name}.`,
          conflictingId: door.id,
          conflictingName: door.name,
        })
        collisionCountsByItem[item.id]++
      }
    })
  })

  // 4. Check Functional Front Clearance (Soft Warning)
  obbs.forEach(({ item }) => {
    // Only check for items that require front clearance (beds, wardrobes, desks)
    if (item.category === 'beds' || item.category === 'storage' || item.category === 'tables') {
      const frontZone = getFurnitureFrontClearanceOBB(item, 0.5)

      // Check if other furniture overlaps this front clearance
      obbs.forEach(({ item: other, obb: otherObb }) => {
        if (other.id !== item.id && checkOBBIntersection(frontZone, otherObb)) {
          warnings.push({
            id: `warn-clearance-${item.id}-${other.id}`,
            furnitureId: item.id,
            furnitureName: item.name,
            severity: 'warning',
            code: 'insufficient_clearance',
            message: `Access clearance in front of ${item.name} is constrained by ${other.name}.`,
            conflictingId: other.id,
            conflictingName: other.name,
          })
        }
      })
    }
  })

  return {
    isValid: errors.length === 0,
    hasWarnings: warnings.length > 0,
    errors,
    warnings,
    collisionCountsByItem,
  }
}
