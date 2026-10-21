/**
 * SPACEFIT AI — 3D ROOM MESH COMPONENT
 * 
 * Renders the floor, segmented walls with apertures, detailed 3D door frames/leaves,
 * double-glazed window assemblies, interior sills, and interactive selection states.
 */

import React, { useMemo } from 'react'
import * as THREE from 'three'
import type { WallId } from '@/types/geometry'
import type { PlacedFurniture } from '@/types/furniture'
import type { RoomGeometryData, SelectedItemState, CutawayMode, DoorMeshSpec, WindowMeshSpec } from './types'
import { ProceduralFurnitureMesh } from './furniture/ProceduralFurnitureMesh'
import {
  createFloorMaterial,
  createWallMaterial,
  createDoorFrameMaterial,
  createDoorLeafMaterial,
  createWindowFrameMaterial,
  createWindowGlassMaterial,
} from './roomMaterials'

interface RoomMeshProps {
  geometryData: RoomGeometryData
  selectedItem: SelectedItemState
  cutawayMode: CutawayMode
  wireframe: boolean
  furniture?: PlacedFurniture[]
  collisionCountsByItem?: Record<string, number>
  onSelectWall?: (wallId: WallId) => void
  onSelectOpening?: (id: string, type: 'door' | 'window', wallId: WallId) => void
  onSelectFurniture?: (id: string) => void
  onSelectRoom?: () => void
}

