/**
 * SPACEFIT AI — 3D CAMERA RIG & CONTROLS
 * 
 * Provides smooth animated camera transitions between Perspective 3D,
 * Top-Down architectural plan view, and side elevations, with OrbitControls damping.
 */

import React, { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import type { CameraViewMode } from './types'

interface CameraRigProps {
  roomWidth: number
  roomLength: number
  ceilingHeight: number
  cameraMode: CameraViewMode
  resetTrigger: number
  fitTrigger: number
}

export const CameraRig: React.FC<CameraRigProps> = ({
  roomWidth,
  roomLength,
  ceilingHeight,
  cameraMode,
  resetTrigger,
  fitTrigger,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null)
  const { camera } = useThree()

  const targetPosition = useRef(new THREE.Vector3())
  const targetLookAt = useRef(new THREE.Vector3(0, ceilingHeight * 0.35, 0))
  const isTransitioning = useRef(false)

  const maxDim = Math.max(roomWidth, roomLength, ceilingHeight)

  // Compute desired camera position based on mode
  const getCameraTarget = (mode: CameraViewMode): { pos: THREE.Vector3; look: THREE.Vector3 } => {
    const look = new THREE.Vector3(0, ceilingHeight * 0.35, 0)
    let pos = new THREE.Vector3()

    switch (mode) {
      case 'top-down':
        pos = new THREE.Vector3(0, maxDim * 2.5, 0.001)
        break
      case 'elevation-south':
        pos = new THREE.Vector3(0, ceilingHeight * 0.5, -maxDim * 1.9)
        break
      case 'elevation-north':
        pos = new THREE.Vector3(0, ceilingHeight * 0.5, maxDim * 1.9)
        break
      case 'elevation-east':
        pos = new THREE.Vector3(maxDim * 1.9, ceilingHeight * 0.5, 0)
        break
      case 'elevation-west':
        pos = new THREE.Vector3(-maxDim * 1.9, ceilingHeight * 0.5, 0)
        break
      case 'perspective':
      default:
        // Default architectural oblique view
        pos = new THREE.Vector3(roomWidth * 1.25, ceilingHeight * 1.7, -roomLength * 1.35)
        break
    }

    return { pos, look }
  }

  // Handle mode changes
  useEffect(() => {
    const { pos, look } = getCameraTarget(cameraMode)
    targetPosition.current.copy(pos)
    targetLookAt.current.copy(look)
    isTransitioning.current = true
  }, [cameraMode, roomWidth, roomLength, ceilingHeight])

  // Handle Reset Camera trigger
  useEffect(() => {
    if (resetTrigger > 0) {
      const { pos, look } = getCameraTarget('perspective')
      targetPosition.current.copy(pos)
      targetLookAt.current.copy(look)
      isTransitioning.current = true
    }
  }, [resetTrigger])

  // Handle Fit to Room trigger
  useEffect(() => {
    if (fitTrigger > 0) {
      const distance = maxDim * 1.8
      const currentDir = camera.position.clone().sub(targetLookAt.current).normalize()
      if (currentDir.length() < 0.1) currentDir.set(1, 1, 1).normalize()
      targetPosition.current.copy(currentDir.multiplyScalar(distance))
      isTransitioning.current = true
    }
  }, [fitTrigger, maxDim])

  // Smooth lerp transition
  useFrame(() => {
    if (!isTransitioning.current) return

    camera.position.lerp(targetPosition.current, 0.08)

    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLookAt.current, 0.08)
      controlsRef.current.update()
    }

    if (
      camera.position.distanceTo(targetPosition.current) < 0.05 &&
      controlsRef.current?.target.distanceTo(targetLookAt.current) < 0.05
    ) {
      camera.position.copy(targetPosition.current)
      controlsRef.current?.target.copy(targetLookAt.current)
      isTransitioning.current = false
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      minDistance={1.2}
      maxDistance={maxDim * 6}
      maxPolarAngle={cameraMode === 'top-down' ? Math.PI / 2 : Math.PI / 2 - 0.01}
      makeDefault
    />
  )
}
