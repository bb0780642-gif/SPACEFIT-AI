/**
 * SPACEFIT AI — INTELLIGENT ROOM LAYOUT OPTIMIZATION ENGINE
 * 
 * Deterministic constraint-based layout generator creating feasible,
 * geometrically validated furniture arrangements tailored to user preferences.
 * 
 * HARD CONSTRAINTS:
 * 1. Complete room containment (no wall penetration)
 * 2. Zero furniture-to-furniture intersection (SAT OBB)
 * 3. Unobstructed door swing and entry clearance zones
 * 4. Respecting canonical physical furniture dimensions
 * 
 * SOFT OBJECTIVES:
 * 1. Maximize usable walking and circulation area
 * 2. Window orientation and natural daylight access
 * 3. Functional furniture clustering (bed + nightstand, sofa + coffee table, desk + chair)
 * 4. Uncluttered entrance corridors
 */

import type { PlacedFurniture } from '@/types/furniture'
import type { RoomConfiguration, WallId } from '@/types/geometry'
import type {
  OptimizationMode,
  OptimizationPreferences,
  CandidateLayout,
  OptimizationResult,
  LayoutScoreBreakdown
} from '@/types/optimizer'
import {
  getFurnitureOBB,
  checkOBBIntersection,
  checkRoomBoundaryContainment,
  getDoorClearanceOBB,
  validateFurnitureLayout
} from './collision'

/**
 * Strategy metadata definitions
 */
export const OPTIMIZATION_STRATEGIES: Record<
  OptimizationMode,
  { label: string; description: string; focus: string }
> = {
  balanced: {
    label: 'Balanced Layout',
    description: 'Harmonious spatial balance between circulation, visual symmetry, and functional zones.',
    focus: 'Even spatial distribution and comfortable walking clearances.',
  },
  'movement-first': {
    label: 'Movement First',
    description: 'Prioritizes maximum unobstructed central circulation corridors and zero door conflict.',
    focus: 'Perimeter alignment and wide walking pathways.',
  },
  'space-saver': {
    label: 'Space Saver',
    description: 'Compact functional groupings to maximize the largest single open floor expanse.',
    focus: 'Corner clustering and contiguous free floor area.',
  },
  'comfort-focus': {
    label: 'Comfort Focus',
    description: 'Oriented around relaxation, generous side bed clearances, and peaceful viewing angles.',
    focus: 'Generous bed/sofa access buffers and cozy focal zoning.',
  },
  'study-productivity': {
    label: 'Study & Productivity',
    description: 'Positions desks adjacent to natural window daylight with ergonomic task accessibility.',
    focus: 'Desk-to-window daylight alignment and dedicated quiet work zone.',
  },
}

/**
 * Calculates transparent, documented objective metrics for a layout.
 */
