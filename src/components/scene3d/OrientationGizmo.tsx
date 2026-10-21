/**
 * SPACEFIT AI — 3D ORIENTATION GIZMO
 * 
 * Renders an orientation coordinate gizmo showing X, Y, Z axes
 * and cardinal directions (North, South, East, West).
 */

import React from 'react'
import { GizmoHelper, GizmoViewport } from '@react-three/drei'

export const OrientationGizmo: React.FC = () => {
  return (
    <GizmoHelper alignment="bottom-right" margin={[60, 60]}>
      <GizmoViewport
        axisColors={['#38bdf8', '#c084fc', '#818cf8']}
        labelColor="#ffffff"
        axisHeadScale={0.8}
      />
    </GizmoHelper>
  )
}
