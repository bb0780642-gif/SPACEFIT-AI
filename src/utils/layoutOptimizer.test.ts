import { describe, it, expect } from 'vitest'
import { generateOptimizedLayouts, OPTIMIZATION_STRATEGIES } from './layoutOptimizer'
import type { PlacedFurniture } from '@/types/furniture'
import type { RoomConfiguration } from '@/types/geometry'
import type { OptimizationPreferences } from '@/types/optimizer'

describe('Layout Optimization Engine', () => {
  const sampleConfig: RoomConfiguration = {
    schemaVersion: '3.0',
    shape: 'rectangular',
    widthMeters: 5.0,
    lengthMeters: 6.0,
    ceilingHeightMeters: 2.8,
    wallThicknessMeters: 0.15,
    doors: [
      {
        id: 'door-south',
        name: 'South Door',
        wallId: 'South',
        widthMeters: 0.9,
        heightMeters: 2.1,
        offsetMeters: 0.6,
        swingDirection: 'inward-right',
      },
    ],
    windows: [
      {
        id: 'win-east',
        name: 'East Window',
        wallId: 'East',
        widthMeters: 1.5,
        heightMeters: 1.2,
        offsetMeters: 2.0,
        sillHeightMeters: 0.9,
      },
    ],
  }

  const sampleFurniture: PlacedFurniture[] = [
    {
      id: 'bed-1',
      catalogId: 'bed-queen',
      name: 'Queen Platform Bed',
      category: 'beds',
      meshType: 'bed-queen',
      color: '#1e293b',
      dimensions: { widthMeters: 1.6, lengthMeters: 2.1, heightMeters: 1.05 },
      position: [0, 0, 0],
      rotationY: 0,
    },
    {
      id: 'desk-1',
      catalogId: 'desk-workstation',
      name: 'Executive Workstation Desk',
      category: 'tables',
      meshType: 'desk-workstation',
      color: '#334155',
      dimensions: { widthMeters: 1.4, lengthMeters: 0.7, heightMeters: 0.75 },
      position: [0.5, 0, 0.5], // Initially overlapping
      rotationY: 0,
    },
    {
      id: 'wardrobe-1',
      catalogId: 'wardrobe-double',
      name: 'Double-Door Wardrobe',
      category: 'storage',
      meshType: 'wardrobe-double',
      color: '#0f172a',
      dimensions: { widthMeters: 1.2, lengthMeters: 0.6, heightMeters: 2.1 },
      position: [-1, 0, -1],
      rotationY: 0,
    },
  ]

  it('generates 3 candidate layouts for valid room and furniture', () => {
    const preferences: OptimizationPreferences = {
      mode: 'balanced',
      deskNearWindow: true,
      bedPlacement: 'against-wall',
      clearEntranceBuffer: 0.8,
      minWalkingClearance: 0.7,
    }

    const result = generateOptimizedLayouts(sampleFurniture, sampleConfig, preferences)

    expect(result.success).toBe(true)
    expect(result.candidates.length).toBe(3)
    expect(result.executionTimeMs).toBeLessThan(100)

    result.candidates.forEach((cand) => {
      expect(cand.furniture.length).toBe(sampleFurniture.length)
      expect(cand.score.overallScore).toBeGreaterThan(0)
      expect(cand.score.usableAreaMeters).toBeGreaterThan(0)
      expect(cand.score.explanation).toContain('Score computed from')
      expect(cand.tradeoffs.length).toBeGreaterThan(0)
    })
  })

  it('optimizes layout for "movement-first" mode', () => {
    const preferences: OptimizationPreferences = {
      mode: 'movement-first',
      deskNearWindow: false,
      bedPlacement: 'against-wall',
      clearEntranceBuffer: 0.9,
      minWalkingClearance: 0.8,
    }

    const result = generateOptimizedLayouts(sampleFurniture, sampleConfig, preferences)
    expect(result.success).toBe(true)
    const primary = result.candidates[0]
    expect(primary.strategy).toBe('movement-first')
    expect(primary.score.circulationScore).toBeGreaterThan(70)
  })

  it('optimizes layout for "study-productivity" and prioritizes window wall', () => {
    const preferences: OptimizationPreferences = {
      mode: 'study-productivity',
      deskNearWindow: true,
      bedPlacement: 'against-wall',
      clearEntranceBuffer: 0.8,
      minWalkingClearance: 0.6,
    }

    const result = generateOptimizedLayouts(sampleFurniture, sampleConfig, preferences)
    expect(result.success).toBe(true)
    const primary = result.candidates[0]
    expect(primary.strategy).toBe('study-productivity')
    expect(primary.score.preferenceScore).toBeGreaterThan(70)
  })

  it('flags physical infeasibility when furniture exceeds physical room capacity', () => {
    // Small 2m x 2m room with giant items
    const tinyConfig: RoomConfiguration = {
      schemaVersion: '3.0',
      shape: 'rectangular',
      widthMeters: 2.0,
      lengthMeters: 2.0,
      ceilingHeightMeters: 2.5,
      wallThicknessMeters: 0.15,
      doors: [],
      windows: [],
    }

    const hugeFurniture: PlacedFurniture[] = [
      {
        id: 'big-bed',
        catalogId: 'bed-king',
        name: 'King Bed',
        category: 'beds',
        meshType: 'bed-queen',
        color: '#1e293b',
        dimensions: { widthMeters: 2.0, lengthMeters: 2.2, heightMeters: 1.2 },
        position: [0, 0, 0],
        rotationY: 0,
      },
    ]

    const preferences: OptimizationPreferences = {
      mode: 'space-saver',
      deskNearWindow: false,
      bedPlacement: 'corner',
      clearEntranceBuffer: 0.5,
      minWalkingClearance: 0.5,
    }

    const result = generateOptimizedLayouts(hugeFurniture, tinyConfig, preferences)
    expect(result.success).toBe(false)
    expect(result.infeasibleReason).toContain('exceeds the feasible physical capacity')
    expect(result.suggestions?.length).toBeGreaterThan(0)
  })

  it('handles empty furniture array gracefully', () => {
    const preferences: OptimizationPreferences = {
      mode: 'balanced',
      deskNearWindow: true,
      bedPlacement: 'against-wall',
      clearEntranceBuffer: 0.8,
      minWalkingClearance: 0.6,
    }

    const result = generateOptimizedLayouts([], sampleConfig, preferences)
    expect(result.success).toBe(false)
    expect(result.infeasibleReason).toContain('No furniture has been added')
  })

  it('defines metadata for all 5 optimization strategies', () => {
    expect(OPTIMIZATION_STRATEGIES['balanced']).toBeDefined()
    expect(OPTIMIZATION_STRATEGIES['movement-first']).toBeDefined()
    expect(OPTIMIZATION_STRATEGIES['space-saver']).toBeDefined()
    expect(OPTIMIZATION_STRATEGIES['comfort-focus']).toBeDefined()
    expect(OPTIMIZATION_STRATEGIES['study-productivity']).toBeDefined()
  })
})
