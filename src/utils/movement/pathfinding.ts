import type { Point2D } from '@/utils/collision'
import type { RoomConfiguration, WallId } from '@/types/geometry'
import type { PlacedFurniture } from '@/types/furniture'
import type {
  MovementPathResult,
  PathWaypoint,
  MovementPresetDestination,
} from '@/types/movement'
import { metersToFeet } from '@/utils/geometry'

const DEFAULT_RESOLUTION = 0.1 // 10cm grid cells

interface GridCell {
  c: number
  r: number
  x: number
  z: number
  isBlocked: boolean
  clearance: number // distance to nearest obstacle in meters
  blockedBy?: string
}

/**
 * Computes shortest Euclidean distance from a 2D world point to a furniture OBB.
 */
export function distancePointToFurnitureOBB(
  point: Point2D,
  item: PlacedFurniture
): number {
  const [cx, , cz] = item.position
  const hw = item.dimensions.widthMeters / 2
  const hl = item.dimensions.lengthMeters / 2
  const rot = item.rotationY

  const cos = Math.cos(-rot)
  const sin = Math.sin(-rot)

  const dx = point.x - cx
  const dz = point.z - cz

  // Rotate point into local box coordinates
  const localX = cos * dx - sin * dz
  const localZ = sin * dx + cos * dz

  const ex = Math.max(0, Math.abs(localX) - hw)
  const ez = Math.max(0, Math.abs(localZ) - hl)

  return Math.sqrt(ex * ex + ez * ez)
}

/**
 * Computes distance from a 2D world point to room perimeter walls.
 */
export function distancePointToWalls(
  point: Point2D,
  widthMeters: number,
  lengthMeters: number
): number {
  const halfW = widthMeters / 2
  const halfL = lengthMeters / 2

  const distLeft = point.x - -halfW
  const distRight = halfW - point.x
  const distBottom = point.z - -halfL
  const distTop = halfL - point.z

  return Math.max(0, Math.min(distLeft, distRight, distBottom, distTop))
}

/**
 * Constructs an Occupancy Grid representing room walkable space.
 */
export function buildOccupancyGrid(
  config: RoomConfiguration,
  furniture: PlacedFurniture[],
  avatarRadius: number,
  resolution: number = DEFAULT_RESOLUTION
): {
  cells: GridCell[][]
  cols: number
  rows: number
  worldToCell: (pt: Point2D) => { c: number; r: number }
  cellToWorld: (c: number, r: number) => Point2D
} {
  const cols = Math.max(5, Math.ceil(config.widthMeters / resolution))
  const rows = Math.max(5, Math.ceil(config.lengthMeters / resolution))

  const halfW = config.widthMeters / 2
  const halfL = config.lengthMeters / 2

  const worldToCell = (pt: Point2D): { c: number; r: number } => {
    const c = Math.floor((pt.x + halfW) / resolution)
    const r = Math.floor((pt.z + halfL) / resolution)
    return {
      c: Math.max(0, Math.min(cols - 1, c)),
      r: Math.max(0, Math.min(rows - 1, r)),
    }
  }

  const cellToWorld = (c: number, r: number): Point2D => ({
    x: Number((-halfW + (c + 0.5) * resolution).toFixed(3)),
    z: Number((-halfL + (r + 0.5) * resolution).toFixed(3)),
  })

  const cells: GridCell[][] = []

  for (let c = 0; c < cols; c++) {
    cells[c] = []
    for (let r = 0; r < rows; r++) {
      const pos = cellToWorld(c, r)

      // Distance to perimeter walls
      const wallDist = distancePointToWalls(pos, config.widthMeters, config.lengthMeters)

      let minDist = wallDist
      let blockedBy: string | undefined = wallDist < avatarRadius ? 'Perimeter Wall' : undefined

      // Distance to all placed furniture
      for (const item of furniture) {
        const itemDist = distancePointToFurnitureOBB(pos, item)
        if (itemDist < minDist) {
          minDist = itemDist
        }
        if (itemDist < avatarRadius) {
          blockedBy = item.name
        }
      }

      cells[c][r] = {
        c,
        r,
        x: pos.x,
        z: pos.z,
        isBlocked: blockedBy !== undefined,
        clearance: Number(minDist.toFixed(3)),
        blockedBy,
      }
    }
  }

  return { cells, cols, rows, worldToCell, cellToWorld }
}

