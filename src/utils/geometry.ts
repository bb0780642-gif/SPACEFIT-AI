/**
 * SPACEFIT AI — SPATIAL GEOMETRY & VALIDATION ENGINE
 * 
 * COORDINATE CONVENTION:
 * - Origin (0, 0) is at the South-West corner of the room floor.
 * - +X axis extends Eastward (along room width: 0 -> widthMeters).
 * - +Z axis extends Northward (along room length: 0 -> lengthMeters).
 * - +Y axis extends Vertically Upward (0 = Floor plane, ceilingHeightMeters = Ceiling plane).
 * 
 * WALL ORIENTATION & OFFSET MEASUREMENT:
 * - South Wall (Z = 0): Spans from SW (0, 0) to SE (width, 0).
 *   Length = widthMeters. Offset 0 is at SW corner (0, 0).
 * - East Wall (X = width): Spans from SE (width, 0) to NE (width, length).
 *   Length = lengthMeters. Offset 0 is at SE corner (width, 0).
 * - North Wall (Z = length): Spans from NW (0, length) to NE (width, length).
 *   Length = widthMeters. Offset 0 is at NW corner (0, length).
 * - West Wall (X = 0): Spans from SW (0, 0) to NW (0, length).
 *   Length = lengthMeters. Offset 0 is at SW corner (0, 0).
 * 
 * OPENING INTERVAL RULES:
 * - Each opening (door/window) occupies interval [offsetMeters, offsetMeters + widthMeters] on its wall.
 * - Boundary condition: offsetMeters >= 0 and (offsetMeters + widthMeters) <= wallLength.
 * - Overlap condition: Openings on the SAME wall overlap if max(o1, o2) < min(o1 + w1, o2 + w2).
 * - Vertical boundary: door height <= ceilingHeight; (window sillHeight + window height) <= ceilingHeight.
 */

import type { 
  WallId, 
  WallDefinition, 
  RoomDoor, 
  RoomWindow, 
  RoomConfiguration, 
  RoomValidationResult, 
  RoomValidationError 
} from '@/types/geometry'
import type { MeasurementUnit } from '@/types/project'

export const METERS_TO_FEET = 3.28084
export const FEET_TO_METERS = 1 / METERS_TO_FEET

// Dimensional safety bounds in canonical metres
export const GEOMETRY_LIMITS = {
  MIN_ROOM_WIDTH: 1.5,
  MAX_ROOM_WIDTH: 30.0,
  MIN_ROOM_LENGTH: 1.5,
  MAX_ROOM_LENGTH: 30.0,
  MIN_CEILING_HEIGHT: 2.0,
  MAX_CEILING_HEIGHT: 8.0,
  MIN_DOOR_WIDTH: 0.5,
  MAX_DOOR_WIDTH: 3.5,
  MIN_DOOR_HEIGHT: 1.5,
  MIN_WINDOW_WIDTH: 0.3,
  MAX_WINDOW_WIDTH: 6.0,
  MIN_WINDOW_HEIGHT: 0.3,
  DEFAULT_WALL_THICKNESS: 0.15, // 15 cm
  MIN_CORNER_CLEARANCE: 0.05, // 5 cm structural clearance
} as const

export function metersToFeet(meters: number): number {
  return Number((meters * METERS_TO_FEET).toFixed(2))
}

export function feetToMeters(feet: number): number {
  return Number((feet * FEET_TO_METERS).toFixed(3))
}

export function convertLength(value: number, fromUnit: MeasurementUnit, toUnit: MeasurementUnit): number {
  if (fromUnit === toUnit) return value
  return toUnit === 'feet' ? metersToFeet(value) : feetToMeters(value)
}

/**
 * Returns canonical length of given wall in metres.
 */
export function getWallLength(wallId: WallId, widthMeters: number, lengthMeters: number): number {
  return wallId === 'North' || wallId === 'South' ? widthMeters : lengthMeters
}

