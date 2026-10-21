import { describe, it, expect } from 'vitest'
import {
  computeLayoutStats,
  compareLayouts,
  exportFurnitureToCSV,
  createLayoutVersionSnapshot,
} from './layoutMetrics'
import type { RoomConfiguration } from '@/types/geometry'
import type { PlacedFurniture } from '@/types/furniture'

const mockConfig: RoomConfiguration = {
  schemaVersion: '3.0',
  shape: 'rectangular',
  widthMeters: 4.0,
  lengthMeters: 5.0,
  ceilingHeightMeters: 2.8,
  wallThicknessMeters: 0.15,
  doors: [
    {
      id: 'door-1',
      name: 'South Entrance',
      wallId: 'South',
      offsetMeters: 1.5,
      widthMeters: 0.9,
      heightMeters: 2.1,
      swingDirection: 'inward-left',
    },
  ],
  windows: [
    {
      id: 'win-1',
      name: 'North Window',
      wallId: 'North',
      offsetMeters: 1.0,
      widthMeters: 1.5,
      heightMeters: 1.2,
      sillHeightMeters: 0.9,
    },
  ],
}

const mockFurnitureA: PlacedFurniture[] = [
  {
    id: 'furn-bed',
    catalogId: 'bed-queen',
    name: 'Queen Bed',
    category: 'beds',
    meshType: 'bed-queen',
    color: '#1e293b',
    dimensions: { widthMeters: 1.6, lengthMeters: 2.0, heightMeters: 1.0 },
    position: [0.8, 0, 1.2],
    rotationY: 0,
  },
  {
    id: 'furn-desk',
    catalogId: 'desk-workstation',
    name: 'Work Desk',
    category: 'tables',
    meshType: 'desk-workstation',
    color: '#334155',
    dimensions: { widthMeters: 1.2, lengthMeters: 0.6, heightMeters: 0.75 },
    position: [-1.2, 0, -1.0],
    rotationY: 0,
  },
]

const mockFurnitureB: PlacedFurniture[] = [
  ...mockFurnitureA,
  {
    id: 'furn-chair',
    catalogId: 'chair-ergonomic',
    name: 'Office Chair',
    category: 'seating',
    meshType: 'chair-ergonomic',
    color: '#475569',
    dimensions: { widthMeters: 0.6, lengthMeters: 0.6, heightMeters: 0.9 },
    position: [-1.2, 0, -0.2],
    rotationY: 0,
  },
]

describe('Layout Analytics & Comparison Engine', () => {
  it('computes genuine floor space and area metrics correctly', () => {
    // Total Room Area = 4.0 * 5.0 = 20.0 m²
    // Bed = 1.6 * 2.0 = 3.2 m²
    // Desk = 1.2 * 0.6 = 0.72 m²
    // Occupied = 3.92 m²
    // Unoccupied = 20.0 - 3.92 = 16.08 m² (~80.4%)
    const stats = computeLayoutStats(mockFurnitureA, mockConfig, 'Test Layout')

    expect(stats.totalRoomAreaMeters).toBe(20.0)
    expect(stats.occupiedAreaMeters).toBeCloseTo(3.92, 2)
    expect(stats.unoccupiedAreaMeters).toBeCloseTo(16.08, 2)
    expect(stats.unoccupiedPercent).toBeCloseTo(80.4, 1)
    expect(stats.hardViolationsCount).toBe(0)
    expect(stats.score?.overallScore).toBeGreaterThanOrEqual(70)
    expect(stats.score?.explanation).toContain('Score is computed mathematically')
  })

  it('compares two layouts and generates accurate quantitative deltas and trade-offs', () => {
    const statsA = computeLayoutStats(mockFurnitureA, mockConfig, 'Layout A')
    const statsB = computeLayoutStats(mockFurnitureB, mockConfig, 'Layout B')

    const comparison = compareLayouts(statsA, statsB)

    // B has 1 additional item (chair: 0.6 * 0.6 = 0.36 m²)
    expect(comparison.deltas.furnitureCountDiff).toBe(1)
    expect(comparison.deltas.occupiedAreaDiffMeters).toBeCloseTo(0.36, 2)
    expect(comparison.deltas.unoccupiedPercentDiff).toBeLessThan(0) // free space dropped
    expect(comparison.deltas.tradeoffs.length).toBeGreaterThan(0)
    expect(comparison.deltas.summary).toBeDefined()
  })

  it('exports furniture inventory to CSV format accurately', () => {
    const csv = exportFurnitureToCSV(mockFurnitureA)

    expect(csv).toContain('Item ID,Name,Category,Width (m),Length (m),Height (m),Position X (m),Position Z (m),Rotation (deg)')
    expect(csv).toContain('"Queen Bed"')
    expect(csv).toContain('"Work Desk"')
    expect(csv.split('\n').length).toBe(3) // header + 2 items
  })

  it('creates layout version snapshot with deep copy isolation', () => {
    const snapshot = createLayoutVersionSnapshot(
      'Baseline Version',
      mockFurnitureA,
      'manual',
      'Initial design'
    )

    expect(snapshot.id).toMatch(/^ver-/)
    expect(snapshot.name).toBe('Baseline Version')
    expect(snapshot.furniture.length).toBe(mockFurnitureA.length)

    // Mutate original - snapshot must be unaffected
    mockFurnitureA[0].position[0] = 99.0
    expect(snapshot.furniture[0].position[0]).not.toBe(99.0)
    // Restore original
    mockFurnitureA[0].position[0] = 0.8
  })
})
