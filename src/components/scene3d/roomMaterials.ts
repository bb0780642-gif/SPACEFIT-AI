/**
 * SPACEFIT AI — 3D ARCHITECTURAL MATERIALS & SHADERS
 * 
 * Curated PBR materials designed for realistic architectural visualization
 * with performant shaders and electric-blue/violet SpaceFit branding.
 */

import * as THREE from 'three'

// Cached procedural floor texture for photorealistic wood/tile appearance
let cachedFloorTexture: THREE.CanvasTexture | null = null

function getProceduralFloorTexture(): THREE.CanvasTexture {
  if (cachedFloorTexture) return cachedFloorTexture

  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')

  if (ctx) {
    // Elegant warm architectural parquet / modern timber tile
    ctx.fillStyle = '#222838'
    ctx.fillRect(0, 0, 512, 512)

    // Draw subtle planks
    const plankHeight = 32
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.4)'
    ctx.lineWidth = 2

    for (let y = 0; y < 512; y += plankHeight) {
      // Horizontal seam
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(512, y)
      ctx.stroke()

      // Vertical staggered seams
      const offset = (Math.floor(y / plankHeight) % 2) * 128
      for (let x = offset; x < 512; x += 256) {
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x, y + plankHeight)
        ctx.stroke()
      }
    }

    // Subtle grain noise
    for (let i = 0; i < 4000; i++) {
      const rx = Math.random() * 512
      const ry = Math.random() * 512
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.015)' : 'rgba(0, 0, 0, 0.03)'
      ctx.fillRect(rx, ry, 2, 2)
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(4, 4)
  cachedFloorTexture = texture
  return texture
}

export function createFloorMaterial(wireframe = false): THREE.Material {
  if (typeof document === 'undefined') {
    return new THREE.MeshStandardMaterial({
      color: 0x1e2433,
      roughness: 0.4,
      metalness: 0.1,
      wireframe,
    })
  }

  const texture = getProceduralFloorTexture()
  return new THREE.MeshStandardMaterial({
    color: 0x272d3f,
    map: texture,
    roughness: 0.4,
    metalness: 0.05,
    wireframe,
  })
}

export function createWallMaterial(
  isSelected = false,
  isCutaway = false,
  wireframe = false
): THREE.Material {
  if (isSelected) {
    return new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.35,
      roughness: 0.3,
      metalness: 0.1,
      wireframe,
    })
  }

  if (isCutaway) {
    return new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.7,
      metalness: 0.05,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
      wireframe,
    })
  }

  return new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.65,
    metalness: 0.02,
    wireframe,
  })
}

export function createDoorFrameMaterial(isSelected = false, wireframe = false): THREE.Material {
  return new THREE.MeshStandardMaterial({
    color: isSelected ? 0x06b6d4 : 0x1e293b,
    roughness: 0.3,
    metalness: 0.4,
    wireframe,
  })
}

export function createDoorLeafMaterial(isSelected = false, wireframe = false): THREE.Material {
  return new THREE.MeshStandardMaterial({
    color: isSelected ? 0x38bdf8 : 0x64748b,
    roughness: 0.4,
    metalness: 0.1,
    wireframe,
  })
}

export function createWindowFrameMaterial(isSelected = false, wireframe = false): THREE.Material {
  return new THREE.MeshStandardMaterial({
    color: isSelected ? 0xf59e0b : 0x0f172a,
    roughness: 0.25,
    metalness: 0.6,
    wireframe,
  })
}

export function createWindowGlassMaterial(isSelected = false): THREE.Material {
  return new THREE.MeshPhysicalMaterial({
    color: isSelected ? 0xfef08a : 0xbae6fd,
    transparent: true,
    opacity: 0.35,
    roughness: 0.05,
    metalness: 0.1,
    transmission: 0.85,
    ior: 1.5,
    thickness: 0.02,
  })
}

export function createGroundGridMaterial(): THREE.Material {
  return new THREE.MeshBasicMaterial({
    color: 0x090e1a,
    transparent: true,
    opacity: 0.9,
  })
}
