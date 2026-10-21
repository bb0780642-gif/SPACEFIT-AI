import React, { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { RoomConfiguration } from '@/types/geometry'
import type { PlacedFurniture } from '@/types/furniture'
import { resolveAvatarMovement } from '@/utils/movement/avatarPhysics'

interface FirstPersonControlsProps {
  isActive: boolean
  config: RoomConfiguration
  furniture: PlacedFurniture[]
  initialPosition?: [number, number, number]
  eyeHeight?: number // default 1.6m
  onExit?: () => void
  onPositionChange?: (pos: [number, number, number]) => void
  onCollision?: (objectName: string) => void
}

export const FirstPersonControls: React.FC<FirstPersonControlsProps> = ({
  isActive,
  config,
  furniture,
  initialPosition = [0, 1.6, 0],
  eyeHeight = 1.6,
  onExit,
  onPositionChange,
  onCollision,
}) => {
  const { camera, gl } = useThree()

  // Avatar state
  const avatarPos = useRef(new THREE.Vector3(...initialPosition))
  const yaw = useRef(0)
  const pitch = useRef(0)
  const isMouseDown = useRef(false)
  const lastMousePos = useRef({ x: 0, y: 0 })

  // Keyboard state
  const keys = useRef<{ [k: string]: boolean }>({
    KeyW: false,
    KeyS: false,
    KeyA: false,
    KeyD: false,
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    ShiftLeft: false,
    ShiftRight: false,
  })

  // Synchronize initial position when active starts
  useEffect(() => {
    if (isActive) {
      avatarPos.current.set(initialPosition[0], eyeHeight, initialPosition[2])
      camera.position.copy(avatarPos.current)
      pitch.current = 0
    }
  }, [isActive, initialPosition, eyeHeight, camera])

  // Mouse drag & Pointer lock look controls
  useEffect(() => {
    if (!isActive) return

    const dom = gl.domElement

    const handleMouseDown = (e: MouseEvent) => {
      // Ignore right clicks or clicks outside canvas
      if (e.button !== 0) return
      isMouseDown.current = true
      lastMousePos.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseUp = () => {
      isMouseDown.current = false
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDown.current && document.pointerLockElement !== dom) return

      const movementX = e.movementX !== undefined ? e.movementX : e.clientX - lastMousePos.current.x
      const movementY = e.movementY !== undefined ? e.movementY : e.clientY - lastMousePos.current.y

      lastMousePos.current = { x: e.clientX, y: e.clientY }

      const sensitivity = 0.003
      yaw.current -= movementX * sensitivity
      pitch.current -= movementY * sensitivity

      // Clamp pitch to avoid neck-snapping (-85 deg to +85 deg)
      const maxPitch = (85 * Math.PI) / 180
      pitch.current = Math.max(-maxPitch, Math.min(maxPitch, pitch.current))
    }

    dom.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      dom.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [isActive, gl])

  // Keyboard controls
  useEffect(() => {
    if (!isActive) return

    const isInputFocused = () => {
      const el = document.activeElement
      if (!el) return false
      const tag = el.tagName.toLowerCase()
      return tag === 'input' || tag === 'textarea' || (el as HTMLElement).isContentEditable
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isInputFocused()) return

      if (e.key === 'Escape') {
        onExit?.()
        return
      }

      if (keys.current[e.code] !== undefined) {
        keys.current[e.code] = true
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (keys.current[e.code] !== undefined) {
        keys.current[e.code] = false
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isActive, onExit])

  // Movement physics and frame loop
  useFrame((_, delta) => {
    if (!isActive) return

    // Cap delta to prevent teleports during frame drops
    const dt = Math.min(delta, 0.1)

    // Calculate forward & right movement vectors
    const forward = (keys.current.KeyW || keys.current.ArrowUp ? 1 : 0) -
                    (keys.current.KeyS || keys.current.ArrowDown ? 1 : 0)
    const right = (keys.current.KeyD || keys.current.ArrowRight ? 1 : 0) -
                  (keys.current.KeyA || keys.current.ArrowLeft ? 1 : 0)

    const isMoving = forward !== 0 || right !== 0
    const isSprinting = keys.current.ShiftLeft || keys.current.ShiftRight
    const speed = isSprinting ? 3.0 : 1.8 // m/s

    if (isMoving) {
      // Compute direction in X-Z plane based on yaw
      const moveAngle = yaw.current
      const cos = Math.cos(moveAngle)
      const sin = Math.sin(moveAngle)

      // Forward vector is (-sin, -cos) in Three.js coordinate system
      const dirX = -sin * forward + cos * right
      const dirZ = -cos * forward - sin * right

      const len = Math.hypot(dirX, dirZ)
      if (len > 0.001) {
        const normX = dirX / len
        const normZ = dirZ / len

        const deltaX = normX * speed * dt
        const deltaZ = normZ * speed * dt

        // Run collision detection and sliding physics
        const moveRes = resolveAvatarMovement(
          [avatarPos.current.x, eyeHeight, avatarPos.current.z],
          [deltaX, deltaZ],
          config,
          furniture
        )

        avatarPos.current.set(moveRes.position[0], eyeHeight, moveRes.position[2])

        if (moveRes.isColliding && moveRes.collidedWith) {
          onCollision?.(moveRes.collidedWith)
        }

        onPositionChange?.([avatarPos.current.x, eyeHeight, avatarPos.current.z])
      }
    }

    // Apply position and rotation to Three.js camera
    camera.position.set(avatarPos.current.x, eyeHeight, avatarPos.current.z)

    // Apply orientation
    const euler = new THREE.Euler(pitch.current, yaw.current, 0, 'YXZ')
    camera.quaternion.setFromEuler(euler)
  })

  return null
}
