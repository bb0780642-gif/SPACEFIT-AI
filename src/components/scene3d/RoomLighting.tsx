import React from 'react'

interface RoomLightingProps {
  roomWidth: number
  roomLength: number
  ceilingHeight: number
}

export const RoomLighting: React.FC<RoomLightingProps> = ({
  roomWidth,
  roomLength,
  ceilingHeight,
}) => {
  const maxDim = Math.max(roomWidth, roomLength, ceilingHeight)
  const shadowRange = maxDim * 1.5

  return (
    <>
      {/* Ambient Fill */}
      <ambientLight color="#94a3b8" intensity={0.4} />

      {/* Atmospheric Hemisphere bounce */}
      <hemisphereLight
        color="#e0e7ff"
        groundColor="#090e1a"
        intensity={0.5}
      />

      {/* Key Sun / Architectural Studio Light */}
      <directionalLight
        position={[maxDim * 1.2, maxDim * 2.2, maxDim * 1.4]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={maxDim * 6}
        shadow-camera-left={-shadowRange}
        shadow-camera-right={shadowRange}
        shadow-camera-top={shadowRange}
        shadow-camera-bottom={-shadowRange}
        shadow-bias={-0.0001}
      />

      {/* Secondary Soft Rim / Accent Light */}
      <directionalLight
        position={[-maxDim * 1.5, maxDim * 1.0, -maxDim * 1.2]}
        intensity={0.45}
        color="#818cf8"
      />

      {/* Subtle interior point light to illuminate inner room when cutaway or interior viewed */}
      <pointLight
        position={[0, ceilingHeight * 0.85, 0]}
        intensity={0.8}
        distance={maxDim * 2}
        color="#fef08a"
        decay={2}
      />
    </>
  )
}
