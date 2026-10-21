import { describe, it, expect } from 'vitest'
import { buildRoom3DGeometry } from './roomGeometryBuilder'
import type { RoomConfiguration } from '@/types/geometry'

describe('roomGeometryBuilder', () => {
  it('generates 4 solid walls for a room with no openings', () => {
    const config: RoomConfiguration = {
      schemaVersion: '3.0',
      shape: 'rectangular',
      widthMeters: 5.0,
      lengthMeters: 4.0,
      ceilingHeightMeters: 2.8,
      wallThicknessMeters: 0.15,
      doors: [],
      windows: [],
    }

    const data = buildRoom3DGeometry(config)
    expect(data.wallSegments.length).toBe(4)
    expect(data.doors.length).toBe(0)
    expect(data.windows.length).toBe(0)

    const south = data.wallSegments.find((s) => s.wallId === 'South')
    const north = data.wallSegments.find((s) => s.wallId === 'North')
    const west = data.wallSegments.find((s) => s.wallId === 'West')
    const east = data.wallSegments.find((s) => s.wallId === 'East')

    expect(south).toBeDefined()
    expect(north).toBeDefined()
    expect(west).toBeDefined()
    expect(east).toBeDefined()

    // South and North span W + 2*T = 5.0 + 0.3 = 5.3
    expect(south?.width).toBeCloseTo(5.3, 2)
    expect(north?.width).toBeCloseTo(5.3, 2)
    // West and East span L = 4.0
    expect(west?.depth).toBeCloseTo(4.0, 2)
    expect(east?.depth).toBeCloseTo(4.0, 2)
  })

  it('correctly creates lintel and side segments for a door on South wall', () => {
    const config: RoomConfiguration = {
      schemaVersion: '3.0',
      shape: 'rectangular',
      widthMeters: 5.0,
      lengthMeters: 4.0,
      ceilingHeightMeters: 2.8,
      wallThicknessMeters: 0.15,
      doors: [
        {
          id: 'door-1',
          name: 'Main Door',
          wallId: 'South',
          widthMeters: 0.9,
          heightMeters: 2.1,
          offsetMeters: 1.0,
          swingDirection: 'inward-right',
        },
      ],
      windows: [],
    }

    const data = buildRoom3DGeometry(config)
    const southSegments = data.wallSegments.filter((s) => s.wallId === 'South')
    // Should have: left side, lintel above door, right side
    expect(southSegments.length).toBe(3)

    const lintel = southSegments.find((s) => s.type === 'lintel')
    expect(lintel).toBeDefined()
    expect(lintel?.width).toBeCloseTo(0.9, 2)
    expect(lintel?.height).toBeCloseTo(0.7, 2) // 2.8 - 2.1 = 0.7
    expect(lintel?.y).toBeCloseTo(2.1 + 0.35, 2)

    expect(data.doors.length).toBe(1)
    expect(data.doors[0].id).toBe('door-1')
    expect(data.doors[0].width).toBeCloseTo(0.9, 2)
    expect(data.doors[0].height).toBeCloseTo(2.1, 2)
  })

  it('correctly creates sill, lintel, and side segments for a window', () => {
    const config: RoomConfiguration = {
      schemaVersion: '3.0',
      shape: 'rectangular',
      widthMeters: 6.0,
      lengthMeters: 5.0,
      ceilingHeightMeters: 3.0,
      wallThicknessMeters: 0.15,
      doors: [],
      windows: [
        {
          id: 'win-1',
          name: 'East View Window',
          wallId: 'East',
          widthMeters: 1.6,
          heightMeters: 1.4,
          offsetMeters: 1.5,
          sillHeightMeters: 0.9,
        },
      ],
    }

    const data = buildRoom3DGeometry(config)
    const eastSegments = data.wallSegments.filter((s) => s.wallId === 'East')
    // Should have: segment before, sill, lintel, segment after
    expect(eastSegments.length).toBe(4)

    const sill = eastSegments.find((s) => s.type === 'sill')
    const lintel = eastSegments.find((s) => s.type === 'lintel')

    expect(sill).toBeDefined()
    expect(sill?.height).toBeCloseTo(0.9, 2)
    expect(sill?.depth).toBeCloseTo(1.6, 2)

    expect(lintel).toBeDefined()
    expect(lintel?.height).toBeCloseTo(0.7, 2) // 3.0 - (0.9 + 1.4) = 0.7
    expect(lintel?.depth).toBeCloseTo(1.6, 2)

    expect(data.windows.length).toBe(1)
    expect(data.windows[0].id).toBe('win-1')
    expect(data.windows[0].sillHeight).toBeCloseTo(0.9, 2)
  })

  it('handles multiple openings on the same wall cleanly', () => {
    const config: RoomConfiguration = {
      schemaVersion: '3.0',
      shape: 'rectangular',
      widthMeters: 6.0,
      lengthMeters: 4.0,
      ceilingHeightMeters: 2.8,
      wallThicknessMeters: 0.15,
      doors: [
        {
          id: 'door-south',
          name: 'South Door',
          wallId: 'South',
          widthMeters: 0.9,
          heightMeters: 2.1,
          offsetMeters: 0.5,
          swingDirection: 'inward-left',
        },
      ],
      windows: [
        {
          id: 'win-south',
          name: 'South Window',
          wallId: 'South',
          widthMeters: 1.2,
          heightMeters: 1.2,
          offsetMeters: 3.0,
          sillHeightMeters: 1.0,
        },
      ],
    }

    const data = buildRoom3DGeometry(config)
    expect(data.doors.length).toBe(1)
    expect(data.windows.length).toBe(1)

    const southSides = data.wallSegments.filter((s) => s.wallId === 'South' && s.type === 'side')
    // 3 side segments: before door, between door and window, after window
    expect(southSides.length).toBe(3)
  })
})
