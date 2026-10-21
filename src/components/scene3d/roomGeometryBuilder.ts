/**
 * SPACEFIT AI — 3D ROOM GEOMETRY BUILDER
 * 
 * Generates accurate watertight 3D box segments, door frames, window apertures,
 * and dimension guides from canonical RoomConfiguration data.
 * 
 * COORDINATE SYSTEM:
 * - Room centered at (0, 0, 0) on the X-Z floor plane.
 * - Interior X bounds: [-W/2, W/2]
 * - Interior Z bounds: [-L/2, L/2]
 * - Floor at Y = 0, Ceiling at Y = H
 * - Wall thickness T extends outwards to preserve exact interior usable area.
 */

import type { RoomConfiguration, WallId, RoomDoor, RoomWindow } from '@/types/geometry'
import type { WallSegment, DoorMeshSpec, WindowMeshSpec, RoomGeometryData } from './types'

interface OpeningInterval {
  id: string
  name: string
  wallId: WallId
  type: 'door' | 'window'
  start: number
  end: number
  width: number
  height: number
  sillHeight: number
  swingDirection?: string
}

export function buildRoom3DGeometry(config: RoomConfiguration): RoomGeometryData {
  const W = config.widthMeters
  const L = config.lengthMeters
  const H = config.ceilingHeightMeters
  const T = config.wallThicknessMeters || 0.15

  const halfW = W / 2
  const halfL = L / 2

  // Group openings by wall
  const openingsByWall: Record<WallId, OpeningInterval[]> = {
    North: [],
    South: [],
    East: [],
    West: [],
  }

  // Register doors
  config.doors.forEach((d: RoomDoor) => {
    openingsByWall[d.wallId].push({
      id: d.id,
      name: d.name,
      wallId: d.wallId,
      type: 'door',
      start: d.offsetMeters,
      end: d.offsetMeters + d.widthMeters,
      width: d.widthMeters,
      height: d.heightMeters,
      sillHeight: 0,
      swingDirection: d.swingDirection,
    })
  })

  // Register windows
  config.windows.forEach((w: RoomWindow) => {
    openingsByWall[w.wallId].push({
      id: w.id,
      name: w.name,
      wallId: w.wallId,
      type: 'window',
      start: w.offsetMeters,
      end: w.offsetMeters + w.widthMeters,
      width: w.widthMeters,
      height: w.heightMeters,
      sillHeight: w.sillHeightMeters,
    })
  })

  // Sort openings along each wall by start offset
  Object.keys(openingsByWall).forEach((k) => {
    const wallId = k as WallId
    openingsByWall[wallId].sort((a, b) => a.start - b.start)
  })

  const wallSegments: WallSegment[] = []
  const doors: DoorMeshSpec[] = []
  const windows: WindowMeshSpec[] = []

  // --- 1. SOUTH WALL (Z = -halfL, spans X: [-halfW - T, halfW + T]) ---
  // Offset measured from West (X = 0 in room coords -> -halfW)
  const southZ = -halfL - T / 2
  const southOpenings = openingsByWall.South
  let southCurrentX = -halfW - T // start at exterior corner cap

  southOpenings.forEach((op) => {
    const opStartX = -halfW + op.start
    const opEndX = -halfW + op.end

    // Solid segment before opening
    if (opStartX > southCurrentX + 0.001) {
      const segWidth = opStartX - southCurrentX
      const segCenterX = southCurrentX + segWidth / 2
      wallSegments.push({
        wallId: 'South',
        x: segCenterX,
        y: H / 2,
        z: southZ,
        width: segWidth,
        height: H,
        depth: T,
        type: 'side',
      })
    }

    // Opening cutouts
    const opCenterX = opStartX + op.width / 2
    if (op.type === 'door') {
      // Lintel segment above door
      if (H > op.height) {
        const lintelHeight = H - op.height
        wallSegments.push({
          wallId: 'South',
          x: opCenterX,
          y: op.height + lintelHeight / 2,
          z: southZ,
          width: op.width,
          height: lintelHeight,
          depth: T,
          type: 'lintel',
        })
      }
      doors.push({
        id: op.id,
        name: op.name,
        wallId: 'South',
        position: [opCenterX, op.height / 2, southZ],
        rotation: [0, 0, 0],
        width: op.width,
        height: op.height,
        depth: T,
        swingDirection: op.swingDirection || 'inward-right',
      })
    } else {
      // Window sill & lintel
      if (op.sillHeight > 0) {
        wallSegments.push({
          wallId: 'South',
          x: opCenterX,
          y: op.sillHeight / 2,
          z: southZ,
          width: op.width,
          height: op.sillHeight,
          depth: T,
          type: 'sill',
        })
      }
      const topOfWindow = op.sillHeight + op.height
      if (H > topOfWindow) {
        const lintelHeight = H - topOfWindow
        wallSegments.push({
          wallId: 'South',
          x: opCenterX,
          y: topOfWindow + lintelHeight / 2,
          z: southZ,
          width: op.width,
          height: lintelHeight,
          depth: T,
          type: 'lintel',
        })
      }
      windows.push({
        id: op.id,
        name: op.name,
        wallId: 'South',
        position: [opCenterX, op.sillHeight + op.height / 2, southZ],
        rotation: [0, 0, 0],
        width: op.width,
        height: op.height,
        depth: T,
        sillHeight: op.sillHeight,
      })
    }

    southCurrentX = opEndX
  })

  // Solid segment after last South opening to East corner cap
  const southFinalX = halfW + T
  if (southFinalX > southCurrentX + 0.001) {
    const segWidth = southFinalX - southCurrentX
    const segCenterX = southCurrentX + segWidth / 2
    wallSegments.push({
      wallId: 'South',
      x: segCenterX,
      y: H / 2,
      z: southZ,
      width: segWidth,
      height: H,
      depth: T,
      type: 'side',
    })
  }

  // --- 2. NORTH WALL (Z = halfL, spans X: [-halfW - T, halfW + T]) ---
  // Offset measured from West (X = 0 in room coords -> -halfW)
  const northZ = halfL + T / 2
  const northOpenings = openingsByWall.North
  let northCurrentX = -halfW - T

  northOpenings.forEach((op) => {
    const opStartX = -halfW + op.start
    const opEndX = -halfW + op.end

    if (opStartX > northCurrentX + 0.001) {
      const segWidth = opStartX - northCurrentX
      const segCenterX = northCurrentX + segWidth / 2
      wallSegments.push({
        wallId: 'North',
        x: segCenterX,
        y: H / 2,
        z: northZ,
        width: segWidth,
        height: H,
        depth: T,
        type: 'side',
      })
    }

    const opCenterX = opStartX + op.width / 2
    if (op.type === 'door') {
      if (H > op.height) {
        const lintelHeight = H - op.height
        wallSegments.push({
          wallId: 'North',
          x: opCenterX,
          y: op.height + lintelHeight / 2,
          z: northZ,
          width: op.width,
          height: lintelHeight,
          depth: T,
          type: 'lintel',
        })
      }
      doors.push({
        id: op.id,
        name: op.name,
        wallId: 'North',
        position: [opCenterX, op.height / 2, northZ],
        rotation: [0, Math.PI, 0],
        width: op.width,
        height: op.height,
        depth: T,
        swingDirection: op.swingDirection || 'inward-right',
      })
    } else {
      if (op.sillHeight > 0) {
        wallSegments.push({
          wallId: 'North',
          x: opCenterX,
          y: op.sillHeight / 2,
          z: northZ,
          width: op.width,
          height: op.sillHeight,
          depth: T,
          type: 'sill',
        })
      }
      const topOfWindow = op.sillHeight + op.height
      if (H > topOfWindow) {
        const lintelHeight = H - topOfWindow
        wallSegments.push({
          wallId: 'North',
          x: opCenterX,
          y: topOfWindow + lintelHeight / 2,
          z: northZ,
          width: op.width,
          height: lintelHeight,
          depth: T,
          type: 'lintel',
        })
      }
      windows.push({
        id: op.id,
        name: op.name,
        wallId: 'North',
        position: [opCenterX, op.sillHeight + op.height / 2, northZ],
        rotation: [0, Math.PI, 0],
        width: op.width,
        height: op.height,
        depth: T,
        sillHeight: op.sillHeight,
      })
    }

    northCurrentX = opEndX
  })

  const northFinalX = halfW + T
  if (northFinalX > northCurrentX + 0.001) {
    const segWidth = northFinalX - northCurrentX
    const segCenterX = northCurrentX + segWidth / 2
    wallSegments.push({
      wallId: 'North',
      x: segCenterX,
      y: H / 2,
      z: northZ,
      width: segWidth,
      height: H,
      depth: T,
      type: 'side',
    })
  }

  // --- 3. WEST WALL (X = -halfW, spans Z: [-halfL, halfL]) ---
  // Offset measured from South (Z = 0 in room coords -> -halfL)
  const westX = -halfW - T / 2
  const westOpenings = openingsByWall.West
  let westCurrentZ = -halfL

  westOpenings.forEach((op) => {
    const opStartZ = -halfL + op.start
    const opEndZ = -halfL + op.end

    if (opStartZ > westCurrentZ + 0.001) {
      const segLength = opStartZ - westCurrentZ
      const segCenterZ = westCurrentZ + segLength / 2
      wallSegments.push({
        wallId: 'West',
        x: westX,
        y: H / 2,
        z: segCenterZ,
        width: T,
        height: H,
        depth: segLength,
        type: 'side',
      })
    }

    const opCenterZ = opStartZ + op.width / 2
    if (op.type === 'door') {
      if (H > op.height) {
        const lintelHeight = H - op.height
        wallSegments.push({
          wallId: 'West',
          x: westX,
          y: op.height + lintelHeight / 2,
          z: opCenterZ,
          width: T,
          height: lintelHeight,
          depth: op.width,
          type: 'lintel',
        })
      }
      doors.push({
        id: op.id,
        name: op.name,
        wallId: 'West',
        position: [westX, op.height / 2, opCenterZ],
        rotation: [0, Math.PI / 2, 0],
        width: op.width,
        height: op.height,
        depth: T,
        swingDirection: op.swingDirection || 'inward-right',
      })
    } else {
      if (op.sillHeight > 0) {
        wallSegments.push({
          wallId: 'West',
          x: westX,
          y: op.sillHeight / 2,
          z: opCenterZ,
          width: T,
          height: op.sillHeight,
          depth: op.width,
          type: 'sill',
        })
      }
      const topOfWindow = op.sillHeight + op.height
      if (H > topOfWindow) {
        const lintelHeight = H - topOfWindow
        wallSegments.push({
          wallId: 'West',
          x: westX,
          y: topOfWindow + lintelHeight / 2,
          z: opCenterZ,
          width: T,
          height: lintelHeight,
          depth: op.width,
          type: 'lintel',
        })
      }
      windows.push({
        id: op.id,
        name: op.name,
        wallId: 'West',
        position: [westX, op.sillHeight + op.height / 2, opCenterZ],
        rotation: [0, Math.PI / 2, 0],
        width: op.width,
        height: op.height,
        depth: T,
        sillHeight: op.sillHeight,
      })
    }

    westCurrentZ = opEndZ
  })

  const westFinalZ = halfL
  if (westFinalZ > westCurrentZ + 0.001) {
    const segLength = westFinalZ - westCurrentZ
    const segCenterZ = westCurrentZ + segLength / 2
    wallSegments.push({
      wallId: 'West',
      x: westX,
      y: H / 2,
      z: segCenterZ,
      width: T,
      height: H,
      depth: segLength,
      type: 'side',
    })
  }

  // --- 4. EAST WALL (X = halfW, spans Z: [-halfL, halfL]) ---
  // Offset measured from South (Z = 0 in room coords -> -halfL)
  const eastX = halfW + T / 2
  const eastOpenings = openingsByWall.East
  let eastCurrentZ = -halfL

  eastOpenings.forEach((op) => {
    const opStartZ = -halfL + op.start
    const opEndZ = -halfL + op.end

    if (opStartZ > eastCurrentZ + 0.001) {
      const segLength = opStartZ - eastCurrentZ
      const segCenterZ = eastCurrentZ + segLength / 2
      wallSegments.push({
        wallId: 'East',
        x: eastX,
        y: H / 2,
        z: segCenterZ,
        width: T,
        height: H,
        depth: segLength,
        type: 'side',
      })
    }

    const opCenterZ = opStartZ + op.width / 2
    if (op.type === 'door') {
      if (H > op.height) {
        const lintelHeight = H - op.height
        wallSegments.push({
          wallId: 'East',
          x: eastX,
          y: op.height + lintelHeight / 2,
          z: opCenterZ,
          width: T,
          height: lintelHeight,
          depth: op.width,
          type: 'lintel',
        })
      }
      doors.push({
        id: op.id,
        name: op.name,
        wallId: 'East',
        position: [eastX, op.height / 2, opCenterZ],
        rotation: [0, -Math.PI / 2, 0],
        width: op.width,
        height: op.height,
        depth: T,
        swingDirection: op.swingDirection || 'inward-right',
      })
    } else {
      if (op.sillHeight > 0) {
        wallSegments.push({
          wallId: 'East',
          x: eastX,
          y: op.sillHeight / 2,
          z: opCenterZ,
          width: T,
          height: op.sillHeight,
          depth: op.width,
          type: 'sill',
        })
      }
      const topOfWindow = op.sillHeight + op.height
      if (H > topOfWindow) {
        const lintelHeight = H - topOfWindow
        wallSegments.push({
          wallId: 'East',
          x: eastX,
          y: topOfWindow + lintelHeight / 2,
          z: opCenterZ,
          width: T,
          height: lintelHeight,
          depth: op.width,
          type: 'lintel',
        })
      }
      windows.push({
        id: op.id,
        name: op.name,
        wallId: 'East',
        position: [eastX, op.sillHeight + op.height / 2, opCenterZ],
        rotation: [0, -Math.PI / 2, 0],
        width: op.width,
        height: op.height,
        depth: T,
        sillHeight: op.sillHeight,
      })
    }

    eastCurrentZ = opEndZ
  })

  const eastFinalZ = halfL
  if (eastFinalZ > eastCurrentZ + 0.001) {
    const segLength = eastFinalZ - eastCurrentZ
    const segCenterZ = eastCurrentZ + segLength / 2
    wallSegments.push({
      wallId: 'East',
      x: eastX,
      y: H / 2,
      z: segCenterZ,
      width: T,
      height: H,
      depth: segLength,
      type: 'side',
    })
  }

  return {
    width: W,
    length: L,
    ceilingHeight: H,
    wallThickness: T,
    wallSegments,
    doors,
    windows,
    center: [0, H / 2, 0],
  }
}