function scoreCandidateLayout(
  furniture: PlacedFurniture[],
  config: RoomConfiguration,
  preferences: OptimizationPreferences,
  strategy: OptimizationMode
): LayoutScoreBreakdown {
  const roomArea = config.widthMeters * config.lengthMeters
  const furnitureArea = furniture.reduce(
    (sum, f) => sum + f.dimensions.widthMeters * f.dimensions.lengthMeters,
    0
  )

  const usableAreaMeters = Number(Math.max(0, roomArea - furnitureArea).toFixed(1))
  const usableAreaPercent = Number(((usableAreaMeters / roomArea) * 100).toFixed(1))

  // 1. Circulation Score (0 - 100)
  // Distance from center and lack of doorway bottlenecks
  const validation = validateFurnitureLayout(furniture, config)
  let circulationScore = 95
  circulationScore -= validation.errors.length * 25
  circulationScore -= validation.warnings.length * 8
  circulationScore = Math.max(20, Math.min(100, circulationScore))

  // 2. Preference Score (0 - 100)
  let preferenceScore = 80

  // Check desk near window preference
  if (preferences.deskNearWindow) {
    const desks = furniture.filter((f) => f.category === 'tables' && f.meshType.includes('desk'))
    const windowWalls = new Set(config.windows.map((w) => w.wallId))

    desks.forEach((desk) => {
      // Check which wall the desk is closest to
      const halfW = config.widthMeters / 2
      const halfL = config.lengthMeters / 2
      const [x, , z] = desk.position

      let closestWall: WallId = 'South'
      let minD = Math.abs(z - (-halfL))
      if (Math.abs(z - halfL) < minD) {
        minD = Math.abs(z - halfL)
        closestWall = 'North'
      }
      if (Math.abs(x - (-halfW)) < minD) {
        minD = Math.abs(x - (-halfW))
        closestWall = 'West'
      }
      if (Math.abs(x - halfW) < minD) {
        closestWall = 'East'
      }

      if (windowWalls.has(closestWall)) {
        preferenceScore += 10
      } else {
        preferenceScore -= 10
      }
    })
  }

  // Check entrance clearance
  const doorOBBs = config.doors.map((d) => getDoorClearanceOBB(d, config.widthMeters, config.lengthMeters))
  let entranceClear = true
  furniture.forEach((f) => {
    const obb = getFurnitureOBB(f)
    doorOBBs.forEach((dObb) => {
      if (checkOBBIntersection(obb, dObb)) {
        entranceClear = false
      }
    })
  })
  if (entranceClear) preferenceScore += 10
  preferenceScore = Math.max(20, Math.min(100, preferenceScore))

  // 3. Functional Grouping Score (0 - 100)
  let groupingScore = 85
  // Check if coffee table is near sofa
  const sofa = furniture.find((f) => f.category === 'seating' && f.meshType.includes('sofa'))
  const coffeeTable = furniture.find((f) => f.meshType.includes('coffee'))
  if (sofa && coffeeTable) {
    const dx = sofa.position[0] - coffeeTable.position[0]
    const dz = sofa.position[2] - coffeeTable.position[2]
    const dist = Math.sqrt(dx * dx + dz * dz)
    if (dist >= 0.7 && dist <= 1.4) {
      groupingScore += 10
    } else {
      groupingScore -= 8
    }
  }

  // Check if chair is near desk
  const desk = furniture.find((f) => f.category === 'tables' && f.meshType.includes('desk'))
  const officeChair = furniture.find((f) => f.meshType.includes('chair-office'))
  if (desk && officeChair) {
    const dx = desk.position[0] - officeChair.position[0]
    const dz = desk.position[2] - officeChair.position[2]
    const dist = Math.sqrt(dx * dx + dz * dz)
    if (dist >= 0.5 && dist <= 1.2) {
      groupingScore += 5
    }
  }
  groupingScore = Math.max(30, Math.min(100, groupingScore))

  // 4. Overall Weighted Score based on Strategy
  let overallScore = 0
  if (strategy === 'movement-first') {
    overallScore = circulationScore * 0.45 + usableAreaPercent * 0.25 + preferenceScore * 0.15 + groupingScore * 0.15
  } else if (strategy === 'space-saver') {
    overallScore = usableAreaPercent * 0.45 + circulationScore * 0.25 + groupingScore * 0.15 + preferenceScore * 0.15
  } else if (strategy === 'study-productivity') {
    overallScore = preferenceScore * 0.4 + groupingScore * 0.25 + circulationScore * 0.2 + usableAreaPercent * 0.15
  } else if (strategy === 'comfort-focus') {
    overallScore = groupingScore * 0.35 + circulationScore * 0.3 + preferenceScore * 0.2 + usableAreaPercent * 0.15
  } else {
    // Balanced
    overallScore = circulationScore * 0.3 + usableAreaPercent * 0.25 + preferenceScore * 0.25 + groupingScore * 0.2
  }

  overallScore = Math.round(Math.max(10, Math.min(99, overallScore)))

  const explanation = `Score computed from ${usableAreaPercent}% usable open floor area, ${circulationScore}% circulation corridor clearance, and ${preferenceScore}% alignment with your ${OPTIMIZATION_STRATEGIES[strategy].label} preferences.`

  return {
    circulationScore: Math.round(circulationScore),
    usableAreaMeters,
    usableAreaPercent,
    preferenceScore: Math.round(preferenceScore),
    functionalGroupingScore: Math.round(groupingScore),
    overallScore,
    explanation,
  }
}

/**
 * Deterministic helper to place an item against a specific wall in centered coordinates.
 */
