import { describe, it, expect } from 'vitest'
import {
  getFurnitureOBB,
  checkOBBIntersection,
  checkRoomBoundaryContainment,
  snapFurnitureToNearestWall,
  validateFurnitureLayout,
} from './collision'
import type { PlacedFurniture } from '@/types/furniture'
import type { RoomConfiguration } from '@/types/geometry'

describe('Collision & Boundary Engine', () => {
  const sampleConfig: RoomConfiguration = {
    schemaVersion: '3.0',
    shape: 'rectangular',
    widthMeters: 5.0,
    lengthMeters: 4.0,
    ceilingHeightMeters: 2.8,
    wallThicknessMeters: 0.15,
    doors: [
      {
        id: 'door-south',
        name: 'South Entry Door',
        wallId: 'South',
        widthMeters: 0.9,
        heightMeters: 2.1,
        offsetMeters: 1.0,
        swingDirection: 'inward-right',
      },
    ],
    windows: [],
  }

  it('detects no collision for two well-separated furniture items', () => {
    const bed: PlacedFurniture = {
      id: 'bed-1',
      catalogId: 'bed-queen',
      name: 'Queen Bed',
      category: 'beds',
      meshType: 'bed-queen',
      color: '#1e293b',
      dimensions: { widthMeters: 1.6, lengthMeters: 2.0, heightMeters: 1.0 },
      position: [-1.2, 0, 0.5],
      rotationY: 0,
    }

    const desk: PlacedFurniture = {
      id: 'desk-1',
      catalogId: 'desk-workstation',
      name: 'Office Desk',
      category: 'tables',
      meshType: 'desk-workstation',
      color: '#334155',
      dimensions: { widthMeters: 1.2, lengthMeters: 0.6, heightMeters: 0.75 },
      position: [1.5, 0, 0.5],
      rotationY: 0,
    }

    const obbBed = getFurnitureOBB(bed)
    const obbDesk = getFurnitureOBB(desk)

    expect(checkOBBIntersection(obbBed, obbDesk)).toBe(false)

    const result = validateFurnitureLayout([bed, desk], sampleConfig)
    expect(result.isValid).toBe(true)
    expect(result.errors.length).toBe(0)
  })

  it('detects overlap between two unrotated furniture items', () => {
    const itemA: PlacedFurniture = {
      id: 'item-a',
      catalogId: 'desk-workstation',
      name: 'Desk A',
      category: 'tables',
      meshType: 'desk-workstation',
      color: '#334155',
      dimensions: { widthMeters: 1.0, lengthMeters: 1.0, heightMeters: 0.75 },
      position: [0, 0, 0],
      rotationY: 0,
    }

    const itemB: PlacedFurniture = {
      id: 'item-b',
      catalogId: 'desk-workstation',
      name: 'Desk B',
      category: 'tables',
      meshType: 'desk-workstation',
      color: '#334155',
      dimensions: { widthMeters: 1.0, lengthMeters: 1.0, heightMeters: 0.75 },
      position: [0.5, 0, 0],
      rotationY: 0,
    }

    const obbA = getFurnitureOBB(itemA)
    const obbB = getFurnitureOBB(itemB)

    expect(checkOBBIntersection(obbA, obbB)).toBe(true)

    const result = validateFurnitureLayout([itemA, itemB], sampleConfig)
    expect(result.isValid).toBe(false)
    expect(result.errors.some((e) => e.code === 'furniture_collision')).toBe(true)
  })

  it('detects overlap between rotated oriented bounding boxes using SAT', () => {
    // Item at origin rotated 45 degrees (PI/4)
    const itemA: PlacedFurniture = {
      id: 'rot-a',
      catalogId: 'coffee-table',
      name: 'Coffee Table',
      category: 'tables',
      meshType: 'table-coffee',
      color: '#1e293b',
      dimensions: { widthMeters: 1.4, lengthMeters: 0.8, heightMeters: 0.4 },
      position: [0, 0, 0],
      rotationY: Math.PI / 4,
    }

    // Item placed right where the 45-degree corner extends
    const itemB: PlacedFurniture = {
      id: 'chair-b',
      catalogId: 'chair-armchair',
      name: 'Lounge Chair',
      category: 'seating',
      meshType: 'chair-armchair',
      color: '#0284c7',
      dimensions: { widthMeters: 0.8, lengthMeters: 0.8, heightMeters: 0.8 },
      position: [0.7, 0, 0.7],
      rotationY: 0,
    }

    const obbA = getFurnitureOBB(itemA)
    const obbB = getFurnitureOBB(itemB)

    expect(checkOBBIntersection(obbA, obbB)).toBe(true)
  })

  it('detects separation when rotated boxes are close but do not intersect', () => {
    const itemA: PlacedFurniture = {
      id: 'rot-a',
      catalogId: 'coffee-table',
      name: 'Coffee Table',
      category: 'tables',
      meshType: 'table-coffee',
      color: '#1e293b',
      dimensions: { widthMeters: 1.0, lengthMeters: 0.6, heightMeters: 0.4 },
      position: [0, 0, 0],
      rotationY: Math.PI / 4,
    }

    // Placed far enough to miss the 45-degree corner
    const itemB: PlacedFurniture = {
      id: 'chair-b',
      catalogId: 'chair-armchair',
      name: 'Lounge Chair',
      category: 'seating',
      meshType: 'chair-armchair',
      color: '#0284c7',
      dimensions: { widthMeters: 0.6, lengthMeters: 0.6, heightMeters: 0.8 },
      position: [1.2, 0, 1.2],
      rotationY: 0,
    }

    const obbA = getFurnitureOBB(itemA)
    const obbB = getFurnitureOBB(itemB)

    expect(checkOBBIntersection(obbA, obbB)).toBe(false)
  })

  it('flags furniture extending beyond room boundaries as out_of_bounds', () => {
    // Room width = 5.0 (halfW = 2.5), length = 4.0 (halfL = 2.0)
    // Item centered at x = 2.3 with width = 1.0 -> extends to 2.8 > 2.5
    const item: PlacedFurniture = {
      id: 'out-item',
      catalogId: 'wardrobe-double',
      name: 'Big Wardrobe',
      category: 'storage',
      meshType: 'wardrobe-double',
      color: '#0f172a',
      dimensions: { widthMeters: 1.0, lengthMeters: 0.6, heightMeters: 2.0 },
      position: [2.3, 0, 0],
      rotationY: 0,
    }

    const obb = getFurnitureOBB(item)
    const { isContained } = checkRoomBoundaryContainment(obb, 5.0, 4.0)
    expect(isContained).toBe(false)

    const result = validateFurnitureLayout([item], sampleConfig)
    expect(result.isValid).toBe(false)
    expect(result.errors.some((e) => e.code === 'out_of_bounds')).toBe(true)
  })

  it('detects when furniture blocks a configured door opening clearance zone', () => {
    // South door on 5m wide room:
    // South wall is at z = -2.0. Door is at offset 1.0 from West (x = -2.5 + 1.0 = -1.5).
    // Door width = 0.9 -> x in [-1.5, -0.6], extending inward to z ~ -0.8.
    const blockingItem: PlacedFurniture = {
      id: 'blocking-chair',
      catalogId: 'chair-armchair',
      name: 'Doorstep Chair',
      category: 'seating',
      meshType: 'chair-armchair',
      color: '#0284c7',
      dimensions: { widthMeters: 0.8, lengthMeters: 0.8, heightMeters: 0.8 },
      position: [-1.0, 0, -1.5], // directly in front of the door
      rotationY: 0,
    }

    const result = validateFurnitureLayout([blockingItem], sampleConfig)
    expect(result.isValid).toBe(false)
    expect(result.errors.some((e) => e.code === 'door_obstruction')).toBe(true)
  })

  it('correctly snaps furniture flush to the nearest wall', () => {
    // Room: 5.0m x 4.0m -> bounds X: [-2.5, 2.5], Z: [-2.0, 2.0]
    // Item at [0, 0, 1.8] is closest to North wall (z = 2.0)
    const item: PlacedFurniture = {
      id: 'snap-bed',
      catalogId: 'bed-queen',
      name: 'Queen Bed',
      category: 'beds',
      meshType: 'bed-queen',
      color: '#1e293b',
      dimensions: { widthMeters: 1.6, lengthMeters: 2.0, heightMeters: 1.0 },
      position: [0, 0, 1.5],
      rotationY: 0,
    }

    const snapped = snapFurnitureToNearestWall(item, 5.0, 4.0)
    // Closest to North (z = 2.0). Depth = 2.0 (halfL = 1.0).
    // Snapped center z should be 2.0 - 1.0 = 1.0
    expect(snapped.position[2]).toBeCloseTo(1.0, 2)
    expect(snapped.rotationY).toBeCloseTo(Math.PI, 2)
  })
})
