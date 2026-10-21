import type { RoomConfiguration } from '@/types/geometry'
import type { PlacedFurniture } from '@/types/furniture'
import type {
  ComputedLayoutStats,
  LayoutComparisonResult,
  LayoutVersion,
} from '@/types/comparison'
import type { LayoutScoreBreakdown } from '@/types/optimizer'
import { validateFurnitureLayout } from '@/utils/collision'
import {
  analyzeMovementPath,
  getDoorEntrancePoint,
  getPresetDestinationPoint,
} from '@/utils/movement/pathfinding'

/**
 * Computes exact spatial, clearance, safety, and movement analytics for a given furniture layout.
 * Only genuine computed metrics are produced.
 */
export function computeLayoutStats(
  furniture: PlacedFurniture[],
  config: RoomConfiguration,
  title: string = 'Current Layout',
  id: string = 'layout-current',
  configuredClearance: number = 0.6
): ComputedLayoutStats {
  const totalRoomAreaMeters = Number(
    (config.widthMeters * config.lengthMeters).toFixed(2)
  )

  // 1. Calculate genuine footprint area of placed furniture
  let occupiedArea = 0
  for (const item of furniture) {
    const area = item.dimensions.widthMeters * item.dimensions.lengthMeters
    occupiedArea += area
  }
  const occupiedAreaMeters = Number(occupiedArea.toFixed(2))

  const unoccupiedAreaMeters = Number(
    Math.max(0, totalRoomAreaMeters - occupiedAreaMeters).toFixed(2)
  )

  const unoccupiedPercent = totalRoomAreaMeters > 0
    ? Number(((unoccupiedAreaMeters / totalRoomAreaMeters) * 100).toFixed(1))
    : 0

  // 2. Validate geometric boundaries and collisions (SAT)
  const validation = validateFurnitureLayout(furniture, config)
  const hardViolationsCount = validation.errors.length

  // 3. Movement path analysis from entrance to primary furniture
  const door = getDoorEntrancePoint(config)
  const target = getPresetDestinationPoint('door-to-bed', config, furniture)
  const movementPath = analyzeMovementPath(
    config,
    furniture,
    door.point,
    target.point,
    configuredClearance,
    'Entrance Door',
    target.label
  )

  // 4. Calculate transparent heuristic score breakdown
  const safetyScore = Math.max(0, 100 - hardViolationsCount * 25)

  let circulationScore = 20
  if (movementPath.status === 'feasible') {
    circulationScore = 95
  } else if (movementPath.status === 'bottleneck') {
    circulationScore = 60
  } else if (movementPath.status === 'same_point') {
    circulationScore = 100
  }

  // Usable area score: 65% - 85% free floor is ideal for comfort and room functionality
  let usableAreaScore = 70
  if (unoccupiedPercent >= 60 && unoccupiedPercent <= 85) {
    usableAreaScore = 95
  } else if (unoccupiedPercent < 50) {
    usableAreaScore = 40 // Overcrowded
  } else if (unoccupiedPercent > 90) {
    usableAreaScore = 60 // Sparse / underutilized
  }

  // Window clearance check: check if tall items block windows
  let windowAccessScore = 90
  const windows = config.windows || []
  if (windows.length > 0) {
    for (const item of furniture) {
      if (item.category === 'storage' && item.dimensions.heightMeters >= 1.4) {
        // High storage item - penalize if near window
        for (const win of windows) {
          const wWall = win.wallId || (win as any).wall
          if (wWall === 'North' && item.position[2] > config.lengthMeters / 2 - 0.8) {
            windowAccessScore = Math.max(30, windowAccessScore - 30)
          } else if (wWall === 'East' && item.position[0] > config.widthMeters / 2 - 0.8) {
            windowAccessScore = Math.max(30, windowAccessScore - 30)
          } else if (wWall === 'West' && item.position[0] < -config.widthMeters / 2 + 0.8) {
            windowAccessScore = Math.max(30, windowAccessScore - 30)
          }
        }
      }
    }
  }

  const overallScore = Math.round(
    safetyScore * 0.35 +
    circulationScore * 0.30 +
    usableAreaScore * 0.20 +
    windowAccessScore * 0.15
  )

  const score: LayoutScoreBreakdown = {
    circulationScore,
    usableAreaMeters: unoccupiedAreaMeters,
    usableAreaPercent: unoccupiedPercent,
    preferenceScore: windowAccessScore,
    functionalGroupingScore: safetyScore,
    overallScore,
    explanation:
      `Score is computed mathematically: 35% geometric safety (${safetyScore} pts), ` +
      `30% circulation corridor navigability (${circulationScore} pts), ` +
      `20% usable floor ratio (${usableAreaScore} pts), and 15% window daylight access (${windowAccessScore} pts). ` +
      `Note: Heuristic score represents algorithmic spatial fitness and is not a certified building safety code assessment.`,
  }

  return {
    id,
    title,
    furniture,
    furnitureCount: furniture.length,
    totalRoomAreaMeters,
    occupiedAreaMeters,
    unoccupiedAreaMeters,
    unoccupiedPercent,
    hardViolationsCount,
    validation,
    movementPath,
    score,
  }
}

/**
 * Compares two layout variants (e.g. Current vs. Optimized, or Version A vs. Version B)
 * and generates verifiable quantitative deltas and trade-offs.
 */