function placeAgainstWall(
  item: PlacedFurniture,
  wallId: WallId,
  offsetAlongWall: number, // from wall start
  roomWidth: number,
  roomLength: number
): PlacedFurniture {
  const halfW = roomWidth / 2
  const halfL = roomLength / 2
  const hw = item.dimensions.widthMeters / 2
  const hl = item.dimensions.lengthMeters / 2

  let x = 0
  let z = 0
  let rotationY = 0

  switch (wallId) {
    case 'South':
      // Wall runs from X: -halfW to halfW along Z = -halfL
      // Offset 0 at West (-halfW)
      x = -halfW + offsetAlongWall + hw
      z = -halfL + hl
      rotationY = 0 // back to South wall, facing North
      break
    case 'North':
      // Wall runs from X: -halfW to halfW along Z = halfL
      x = -halfW + offsetAlongWall + hw
      z = halfL - hl
      rotationY = Math.PI // back to North wall, facing South
      break
    case 'West':
      // Wall runs from Z: -halfL to halfL along X = -halfW
      x = -halfW + hl
      z = -halfL + offsetAlongWall + hw
      rotationY = -Math.PI / 2 // back to West wall, facing East
      break
    case 'East':
      // Wall runs from Z: -halfL to halfL along X = halfW
      x = halfW - hl
      z = -halfL + offsetAlongWall + hw
      rotationY = Math.PI / 2 // back to East wall, facing West
      break
  }

  return {
    ...item,
    position: [Number(x.toFixed(2)), 0, Number(z.toFixed(2))],
    rotationY,
  }
}

/**
 * Attempts to place satellite items (coffee table in front of sofa, chair at desk, nightstand beside bed)
 */
function placeSatellites(
  furniture: PlacedFurniture[],
  roomWidth: number,
  roomLength: number
): PlacedFurniture[] {
  const halfW = roomWidth / 2
  const halfL = roomLength / 2

  return furniture.map((item) => {
    // 1. Coffee Table placed 0.5m in front of Sofa
    if (item.meshType.includes('coffee')) {
      const sofa = furniture.find((f) => f.meshType.includes('sofa'))
      if (sofa) {
        const [sx, , sz] = sofa.position
        const sRot = sofa.rotationY
        const fwdX = -Math.sin(sRot)
        const fwdZ = Math.cos(sRot)
        const targetX = sx + fwdX * 0.75
        const targetZ = sz + fwdZ * 0.75

        // Clamp to room bounds
        const cx = Math.max(-halfW + 0.4, Math.min(halfW - 0.4, targetX))
        const cz = Math.max(-halfL + 0.4, Math.min(halfL - 0.4, targetZ))

        return {
          ...item,
          position: [Number(cx.toFixed(2)), 0, Number(cz.toFixed(2))],
          rotationY: sRot,
        }
      }
    }

    // 2. Office Chair placed in front of Desk
    if (item.meshType.includes('chair-office')) {
      const desk = furniture.find((f) => f.meshType.includes('desk'))
      if (desk) {
        const [dx, , dz] = desk.position
        const dRot = desk.rotationY
        const fwdX = -Math.sin(dRot)
        const fwdZ = Math.cos(dRot)
        const targetX = dx + fwdX * 0.65
        const targetZ = dz + fwdZ * 0.65

        const cx = Math.max(-halfW + 0.35, Math.min(halfW - 0.35, targetX))
        const cz = Math.max(-halfL + 0.35, Math.min(halfL - 0.35, targetZ))

        return {
          ...item,
          position: [Number(cx.toFixed(2)), 0, Number(cz.toFixed(2))],
          rotationY: (dRot + Math.PI) % (Math.PI * 2), // chair facing desk
        }
      }
    }

    // 3. Nightstand placed beside Bed
    if (item.meshType.includes('nightstand')) {
      const bed = furniture.find((f) => f.meshType.includes('bed'))
      if (bed) {
        const [bx, , bz] = bed.position
        const bRot = bed.rotationY
        // Beside bed on local X
        const sideX = Math.cos(bRot) * (bed.dimensions.widthMeters / 2 + item.dimensions.widthMeters / 2 + 0.08)
        const sideZ = Math.sin(bRot) * (bed.dimensions.widthMeters / 2 + item.dimensions.widthMeters / 2 + 0.08)

        const targetX = bx + sideX
        const targetZ = bz + sideZ

        if (Math.abs(targetX) < halfW - 0.25 && Math.abs(targetZ) < halfL - 0.25) {
          return {
            ...item,
            position: [Number(targetX.toFixed(2)), 0, Number(targetZ.toFixed(2))],
            rotationY: bRot,
          }
        }
      }
    }

    return item
  })
}

/**
 * Generates a candidate layout given a wall allocation permutation.
 */
