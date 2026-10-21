/**
 * SPACEFIT AI — 3D DIMENSION & MEASUREMENT OVERLAYS
 * 
 * Renders architectural CAD dimension ticks, measurement lines,
 * and high-contrast numerical badges aligned with the 3D room perimeter.
 */

import React from 'react'
import { Html } from '@react-three/drei'
import { metersToFeet } from '@/utils/geometry'

interface DimensionOverlays3DProps {
  widthMeters: number
  lengthMeters: number
  ceilingHeightMeters: number
  unit: 'metres' | 'feet'
  visible: boolean
}

export const DimensionOverlays3D: React.FC<DimensionOverlays3DProps> = ({
  widthMeters,
  lengthMeters,
  ceilingHeightMeters,
  unit,
  visible,
}) => {
  if (!visible) return null

  const halfW = widthMeters / 2
  const halfL = lengthMeters / 2
  const H = ceilingHeightMeters
  const offset = 0.45

  const formatDim = (meters: number) => {
    if (unit === 'feet') {
      return `${metersToFeet(meters).toFixed(1)} ft`
    }
    return `${meters.toFixed(2)} m`
  }

  return (
    <group position={[0, 0, 0]}>
      {/* 1. ROOM WIDTH DIMENSION (South Edge) */}
      <group position={[0, 0.05, -halfL - offset]}>
        {/* Main Line */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[widthMeters, 0.015, 0.015]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        {/* West Tick */}
        <mesh position={[-halfW, 0, 0]}>
          <boxGeometry args={[0.015, 0.015, 0.15]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        {/* East Tick */}
        <mesh position={[halfW, 0, 0]}>
          <boxGeometry args={[0.015, 0.015, 0.15]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>

        {/* Floating Width Badge */}
        <Html position={[0, 0.15, 0]} center distanceFactor={12}>
          <div className="px-2.5 py-1 rounded-full bg-slate-900/90 border border-cyan-500/40 text-cyan-300 font-mono text-[11px] font-bold shadow-lg shadow-cyan-950/40 backdrop-blur-md whitespace-nowrap select-none pointer-events-none">
            ↔ Width: {formatDim(widthMeters)}
          </div>
        </Html>
      </group>

      {/* 2. ROOM LENGTH DIMENSION (West Edge) */}
      <group position={[-halfW - offset, 0.05, 0]}>
        {/* Main Line */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.015, 0.015, lengthMeters]} />
          <meshBasicMaterial color="#818cf8" />
        </mesh>
        {/* South Tick */}
        <mesh position={[0, 0, -halfL]}>
          <boxGeometry args={[0.15, 0.015, 0.015]} />
          <meshBasicMaterial color="#818cf8" />
        </mesh>
        {/* North Tick */}
        <mesh position={[0, 0, halfL]}>
          <boxGeometry args={[0.15, 0.015, 0.015]} />
          <meshBasicMaterial color="#818cf8" />
        </mesh>

        {/* Floating Length Badge */}
        <Html position={[-0.15, 0.15, 0]} center distanceFactor={12}>
          <div className="px-2.5 py-1 rounded-full bg-slate-900/90 border border-indigo-500/40 text-indigo-300 font-mono text-[11px] font-bold shadow-lg shadow-indigo-950/40 backdrop-blur-md whitespace-nowrap select-none pointer-events-none">
            ↕ Length: {formatDim(lengthMeters)}
          </div>
        </Html>
      </group>

      {/* 3. CEILING HEIGHT DIMENSION (Vertical SW Corner) */}
      <group position={[-halfW - offset, H / 2, -halfL - offset]}>
        {/* Vertical Line */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.015, H, 0.015]} />
          <meshBasicMaterial color="#c084fc" />
        </mesh>
        {/* Bottom Tick */}
        <mesh position={[0, -H / 2, 0]}>
          <boxGeometry args={[0.12, 0.015, 0.12]} />
          <meshBasicMaterial color="#c084fc" />
        </mesh>
        {/* Top Tick */}
        <mesh position={[0, H / 2, 0]}>
          <boxGeometry args={[0.12, 0.015, 0.12]} />
          <meshBasicMaterial color="#c084fc" />
        </mesh>

        {/* Floating Height Badge */}
        <Html position={[-0.15, 0, 0]} center distanceFactor={12}>
          <div className="px-2.5 py-1 rounded-full bg-slate-900/90 border border-purple-500/40 text-purple-300 font-mono text-[11px] font-bold shadow-lg shadow-purple-950/40 backdrop-blur-md whitespace-nowrap select-none pointer-events-none">
            ⇕ Height: {formatDim(H)}
          </div>
        </Html>
      </group>

      {/* 4. CARDINAL WALL INDICATOR BADGES */}
      <Html position={[0, 0.05, halfL + 0.65]} center distanceFactor={15}>
        <div className="px-2 py-0.5 rounded bg-blue-950/80 border border-blue-500/30 text-blue-300 font-mono text-[10px] tracking-wider font-semibold select-none">
          NORTH
        </div>
      </Html>

      <Html position={[0, 0.05, -halfL - 0.75]} center distanceFactor={15}>
        <div className="px-2 py-0.5 rounded bg-blue-950/80 border border-blue-500/30 text-blue-300 font-mono text-[10px] tracking-wider font-semibold select-none">
          SOUTH
        </div>
      </Html>

      <Html position={[halfW + 0.65, 0.05, 0]} center distanceFactor={15}>
        <div className="px-2 py-0.5 rounded bg-blue-950/80 border border-blue-500/30 text-blue-300 font-mono text-[10px] tracking-wider font-semibold select-none">
          EAST
        </div>
      </Html>

      <Html position={[-halfW - 0.75, 0.05, 0]} center distanceFactor={15}>
        <div className="px-2 py-0.5 rounded bg-blue-950/80 border border-blue-500/30 text-blue-300 font-mono text-[10px] tracking-wider font-semibold select-none">
          WEST
        </div>
      </Html>
    </group>
  )
}