export function compareLayouts(
  layoutA: ComputedLayoutStats,
  layoutB: ComputedLayoutStats
): LayoutComparisonResult {
  const furnitureCountDiff = layoutB.furnitureCount - layoutA.furnitureCount
  const occupiedAreaDiffMeters = Number(
    (layoutB.occupiedAreaMeters - layoutA.occupiedAreaMeters).toFixed(2)
  )
  const unoccupiedPercentDiff = Number(
    (layoutB.unoccupiedPercent - layoutA.unoccupiedPercent).toFixed(1)
  )
  const hardViolationsDiff = layoutB.hardViolationsCount - layoutA.hardViolationsCount

  const pathLengthA = layoutA.movementPath?.lengthMeters ?? 0
  const pathLengthB = layoutB.movementPath?.lengthMeters ?? 0
  const pathLengthDiffMeters = Number((pathLengthB - pathLengthA).toFixed(2))

  const overallScoreA = layoutA.score?.overallScore ?? 0
  const overallScoreB = layoutB.score?.overallScore ?? 0
  const overallScoreDiff = overallScoreB - overallScoreA

  const tradeoffs: string[] = []

  // Hard constraints analysis
  if (hardViolationsDiff < 0) {
    tradeoffs.push(
      `Resolves ${Math.abs(hardViolationsDiff)} collision/boundary error${Math.abs(hardViolationsDiff) > 1 ? 's' : ''}`
    )
  } else if (hardViolationsDiff > 0) {
    tradeoffs.push(
      `Introduces ${hardViolationsDiff} overlapping boundary issue${hardViolationsDiff > 1 ? 's' : ''}`
    )
  } else {
    tradeoffs.push(`Maintains equal boundary validation safety (${layoutA.hardViolationsCount} errors)`)
  }

  // Floor space analysis
  if (occupiedAreaDiffMeters < 0) {
    tradeoffs.push(
      `Frees up ${Math.abs(occupiedAreaDiffMeters)} m² of floor circulation space (+${Math.abs(unoccupiedPercentDiff)}% open area)`
    )
  } else if (occupiedAreaDiffMeters > 0) {
    tradeoffs.push(
      `Consumes ${occupiedAreaDiffMeters} m² additional floor space (${unoccupiedPercentDiff}% open area)`
    )
  }

  // Walking path analysis
  if (layoutA.movementPath && layoutB.movementPath) {
    if (layoutA.movementPath.status === 'blocked' && layoutB.movementPath.status === 'feasible') {
      tradeoffs.push('Restores previously blocked entrance-to-destination walking corridor')
    } else if (layoutB.movementPath.status === 'blocked') {
      tradeoffs.push('Warning: Obstructs main walking pathway between entrance and destination')
    } else if (pathLengthDiffMeters !== 0) {
      const shorter = pathLengthDiffMeters < 0
      tradeoffs.push(
        `${shorter ? 'Shortens' : 'Lengthens'} primary walking route by ${Math.abs(pathLengthDiffMeters)} m`
      )
    }
  }

  // Score comparison
  if (overallScoreDiff > 0) {
    tradeoffs.push(`Increases composite spatial efficiency score by +${overallScoreDiff} points`)
  } else if (overallScoreDiff < 0) {
    tradeoffs.push(`Decreases composite spatial score by ${overallScoreDiff} points`)
  }

  const summary = overallScoreDiff >= 0
    ? `${layoutB.title} shows an improvement in spatial efficiency with ${tradeoffs[0].toLowerCase()}.`
    : `${layoutB.title} introduces spatial trade-offs compared to ${layoutA.title}.`

  return {
    layoutA,
    layoutB,
    deltas: {
      furnitureCountDiff,
      occupiedAreaDiffMeters,
      unoccupiedPercentDiff,
      hardViolationsDiff,
      pathLengthDiffMeters,
      overallScoreDiff,
      tradeoffs,
      summary,
    },
  }
}

/**
 * Generates clean CSV furniture inventory spreadsheet for export.
 */
export function exportFurnitureToCSV(furniture: PlacedFurniture[]): string {
  const headers = [
    'Item ID',
    'Name',
    'Category',
    'Width (m)',
    'Length (m)',
    'Height (m)',
    'Position X (m)',
    'Position Z (m)',
    'Rotation (deg)',
  ]

  const rows = furniture.map((item) => {
    const rotDeg = Math.round((item.rotationY * 180) / Math.PI)
    return [
      `"${item.id}"`,
      `"${item.name.replace(/"/g, '""')}"`,
      `"${item.category}"`,
      item.dimensions.widthMeters.toFixed(2),
      item.dimensions.lengthMeters.toFixed(2),
      item.dimensions.heightMeters.toFixed(2),
      item.position[0].toFixed(2),
      item.position[2].toFixed(2),
      rotDeg,
    ].join(',')
  })

  return [headers.join(','), ...rows].join('\n')
}

/**
 * Creates a unique LayoutVersion snapshot from current furniture state.
 */
export function createLayoutVersionSnapshot(
  name: string,
  furniture: PlacedFurniture[],
  source: LayoutVersion['source'] = 'manual',
  notes?: string,
  strategy?: string
): LayoutVersion {
  const id = `ver-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`
  return {
    id,
    name: name.trim() || `Layout Version ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    createdAt: new Date().toISOString(),
    furniture: JSON.parse(JSON.stringify(furniture)),
    source,
    notes,
    strategy,
  }
}