function generateCandidate(
  furniture: PlacedFurniture[],
  config: RoomConfiguration,
  strategy: OptimizationMode,
  variantIndex: number, // 0 = primary, 1 = alt, 2 = zoned
  preferences: OptimizationPreferences
): CandidateLayout {
  const W = config.widthMeters
  const L = config.lengthMeters

  // Sort furniture: Anchor items (beds/sofas) first, then work/storage, then decor
  const sorted = [...furniture].sort((a, b) => {
    const areaA = a.dimensions.widthMeters * a.dimensions.lengthMeters
    const areaB = b.dimensions.widthMeters * b.dimensions.lengthMeters
    return areaB - areaA
  })

  // Available wall sequences based on variant
  const wallOrder: WallId[][] = [
    ['North', 'East', 'West', 'South'], // Variant 0 (North-anchored)
    ['West', 'North', 'East', 'South'], // Variant 1 (West-anchored)
    ['East', 'West', 'North', 'South'], // Variant 2 (East/Zoned)
  ]
  const currentWalls = wallOrder[variantIndex % wallOrder.length]

  // Track occupied intervals on each wall
  const wallOccupancy: Record<WallId, { start: number; end: number }[]> = {
    North: [],
    South: [],
    East: [],
    West: [],
  }

  // Pre-fill door clearance exclusions on walls
  config.doors.forEach((door) => {
    const rawWallId = door.wallId || (door as any).wall || 'North'
    const normalizedWallId = (rawWallId.charAt(0).toUpperCase() + rawWallId.slice(1).toLowerCase()) as WallId
    const buffer = preferences.clearEntranceBuffer || 0.6
    if (wallOccupancy[normalizedWallId]) {
      wallOccupancy[normalizedWallId].push({
        start: Math.max(0, door.offsetMeters - buffer),
        end: door.offsetMeters + door.widthMeters + buffer,
      })
    }
  })

  const placed: PlacedFurniture[] = []
  const satellites: PlacedFurniture[] = []

  // Check window walls for desk preference
  const rawWinWall = config.windows[0]?.wallId || (config.windows[0] as any)?.wall || 'East'
  const windowWall = (rawWinWall.charAt(0).toUpperCase() + rawWinWall.slice(1).toLowerCase()) as WallId

  sorted.forEach((item) => {
    // Defer satellite items for secondary relative placement
    if (
      item.meshType.includes('coffee') ||
      item.meshType.includes('chair-office') ||
      item.meshType.includes('nightstand')
    ) {
      satellites.push(item)
      return
    }

    // Determine target wall preference for this item
    let targetWallIndex = 0
    if (preferences.deskNearWindow && item.meshType.includes('desk')) {
      const winIdx = currentWalls.indexOf(windowWall)
      if (winIdx !== -1) targetWallIndex = winIdx
    }

    let placedItem: PlacedFurniture | null = null

    // Search available walls
    for (let w = 0; w < currentWalls.length; w++) {
      const wallId = currentWalls[(targetWallIndex + w) % currentWalls.length]
      const wallLength = wallId === 'North' || wallId === 'South' ? W : L
      const itemSpan = item.dimensions.widthMeters
      const occupied = wallOccupancy[wallId].sort((a, b) => a.start - b.start)

      // Find first gap >= itemSpan + 0.2
      let candidateOffset = 0.2 // 20cm corner margin

      for (let g = 0; g <= occupied.length; g++) {
        const gapStart = candidateOffset
        const gapEnd = g < occupied.length ? occupied[g].start : wallLength - 0.2

        if (gapEnd - gapStart >= itemSpan) {
          // Candidate fits in this gap!
          let testPlaced = placeAgainstWall(item, wallId, gapStart, W, L)

          // Verify SAT collision against already placed items
          const testObb = getFurnitureOBB(testPlaced)
          const { isContained } = checkRoomBoundaryContainment(testObb, W, L)
          const intersectsExisting = placed.some((other) =>
            checkOBBIntersection(testObb, getFurnitureOBB(other))
          )

          if (isContained && !intersectsExisting) {
            placedItem = testPlaced
            wallOccupancy[wallId].push({
              start: gapStart,
              end: gapStart + itemSpan + 0.15,
            })
            break
          }
        }

        if (g < occupied.length) {
          candidateOffset = occupied[g].end + 0.15
        }
      }

      if (placedItem) break
    }

    // Fallback: If no clean wall slot found, keep original or center-nudged
    if (!placedItem) {
      placedItem = { ...item }
    }

    placed.push(placedItem)
  })

  // Combine placed primary items and satellites
  const allFurniture = placeSatellites([...placed, ...satellites], W, L)

  // Verify feasibility using our authoritative SAT validator
  const validation = validateFurnitureLayout(allFurniture, config)
  const isFeasible = validation.isValid

  // Calculate scores and trade-offs
  const score = scoreCandidateLayout(allFurniture, config, preferences, strategy)

  const tradeoffs: string[] = []
  if (strategy === 'movement-first') {
    tradeoffs.push('Maximizes center walking corridor and clear entry lines.')
    tradeoffs.push('Places furniture tightly along walls; reduces central grouping.')
  } else if (strategy === 'space-saver') {
    tradeoffs.push('Clusters pieces into corners to unlock the largest continuous floor zone.')
    tradeoffs.push('Slightly tighter side clearances around individual furniture.')
  } else if (strategy === 'study-productivity') {
    tradeoffs.push('Desk oriented directly to optimize natural light from windows.')
    tradeoffs.push('May reduce bedside or secondary storage perimeter spacing.')
  } else if (strategy === 'comfort-focus') {
    tradeoffs.push('Generous buffers around beds and sofas for luxury living feel.')
    tradeoffs.push('Slightly higher floor area consumption.')
  } else {
    tradeoffs.push('Balanced circulation pathways and clean functional zoning.')
    tradeoffs.push('Even trade-off across all parameters.')
  }

  const stratMeta = OPTIMIZATION_STRATEGIES[strategy]

  const title =
    variantIndex === 0
      ? `Option 1: Primary ${stratMeta.label}`
      : variantIndex === 1
      ? `Option 2: Perimeter Alternative`
      : `Option 3: Compact Zoned Variant`

  return {
    id: `layout-cand-${strategy}-${variantIndex}-${Date.now().toString(36)}`,
    title,
    strategy,
    strategyLabel: stratMeta.label,
    description: stratMeta.description,
    isFeasible,
    score,
    tradeoffs,
    furniture: allFurniture,
    warnings: validation.warnings.map((w) => w.message),
    infeasibilityReasons: validation.errors.map((e) => e.message),
  }
}