interface NodeRecord {
  c: number
  r: number
  g: number
  h: number
  f: number
  parent: NodeRecord | null
}

/**
 * Executes A* search on the 2D grid from start to goal.
 */
function aStarSearch(
  grid: {
    cells: GridCell[][]
    cols: number
    rows: number
    cellToWorld: (c: number, r: number) => Point2D
  },
  startCell: { c: number; r: number },
  goalCell: { c: number; r: number }
): PathWaypoint[] | null {
  const { cells, cols, rows, cellToWorld } = grid

  // If start or goal cell is blocked, find nearest unblocked neighbor
  let actualStart = startCell
  if (cells[startCell.c]?.[startCell.r]?.isBlocked) {
    const unblocked = findNearestWalkableCell(grid, startCell)
    if (!unblocked) return null
    actualStart = unblocked
  }

  let actualGoal = goalCell
  if (cells[goalCell.c]?.[goalCell.r]?.isBlocked) {
    const unblocked = findNearestWalkableCell(grid, goalCell)
    if (!unblocked) return null
    actualGoal = unblocked
  }

  const openList: NodeRecord[] = []
  const closedSet = new Set<string>()

  const heuristic = (c: number, r: number): number => {
    const dc = Math.abs(c - actualGoal.c)
    const dr = Math.abs(r - actualGoal.r)
    return Math.sqrt(dc * dc + dr * dr)
  }

  const startRecord: NodeRecord = {
    c: actualStart.c,
    r: actualStart.r,
    g: 0,
    h: heuristic(actualStart.c, actualStart.r),
    f: heuristic(actualStart.c, actualStart.r),
    parent: null,
  }

  openList.push(startRecord)

  // 8 Directions (horizontal, vertical, diagonal)
  const neighbors = [
    { dc: 1, dr: 0, cost: 1.0 },
    { dc: -1, dr: 0, cost: 1.0 },
    { dc: 0, dr: 1, cost: 1.0 },
    { dc: 0, dr: -1, cost: 1.0 },
    { dc: 1, dr: 1, cost: 1.414 },
    { dc: 1, dr: -1, cost: 1.414 },
    { dc: -1, dr: 1, cost: 1.414 },
    { dc: -1, dr: -1, cost: 1.414 },
  ]

  let iterations = 0
  const MAX_ITERATIONS = 8000

  while (openList.length > 0 && iterations < MAX_ITERATIONS) {
    iterations++

    // Find node with lowest f
    let bestIdx = 0
    for (let i = 1; i < openList.length; i++) {
      if (openList[i].f < openList[bestIdx].f) {
        bestIdx = i
      }
    }

    const current = openList.splice(bestIdx, 1)[0]
    const key = `${current.c},${current.r}`

    if (current.c === actualGoal.c && current.r === actualGoal.r) {
      // Reconstruct path
      const path: PathWaypoint[] = []
      let curr: NodeRecord | null = current
      while (curr) {
        const pt = cellToWorld(curr.c, curr.r)
        path.unshift({ x: pt.x, z: pt.z })
        curr = curr.parent
      }
      return path
    }

    closedSet.add(key)

    for (const nb of neighbors) {
      const nc = current.c + nb.dc
      const nr = current.r + nb.dr

      if (nc < 0 || nc >= cols || nr < 0 || nr >= rows) continue

      const neighborKey = `${nc},${nr}`
      if (closedSet.has(neighborKey)) continue

      const cell = cells[nc][nr]
      if (cell.isBlocked) continue

      // Diagonal corner-cutting prevention
      if (nb.dc !== 0 && nb.dr !== 0) {
        if (cells[current.c + nb.dc][current.r].isBlocked && cells[current.c][current.r + nb.dr].isBlocked) {
          continue
        }
      }

      const gScore = current.g + nb.cost

      const existingOpen = openList.find((n) => n.c === nc && n.r === nr)
      if (existingOpen) {
        if (gScore < existingOpen.g) {
          existingOpen.g = gScore
          existingOpen.f = gScore + existingOpen.h
          existingOpen.parent = current
        }
      } else {
        const hScore = heuristic(nc, nr)
        openList.push({
          c: nc,
          r: nr,
          g: gScore,
          h: hScore,
          f: gScore + hScore,
          parent: current,
        })
      }
    }
  }

  return null // No path found
}

