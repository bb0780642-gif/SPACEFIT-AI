/**
 * SPACEFIT AI — INTERACTIVE 3D DIGITAL TWIN ROOM SCENE
 * 
 * Main WebGL Canvas container integrating RoomMesh, DimensionOverlays3D,
 * CameraRig, Lighting, OrientationGizmo, and HUD Controls.
 */

import React, { useState, Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { AlertTriangle, Loader2, Plus, Undo2, Redo2, Armchair, Footprints } from 'lucide-react'
import type { RoomConfiguration, WallId } from '@/types/geometry'
import type { CameraViewMode, CutawayMode, SelectedItemState } from './types'
import type { MovementPathResult } from '@/types/movement'
import { buildRoom3DGeometry } from './roomGeometryBuilder'
import { RoomLighting } from './RoomLighting'
import { RoomMesh } from './RoomMesh'
import { DimensionOverlays3D } from './DimensionOverlays3D'
import { CameraRig } from './CameraRig'
import { OrientationGizmo } from './OrientationGizmo'
import { CameraControlsBar } from './CameraControlsBar'
import { FirstPersonControls } from './FirstPersonControls'
import { MovementPath3D } from './MovementPath3D'
import { WalkthroughHUD } from '@/components/movement/WalkthroughHUD'
import { getDoorEntrancePoint } from '@/utils/movement/pathfinding'
import type { PlacedFurniture, FurnitureCollisionIssue } from '@/types/furniture'

interface RoomScene3DProps {
  configuration: RoomConfiguration | null
  unit?: 'metres' | 'feet'
  selectedItem?: SelectedItemState
  furniture?: PlacedFurniture[]
  collisionIssues?: FurnitureCollisionIssue[]
  isWalkthroughActive?: boolean
  onToggleWalkthrough?: () => void
  onExitWalkthrough?: () => void
  movementPathResult?: MovementPathResult | null
  showMovementPath?: boolean
  onSelectWall?: (wallId: WallId) => void
  onSelectOpening?: (id: string, type: 'door' | 'window', wallId: WallId) => void
  onSelectFurniture?: (id: string) => void
  onSelectRoom?: () => void
  onOpenCatalog?: () => void
  canUndo?: boolean
  canRedo?: boolean
  onUndo?: () => void
  onRedo?: () => void
  className?: string
}

export const RoomScene3D: React.FC<RoomScene3DProps> = ({
  configuration,
  unit = 'metres',
  selectedItem = { type: null, id: null },
  furniture = [],
  collisionIssues = [],
  isWalkthroughActive = false,
  onToggleWalkthrough,
  onExitWalkthrough,
  movementPathResult = null,
  showMovementPath = true,
  onSelectWall,
  onSelectOpening,
  onSelectFurniture,
  onSelectRoom,
  onOpenCatalog,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  className = '',
}) => {
  const [cameraMode, setCameraMode] = useState<CameraViewMode>('perspective')
  const [cutawayMode, setCutawayMode] = useState<CutawayMode>('half')
  const [showDimensions, setShowDimensions] = useState(true)
  const [wireframe, setWireframe] = useState(false)
  const [resetTrigger, setResetTrigger] = useState(0)
  const [fitTrigger, setFitTrigger] = useState(0)

  // Walkthrough avatar state
  const entrancePos = useMemo<[number, number, number]>(() => {
    if (!configuration) return [0, 1.6, 0]
    const ep = getDoorEntrancePoint(configuration)
    return [ep.point.x, 1.6, ep.point.z]
  }, [configuration])

  const [avatarPos, setAvatarPos] = useState<[number, number, number]>(entrancePos)
  const [collidedObject, setCollidedObject] = useState<string | undefined>()

  const collisionCountsByItem = useMemo(() => {
    const counts: Record<string, number> = {}
    collisionIssues.forEach((issue) => {
      if (issue.severity === 'error') {
        counts[issue.furnitureId] = (counts[issue.furnitureId] || 0) + 1
      }
    })
    return counts
  }, [collisionIssues])

  const totalErrors = collisionIssues.filter((c) => c.severity === 'error').length

  // Validate geometry before building
  const isValidGeometry = Boolean(
    configuration &&
    configuration.widthMeters > 0 &&
    configuration.lengthMeters > 0 &&
    configuration.ceilingHeightMeters > 0
  )

  const geometryData = useMemo(() => {
    if (!isValidGeometry || !configuration) return null
    try {
      return buildRoom3DGeometry(configuration)
    } catch (e) {
      console.error('Failed to construct 3D geometry', e)
      return null
    }
  }, [configuration, isValidGeometry])

  // Empty / Invalid Geometry State
  if (!isValidGeometry || !geometryData || !configuration) {
    return (
      <div
        className={`w-full h-full min-h-[460px] rounded-3xl glass-panel bg-[#050811] border border-blue-500/20 flex flex-col items-center justify-center p-8 text-center ${className}`}
      >
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 animate-pulse">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Invalid or Incomplete Room Geometry</h3>
        <p className="text-xs text-slate-400 max-w-md leading-relaxed mb-6">
          The 3D Digital Twin requires valid room dimensions and boundary coordinates. Please review and update your room parameters in the Blueprint Studio.
        </p>
      </div>
    )
  }

  const gridSpan = Math.max(geometryData.width, geometryData.length) * 3

  return (
    <div
      className={`relative w-full h-full min-h-[500px] rounded-3xl overflow-hidden bg-gradient-to-b from-[#060A14] to-[#03060C] border border-blue-500/20 shadow-2xl select-none ${className}`}
    >
      {/* 1. TOP STATUS BADGE & FURNITURE ACTIONS */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass-panel bg-slate-950/80 border border-blue-500/20 text-xs font-mono backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white font-semibold">3D Digital Twin</span>
          <span className="text-slate-500">•</span>
          <span className="text-cyan-400">
            {configuration.widthMeters}m × {configuration.lengthMeters}m
          </span>
        </div>

        {/* Furniture count */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-panel bg-slate-950/80 border border-blue-500/20 text-xs font-mono text-slate-300">
          <Armchair className="w-3.5 h-3.5 text-blue-400" />
          <span>{furniture.length} Items</span>
        </div>

        {/* Collision badge if errors */}
        {totalErrors > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/30 border border-rose-500/50 text-rose-300 text-xs font-mono animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>{totalErrors} Collision{totalErrors > 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Add Furniture Button */}
        {onOpenCatalog && !isWalkthroughActive && (
          <button
            type="button"
            onClick={onOpenCatalog}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold shadow-lg shadow-blue-500/30 transition-all hover:scale-105"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Furniture</span>
          </button>
        )}

        {/* First-Person Walkthrough Toggle Button */}
        {onToggleWalkthrough && (
          <button
            type="button"
            onClick={onToggleWalkthrough}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shadow-md ${
              isWalkthroughActive
                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-cyan-500/40'
                : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/40 hover:scale-105'
            }`}
            title="Toggle First-Person 3D Walkthrough"
          >
            <Footprints className="w-3.5 h-3.5" />
            <span>{isWalkthroughActive ? 'Exit Walk' : 'Walkthrough'}</span>
          </button>
        )}

        {/* Undo / Redo controls */}
        {(onUndo || onRedo) && (
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-blue-500/20 text-xs font-mono">
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              className="p-1 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              className="p-1 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 2. TOP HUD CAMERA CONTROLS BAR */}
      <div className="absolute top-4 right-4 z-10 max-w-full">
        <CameraControlsBar
          cameraMode={cameraMode}
          onCameraModeChange={(m) => setCameraMode(m)}
          cutawayMode={cutawayMode}
          onCutawayModeChange={(c) => setCutawayMode(c)}
          showDimensions={showDimensions}
          onToggleDimensions={() => setShowDimensions((prev) => !prev)}
          wireframe={wireframe}
          onToggleWireframe={() => setWireframe((prev) => !prev)}
          onResetCamera={() => setResetTrigger((n) => n + 1)}
          onFitToRoom={() => setFitTrigger((n) => n + 1)}
        />
      </div>

      {/* 3. BOTTOM INTERACTION HINT */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-none hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-blue-500/15 text-[11px] font-mono text-slate-400 backdrop-blur-md">
        <span>Orbit: <strong className="text-slate-200">Left Click + Drag</strong></span>
        <span>•</span>
        <span>Pan: <strong className="text-slate-200">Right Click + Drag</strong></span>
        <span>•</span>
        <span>Zoom: <strong className="text-slate-200">Scroll</strong></span>
        <span>•</span>
        <span>Select: <strong className="text-cyan-300">Click Mesh</strong></span>
      </div>

      {/* 4. THREE.JS REACT THREE FIBER CANVAS */}
      <Suspense
        fallback={
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-slate-400 font-mono text-xs">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            <span>Generating 3D Digital Twin...</span>
          </div>
        }
      >
        <Canvas
          shadows
          camera={{
            position: [
              geometryData.width * 1.3,
              geometryData.ceilingHeight * 1.8,
              -geometryData.length * 1.4,
            ],
            fov: 45,
            near: 0.1,
            far: 1000,
          }}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
          }}
          onPointerMissed={() => {
            onSelectRoom?.()
          }}
        >
          <color attach="background" args={['#040711']} />

          {/* Architectural Studio Lighting */}
          <RoomLighting
            roomWidth={geometryData.width}
            roomLength={geometryData.length}
            ceilingHeight={geometryData.ceilingHeight}
          />

          {/* Ground Plane Grid */}
          <gridHelper
            args={[gridSpan, Math.round(gridSpan), '#1e293b', '#0b1120']}
            position={[0, -0.015, 0]}
          />

          {/* Primary 3D Room Mesh */}
          <RoomMesh
            geometryData={geometryData}
            selectedItem={selectedItem}
            cutawayMode={cutawayMode}
            wireframe={wireframe}
            furniture={furniture}
            collisionCountsByItem={collisionCountsByItem}
            onSelectWall={onSelectWall}
            onSelectOpening={onSelectOpening}
            onSelectFurniture={onSelectFurniture}
            onSelectRoom={onSelectRoom}
          />

          {/* Dimension Overlays */}
          <DimensionOverlays3D
            widthMeters={geometryData.width}
            lengthMeters={geometryData.length}
            ceilingHeightMeters={geometryData.ceilingHeight}
            unit={unit}
            visible={showDimensions}
          />

          {/* 3D Movement Circulation Path */}
          <MovementPath3D
            pathResult={movementPathResult}
            visible={showMovementPath}
          />

          {/* Camera Controls: First-Person Walkthrough or Orbit Camera Rig */}
          {isWalkthroughActive ? (
            <FirstPersonControls
              isActive={true}
              config={configuration}
              furniture={furniture}
              initialPosition={entrancePos}
              eyeHeight={1.6}
              onExit={onExitWalkthrough}
              onPositionChange={(pos) => setAvatarPos(pos)}
              onCollision={(obj) => setCollidedObject(obj)}
            />
          ) : (
            <CameraRig
              roomWidth={geometryData.width}
              roomLength={geometryData.length}
              ceilingHeight={geometryData.ceilingHeight}
              cameraMode={cameraMode}
              resetTrigger={resetTrigger}
              fitTrigger={fitTrigger}
            />
          )}

          {/* 3D Coordinate Orientation Gizmo */}
          {!isWalkthroughActive && <OrientationGizmo />}
        </Canvas>
      </Suspense>

      {/* 5. First-Person Walkthrough HUD Overlay */}
      <WalkthroughHUD
        isActive={isWalkthroughActive}
        onExit={() => onExitWalkthrough?.()}
        onResetToEntrance={() => setAvatarPos(entrancePos)}
        avatarPosition={avatarPos}
        collidingWith={collidedObject}
        unit={unit}
      />
    </div>
  )
}
