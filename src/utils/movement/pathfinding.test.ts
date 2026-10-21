import { describe, it, expect } from 'vitest'
import {
  distancePointToFurnitureOBB,
  distancePointToWalls,
  buildOccupancyGrid,
  analyzeMovementPath,
  getDoorEntrancePoint,
  getPresetDestinationPoint,
} from './pathfinding'
import { resolveAvatarMovement } from './avatarPhysics'
import type { RoomConfiguration } from '@/types/geometry'
import type { PlacedFurniture } from '@/types/furniture'

const mockConfig: RoomConfiguration = {
  schemaVersion: '3.0',
  shape: 'rectangular',
  widthMeters: 5.0,
  lengthMeters: 6.0,
  ceilingHeightMeters: 2.8,
  wallThicknessMeters: 0.15,
  doors: [
    {
      id: 'door-1',
      name: 'South Entrance Door',
      wallId: 'South',
      offsetMeters: 2.0,
      widthMeters: 0.9,
      heightMeters: 2.1,
      swingDirection: 'inward-left',
    },
  ],
  windows: [
    {
      id: 'win-1',
      name: 'East Daylight Window',
      wallId: 'East',
      offsetMeters: 2.5,
      widthMeters: 1.4,
      heightMeters: 1.2,
      sillHeightMeters: 0.9,
    },
  ],
}

const mockFurniture: PlacedFurniture[] = [
  {
    id: 'furn-bed',
    catalogId: 'bed-queen',
    name: 'Queen Platform Bed',
    category: 'beds',
    meshType: 'bed-queen',
    color: '#1e293b',
    dimensions: { widthMeters: 1.6, lengthMeters: 2.1, heightMeters: 1.05 },
    position: [1.2, 0, 1.5],
    rotationY: 0,
  },
  {
    id: 'furn-desk',
    catalogId: 'desk-workstation',
    name: 'Executive Workstation Desk',
    category: 'tables',
    meshType: 'desk-workstation',
    color: '#334155',
    dimensions: { widthMeters: 1.6, lengthMeters: 0.8, heightMeters: 0.75 },
    position: [-1.4, 0, -1.0],
    rotationY: 0,
  },
]

describe('Movement Analysis & A* Pathfinding Engine', () => {
  it('calculates distance from point to rotated furniture OBB correctly', () => {
    const item = mockFurniture[0] // center at [1.2, 0, 1.5], width 1.6, length 2.1
    // Point directly on center
    const distCenter = distancePointToFurnitureOBB({ x: 1.2, z: 1.5 }, item)
    expect(distCenter).toBe(0)

    // Point 1m to the right of box edge (halfWidth = 0.8 -> edge at x = 2.0 -> point at x = 3.0)
    const distRight = distancePointToFurnitureOBB({ x: 3.0, z: 1.5 }, item)
    expect(distRight).toBeCloseTo(1.0, 2)
  })

  it('calculates distance to walls correctly', () => {
    // Room width 5m (-2.5 to 2.5), length 6m (-3.0 to 3.0)
    // Point at (2.0, 0) is 0.5m away from right wall
    const dist = distancePointToWalls({ x: 2.0, z: 0 }, 5.0, 6.0)
    expect(dist).toBeCloseTo(0.5, 2)
  })

  it('builds occupancy grid and extracts entrance coordinate', () => {
    const door = getDoorEntrancePoint(mockConfig)
    expect(door.wallId).toBe('South')
    expect(door.point.z).toBeCloseTo(-2.6, 1)

    const grid = buildOccupancyGrid(mockConfig, mockFurniture, 0.28)
    expect(grid.cols).toBeGreaterThan(10)
    expect(grid.rows).toBeGreaterThan(10)
  })

  it('finds feasible A* movement path from door to bed', () => {
    const door = getDoorEntrancePoint(mockConfig)
    const dest = getPresetDestinationPoint('door-to-bed', mockConfig, mockFurniture)

    const pathRes = analyzeMovementPath(
      mockConfig,
      mockFurniture,
      door.point,
      dest.point,
      0.6,
      'Door',
      dest.label
    )

    expect(pathRes.isFeasible).toBe(true)
    expect(pathRes.status).toBe('feasible')
    expect(pathRes.waypoints.length).toBeGreaterThan(1)
    expect(pathRes.lengthMeters).toBeGreaterThan(1.0)
    expect(pathRes.minClearanceMeters).toBeGreaterThanOrEqual(0.6)
  })

  it('flags bottleneck when corridor clearance is below configured requirement', () => {
    const door = getDoorEntrancePoint(mockConfig)
    const dest = getPresetDestinationPoint('door-to-desk', mockConfig, mockFurniture)

    // Require an exaggerated 1.4m clearance in a furnished room
    const pathRes = analyzeMovementPath(
      mockConfig,
      mockFurniture,
      door.point,
      dest.point,
      1.4,
      'Door',
      dest.label
    )

    // Path may exist geometrically but fails the 1.4m requirement
    if (pathRes.waypoints.length > 0) {
      expect(pathRes.status).toBe('bottleneck')
      expect(pathRes.isFeasible).toBe(false)
      expect(pathRes.warningMessage).toContain('Narrow corridor detected')
    } else {
      expect(pathRes.status).toBe('blocked')
    }
  })

  it('handles completely blocked paths gracefully', () => {
    // Huge barricading furniture that cuts room in half
    const barricade: PlacedFurniture[] = [
      {
        id: 'furn-wall',
        catalogId: 'wardrobe-double',
        name: 'Huge Wall Divider',
        category: 'storage',
        meshType: 'wardrobe-double',
        color: '#000',
        dimensions: { widthMeters: 4.8, lengthMeters: 2.0, heightMeters: 2.5 },
        position: [0, 0, 0],
        rotationY: 0,
      },
    ]

    const pathRes = analyzeMovementPath(
      mockConfig,
      barricade,
      { x: 0, z: -2.2 },
      { x: 0, z: 2.2 },
      0.6,
      'South Side',
      'North Side'
    )

    expect(pathRes.isFeasible).toBe(false)
    expect(pathRes.status).toBe('blocked')
    expect(pathRes.blockedReason).toBeDefined()
  })

  it('resolves first-person avatar movement with wall clamping and sliding physics', () => {
    // 1. Try moving into right wall (x > 2.5 - 0.28 = 2.22)
    const wallHit = resolveAvatarMovement(
      [2.2, 1.6, 0],
      [0.3, 0], // pushing +X
      mockConfig,
      mockFurniture
    )
    expect(wallHit.position[0]).toBeLessThanOrEqual(2.23)
    expect(wallHit.isColliding).toBe(true)

    // 2. Sliding along Z when hitting X obstacle
    const slideHit = resolveAvatarMovement(
      [-0.2, 1.6, 1.5], // approaching bed at [1.2, 0, 1.5] (bed starts at x = 0.4)
      [0.5, 0.3], // moving toward bed (+X = 0.3 -> hits) and forward (+Z = 1.8 -> clear)
      mockConfig,
      mockFurniture
    )
    // Avatar should slide along unobstructed Z axis!
    expect(slideHit.position[0]).toBe(-0.2)
    expect(slideHit.position[2]).toBeCloseTo(1.8, 2)
    expect(slideHit.isColliding).toBe(true)
    expect(slideHit.collidedWith).toBe('Queen Platform Bed')
  })
})