/**
 * Searches in concentric rings for the nearest walkable cell to an obstructed point.
 */
function findNearestWalkableCell(
  grid: {
    cells: GridCell[][]
    cols: number
    rows: number
  },
  origin: { c: number; r: number },
  maxRadius: number = 8
): { c: number; r: number } | null {
  const { cells, cols, rows } = grid
  for (let rad = 1; rad <= maxRadius; rad++) {
    for (let dc = -rad; dc <= rad; dc++) {
      for (let dr = -rad; dr <= rad; dr++) {
        if (Math.abs(dc) !== rad && Math.abs(dr) !== rad) continue
        const nc = origin.c + dc
        const nr = origin.r + dr
        if (nc >= 0 && nc < cols && nr >= 0 && nr < rows) {
          if (!cells[nc][nr].isBlocked) {
            return { c: nc, r: nr }
          }
        }
      }
    }
  }
  return null
}

/**
 * Smooths grid-aligned stairs path by removing redundant intermediate waypoints.
 */
function smoothPathWaypoints(waypoints: PathWaypoint[]): PathWaypoint[] {
  if (waypoints.length <= 2) return waypoints

  const smoothed: PathWaypoint[] = [waypoints[0]]

  let currentIdx = 0
  while (currentIdx < waypoints.length - 1) {
    let nextIdx = Math.min(currentIdx + 4, waypoints.length - 1)
    smoothed.push(waypoints[nextIdx])
    currentIdx = nextIdx
  }

  if (smoothed[smoothed.length - 1] !== waypoints[waypoints.length - 1]) {
    smoothed.push(waypoints[waypoints.length - 1])
  }

  return smoothed
}

/**
 * Calculates the total length of path waypoints in meters.
 */
export function calculatePathLength(waypoints: PathWaypoint[]): number {
  if (waypoints.length < 2) return 0
  let total = 0
  for (let i = 1; i < waypoints.length; i++) {
    const dx = waypoints[i].x - waypoints[i - 1].x
    const dz = waypoints[i].z - waypoints[i - 1].z
    total += Math.sqrt(dx * dx + dz * dz)
  }
  return Number(total.toFixed(2))
}

/**
 * Computes door center coordinate along its perimeter wall.
 */
export function getDoorEntrancePoint(
  config: RoomConfiguration
): { point: Point2D; wallId: WallId } {
  const halfW = config.widthMeters / 2
  const halfL = config.lengthMeters / 2

  if (!config.doors || config.doors.length === 0) {
    return { point: { x: 0, z: halfL - 0.5 }, wallId: 'South' }
  }

  const door = config.doors[0]
  const wallId = (door.wallId || (door as any).wall || 'South') as WallId
  const offset = door.offsetMeters + door.widthMeters / 2

  let x = 0
  let z = 0

  switch (wallId) {
    case 'North':
      x = -halfW + offset
      z = halfL - 0.4
      break
    case 'South':
      x = -halfW + offset
      z = -halfL + 0.4
      break
    case 'East':
      x = halfW - 0.4
      z = -halfL + offset
      break
    case 'West':
      x = -halfW + 0.4
      z = -halfL + offset
      break
  }

  return {
    point: { x: Number(x.toFixed(2)), z: Number(z.toFixed(2)) },
    wallId,
  }
}

