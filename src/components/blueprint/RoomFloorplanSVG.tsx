import React from 'react'
import type { RoomConfiguration } from '@/types/geometry'
import type { PlacedFurniture } from '@/types/furniture'
import type { MovementPathResult } from '@/types/movement'

interface RoomFloorplanSVGProps {
  configuration: RoomConfiguration
  furniture: PlacedFurniture[]
  movementPath?: MovementPathResult | null
  unit?: 'metres' | 'feet'
  className?: string
}

export const RoomFloorplanSVG: React.FC<RoomFloorplanSVGProps> = ({
  configuration,
  furniture,
  movementPath,
  className = '',
}) => {
  const { widthMeters, lengthMeters, doors = [], windows = [] } = configuration

  // SVG coordinate system:
  // Margin for walls & dimensions: 0.5m
  const margin = 0.6
  const totalW = widthMeters + margin * 2
  const totalL = lengthMeters + margin * 2

  // Transform world (x: [-w/2, w/2], z: [-l/2, l/2]) to SVG (0,0 at top-left)
  // In 3D: -z is towards North, +z is towards South (or vice versa)
  // Let's map x: -w/2 -> margin, +w/2 -> margin + widthMeters
  // z: -l/2 -> margin, +l/2 -> margin + lengthMeters
  const toSvgX = (x: number) => margin + (x + widthMeters / 2)
  const toSvgY = (z: number) => margin + (z + lengthMeters / 2)

  const scale = 80 // pixels per meter for internal viewBox
  const vbWidth = totalW * scale
  const vbHeight = totalL * scale

  return (
    <svg
      viewBox={`0 0 ${vbWidth} ${vbHeight}`}
      className={`w-full h-full max-h-[420px] select-none ${className}`}
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* Subtle grid pattern */}
        <pattern id="gridPattern" width={scale * 0.5} height={scale * 0.5} patternUnits="userSpaceOnUse">
          <path
            d={`M ${scale * 0.5} 0 L 0 0 0 ${scale * 0.5}`}
            fill="none"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="1"
          />
        </pattern>
      </defs>

      {/* 1. Room Floor Background with Grid */}
      <rect
        x={margin * scale}
        y={margin * scale}
        width={widthMeters * scale}
        height={lengthMeters * scale}
        fill="#0f172a"
        stroke="#334155"
        strokeWidth="3"
        rx="4"
      />
      <rect
        x={margin * scale}
        y={margin * scale}
        width={widthMeters * scale}
        height={lengthMeters * scale}
        fill="url(#gridPattern)"
      />

      {/* 2. Openings (Doors & Windows) */}
      {doors.map((door) => {
        const wallId = (door.wallId || (door as any).wall || 'South') as string
        let dx = margin
        let dy = margin
        let dw = door.widthMeters * scale
        let dh = 6

        if (wallId === 'North') {
          dx = (margin + door.offsetMeters) * scale
          dy = margin * scale - 3
        } else if (wallId === 'South') {
          dx = (margin + door.offsetMeters) * scale
          dy = (margin + lengthMeters) * scale - 3
        } else if (wallId === 'East') {
          dx = (margin + widthMeters) * scale - 3
          dy = (margin + door.offsetMeters) * scale
          dw = 6
          dh = door.widthMeters * scale
        } else if (wallId === 'West') {
          dx = margin * scale - 3
          dy = (margin + door.offsetMeters) * scale
          dw = 6
          dh = door.widthMeters * scale
        }

        return (
          <g key={door.id}>
            <rect
              x={dx}
              y={dy}
              width={dw}
              height={dh}
              fill="#10b981"
              stroke="#059669"
              strokeWidth="1"
              rx="2"
            />
          </g>
        )
      })}

      {windows.map((win) => {
        const wallId = (win.wallId || (win as any).wall || 'East') as string
        let wx = margin
        let wy = margin
        let ww = win.widthMeters * scale
        let wh = 6

        if (wallId === 'North') {
          wx = (margin + win.offsetMeters) * scale
          wy = margin * scale - 3
        } else if (wallId === 'South') {
          wx = (margin + win.offsetMeters) * scale
          wy = (margin + lengthMeters) * scale - 3
        } else if (wallId === 'East') {
          wx = (margin + widthMeters) * scale - 3
          wy = (margin + win.offsetMeters) * scale
          ww = 6
          wh = win.widthMeters * scale
        } else if (wallId === 'West') {
          wx = margin * scale - 3
          wy = (margin + win.offsetMeters) * scale
          ww = 6
          wh = win.widthMeters * scale
        }

        return (
          <g key={win.id}>
            <rect
              x={wx}
              y={wy}
              width={ww}
              height={wh}
              fill="#38bdf8"
              stroke="#0284c7"
              strokeWidth="1"
              rx="2"
            />
          </g>
        )
      })}

      {/* 3. Movement Path Route Overlay (if provided) */}
      {movementPath && movementPath.waypoints.length >= 2 && (
        <g name="MovementPathSvg">
          {/* Path line */}
          <polyline
            points={movementPath.waypoints
              .map((wp) => `${toSvgX(wp.x) * scale},${toSvgY(wp.z) * scale}`)
              .join(' ')}
            fill="none"
            stroke={movementPath.isFeasible ? '#06b6d4' : '#f59e0b'}
            strokeWidth="3.5"
            strokeDasharray="6,4"
            opacity="0.85"
          />
          {/* Start Point Pin */}
          <circle
            cx={toSvgX(movementPath.startPoint.x) * scale}
            cy={toSvgY(movementPath.startPoint.z) * scale}
            r="6"
            fill="#10b981"
            stroke="#ffffff"
            strokeWidth="2"
          />
          {/* Goal Point Pin */}
          <circle
            cx={toSvgX(movementPath.destinationPoint.x) * scale}
            cy={toSvgY(movementPath.destinationPoint.z) * scale}
            r="6"
            fill="#06b6d4"
            stroke="#ffffff"
            strokeWidth="2"
          />
        </g>
      )}

      {/* 4. Placed Furniture Silhouettes & Labels */}
      {furniture.map((item) => {
        const itemW = item.dimensions.widthMeters * scale
        const itemL = item.dimensions.lengthMeters * scale
        const cx = toSvgX(item.position[0]) * scale
        const cy = toSvgY(item.position[2]) * scale
        const rotDeg = (item.rotationY * 180) / Math.PI

        return (
          <g
            key={item.id}
            transform={`translate(${cx}, ${cy}) rotate(${rotDeg})`}
          >
            {/* Furniture Footprint Box */}
            <rect
              x={-itemW / 2}
              y={-itemL / 2}
              width={itemW}
              height={itemL}
              fill={item.color || '#334155'}
              fillOpacity="0.8"
              stroke="#64748b"
              strokeWidth="1.5"
              rx="3"
            />
            {/* Front indicator line */}
            <line
              x1={-itemW / 2 + 4}
              y1={-itemL / 2 + 3}
              x2={itemW / 2 - 4}
              y2={-itemL / 2 + 3}
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="2"
            />
            {/* Label (if wide enough) */}
            {itemW > 30 && itemL > 20 && (
              <text
                x="0"
                y="3"
                textAnchor="middle"
                fontSize="9"
                fontWeight="600"
                fill="#f8fafc"
                className="select-none pointer-events-none"
              >
                {item.name.length > 14 ? item.name.substring(0, 12) + '..' : item.name}
              </text>
            )}
          </g>
        )
      })}

      {/* 5. Dimension Dimensioners */}
      <text
        x={(margin + widthMeters / 2) * scale}
        y={margin * scale - 12}
        textAnchor="middle"
        fontSize="11"
        fontWeight="600"
        fill="#94a3b8"
      >
        {widthMeters}m
      </text>
      <text
        x={margin * scale - 12}
        y={(margin + lengthMeters / 2) * scale}
        textAnchor="middle"
        fontSize="11"
        fontWeight="600"
        fill="#94a3b8"
        transform={`rotate(-90, ${margin * scale - 12}, ${(margin + lengthMeters / 2) * scale})`}
      >
        {lengthMeters}m
      </text>
    </svg>
  )
}