export const RoomMesh: React.FC<RoomMeshProps> = ({
  geometryData,
  selectedItem,
  cutawayMode,
  wireframe,
  furniture = [],
  collisionCountsByItem = {},
  onSelectWall,
  onSelectOpening,
  onSelectFurniture,
  onSelectRoom,
}) => {
  const { width, length, ceilingHeight, wallSegments, doors, windows } = geometryData

  // Materials
  const floorMaterial = useMemo(() => createFloorMaterial(wireframe), [wireframe])

  // Determine wall cutaway status
  const getIsWallCutaway = (wallId: WallId) => {
    if (cutawayMode === 'none') return false
    if (cutawayMode === 'transparent') return true
    if (cutawayMode === 'half') {
      // Front walls (South and West) cut down to expose room interior
      return wallId === 'South' || wallId === 'West'
    }
    if (cutawayMode === 'auto') {
      return wallId === 'South'
    }
    return false
  }

  return (
    <group
      onClick={(e) => {
        // Fallback room select when clicking floor
        if (e.target === e.currentTarget) {
          e.stopPropagation()
          onSelectRoom?.()
        }
      }}
    >
      {/* 1. ROOM INTERIOR FLOOR */}
      <mesh
        position={[0, -0.01, 0]}
        receiveShadow
        material={floorMaterial}
        onClick={(e) => {
          e.stopPropagation()
          onSelectRoom?.()
        }}
      >
        <boxGeometry args={[width, 0.02, length]} />
      </mesh>

      {/* Subtle Floor Baseboard Perimeter (North, South, East, West inner perimeter) */}
      <group position={[0, 0.04, 0]}>
        {/* North Baseboard */}
        <mesh position={[0, 0, length / 2 - 0.01]}>
          <boxGeometry args={[width, 0.08, 0.02]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        {/* South Baseboard */}
        <mesh position={[0, 0, -length / 2 + 0.01]}>
          <boxGeometry args={[width, 0.08, 0.02]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        {/* West Baseboard */}
        <mesh position={[-width / 2 + 0.01, 0, 0]}>
          <boxGeometry args={[0.02, 0.08, length]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        {/* East Baseboard */}
        <mesh position={[width / 2 - 0.01, 0, 0]}>
          <boxGeometry args={[0.02, 0.08, length]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>

      {/* 2. SEGMENTED ARCHITECTURAL WALLS */}
      <group>
        {wallSegments.map((segment, idx) => {
          const isSelected =
            (selectedItem.type === 'wall' && selectedItem.wallId === segment.wallId) ||
            selectedItem.type === 'room'
          const isCutaway = getIsWallCutaway(segment.wallId)

          // Adjust height if half-cutaway on front walls
          let segHeight = segment.height
          let segY = segment.y
          if (isCutaway && cutawayMode === 'half') {
            const cutMaxHeight = Math.min(1.1, ceilingHeight * 0.4)
            if (segY - segHeight / 2 < cutMaxHeight) {
              segHeight = Math.min(segHeight, cutMaxHeight)
              segY = segHeight / 2
            } else {
              // Upper lintels in half-cutaway can be skipped or lowered
              return null
            }
          }

          const wallMat = createWallMaterial(isSelected, isCutaway, wireframe)

          return (
            <mesh
              key={`wall-seg-${segment.wallId}-${idx}`}
              position={[segment.x, segY, segment.z]}
              castShadow={!isCutaway}
              receiveShadow
              material={wallMat}
              onClick={(e) => {
                e.stopPropagation()
                onSelectWall?.(segment.wallId)
              }}
            >
              <boxGeometry args={[segment.width, segHeight, segment.depth]} />
            </mesh>
          )
        })}
      </group>

      {/* 3. 3D DOORS WITH ARCHITECTURAL JAMBS AND LEAF */}
      <group>
        {doors.map((door: DoorMeshSpec) => {
          const isSelected = selectedItem.type === 'door' && selectedItem.id === door.id
          const frameMat = createDoorFrameMaterial(isSelected, wireframe)
          const leafMat = createDoorLeafMaterial(isSelected, wireframe)

          const frameThickness = 0.05
          const leafThickness = 0.04
          const swingAngle = door.swingDirection.includes('inward')
            ? (Math.PI / 4) // open 45 deg inward
            : -(Math.PI / 4) // open 45 deg outward

          return (
            <group
              key={door.id}
              position={door.position}
              rotation={new THREE.Euler(...door.rotation)}
              onClick={(e) => {
                e.stopPropagation()
                onSelectOpening?.(door.id, 'door', door.wallId)
              }}
            >
              {/* Left Jamb */}
              <mesh position={[-door.width / 2 + frameThickness / 2, 0, 0]} material={frameMat}>
                <boxGeometry args={[frameThickness, door.height, door.depth * 1.05]} />
              </mesh>

              {/* Right Jamb */}
              <mesh position={[door.width / 2 - frameThickness / 2, 0, 0]} material={frameMat}>
                <boxGeometry args={[frameThickness, door.height, door.depth * 1.05]} />
              </mesh>

              {/* Top Header Jamb */}
              <mesh position={[0, door.height / 2 - frameThickness / 2, 0]} material={frameMat}>
                <boxGeometry args={[door.width, frameThickness, door.depth * 1.05]} />
              </mesh>

              {/* Door Leaf (Hinged at left jamb, slightly open for 3D realism) */}
              <group position={[-door.width / 2 + frameThickness, 0, 0]} rotation={[0, swingAngle, 0]}>
                <mesh position={[(door.width - frameThickness * 2) / 2, 0, 0]} castShadow material={leafMat}>
                  <boxGeometry args={[door.width - frameThickness * 2, door.height - frameThickness, leafThickness]} />
                </mesh>

                {/* Satin Chrome Handle / Lever */}
                <mesh position={[(door.width - frameThickness * 2) * 0.85, 0, leafThickness / 2 + 0.02]}>
                  <boxGeometry args={[0.1, 0.02, 0.04]} />
                  <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.2} />
                </mesh>
                <mesh position={[(door.width - frameThickness * 2) * 0.85, 0, -leafThickness / 2 - 0.02]}>
                  <boxGeometry args={[0.1, 0.02, 0.04]} />
                  <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.2} />
                </mesh>
              </group>

              {/* Threshold plate */}
              <mesh position={[0, -door.height / 2 + 0.01, 0]}>
                <boxGeometry args={[door.width, 0.02, door.depth * 1.1]} />
                <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.3} />
              </mesh>
            </group>
          )
        })}
      </group>

      {/* 4. 3D WINDOWS WITH FRAMES, DOUBLE-GLAZING, AND SILL LEDGES */}
      <group>
        {windows.map((win: WindowMeshSpec) => {
          const isSelected = selectedItem.type === 'window' && selectedItem.id === win.id
          const frameMat = createWindowFrameMaterial(isSelected, wireframe)
          const glassMat = createWindowGlassMaterial(isSelected)

          const frameThick = 0.04
          const innerW = win.width - frameThick * 2
          const innerH = win.height - frameThick * 2

          return (
            <group
              key={win.id}
              position={win.position}
              rotation={new THREE.Euler(...win.rotation)}
              onClick={(e) => {
                e.stopPropagation()
                onSelectOpening?.(win.id, 'window', win.wallId)
              }}
            >
              {/* Outer Window Frame - 4 bars */}
              {/* Top Bar */}
              <mesh position={[0, win.height / 2 - frameThick / 2, 0]} material={frameMat}>
                <boxGeometry args={[win.width, frameThick, win.depth * 1.02]} />
              </mesh>
              {/* Bottom Bar */}
              <mesh position={[0, -win.height / 2 + frameThick / 2, 0]} material={frameMat}>
                <boxGeometry args={[win.width, frameThick, win.depth * 1.02]} />
              </mesh>
              {/* Left Bar */}
              <mesh position={[-win.width / 2 + frameThick / 2, 0, 0]} material={frameMat}>
                <boxGeometry args={[frameThick, win.height, win.depth * 1.02]} />
              </mesh>
              {/* Right Bar */}
              <mesh position={[win.width / 2 - frameThick / 2, 0, 0]} material={frameMat}>
                <boxGeometry args={[frameThick, win.height, win.depth * 1.02]} />
              </mesh>

              {/* Center Vertical Mullion (if width > 1.2m) */}
              {win.width > 1.2 && (
                <mesh position={[0, 0, 0]} material={frameMat}>
                  <boxGeometry args={[frameThick * 0.75, win.height - frameThick * 2, win.depth * 0.9]} />
                </mesh>
              )}

              {/* Translucent Double-Glazed Glass Pane */}
              <mesh position={[0, 0, 0]} material={glassMat}>
                <boxGeometry args={[innerW, innerH, 0.015]} />
              </mesh>

              {/* Interior Window Sill Ledge (Extends into room by 6cm) */}
              <mesh position={[0, -win.height / 2 - 0.015, win.depth / 2 + 0.03]}>
                <boxGeometry args={[win.width + 0.1, 0.03, win.depth + 0.08]} />
                <meshStandardMaterial color="#f8fafc" roughness={0.4} metalness={0.1} />
              </mesh>
            </group>
          )
        })}
      </group>

      {/* 5. PLACED 3D ARCHITECTURAL FURNITURE */}
      <group>
        {furniture.map((item) => {
          const isSelected = selectedItem.type === 'furniture' && selectedItem.id === item.id
          const isColliding = (collisionCountsByItem[item.id] || 0) > 0

          return (
            <ProceduralFurnitureMesh
              key={item.id}
              furniture={item}
              isSelected={isSelected}
              isColliding={isColliding}
              onClick={(e) => {
                e.stopPropagation()
                onSelectFurniture?.(item.id)
              }}
            />
          )
        })}
      </group>
    </group>
  )
}
