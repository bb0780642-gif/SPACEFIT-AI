import { describe, it, expect } from 'vitest'
import {
  validateRoomDimensions,
  validateDoor,
  validateWindow,
  checkOpeningsOverlap,
  validateRoomConfiguration,
  ensureRoomConfiguration,
  feetToMeters,
  metersToFeet,
  convertLength,
} from './geometry'
import type { RoomConfiguration, RoomDoor, RoomWindow } from '@/types/geometry'

describe('Spatial Geometry & Validation Engine', () => {
  // 1. Valid rectangular room
  it('1. validates a correct rectangular room within standard bounds', () => {
    const result = validateRoomDimensions(5.0, 6.0, 2.8)
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  // 2. Zero or negative room dimensions
  it('2. rejects zero or negative room dimensions', () => {
    const zeroResult = validateRoomDimensions(0, 5.0, 2.8)
    expect(zeroResult.isValid).toBe(false)
    expect(zeroResult.errors.some((e) => e.code === 'INVALID_WIDTH')).toBe(true)

    const negResult = validateRoomDimensions(5.0, -2.0, 2.8)
    expect(negResult.isValid).toBe(false)
    expect(negResult.errors.some((e) => e.code === 'INVALID_LENGTH')).toBe(true)

    const ceilingResult = validateRoomDimensions(5.0, 6.0, -1.0)
    expect(ceilingResult.isValid).toBe(false)
    expect(ceilingResult.errors.some((e) => e.code === 'INVALID_CEILING_HEIGHT')).toBe(true)
  })

  // 3. A door fitting exactly within a wall
  it('3. accepts a door fitting exactly within the wall limits', () => {
    const wallLength = 5.0
    const ceilingHeight = 2.8
    const door: RoomDoor = {
      id: 'door-1',
      name: 'Full Span Door',
      wallId: 'South',
      widthMeters: 2.0,
      heightMeters: 2.1,
      offsetMeters: 3.0, // offset (3.0) + width (2.0) = 5.0 (exact wall boundary)
      swingDirection: 'inward-right',
    }
    const errors = validateDoor(door, wallLength, ceilingHeight)
    expect(errors).toHaveLength(0)
  })

  // 4. A door extending beyond the wall
  it('4. rejects a door extending beyond the wall boundary', () => {
    const wallLength = 4.0
    const ceilingHeight = 2.8
    const door: RoomDoor = {
      id: 'door-overflow',
      name: 'Overflowing Door',
      wallId: 'West',
      widthMeters: 1.2,
      heightMeters: 2.1,
      offsetMeters: 3.2, // 3.2 + 1.2 = 4.4 > 4.0
      swingDirection: 'inward-left',
    }
    const errors = validateDoor(door, wallLength, ceilingHeight)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors.some((e) => e.code === 'DOOR_EXCEEDS_WALL')).toBe(true)
  })

  // 5. Two overlapping openings on the same wall
  it('5. detects two overlapping openings on the same wall', () => {
    const openings = [
      { id: 'door-1', name: 'Entry Door', wallId: 'South' as const, offsetMeters: 1.0, widthMeters: 1.0 },
      { id: 'win-1', name: 'Side Window', wallId: 'South' as const, offsetMeters: 1.5, widthMeters: 1.2 }, // overlaps [1.0, 2.0] and [1.5, 2.7]
    ]
    const errors = checkOpeningsOverlap(openings)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors.some((e) => e.code === 'OPENINGS_OVERLAP')).toBe(true)
  })

  // 6. Openings on separate walls do not overlap
  it('6. confirms that openings on separate walls do not conflict even with identical offsets', () => {
    const openings = [
      { id: 'door-south', name: 'South Door', wallId: 'South' as const, offsetMeters: 1.0, widthMeters: 1.0 },
      { id: 'win-north', name: 'North Window', wallId: 'North' as const, offsetMeters: 1.0, widthMeters: 1.0 },
      { id: 'win-east', name: 'East Window', wallId: 'East' as const, offsetMeters: 1.0, widthMeters: 1.0 },
    ]
    const errors = checkOpeningsOverlap(openings)
    expect(errors).toHaveLength(0)
  })

  // 7. A window exceeding ceiling-height constraints
  it('7. rejects a window where sill height + window height exceeds ceiling height', () => {
    const wallLength = 5.0
    const ceilingHeight = 2.8
    const window: RoomWindow = {
      id: 'win-high',
      name: 'Tall Window',
      wallId: 'North',
      widthMeters: 1.4,
      heightMeters: 2.0,
      sillHeightMeters: 1.2, // 1.2 + 2.0 = 3.2m > 2.8m ceiling
      offsetMeters: 1.0,
    }
    const errors = validateWindow(window, wallLength, ceilingHeight)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors.some((e) => e.code === 'WINDOW_EXCEEDS_CEILING')).toBe(true)
  })

  // 8. Correct feet-to-metres conversion
  it('8. accurately converts between feet and metres without scale distortion', () => {
    const feetVal = 16.4042
    const metersVal = feetToMeters(feetVal)
    expect(Math.abs(metersVal - 5.0)).toBeLessThan(0.01)

    const convertedBack = metersToFeet(5.0)
    expect(Math.abs(convertedBack - 16.4)).toBeLessThan(0.1)

    expect(convertLength(10, 'feet', 'metres')).toBeCloseTo(3.048, 1)
  })

  // 9. Editing and reloading a saved configuration
  it('9. validates a modified configuration after editing door offset', () => {
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
      windows: [
        {
          id: 'win-1',
          name: 'Main Window',
          wallId: 'North',
          widthMeters: 1.5,
          heightMeters: 1.2,
          offsetMeters: 1.5,
          sillHeightMeters: 0.9,
        },
      ],
    }

    // Initial valid
    expect(validateRoomConfiguration(config).isValid).toBe(true)

    // Edit door offset to overflow
    const modifiedConfig: RoomConfiguration = {
      ...config,
      doors: [{ ...config.doors[0], offsetMeters: 4.5 }], // 4.5 + 0.9 = 5.4 > 5.0 wall width
    }
    const result = validateRoomConfiguration(modifiedConfig)
    expect(result.isValid).toBe(false)
    expect(result.errors.some((e) => e.code === 'DOOR_EXCEEDS_WALL')).toBe(true)
  })

  // 10. Backward-compatible loading of a Phase 2 project without room-geometry data
  it('10. safely generates a valid 3.0 geometry configuration for a Phase 2 project', () => {
    const phase2Project = {
      width: 5.2,
      length: 6.4,
      ceilingHeight: 2.8,
      unit: 'metres' as const,
      normalizedDimensions: {
        widthMeters: 5.2,
        lengthMeters: 6.4,
        areaMeters: 33.28,
        volumeMeters: 93.18,
      },
    }

    const config = ensureRoomConfiguration(phase2Project)
    expect(config.schemaVersion).toBe('3.0')
    expect(config.widthMeters).toBe(5.2)
    expect(config.lengthMeters).toBe(6.4)
    expect(config.doors).toHaveLength(1)
    expect(config.windows).toHaveLength(1)

    // Verify generated default config is completely valid
    const validation = validateRoomConfiguration(config)
    expect(validation.isValid).toBe(true)
    expect(validation.errors).toHaveLength(0)
  })
})