/**
 * Generates geometric definitions for all four walls based on room bounds.
 */
export function getWallDefinitions(widthMeters: number, lengthMeters: number): WallDefinition[] {
  return [
    {
      id: 'North',
      name: 'North Wall',
      lengthMeters: widthMeters,
      startPoint: { x: 0, z: lengthMeters },
      endPoint: { x: widthMeters, z: lengthMeters },
      orientation: 'horizontal',
    },
    {
      id: 'East',
      name: 'East Wall',
      lengthMeters: lengthMeters,
      startPoint: { x: widthMeters, z: 0 },
      endPoint: { x: widthMeters, z: lengthMeters },
      orientation: 'vertical',
    },
    {
      id: 'South',
      name: 'South Wall',
      lengthMeters: widthMeters,
      startPoint: { x: 0, z: 0 },
      endPoint: { x: widthMeters, z: 0 },
      orientation: 'horizontal',
    },
    {
      id: 'West',
      name: 'West Wall',
      lengthMeters: lengthMeters,
      startPoint: { x: 0, z: 0 },
      endPoint: { x: 0, z: lengthMeters },
      orientation: 'vertical',
    },
  ]
}

/**
 * Validates room perimeter and ceiling height dimensions.
 */
export function validateRoomDimensions(
  widthMeters: number,
  lengthMeters: number,
  ceilingHeightMeters: number
): RoomValidationResult {
  const errors: RoomValidationError[] = []
  const warnings: RoomValidationError[] = []

  // Width check
  if (typeof widthMeters !== 'number' || isNaN(widthMeters) || widthMeters <= 0) {
    errors.push({
      field: 'width',
      severity: 'error',
      code: 'INVALID_WIDTH',
      message: 'Room width must be a positive number.',
    })
  } else if (widthMeters < GEOMETRY_LIMITS.MIN_ROOM_WIDTH || widthMeters > GEOMETRY_LIMITS.MAX_ROOM_WIDTH) {
    errors.push({
      field: 'width',
      severity: 'error',
      code: 'WIDTH_OUT_OF_BOUNDS',
      message: `Width must be between ${GEOMETRY_LIMITS.MIN_ROOM_WIDTH}m and ${GEOMETRY_LIMITS.MAX_ROOM_WIDTH}m.`,
    })
  }

  // Length check
  if (typeof lengthMeters !== 'number' || isNaN(lengthMeters) || lengthMeters <= 0) {
    errors.push({
      field: 'length',
      severity: 'error',
      code: 'INVALID_LENGTH',
      message: 'Room length must be a positive number.',
    })
  } else if (lengthMeters < GEOMETRY_LIMITS.MIN_ROOM_LENGTH || lengthMeters > GEOMETRY_LIMITS.MAX_ROOM_LENGTH) {
    errors.push({
      field: 'length',
      severity: 'error',
      code: 'LENGTH_OUT_OF_BOUNDS',
      message: `Length must be between ${GEOMETRY_LIMITS.MIN_ROOM_LENGTH}m and ${GEOMETRY_LIMITS.MAX_ROOM_LENGTH}m.`,
    })
  }

  // Ceiling height check
  if (typeof ceilingHeightMeters !== 'number' || isNaN(ceilingHeightMeters) || ceilingHeightMeters <= 0) {
    errors.push({
      field: 'ceilingHeight',
      severity: 'error',
      code: 'INVALID_CEILING_HEIGHT',
      message: 'Ceiling height must be a positive number.',
    })
  } else if (
    ceilingHeightMeters < GEOMETRY_LIMITS.MIN_CEILING_HEIGHT ||
    ceilingHeightMeters > GEOMETRY_LIMITS.MAX_CEILING_HEIGHT
  ) {
    errors.push({
      field: 'ceilingHeight',
      severity: 'error',
      code: 'CEILING_OUT_OF_BOUNDS',
      message: `Ceiling height must be between ${GEOMETRY_LIMITS.MIN_CEILING_HEIGHT}m and ${GEOMETRY_LIMITS.MAX_CEILING_HEIGHT}m.`,
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Validates a single door opening against its designated wall and ceiling height.
 */
export function validateDoor(
  door: RoomDoor,
  wallLength: number,
  ceilingHeight: number
): RoomValidationError[] {
  const errors: RoomValidationError[] = []

  if (door.widthMeters <= 0 || isNaN(door.widthMeters)) {
    errors.push({
      openingId: door.id,
      wallId: door.wallId,
      severity: 'error',
      code: 'INVALID_DOOR_WIDTH',
      message: `Door "${door.name}" width must be positive.`,
    })
  } else if (door.widthMeters < GEOMETRY_LIMITS.MIN_DOOR_WIDTH || door.widthMeters > GEOMETRY_LIMITS.MAX_DOOR_WIDTH) {
    errors.push({
      openingId: door.id,
      wallId: door.wallId,
      severity: 'error',
      code: 'DOOR_WIDTH_OUT_OF_BOUNDS',
      message: `Door "${door.name}" width must be between ${GEOMETRY_LIMITS.MIN_DOOR_WIDTH}m and ${GEOMETRY_LIMITS.MAX_DOOR_WIDTH}m.`,
    })
  }

  if (door.heightMeters <= 0 || isNaN(door.heightMeters)) {
    errors.push({
      openingId: door.id,
      wallId: door.wallId,
      severity: 'error',
      code: 'INVALID_DOOR_HEIGHT',
      message: `Door "${door.name}" height must be positive.`,
    })
  } else if (door.heightMeters > ceilingHeight) {
    errors.push({
      openingId: door.id,
      wallId: door.wallId,
      severity: 'error',
      code: 'DOOR_EXCEEDS_CEILING',
      message: `Door "${door.name}" height (${door.heightMeters}m) exceeds ceiling height (${ceilingHeight}m).`,
    })
  }

  if (door.offsetMeters < 0 || isNaN(door.offsetMeters)) {
    errors.push({
      openingId: door.id,
      wallId: door.wallId,
      severity: 'error',
      code: 'NEGATIVE_DOOR_OFFSET',
      message: `Door "${door.name}" offset cannot be negative.`,
    })
  } else if (door.offsetMeters + door.widthMeters > wallLength) {
    const overflow = Number((door.offsetMeters + door.widthMeters - wallLength).toFixed(2))
    errors.push({
      openingId: door.id,
      wallId: door.wallId,
      severity: 'error',
      code: 'DOOR_EXCEEDS_WALL',
      message: `Door "${door.name}" extends ${overflow}m past the ${door.wallId} wall boundary (Wall: ${wallLength}m).`,
    })
  }

  return errors
}

/**
 * Validates a single window opening against its designated wall and ceiling height.
 */
export function validateWindow(
  win: RoomWindow,
  wallLength: number,
  ceilingHeight: number
): RoomValidationError[] {
  const errors: RoomValidationError[] = []

  if (win.widthMeters <= 0 || isNaN(win.widthMeters)) {
    errors.push({
      openingId: win.id,
      wallId: win.wallId,
      severity: 'error',
      code: 'INVALID_WINDOW_WIDTH',
      message: `Window "${win.name}" width must be positive.`,
    })
  } else if (win.widthMeters < GEOMETRY_LIMITS.MIN_WINDOW_WIDTH || win.widthMeters > GEOMETRY_LIMITS.MAX_WINDOW_WIDTH) {
    errors.push({
      openingId: win.id,
      wallId: win.wallId,
      severity: 'error',
      code: 'WINDOW_WIDTH_OUT_OF_BOUNDS',
      message: `Window "${win.name}" width must be between ${GEOMETRY_LIMITS.MIN_WINDOW_WIDTH}m and ${GEOMETRY_LIMITS.MAX_WINDOW_WIDTH}m.`,
    })
  }

  if (win.heightMeters <= 0 || isNaN(win.heightMeters)) {
    errors.push({
      openingId: win.id,
      wallId: win.wallId,
      severity: 'error',
      code: 'INVALID_WINDOW_HEIGHT',
      message: `Window "${win.name}" height must be positive.`,
    })
  }

  if (win.sillHeightMeters < 0 || isNaN(win.sillHeightMeters)) {
    errors.push({
      openingId: win.id,
      wallId: win.wallId,
      severity: 'error',
      code: 'NEGATIVE_SILL_HEIGHT',
      message: `Window "${win.name}" sill height cannot be negative.`,
    })
  }

  if (win.heightMeters > 0 && win.sillHeightMeters >= 0) {
    const totalTop = Number((win.sillHeightMeters + win.heightMeters).toFixed(2))
    if (totalTop > ceilingHeight) {
      errors.push({
        openingId: win.id,
        wallId: win.wallId,
        severity: 'error',
        code: 'WINDOW_EXCEEDS_CEILING',
        message: `Window "${win.name}" top (${totalTop}m) exceeds ceiling height (${ceilingHeight}m).`,
      })
    }
  }

  if (win.offsetMeters < 0 || isNaN(win.offsetMeters)) {
    errors.push({
      openingId: win.id,
      wallId: win.wallId,
      severity: 'error',
      code: 'NEGATIVE_WINDOW_OFFSET',
      message: `Window "${win.name}" offset cannot be negative.`,
    })
  } else if (win.offsetMeters + win.widthMeters > wallLength) {
    const overflow = Number((win.offsetMeters + win.widthMeters - wallLength).toFixed(2))
    errors.push({
      openingId: win.id,
      wallId: win.wallId,
      severity: 'error',
      code: 'WINDOW_EXCEEDS_WALL',
      message: `Window "${win.name}" extends ${overflow}m past the ${win.wallId} wall boundary (Wall: ${wallLength}m).`,
    })
  }

  return errors
}

/**
 * Checks for interval collisions among all openings on the SAME wall.
 * Openings on different walls do NOT collide.
 */
export function checkOpeningsOverlap(
  openings: Array<{ id: string; name: string; wallId: WallId; offsetMeters: number; widthMeters: number }>
): RoomValidationError[] {
  const errors: RoomValidationError[] = []

  for (let i = 0; i < openings.length; i++) {
    for (let j = i + 1; j < openings.length; j++) {
      const a = openings[i]
      const b = openings[j]

      // Only evaluate openings located on the EXACT same wall
      if (a.wallId !== b.wallId) continue

      const aStart = a.offsetMeters
      const aEnd = a.offsetMeters + a.widthMeters
      const bStart = b.offsetMeters
      const bEnd = b.offsetMeters + b.widthMeters

      // Standard interval overlap condition: max(start1, start2) < min(end1, end2)
      const overlapStart = Math.max(aStart, bStart)
      const overlapEnd = Math.min(aEnd, bEnd)

      if (overlapStart < overlapEnd) {
        const overlapLength = Number((overlapEnd - overlapStart).toFixed(2))
        errors.push({
          openingId: a.id,
          wallId: a.wallId,
          severity: 'error',
          code: 'OPENINGS_OVERLAP',
          message: `"${a.name}" and "${b.name}" overlap by ${overlapLength}m on the ${a.wallId} wall.`,
        })
      }
    }
  }

  return errors
}

/**
 * Validates complete room configuration including dimensions, doors, windows, and overlaps.
 */
export function validateRoomConfiguration(config: RoomConfiguration): RoomValidationResult {
  const dimResult = validateRoomDimensions(
    config.widthMeters,
    config.lengthMeters,
    config.ceilingHeightMeters
  )

  const errors: RoomValidationError[] = [...dimResult.errors]
  const warnings: RoomValidationError[] = [...dimResult.warnings]

  // Validate each door
  for (const door of config.doors) {
    const wallLength = getWallLength(door.wallId, config.widthMeters, config.lengthMeters)
    const doorErrors = validateDoor(door, wallLength, config.ceilingHeightMeters)
    errors.push(...doorErrors)
  }

  // Validate each window
  for (const win of config.windows) {
    const wallLength = getWallLength(win.wallId, config.widthMeters, config.lengthMeters)
    const winErrors = validateWindow(win, wallLength, config.ceilingHeightMeters)
    errors.push(...winErrors)
  }

  // Check overlap across all openings on identical walls
  const allOpenings = [
    ...config.doors.map((d) => ({
      id: d.id,
      name: d.name,
      wallId: d.wallId,
      offsetMeters: d.offsetMeters,
      widthMeters: d.widthMeters,
    })),
    ...config.windows.map((w) => ({
      id: w.id,
      name: w.name,
      wallId: w.wallId,
      offsetMeters: w.offsetMeters,
      widthMeters: w.widthMeters,
    })),
  ]

  const overlapErrors = checkOpeningsOverlap(allOpenings)
  errors.push(...overlapErrors)

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Backward-compatible migration:
 * Guarantees a valid RoomConfiguration object for any project (including Phase 2 projects).
 */
export function ensureRoomConfiguration(project: {
  width?: number
  length?: number
  ceilingHeight?: number
  unit?: MeasurementUnit
  normalizedDimensions?: {
    widthMeters?: number
    lengthMeters?: number
    areaMeters?: number
    volumeMeters?: number
  }
  configuration?: RoomConfiguration
}): RoomConfiguration {
  if (project.configuration && project.configuration.schemaVersion === '3.0') {
    return project.configuration
  }

  // Derive canonical dimensions in metres
  let widthMeters = project.normalizedDimensions?.widthMeters
  let lengthMeters = project.normalizedDimensions?.lengthMeters

  if (!widthMeters) {
    widthMeters = project.unit === 'feet' && project.width ? feetToMeters(project.width) : project.width || 5.0
  }
  if (!lengthMeters) {
    lengthMeters = project.unit === 'feet' && project.length ? feetToMeters(project.length) : project.length || 6.0
  }

  const ceilingHeightMeters = project.unit === 'feet' && project.ceilingHeight
    ? feetToMeters(project.ceilingHeight)
    : project.ceilingHeight || 2.8

  // Safe default door on South Wall
  const defaultDoorWidth = 0.9
  const defaultDoorOffset = Math.max(0.2, Math.min(1.0, widthMeters - defaultDoorWidth - 0.2))

  // Safe default window on North Wall
  const defaultWindowWidth = 1.4
  const defaultWindowOffset = Math.max(0.3, Math.min(1.5, widthMeters - defaultWindowWidth - 0.3))

  return {
    schemaVersion: '3.0',
    shape: 'rectangular',
    widthMeters: Number(widthMeters.toFixed(2)),
    lengthMeters: Number(lengthMeters.toFixed(2)),
    ceilingHeightMeters: Number(ceilingHeightMeters.toFixed(2)),
    wallThicknessMeters: GEOMETRY_LIMITS.DEFAULT_WALL_THICKNESS,
    doors: [
      {
        id: 'door-primary',
        name: 'Main Entry Door',
        wallId: 'South',
        widthMeters: defaultDoorWidth,
        heightMeters: 2.1,
        offsetMeters: Number(defaultDoorOffset.toFixed(2)),
        swingDirection: 'inward-right',
      },
    ],
    windows: [
      {
        id: 'win-primary',
        name: 'Main Window',
        wallId: 'North',
        widthMeters: defaultWindowWidth,
        heightMeters: 1.2,
        offsetMeters: Number(defaultWindowOffset.toFixed(2)),
        sillHeightMeters: 0.9,
      },
    ],
  }
}