/**
 * Extracts target destination point for common room furniture presets.
 */
export function getPresetDestinationPoint(
  preset: MovementPresetDestination,
  config: RoomConfiguration,
  furniture: PlacedFurniture[]
): { point: Point2D; label: string } {
  switch (preset) {
    case 'door-to-bed': {
      const bed = furniture.find((f) => f.category === 'beds')
      if (bed) {
        // Place destination at foot or side of bed in clear access fairway
        return {
          point: {
            x: Number(bed.position[0].toFixed(2)),
            z: Number((bed.position[2] - (bed.dimensions.lengthMeters / 2 + 0.45)).toFixed(2)),
          },
          label: bed.name,
        }
      }
      return { point: { x: 0, z: 0 }, label: 'Center Room' }
    }

    case 'door-to-desk': {
      const desk = furniture.find((f) => f.category === 'tables' && f.meshType.includes('desk'))
      if (desk) {
        return {
          point: {
            x: Number(desk.position[0].toFixed(2)),
            z: Number((desk.position[2] + (desk.dimensions.lengthMeters / 2 + 0.45)).toFixed(2)),
          },
          label: desk.name,
        }
      }
      return { point: { x: 0, z: 0 }, label: 'Center Room' }
    }

    case 'door-to-wardrobe': {
      const wardrobe = furniture.find((f) => f.category === 'storage' && f.meshType.includes('wardrobe'))
      if (wardrobe) {
        return {
          point: {
            x: Number(wardrobe.position[0].toFixed(2)),
            z: Number((wardrobe.position[2] + (wardrobe.dimensions.lengthMeters / 2 + 0.5)).toFixed(2)),
          },
          label: wardrobe.name,
        }
      }
      return { point: { x: 0, z: 0 }, label: 'Center Room' }
    }

    case 'door-to-sofa': {
      const sofa = furniture.find((f) => f.category === 'seating' && f.meshType.includes('sofa'))
      if (sofa) {
        return {
          point: {
            x: Number(sofa.position[0].toFixed(2)),
            z: Number((sofa.position[2] + (sofa.dimensions.lengthMeters / 2 + 0.45)).toFixed(2)),
          },
          label: sofa.name,
        }
      }
      return { point: { x: 0, z: 0 }, label: 'Center Room' }
    }

    case 'bed-to-window': {
      const halfW = config.widthMeters / 2
      const halfL = config.lengthMeters / 2
      const win = config.windows[0]
      let winPos: Point2D = { x: halfW - 0.4, z: 0 }
      if (win) {
        const wId = win.wallId || (win as any).wall
        if (wId === 'East') winPos = { x: halfW - 0.4, z: -halfL + win.offsetMeters }
        else if (wId === 'West') winPos = { x: -halfW + 0.4, z: -halfL + win.offsetMeters }
        else if (wId === 'North') winPos = { x: -halfW + win.offsetMeters, z: halfL - 0.4 }
        else if (wId === 'South') winPos = { x: -halfW + win.offsetMeters, z: -halfL + 0.4 }
      }
      return {
        point: winPos,
        label: win ? `${win.wallId || 'East'} Window` : 'Window',
      }
    }

    case 'custom':
    default:
      return { point: { x: 0, z: 0 }, label: 'Room Center' }
  }
}

/**
 * Computes Movement Path Analysis using A* search and geometric clearance validation.
 */
