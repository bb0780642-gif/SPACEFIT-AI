import React, { useMemo } from 'react'
import * as THREE from 'three'
import type { MovementPathResult } from '@/types/movement'

interface MovementPath3DProps {
  pathResult: MovementPathResult | null
  visible?: boolean
}

export const MovementPath3D: React.FC<MovementPath3DProps> = ({
  pathResult,
  visible = true,
}) => {
  if (!visible || !pathResult || pathResult.waypoints.length < 2) {
    return null
  }

  const {
    waypoints,
    isFeasible,
    startPoint,
    destinationPoint,
    bottleneckPoint,
  } = pathResult

  // Construct smooth 3D curve through waypoints
  const points = useMemo(() => {
    return waypoints.map((wp) => new THREE.Vector3(wp.x, 0.025, wp.z))
  }, [waypoints])

  const lineGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [points])

  const pathColor = isFeasible ? '#06b6d4' : '#f59e0b' // cyan if feasible, amber if bottleneck/tight

  const lineObject = useMemo(() => {
    const mat = new THREE.LineBasicMaterial({
      color: pathColor,
      linewidth: 3,
      transparent: true,
      opacity: 0.85,
    })
    return new THREE.Line(lineGeometry, mat)
  }, [lineGeometry, pathColor])

  return (
    <group name="MovementPathOverlay3D">
      {/* 1. Main Path Line */}
      <primitive object={lineObject} />

      {/* 2. Start Marker (Door / Entrance) */}
      <group position={[startPoint.x, 0, startPoint.z]}>
        {/* Floor ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[0.15, 0.28, 32]} />
          <meshBasicMaterial color="#10b981" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
        {/* Beacon Pin */}
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.08, 0.01, 0.35, 16]} />
          <meshStandardMaterial
            color="#10b981"
            emissive="#10b981"
            emissiveIntensity={0.5}
            roughness={0.2}
          />
        </mesh>
        <mesh position={[0, 0.65, 0]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial
            color="#34d399"
            emissive="#10b981"
            emissiveIntensity={0.7}
          />
        </mesh>
      </group>

      {/* 3. Destination Marker (Furniture Goal) */}
      <group position={[destinationPoint.x, 0, destinationPoint.z]}>
        {/* Floor ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[0.15, 0.28, 32]} />
          <meshBasicMaterial
            color={isFeasible ? '#38bdf8' : '#f43f5e'}
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Beacon Pin */}
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.08, 0.01, 0.35, 16]} />
          <meshStandardMaterial
            color={isFeasible ? '#0284c7' : '#e11d48'}
            emissive={isFeasible ? '#0284c7' : '#e11d48'}
            emissiveIntensity={0.5}
            roughness={0.2}
          />
        </mesh>
        <mesh position={[0, 0.65, 0]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial
            color={isFeasible ? '#38bdf8' : '#fb7185'}
            emissive={isFeasible ? '#38bdf8' : '#fb7185'}
            emissiveIntensity={0.7}
          />
        </mesh>
      </group>

      {/* 4. Bottleneck Indicator (if narrow gap detected) */}
      {bottleneckPoint && (
        <group position={[bottleneckPoint.x, 0.03, bottleneckPoint.z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.12, 0.22, 24]} />
            <meshBasicMaterial color="#f59e0b" transparent opacity={0.75} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0.25, 0]}>
            <octahedronGeometry args={[0.1, 0]} />
            <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.6} />
          </mesh>
        </group>
      )}
    </group>
  )
}
