import React, { useState, useRef, useMemo } from 'react'
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Compass
} from 'lucide-react'
import type { 
  WallId, 
  RoomConfiguration, 
  RoomValidationError 
} from '@/types/geometry'
import type { MeasurementUnit } from '@/types/project'
import { metersToFeet } from '@/utils/geometry'
import { Badge } from '@/components/common/Badge'

export interface RoomBlueprint2DProps {
  configuration: RoomConfiguration
  unit: MeasurementUnit
  selectedWallId: WallId | null
  selectedOpeningId: string | null
  onSelectWall: (wallId: WallId) => void
  onSelectOpening: (openingId: string, type: 'door' | 'window') => void
  onUpdateDoorOffset?: (doorId: string, newOffsetMeters: number) => void
  onUpdateWindowOffset?: (windowId: string, newOffsetMeters: number) => void
  validationErrors?: RoomValidationError[]
}

export const RoomBlueprint2D: React.FC<RoomBlueprint2DProps> = ({
  configuration,
  unit,
  selectedWallId,
  selectedOpeningId,
  onSelectWall,
  onSelectOpening,
  onUpdateDoorOffset,
  onUpdateWindowOffset,
  validationErrors = [],
}) => {
  const [zoom, setZoom] = useState(1.0)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [draggingOpening, setDraggingOpening] = useState<{
    id: string
    type: 'door' | 'window'
    wallId: WallId
    startOffset: number
    startMouseCoord: number
    wallPixelLength: number
    wallMeterLength: number
  } | null>(null)

  const svgRef = useRef<SVGSVGElement>(null)

  const { widthMeters, lengthMeters, wallThicknessMeters, doors, windows } = configuration

  // Dimensions formatted in display units
  const formatDim = (meters: number) => {
    if (unit === 'feet') {
      return `${metersToFeet(meters).toFixed(1)} ft`
    }
    return `${meters.toFixed(2)} m`
  }

  // SVG Viewport Sizing & Canvas Scale
  // In our coordinates:
  // Width is horizontal (X), Length is vertical (Z, rendered as Y on screen)
  // Let's allocate 650x550 virtual SVG canvas space with 70px padding for dimension lines
  const PADDING = 75
  const CANVAS_WIDTH = 700
  const CANVAS_HEIGHT = 560

  const innerWidth = CANVAS_WIDTH - 2 * PADDING
  const innerHeight = CANVAS_HEIGHT - 2 * PADDING

  // Calculate scaling factor to fit room into viewport maintaining aspect ratio
  const scale = useMemo(() => {
    const scaleX = innerWidth / widthMeters
    const scaleZ = innerHeight / lengthMeters
    return Math.min(scaleX, scaleZ) * 0.92
  }, [innerWidth, innerHeight, widthMeters, lengthMeters])

  const roomPixelWidth = widthMeters * scale
  const roomPixelLength = lengthMeters * scale
  const wallThicknessPx = Math.max(8, wallThicknessMeters * scale)

  // Center room inside SVG canvas
  const roomOriginX = (CANVAS_WIDTH - roomPixelWidth) / 2
  const roomOriginY = (CANVAS_HEIGHT - roomPixelLength) / 2

  // Wall lengths in meters
  const wallLengths: Record<WallId, number> = {
    North: widthMeters,
    South: widthMeters,
    East: lengthMeters,
    West: lengthMeters,
  }

  // Wall coordinates in SVG space:
  // North: Top horizontal wall (Y = roomOriginY), from X=roomOriginX to X=roomOriginX + roomPixelWidth
  // South: Bottom horizontal wall (Y = roomOriginY + roomPixelLength), from X=roomOriginX to X=roomOriginX + roomPixelWidth
  // East: Right vertical wall (X = roomOriginX + roomPixelWidth), from Y=roomOriginY to Y=roomOriginY + roomPixelLength
  // West: Left vertical wall (X = roomOriginX), from Y=roomOriginY to Y=roomOriginY + roomPixelLength

  // Handlers for Opening Dragging along wall
  const handleOpeningMouseDown = (
    e: React.MouseEvent,
    id: string,
    type: 'door' | 'window',
    wallId: WallId,
    currentOffset: number
  ) => {
    e.stopPropagation()
    onSelectOpening(id, type)

    const isHorizontal = wallId === 'North' || wallId === 'South'
    const startMouseCoord = isHorizontal ? e.clientX : e.clientY
    const wallPixelLength = isHorizontal ? roomPixelWidth : roomPixelLength
    const wallMeterLength = wallLengths[wallId]

    setDraggingOpening({
      id,
      type,
      wallId,
      startOffset: currentOffset,
      startMouseCoord,
      wallPixelLength,
      wallMeterLength,
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingOpening) {
      const isHorizontal = draggingOpening.wallId === 'North' || draggingOpening.wallId === 'South'
      const currentMouseCoord = isHorizontal ? e.clientX : e.clientY
      const pixelDelta = (currentMouseCoord - draggingOpening.startMouseCoord) / zoom
      
      // Calculate meter delta
      const meterDelta = (pixelDelta / draggingOpening.wallPixelLength) * draggingOpening.wallMeterLength

      // Re-calculate target offset with bounds
      const openingObj =
        draggingOpening.type === 'door'
          ? doors.find((d) => d.id === draggingOpening.id)
          : windows.find((w) => w.id === draggingOpening.id)

      if (openingObj) {
        const openingWidth = openingObj.widthMeters
        const maxOffset = draggingOpening.wallMeterLength - openingWidth
        const rawNewOffset = draggingOpening.startOffset + meterDelta
        const clampedOffset = Math.max(0, Math.min(maxOffset, Number(rawNewOffset.toFixed(2))))

        if (draggingOpening.type === 'door' && onUpdateDoorOffset) {
          onUpdateDoorOffset(draggingOpening.id, clampedOffset)
        } else if (draggingOpening.type === 'window' && onUpdateWindowOffset) {
          onUpdateWindowOffset(draggingOpening.id, clampedOffset)
        }
      }
    } else if (isPanning) {
      setPan({
        x: pan.x + (e.clientX - dragStart.x),
        y: pan.y + (e.clientY - dragStart.y),
      })
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseUp = () => {
    setDraggingOpening(null)
    setIsPanning(false)
  }

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsPanning(true)
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }

  // Check if an opening or wall has validation errors
  const hasOpeningError = (id: string) => validationErrors.some((e) => e.openingId === id)
  const hasWallError = (wallId: WallId) => validationErrors.some((e) => e.wallId === wallId)

  return (
    <div className="relative w-full h-full flex flex-col bg-[#070B14] rounded-2xl border border-blue-500/20 overflow-hidden select-none">
      {/* Blueprint Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-[#090E1A]/90 border-b border-blue-500/15 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <Badge variant="blue" className="text-[10px]">
            2D CAD Blueprint
          </Badge>
          <span className="text-xs font-mono text-slate-300">
            Scale: 1:{Math.round(100 / (scale / 100))} (Metric Ground Plane)
          </span>
        </div>

        {/* Zoom & Reset Controls */}
        <div className="flex items-center gap-1.5 bg-[#070B14] p-1 rounded-xl border border-blue-500/20">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(2.0, z + 0.15))}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Zoom In"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono text-slate-400 px-1.5">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Zoom Out"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-blue-500/20 my-auto" />
          <button
            type="button"
            onClick={() => {
              setZoom(1.0)
              setPan({ x: 0, y: 0 })
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Reset Canvas View"
            aria-label="Reset zoom and pan"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Blueprint SVG Surface */}
      <div
        className="relative flex-1 w-full min-h-[420px] sm:min-h-[500px] overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing"
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
          className="w-full h-full"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isPanning || draggingOpening ? 'none' : 'transform 0.15s ease-out',
          }}
        >
          <defs>
            {/* Technical grid pattern */}
            <pattern id="blueprint-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(59, 130, 246, 0.08)" strokeWidth="0.8" />
            </pattern>
            <pattern id="blueprint-grid-major" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(59, 130, 246, 0.18)" strokeWidth="1.2" />
            </pattern>
            {/* Arrow marker for dimension lines */}
            <marker id="dim-arrow-start" viewBox="0 0 10 10" refX="0" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 10 0 L 0 5 L 10 10 z" fill="#60A5FA" />
            </marker>
            <marker id="dim-arrow-end" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#60A5FA" />
            </marker>
          </defs>

          {/* Grid Background */}
          <rect width="100%" height="100%" fill="#070B14" />
          <rect width="100%" height="100%" fill="url(#blueprint-grid)" />
          <rect width="100%" height="100%" fill="url(#blueprint-grid-major)" />

          {/* Room Floor Plane */}
          <rect
            x={roomOriginX}
            y={roomOriginY}
            width={roomPixelWidth}
            height={roomPixelLength}
            fill="#0B1326"
            fillOpacity="0.8"
            className="transition-colors duration-200"
          />

          {/* Architectural Room Floor Grid */}
          <g opacity="0.3">
            {Array.from({ length: Math.floor(widthMeters) }).map((_, i) => (
              <line
                key={`floor-grid-x-${i}`}
                x1={roomOriginX + (i + 1) * scale}
                y1={roomOriginY}
                x2={roomOriginX + (i + 1) * scale}
                y2={roomOriginY + roomPixelLength}
                stroke="#3B82F6"
                strokeWidth="0.75"
                strokeDasharray="4 4"
              />
            ))}
            {Array.from({ length: Math.floor(lengthMeters) }).map((_, j) => (
              <line
                key={`floor-grid-z-${j}`}
                x1={roomOriginX}
                y1={roomOriginY + (j + 1) * scale}
                x2={roomOriginX + roomPixelWidth}
                y2={roomOriginY + (j + 1) * scale}
                stroke="#3B82F6"
                strokeWidth="0.75"
                strokeDasharray="4 4"
              />
            ))}
          </g>

          {/* ======================================================== */}
          {/* WALLS & WALL SELECTION HIT AREAS */}
          {/* ======================================================== */}

          {/* 1. NORTH WALL (Top) */}
          <g
            onClick={() => onSelectWall('North')}
            className="cursor-pointer group"
          >
            <rect
              x={roomOriginX - wallThicknessPx / 2}
              y={roomOriginY - wallThicknessPx / 2}
              width={roomPixelWidth + wallThicknessPx}
              height={wallThicknessPx}
              fill={selectedWallId === 'North' ? '#3B82F6' : '#1E293B'}
              stroke={hasWallError('North') ? '#EF4444' : selectedWallId === 'North' ? '#60A5FA' : '#334155'}
              strokeWidth={selectedWallId === 'North' ? '2.5' : '1.5'}
              rx="2"
            />
            {/* Wall Label */}
            <text
              x={roomOriginX + roomPixelWidth / 2}
              y={roomOriginY - wallThicknessPx - 8}
              textAnchor="middle"
              className={`text-[11px] font-mono font-bold tracking-wider ${
                selectedWallId === 'North' ? 'fill-blue-400' : 'fill-slate-400'
              }`}
            >
              NORTH WALL ({formatDim(widthMeters)})
            </text>
          </g>

          {/* 2. SOUTH WALL (Bottom) */}
          <g
            onClick={() => onSelectWall('South')}
            className="cursor-pointer group"
          >
            <rect
              x={roomOriginX - wallThicknessPx / 2}
              y={roomOriginY + roomPixelLength - wallThicknessPx / 2}
              width={roomPixelWidth + wallThicknessPx}
              height={wallThicknessPx}
              fill={selectedWallId === 'South' ? '#3B82F6' : '#1E293B'}
              stroke={hasWallError('South') ? '#EF4444' : selectedWallId === 'South' ? '#60A5FA' : '#334155'}
              strokeWidth={selectedWallId === 'South' ? '2.5' : '1.5'}
              rx="2"
            />
            <text
              x={roomOriginX + roomPixelWidth / 2}
              y={roomOriginY + roomPixelLength + wallThicknessPx + 18}
              textAnchor="middle"
              className={`text-[11px] font-mono font-bold tracking-wider ${
                selectedWallId === 'South' ? 'fill-blue-400' : 'fill-slate-400'
              }`}
            >
              SOUTH WALL ({formatDim(widthMeters)})
            </text>
          </g>

          {/* 3. WEST WALL (Left) */}
          <g
            onClick={() => onSelectWall('West')}
            className="cursor-pointer group"
          >
            <rect
              x={roomOriginX - wallThicknessPx / 2}
              y={roomOriginY - wallThicknessPx / 2}
              width={wallThicknessPx}
              height={roomPixelLength + wallThicknessPx}
              fill={selectedWallId === 'West' ? '#3B82F6' : '#1E293B'}
              stroke={hasWallError('West') ? '#EF4444' : selectedWallId === 'West' ? '#60A5FA' : '#334155'}
              strokeWidth={selectedWallId === 'West' ? '2.5' : '1.5'}
              rx="2"
            />
            <text
              x={roomOriginX - wallThicknessPx - 16}
              y={roomOriginY + roomPixelLength / 2}
              textAnchor="middle"
              transform={`rotate(-90 ${roomOriginX - wallThicknessPx - 16} ${roomOriginY + roomPixelLength / 2})`}
              className={`text-[11px] font-mono font-bold tracking-wider ${
                selectedWallId === 'West' ? 'fill-blue-400' : 'fill-slate-400'
              }`}
            >
              WEST WALL ({formatDim(lengthMeters)})
            </text>
          </g>

          {/* 4. EAST WALL (Right) */}
          <g
            onClick={() => onSelectWall('East')}
            className="cursor-pointer group"
          >
            <rect
              x={roomOriginX + roomPixelWidth - wallThicknessPx / 2}
              y={roomOriginY - wallThicknessPx / 2}
              width={wallThicknessPx}
              height={roomPixelLength + wallThicknessPx}
              fill={selectedWallId === 'East' ? '#3B82F6' : '#1E293B'}
              stroke={hasWallError('East') ? '#EF4444' : selectedWallId === 'East' ? '#60A5FA' : '#334155'}
              strokeWidth={selectedWallId === 'East' ? '2.5' : '1.5'}
              rx="2"
            />
            <text
              x={roomOriginX + roomPixelWidth + wallThicknessPx + 16}
              y={roomOriginY + roomPixelLength / 2}
              textAnchor="middle"
              transform={`rotate(90 ${roomOriginX + roomPixelWidth + wallThicknessPx + 16} ${roomOriginY + roomPixelLength / 2})`}
              className={`text-[11px] font-mono font-bold tracking-wider ${
                selectedWallId === 'East' ? 'fill-blue-400' : 'fill-slate-400'
              }`}
            >
              EAST WALL ({formatDim(lengthMeters)})
            </text>
          </g>

          {/* ======================================================== */}
          {/* WINDOW OPENINGS (Rendered with distinct cyan glass lines) */}
          {/* ======================================================== */}
          {windows.map((win) => {
            const isSelected = selectedOpeningId === win.id
            const isError = hasOpeningError(win.id)
            const winWidthPx = win.widthMeters * scale
            const winOffsetPx = win.offsetMeters * scale

            let x = 0
            let y = 0
            let w = 0
            let h = 0

            if (win.wallId === 'North') {
              x = roomOriginX + winOffsetPx
              y = roomOriginY - wallThicknessPx / 2
              w = winWidthPx
              h = wallThicknessPx
            } else if (win.wallId === 'South') {
              x = roomOriginX + winOffsetPx
              y = roomOriginY + roomPixelLength - wallThicknessPx / 2
              w = winWidthPx
              h = wallThicknessPx
            } else if (win.wallId === 'West') {
              x = roomOriginX - wallThicknessPx / 2
              y = roomOriginY + winOffsetPx
              w = wallThicknessPx
              h = winWidthPx
            } else if (win.wallId === 'East') {
              x = roomOriginX + roomPixelWidth - wallThicknessPx / 2
              y = roomOriginY + winOffsetPx
              w = wallThicknessPx
              h = winWidthPx
            }

            return (
              <g
                key={win.id}
                onMouseDown={(e) =>
                  handleOpeningMouseDown(e, win.id, 'window', win.wallId, win.offsetMeters)
                }
                className="cursor-pointer"
              >
                {/* Wall Opening Cutout */}
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  fill="#070B14"
                  stroke={isError ? '#EF4444' : isSelected ? '#06B6D4' : '#0891B2'}
                  strokeWidth={isSelected ? '2.5' : '1.5'}
                />

                {/* Double Glazing Glass Lines */}
                {win.wallId === 'North' || win.wallId === 'South' ? (
                  <>
                    <line
                      x1={x}
                      y1={y + h * 0.35}
                      x2={x + w}
                      y2={y + h * 0.35}
                      stroke="#22D3EE"
                      strokeWidth="1.5"
                    />
                    <line
                      x1={x}
                      y1={y + h * 0.65}
                      x2={x + w}
                      y2={y + h * 0.65}
                      stroke="#22D3EE"
                      strokeWidth="1.5"
                    />
                  </>
                ) : (
                  <>
                    <line
                      x1={x + w * 0.35}
                      y1={y}
                      x2={x + w * 0.35}
                      y2={y + h}
                      stroke="#22D3EE"
                      strokeWidth="1.5"
                    />
                    <line
                      x1={x + w * 0.65}
                      y1={y}
                      x2={x + w * 0.65}
                      y2={y + h}
                      stroke="#22D3EE"
                      strokeWidth="1.5"
                    />
                  </>
                )}

                {/* Window Label Tag */}
                <text
                  x={x + w / 2}
                  y={win.wallId === 'South' ? y - 6 : y + h + 14}
                  textAnchor="middle"
                  className={`text-[9px] font-mono font-semibold ${
                    isError ? 'fill-rose-400' : isSelected ? 'fill-cyan-300' : 'fill-cyan-400/80'
                  }`}
                >
                  {win.name} ({formatDim(win.widthMeters)})
                </text>
              </g>
            )
          })}

          {/* ======================================================== */}
          {/* DOOR OPENINGS & SWING ARCS */}
          {/* ======================================================== */}
          {doors.map((door) => {
            const isSelected = selectedOpeningId === door.id
            const isError = hasOpeningError(door.id)
            const doorWidthPx = door.widthMeters * scale
            const doorOffsetPx = door.offsetMeters * scale

            let x = 0
            let y = 0
            let w = 0
            let h = 0

            if (door.wallId === 'South') {
              x = roomOriginX + doorOffsetPx
              y = roomOriginY + roomPixelLength - wallThicknessPx / 2
              w = doorWidthPx
              h = wallThicknessPx
            } else if (door.wallId === 'North') {
              x = roomOriginX + doorOffsetPx
              y = roomOriginY - wallThicknessPx / 2
              w = doorWidthPx
              h = wallThicknessPx
            } else if (door.wallId === 'West') {
              x = roomOriginX - wallThicknessPx / 2
              y = roomOriginY + doorOffsetPx
              w = wallThicknessPx
              h = doorWidthPx
            } else if (door.wallId === 'East') {
              x = roomOriginX + roomPixelWidth - wallThicknessPx / 2
              y = roomOriginY + doorOffsetPx
              w = wallThicknessPx
              h = doorWidthPx
            }

            // Door Leaf & Swing Arc Geometry
            const isRightSwing = door.swingDirection.includes('right')
            const isInward = door.swingDirection.includes('inward')

            return (
              <g
                key={door.id}
                onMouseDown={(e) =>
                  handleOpeningMouseDown(e, door.id, 'door', door.wallId, door.offsetMeters)
                }
                className="cursor-pointer"
              >
                {/* Wall Opening Cutout */}
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  fill="#070B14"
                  stroke={isError ? '#EF4444' : isSelected ? '#10B981' : '#059669'}
                  strokeWidth={isSelected ? '2.5' : '1.5'}
                />

                {/* Door Leaf (drawn line) and Swing Arc (dashed 90-degree quadrant) */}
                {door.wallId === 'South' && (
                  <g>
                    {/* Hinge at left or right */}
                    <line
                      x1={isRightSwing ? x + w : x}
                      y1={y}
                      x2={isRightSwing ? x + w : x}
                      y2={isInward ? y - w : y + h + w}
                      stroke="#10B981"
                      strokeWidth="2"
                    />
                    {/* Quarter circle swing path */}
                    <path
                      d={
                        isRightSwing
                          ? `M ${x} ${y} A ${w} ${w} 0 0 1 ${x + w} ${isInward ? y - w : y + h + w}`
                          : `M ${x + w} ${y} A ${w} ${w} 0 0 0 ${x} ${isInward ? y - w : y + h + w}`
                      }
                      fill="rgba(16, 185, 129, 0.08)"
                      stroke="#10B981"
                      strokeWidth="1.2"
                      strokeDasharray="3 3"
                    />
                  </g>
                )}

                {door.wallId === 'North' && (
                  <g>
                    <line
                      x1={isRightSwing ? x + w : x}
                      y1={y + h}
                      x2={isRightSwing ? x + w : x}
                      y2={isInward ? y + h + w : y - w}
                      stroke="#10B981"
                      strokeWidth="2"
                    />
                    <path
                      d={
                        isRightSwing
                          ? `M ${x} ${y + h} A ${w} ${w} 0 0 0 ${x + w} ${isInward ? y + h + w : y - w}`
                          : `M ${x + w} ${y + h} A ${w} ${w} 0 0 1 ${x} ${isInward ? y + h + w : y - w}`
                      }
                      fill="rgba(16, 185, 129, 0.08)"
                      stroke="#10B981"
                      strokeWidth="1.2"
                      strokeDasharray="3 3"
                    />
                  </g>
                )}

                {door.wallId === 'West' && (
                  <g>
                    <line
                      x1={x + w}
                      y1={isRightSwing ? y + h : y}
                      x2={isInward ? x + w + h : x - h}
                      y2={isRightSwing ? y + h : y}
                      stroke="#10B981"
                      strokeWidth="2"
                    />
                    <path
                      d={
                        isRightSwing
                          ? `M ${x + w} ${y} A ${h} ${h} 0 0 1 ${isInward ? x + w + h : x - h} ${y + h}`
                          : `M ${x + w} ${y + h} A ${h} ${h} 0 0 0 ${isInward ? x + w + h : x - h} ${y}`
                      }
                      fill="rgba(16, 185, 129, 0.08)"
                      stroke="#10B981"
                      strokeWidth="1.2"
                      strokeDasharray="3 3"
                    />
                  </g>
                )}

                {door.wallId === 'East' && (
                  <g>
                    <line
                      x1={x}
                      y1={isRightSwing ? y + h : y}
                      x2={isInward ? x - h : x + w + h}
                      y2={isRightSwing ? y + h : y}
                      stroke="#10B981"
                      strokeWidth="2"
                    />
                    <path
                      d={
                        isRightSwing
                          ? `M ${x} ${y} A ${h} ${h} 0 0 0 ${isInward ? x - h : x + w + h} ${y + h}`
                          : `M ${x} ${y + h} A ${h} ${h} 0 0 1 ${isInward ? x - h : x + w + h} ${y}`
                      }
                      fill="rgba(16, 185, 129, 0.08)"
                      stroke="#10B981"
                      strokeWidth="1.2"
                      strokeDasharray="3 3"
                    />
                  </g>
                )}

                {/* Door Label Tag */}
                <text
                  x={x + w / 2}
                  y={door.wallId === 'South' ? y + h + 14 : y - 6}
                  textAnchor="middle"
                  className={`text-[9px] font-mono font-semibold ${
                    isError ? 'fill-rose-400' : isSelected ? 'fill-emerald-300' : 'fill-emerald-400/80'
                  }`}
                >
                  {door.name} ({formatDim(door.widthMeters)})
                </text>
              </g>
            )
          })}

          {/* ======================================================== */}
          {/* EXTERNAL DIMENSION MEASUREMENT GUIDES */}
          {/* ======================================================== */}
          {/* North Width Dimension Line */}
          <g>
            <line
              x1={roomOriginX}
              y1={roomOriginY - 32}
              x2={roomOriginX + roomPixelWidth}
              y2={roomOriginY - 32}
              stroke="#60A5FA"
              strokeWidth="1"
              markerStart="url(#dim-arrow-start)"
              markerEnd="url(#dim-arrow-end)"
            />
            <rect
              x={roomOriginX + roomPixelWidth / 2 - 32}
              y={roomOriginY - 40}
              width="64"
              height="16"
              fill="#070B14"
              rx="3"
            />
            <text
              x={roomOriginX + roomPixelWidth / 2}
              y={roomOriginY - 28}
              textAnchor="middle"
              className="text-[10px] font-mono font-bold fill-blue-300"
            >
              {formatDim(widthMeters)}
            </text>
          </g>

          {/* West Length Dimension Line */}
          <g>
            <line
              x1={roomOriginX - 32}
              y1={roomOriginY}
              x2={roomOriginX - 32}
              y2={roomOriginY + roomPixelLength}
              stroke="#60A5FA"
              strokeWidth="1"
              markerStart="url(#dim-arrow-start)"
              markerEnd="url(#dim-arrow-end)"
            />
            <rect
              x={roomOriginX - 44}
              y={roomOriginY + roomPixelLength / 2 - 8}
              width="24"
              height="16"
              fill="#070B14"
              rx="3"
            />
            <text
              x={roomOriginX - 32}
              y={roomOriginY + roomPixelLength / 2 + 4}
              textAnchor="middle"
              transform={`rotate(-90 ${roomOriginX - 32} ${roomOriginY + roomPixelLength / 2 + 4})`}
              className="text-[10px] font-mono font-bold fill-blue-300"
            >
              {formatDim(lengthMeters)}
            </text>
          </g>
        </svg>

        {/* Blueprint Floating Legend */}
        <div className="absolute bottom-3 left-3 glass-dropdown p-2.5 rounded-xl border border-blue-500/20 text-[10px] font-mono flex items-center gap-4 text-slate-300 shadow-xl pointer-events-none">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-slate-600 rounded" />
            <span>Wall (15cm)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-emerald-500 rounded" />
            <span>Door & Arc</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-cyan-400 rounded" />
            <span>Window Glazing</span>
          </div>
          <div className="flex items-center gap-1.5 text-blue-400">
            <Compass className="w-3 h-3" />
            <span>Origin at SW (0,0)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