export function analyzeMovementPath(
  config: RoomConfiguration,
  furniture: PlacedFurniture[],
  startPoint: Point2D,
  destinationPoint: Point2D,
  configuredClearanceMeters: number = 0.6,
  startLabel: string = 'Entrance Door',
  destinationLabel: string = 'Destination'
): MovementPathResult {
  const avatarRadius = Math.max(0.18, configuredClearanceMeters / 2)

  // 1. Build occupancy grid with clearance inflation
  const grid = buildOccupancyGrid(config, furniture, avatarRadius)

  const startCell = grid.worldToCell(startPoint)
  const goalCell = grid.worldToCell(destinationPoint)

  // Check if start and goal are virtually identical
  const dist = Math.hypot(destinationPoint.x - startPoint.x, destinationPoint.z - startPoint.z)
  if (dist < 0.25) {
    return {
      isFeasible: true,
      status: 'same_point',
      waypoints: [startPoint, destinationPoint],
      lengthMeters: 0,
      lengthFeet: 0,
      minClearanceMeters: configuredClearanceMeters,
      startPoint,
      destinationPoint,
      startLabel,
      destinationLabel,
      configuredClearanceMeters,
    }
  }

  // 2. Perform A* search
  const rawWaypoints = aStarSearch(grid, startCell, goalCell)

  if (!rawWaypoints || rawWaypoints.length === 0) {
    // Check if start or goal is blocked
    const startCellInfo = grid.cells[startCell.c]?.[startCell.r]
    const goalCellInfo = grid.cells[goalCell.c]?.[goalCell.r]

    let blockedReason = 'No continuous corridor satisfies the required walking clearance.'
    if (startCellInfo?.isBlocked) {
      blockedReason = `The starting zone (${startLabel}) is obstructed by ${startCellInfo.blockedBy || 'obstacles'}.`
    } else if (goalCellInfo?.isBlocked) {
      blockedReason = `The destination zone (${destinationLabel}) is directly obstructed by ${goalCellInfo.blockedBy || 'obstacles'}.`
    }

    return {
      isFeasible: false,
      status: 'blocked',
      waypoints: [],
      lengthMeters: 0,
      lengthFeet: 0,
      minClearanceMeters: 0,
      blockedReason,
      actionableSuggestion:
        'Try reducing configured clearance or run the Intelligent Layout Optimizer in Movement First mode to restore walking pathways.',
      startPoint,
      destinationPoint,
      startLabel,
      destinationLabel,
      configuredClearanceMeters,
    }
  }

  // 3. Smooth waypoints for clean visual trajectory
  const smoothedWaypoints = smoothPathWaypoints(rawWaypoints)
  const lengthMeters = calculatePathLength(smoothedWaypoints)
  const lengthFeet = Number(metersToFeet(lengthMeters).toFixed(1))

  // 4. Bottleneck Analysis: find minimum clearance along path
  let minClearanceMeters = 999
  let bottleneckPoint: Point2D | undefined

  for (const wp of smoothedWaypoints) {
    const c = grid.worldToCell(wp)
    const cell = grid.cells[c.c]?.[c.r]
    if (cell && cell.clearance < minClearanceMeters) {
      minClearanceMeters = cell.clearance
      bottleneckPoint = { x: cell.x, z: cell.z }
    }
  }

  // Double radius to reflect effective corridor width
  const effectiveCorridorWidth = Number((minClearanceMeters * 2).toFixed(2))

  const isBottleneck = effectiveCorridorWidth < configuredClearanceMeters

  return {
    isFeasible: !isBottleneck,
    status: isBottleneck ? 'bottleneck' : 'feasible',
    waypoints: smoothedWaypoints,
    lengthMeters,
    lengthFeet,
    minClearanceMeters: effectiveCorridorWidth,
    bottleneckPoint: isBottleneck ? bottleneckPoint : undefined,
    warningMessage: isBottleneck
      ? `Narrow corridor detected: Minimum clearance along this route is ${effectiveCorridorWidth}m, which is below your configured ${configuredClearanceMeters.toFixed(2)}m requirement.`
      : undefined,
    startPoint,
    destinationPoint,
    startLabel,
    destinationLabel,
    configuredClearanceMeters,
  }
}