/**
 * Main optimization entry point generating up to 3 distinct candidate layouts.
 */
export function generateOptimizedLayouts(
  furniture: PlacedFurniture[],
  config: RoomConfiguration,
  preferences: OptimizationPreferences
): OptimizationResult {
  const startTime = performance.now()

  if (!furniture || furniture.length === 0) {
    return {
      success: false,
      candidates: [],
      infeasibleReason: 'No furniture has been added to the room yet. Add furniture items from the catalog before optimizing.',
      suggestions: ['Browse the catalog and add beds, sofas, or desks to generate layout candidates.'],
      executionTimeMs: 0,
    }
  }

  // Check physical density feasibility
  const roomArea = config.widthMeters * config.lengthMeters
  const furnitureTotalArea = furniture.reduce(
    (sum, f) => sum + f.dimensions.widthMeters * f.dimensions.lengthMeters,
    0
  )

  if (furnitureTotalArea > roomArea * 0.72) {
    return {
      success: false,
      candidates: [],
      infeasibleReason: `The total footprint of your furniture (${furnitureTotalArea.toFixed(1)}m²) exceeds the feasible physical capacity for a ${roomArea.toFixed(1)}m² room.`,
      suggestions: [
        'Remove 1 or 2 large pieces (e.g., secondary sofa, second bed, or large wardrobe).',
        'Reduce furniture dimensions (e.g. choose a single daybed or compact writing desk).',
        'Reconfigure the room perimeter to expand room width or length.',
      ],
      executionTimeMs: Math.round(performance.now() - startTime),
    }
  }

  // Generate 3 distinct candidates
  const candidates: CandidateLayout[] = [
    generateCandidate(furniture, config, preferences.mode, 0, preferences),
    generateCandidate(furniture, config, preferences.mode, 1, preferences),
    generateCandidate(furniture, config, preferences.mode, 2, preferences),
  ]

  const executionTimeMs = Math.round(performance.now() - startTime)

  return {
    success: candidates.some((c) => c.isFeasible),
    candidates,
    executionTimeMs,
  }
}
