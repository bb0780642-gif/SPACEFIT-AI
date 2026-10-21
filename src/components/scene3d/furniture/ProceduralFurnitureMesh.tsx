/**
 * SPACEFIT AI — PROCEDURAL 3D ARCHITECTURAL FURNITURE MESHES
 * 
 * High-detail procedural geometric representations for beds, seating,
 * desks, wardrobes, shelves, dining sets, lighting, and botanical decor.
 * Fully responsive to dimensional scaling and interactive selection/collision highlights.
 */

import React from 'react'
import * as THREE from 'three'
import type { PlacedFurniture } from '@/types/furniture'

interface ProceduralFurnitureMeshProps {
  furniture: PlacedFurniture
  isSelected: boolean
  isColliding: boolean
  onClick?: (e: React.MouseEvent) => void
}

export const ProceduralFurnitureMesh: React.FC<ProceduralFurnitureMeshProps> = ({
  furniture,
  isSelected,
  isColliding,
  onClick,
}) => {
  const { dimensions, color, meshType, position, rotationY } = furniture
  const [W, H, L] = [dimensions.widthMeters, dimensions.heightMeters, dimensions.lengthMeters]

  // Color logic: if colliding, tinted warning red; if selected, accented
  const primaryColor = isColliding ? '#ef4444' : color
  const accentColor = isColliding ? '#b91c1c' : '#38bdf8'

  const renderMeshContent = () => {
    switch (meshType) {
      // 1. QUEEN / KING PLATFORM BED
      case 'bed-queen': {
        const headboardThick = 0.08
        const headboardH = H
        const mattressH = 0.25
        const frameH = 0.25
        const frameL = L - headboardThick

        return (
          <group>
            {/* Headboard at rear (-L/2 + headboardThick/2) */}
            <mesh position={[0, headboardH / 2, -L / 2 + headboardThick / 2]} castShadow receiveShadow>
              <boxGeometry args={[W, headboardH, headboardThick]} />
              <meshStandardMaterial color={primaryColor} roughness={0.6} />
            </mesh>

            {/* Platform Base Frame */}
            <mesh position={[0, frameH / 2, -L / 2 + headboardThick + frameL / 2]} castShadow receiveShadow>
              <boxGeometry args={[W, frameH, frameL]} />
              <meshStandardMaterial color="#0f172a" roughness={0.5} />
            </mesh>

            {/* Mattress */}
            <mesh position={[0, frameH + mattressH / 2, -L / 2 + headboardThick + frameL / 2]} castShadow receiveShadow>
              <boxGeometry args={[W * 0.94, mattressH, frameL * 0.96]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.8} />
            </mesh>

            {/* Duvet / Quilt (covers lower 70% of bed) */}
            <mesh position={[0, frameH + mattressH + 0.015, -L / 2 + headboardThick + frameL * 0.6]} castShadow>
              <boxGeometry args={[W * 0.95, 0.03, frameL * 0.68]} />
              <meshStandardMaterial color={primaryColor} roughness={0.7} />
            </mesh>

            {/* Two Plush Pillows */}
            <mesh position={[-W * 0.23, frameH + mattressH + 0.04, -L / 2 + headboardThick + 0.25]} castShadow>
              <boxGeometry args={[W * 0.38, 0.08, 0.35]} />
              <meshStandardMaterial color="#f1f5f9" roughness={0.9} />
            </mesh>
            <mesh position={[W * 0.23, frameH + mattressH + 0.04, -L / 2 + headboardThick + 0.25]} castShadow>
              <boxGeometry args={[W * 0.38, 0.08, 0.35]} />
              <meshStandardMaterial color="#f1f5f9" roughness={0.9} />
            </mesh>
          </group>
        )
      }

      // 2. SINGLE DAYBED
      case 'bed-single': {
        const headboardThick = 0.06
        const frameH = 0.24
        const mattressH = 0.22
        return (
          <group>
            {/* Headboard */}
            <mesh position={[0, H / 2, -L / 2 + headboardThick / 2]} castShadow>
              <boxGeometry args={[W, H, headboardThick]} />
              <meshStandardMaterial color={primaryColor} roughness={0.6} />
            </mesh>
            {/* Base Frame */}
            <mesh position={[0, frameH / 2, 0]} castShadow>
              <boxGeometry args={[W, frameH, L - headboardThick]} />
              <meshStandardMaterial color="#1e293b" roughness={0.5} />
            </mesh>
            {/* Mattress */}
            <mesh position={[0, frameH + mattressH / 2, 0]} castShadow>
              <boxGeometry args={[W * 0.92, mattressH, (L - headboardThick) * 0.95]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.8} />
            </mesh>
            {/* Pillow */}
            <mesh position={[0, frameH + mattressH + 0.03, -L / 2 + headboardThick + 0.25]} castShadow>
              <boxGeometry args={[W * 0.7, 0.07, 0.32]} />
              <meshStandardMaterial color="#f1f5f9" roughness={0.9} />
            </mesh>
          </group>
        )
      }

      // 3. 3-SEATER SOFA
      case 'sofa-3seat': {
        const legH = 0.12
        const seatH = 0.3
        const backH = H - legH - seatH
        const backThick = 0.2
        const armThick = 0.16

        return (
          <group>
            {/* 4 Metal Legs */}
            {[
              [-W / 2 + 0.08, -L / 2 + 0.08],
              [W / 2 - 0.08, -L / 2 + 0.08],
              [-W / 2 + 0.08, L / 2 - 0.08],
              [W / 2 - 0.08, L / 2 - 0.08],
            ].map(([lx, lz], i) => (
              <mesh key={i} position={[lx, legH / 2, lz]} castShadow>
                <cylinderGeometry args={[0.02, 0.015, legH, 12]} />
                <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
              </mesh>
            ))}

            {/* Main Base Frame */}
            <mesh position={[0, legH + 0.05, 0]} castShadow>
              <boxGeometry args={[W, 0.1, L]} />
              <meshStandardMaterial color="#1e293b" roughness={0.6} />
            </mesh>

            {/* 3 Seat Cushions */}
            {[0, 1, 2].map((idx) => {
              const cushionW = (W - armThick * 2) / 3
              const cx = -(W - armThick * 2) / 2 + cushionW / 2 + idx * cushionW
              return (
                <mesh key={idx} position={[cx, legH + 0.1 + seatH / 2, 0.05]} castShadow>
                  <boxGeometry args={[cushionW * 0.96, seatH, L * 0.75]} />
                  <meshStandardMaterial color={primaryColor} roughness={0.7} />
                </mesh>
              )
            })}

            {/* Backrest Structure & Cushions */}
            <mesh position={[0, legH + seatH + backH / 2, -L / 2 + backThick / 2]} castShadow>
              <boxGeometry args={[W, backH, backThick]} />
              <meshStandardMaterial color={primaryColor} roughness={0.7} />
            </mesh>

            {/* Left and Right Armrests */}
            <mesh position={[-W / 2 + armThick / 2, legH + seatH * 0.8, 0]} castShadow>
              <boxGeometry args={[armThick, seatH * 1.2, L]} />
              <meshStandardMaterial color={primaryColor} roughness={0.7} />
            </mesh>
            <mesh position={[W / 2 - armThick / 2, legH + seatH * 0.8, 0]} castShadow>
              <boxGeometry args={[armThick, seatH * 1.2, L]} />
              <meshStandardMaterial color={primaryColor} roughness={0.7} />
            </mesh>
          </group>
        )
      }

      // 4. L-SHAPED SECTIONAL SOFA
      case 'sofa-sectional': {
        const legH = 0.1
        const mainW = W * 0.65
        const chaiseW = W - mainW

        return (
          <group>
            {/* Main Section */}
            <mesh position={[-W / 2 + mainW / 2, legH + 0.2, -L * 0.2]} castShadow>
              <boxGeometry args={[mainW, 0.35, L * 0.6]} />
              <meshStandardMaterial color={primaryColor} roughness={0.7} />
            </mesh>
            {/* Chaise Section */}
            <mesh position={[W / 2 - chaiseW / 2, legH + 0.2, 0]} castShadow>
              <boxGeometry args={[chaiseW, 0.35, L]} />
              <meshStandardMaterial color={primaryColor} roughness={0.7} />
            </mesh>
            {/* Backrest Along Rear */}
            <mesh position={[0, legH + 0.45, -L / 2 + 0.12]} castShadow>
              <boxGeometry args={[W, 0.4, 0.24]} />
              <meshStandardMaterial color={primaryColor} roughness={0.7} />
            </mesh>
          </group>
        )
      }

      // 5. LOUNGE ARMCHAIR
      case 'chair-armchair': {
        const legH = 0.16
        const seatH = 0.26
        return (
          <group>
            {/* 4 Wooden Legs */}
            {[
              [-W * 0.35, -L * 0.35],
              [W * 0.35, -L * 0.35],
              [-W * 0.35, L * 0.35],
              [W * 0.35, L * 0.35],
            ].map(([lx, lz], i) => (
              <mesh key={i} position={[lx, legH / 2, lz]} castShadow>
                <cylinderGeometry args={[0.02, 0.015, legH, 8]} />
                <meshStandardMaterial color="#78350f" roughness={0.4} />
              </mesh>
            ))}

            {/* Plush Seat Cushion */}
            <mesh position={[0, legH + seatH / 2, 0.03]} castShadow>
              <boxGeometry args={[W * 0.88, seatH, L * 0.8]} />
              <meshStandardMaterial color={primaryColor} roughness={0.65} />
            </mesh>

            {/* Contoured Backrest */}
            <mesh position={[0, legH + seatH + 0.22, -L * 0.32]} castShadow>
              <boxGeometry args={[W * 0.88, 0.45, 0.16]} />
              <meshStandardMaterial color={primaryColor} roughness={0.65} />
            </mesh>

            {/* Armrests */}
            <mesh position={[-W * 0.44, legH + seatH + 0.12, 0]} castShadow>
              <boxGeometry args={[0.1, 0.25, L * 0.7]} />
              <meshStandardMaterial color={primaryColor} roughness={0.65} />
            </mesh>
            <mesh position={[W * 0.44, legH + seatH + 0.12, 0]} castShadow>
              <boxGeometry args={[0.1, 0.25, L * 0.7]} />
              <meshStandardMaterial color={primaryColor} roughness={0.65} />
            </mesh>
          </group>
        )
      }

      // 6. ERGONOMIC OFFICE CHAIR
      case 'chair-office': {
        return (
          <group>
            {/* Base 5-Star Hub */}
            <mesh position={[0, 0.05, 0]}>
              <cylinderGeometry args={[0.28, 0.28, 0.04, 16]} />
              <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.3} />
            </mesh>
            {/* Center Hydraulic Column */}
            <mesh position={[0, 0.22, 0]}>
              <cylinderGeometry args={[0.035, 0.035, 0.3, 16]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Contoured Seat */}
            <mesh position={[0, 0.42, 0]} castShadow>
              <boxGeometry args={[W * 0.85, 0.08, L * 0.8]} />
              <meshStandardMaterial color={primaryColor} roughness={0.7} />
            </mesh>
            {/* Ergonomic Mesh Backrest */}
            <mesh position={[0, 0.78, -L * 0.35]} castShadow>
              <boxGeometry args={[W * 0.78, 0.58, 0.06]} />
              <meshStandardMaterial color="#0f172a" roughness={0.5} />
            </mesh>
            {/* Armrests */}
            <mesh position={[-W * 0.42, 0.6, -0.05]}>
              <boxGeometry args={[0.06, 0.22, 0.26]} />
              <meshStandardMaterial color="#0f172a" roughness={0.4} />
            </mesh>
            <mesh position={[W * 0.42, 0.6, -0.05]}>
              <boxGeometry args={[0.06, 0.22, 0.26]} />
              <meshStandardMaterial color="#0f172a" roughness={0.4} />
            </mesh>
          </group>
        )
      }

      // 7. EXECUTIVE WORKSTATION DESK
      case 'desk-workstation': {
        const topThick = 0.04
        const legThick = 0.04
        return (
          <group>
            {/* Solid Desktop */}
            <mesh position={[0, H - topThick / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[W, topThick, L]} />
              <meshStandardMaterial color={primaryColor} roughness={0.4} metalness={0.05} />
            </mesh>

            {/* Left Leg Frame */}
            <mesh position={[-W / 2 + legThick / 2 + 0.02, (H - topThick) / 2, 0]} castShadow>
              <boxGeometry args={[legThick, H - topThick, L * 0.85]} />
              <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.25} />
            </mesh>

            {/* Right Leg Frame */}
            <mesh position={[W / 2 - legThick / 2 - 0.02, (H - topThick) / 2, 0]} castShadow>
              <boxGeometry args={[legThick, H - topThick, L * 0.85]} />
              <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.25} />
            </mesh>

            {/* Rear Modesty Panel */}
            <mesh position={[0, H * 0.6, -L / 2 + 0.03]} castShadow>
              <boxGeometry args={[W * 0.88, H * 0.45, 0.02]} />
              <meshStandardMaterial color="#1e293b" roughness={0.5} />
            </mesh>

            {/* Cable Management Port */}
            <mesh position={[W * 0.35, H, -L * 0.35]}>
              <cylinderGeometry args={[0.03, 0.03, 0.045, 16]} />
              <meshStandardMaterial color="#0f172a" metalness={0.6} />
            </mesh>
          </group>
        )
      }

      // 8. COFFEE TABLE
      case 'table-coffee': {
        const topThick = 0.035
        return (
          <group>
            {/* Top Surface */}
            <mesh position={[0, H - topThick / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[W, topThick, L]} />
              <meshStandardMaterial color={primaryColor} roughness={0.35} metalness={0.1} />
            </mesh>
            {/* Lower Shelf */}
            <mesh position={[0, H * 0.35, 0]} castShadow>
              <boxGeometry args={[W * 0.88, 0.02, L * 0.85]} />
              <meshStandardMaterial color="#1e293b" roughness={0.5} />
            </mesh>
            {/* 4 Metal Legs */}
            {[
              [-W / 2 + 0.05, -L / 2 + 0.05],
              [W / 2 - 0.05, -L / 2 + 0.05],
              [-W / 2 + 0.05, L / 2 - 0.05],
              [W / 2 - 0.05, L / 2 - 0.05],
            ].map(([lx, lz], i) => (
              <mesh key={i} position={[lx, H / 2, lz]} castShadow>
                <cylinderGeometry args={[0.018, 0.015, H, 12]} />
                <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
              </mesh>
            ))}
          </group>
        )
      }

      // 9. BEDSIDE NIGHTSTAND
      case 'table-nightstand': {
        return (
          <group>
            {/* Cabinet Box */}
            <mesh position={[0, H * 0.55, 0]} castShadow receiveShadow>
              <boxGeometry args={[W, H * 0.8, L]} />
              <meshStandardMaterial color={primaryColor} roughness={0.5} />
            </mesh>
            {/* 2 Drawer Horizontal Handles */}
            <mesh position={[0, H * 0.72, L / 2 + 0.015]}>
              <boxGeometry args={[W * 0.45, 0.015, 0.02]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0, H * 0.38, L / 2 + 0.015]}>
              <boxGeometry args={[W * 0.45, 0.015, 0.02]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* 4 Short Feet */}
            {[
              [-W * 0.38, -L * 0.38],
              [W * 0.38, -L * 0.38],
              [-W * 0.38, L * 0.38],
              [W * 0.38, L * 0.38],
            ].map(([lx, lz], i) => (
              <mesh key={i} position={[lx, H * 0.075, lz]}>
                <cylinderGeometry args={[0.015, 0.015, H * 0.15, 8]} />
                <meshStandardMaterial color="#0f172a" />
              </mesh>
            ))}
          </group>
        )
      }

      // 10. DOUBLE WARDROBE
      case 'wardrobe-double': {
        return (
          <group>
            {/* Main Closet Body */}
            <mesh position={[0, H / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[W, H, L]} />
              <meshStandardMaterial color={primaryColor} roughness={0.5} />
            </mesh>
            {/* Center Door Seam */}
            <mesh position={[0, H / 2, L / 2 + 0.005]}>
              <boxGeometry args={[0.008, H * 0.95, 0.005]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>
            {/* Left & Right Vertical Handles */}
            <mesh position={[-0.04, H * 0.5, L / 2 + 0.02]}>
              <boxGeometry args={[0.015, 0.35, 0.025]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.85} roughness={0.15} />
            </mesh>
            <mesh position={[0.04, H * 0.5, L / 2 + 0.02]}>
              <boxGeometry args={[0.015, 0.35, 0.025]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.85} roughness={0.15} />
            </mesh>
          </group>
        )
      }

      // 11. 5-TIER BOOKSHELF
      case 'bookshelf-5tier': {
        const sideThick = 0.03
        return (
          <group>
            {/* Left Side Panel */}
            <mesh position={[-W / 2 + sideThick / 2, H / 2, 0]} castShadow>
              <boxGeometry args={[sideThick, H, L]} />
              <meshStandardMaterial color={primaryColor} roughness={0.5} />
            </mesh>
            {/* Right Side Panel */}
            <mesh position={[W / 2 - sideThick / 2, H / 2, 0]} castShadow>
              <boxGeometry args={[sideThick, H, L]} />
              <meshStandardMaterial color={primaryColor} roughness={0.5} />
            </mesh>
            {/* Back Panel */}
            <mesh position={[0, H / 2, -L / 2 + 0.01]}>
              <boxGeometry args={[W, H, 0.02]} />
              <meshStandardMaterial color="#0f172a" roughness={0.6} />
            </mesh>
            {/* 5 Shelves */}
            {[0, 1, 2, 3, 4].map((s) => {
              const sy = (H / 4) * s * 0.95 + 0.08
              return (
                <mesh key={s} position={[0, sy, 0]} castShadow>
                  <boxGeometry args={[W - sideThick * 2, 0.025, L * 0.95]} />
                  <meshStandardMaterial color={primaryColor} roughness={0.5} />
                </mesh>
              )
            })}
          </group>
        )
      }

      // 12. MEDIA CREDENZA
      case 'credenza-media': {
        return (
          <group>
            {/* Cabinet */}
            <mesh position={[0, H * 0.6, 0]} castShadow receiveShadow>
              <boxGeometry args={[W, H * 0.75, L]} />
              <meshStandardMaterial color={primaryColor} roughness={0.45} />
            </mesh>
            {/* 4 Slatted Door Divisions */}
            {[-W * 0.36, -W * 0.12, W * 0.12, W * 0.36].map((dx, i) => (
              <mesh key={i} position={[dx, H * 0.6, L / 2 + 0.01]}>
                <boxGeometry args={[W * 0.22, H * 0.68, 0.01]} />
                <meshStandardMaterial color="#1e293b" roughness={0.6} />
              </mesh>
            ))}
            {/* Feet */}
            {[
              [-W * 0.44, -L * 0.35],
              [W * 0.44, -L * 0.35],
              [-W * 0.44, L * 0.35],
              [W * 0.44, L * 0.35],
            ].map(([lx, lz], i) => (
              <mesh key={i} position={[lx, H * 0.1, lz]}>
                <cylinderGeometry args={[0.015, 0.012, H * 0.2, 8]} />
                <meshStandardMaterial color="#0f172a" metalness={0.8} />
              </mesh>
            ))}
          </group>
        )
      }

      // 13. DINING TABLE & 4 CHAIRS
      case 'dining-set-4': {
        const topThick = 0.04
        return (
          <group>
            {/* Dining Table Top */}
            <mesh position={[0, H - topThick / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[W, topThick, L]} />
              <meshStandardMaterial color={primaryColor} roughness={0.35} />
            </mesh>
            {/* 4 Table Legs */}
            {[
              [-W / 2 + 0.06, -L / 2 + 0.06],
              [W / 2 - 0.06, -L / 2 + 0.06],
              [-W / 2 + 0.06, L / 2 - 0.06],
              [W / 2 - 0.06, L / 2 - 0.06],
            ].map(([lx, lz], i) => (
              <mesh key={i} position={[lx, H / 2, lz]} castShadow>
                <boxGeometry args={[0.06, H, 0.06]} />
                <meshStandardMaterial color="#0f172a" roughness={0.4} />
              </mesh>
            ))}
            {/* 4 Dining Chairs tucked under */}
            {/* North 2 chairs */}
            {[-W * 0.25, W * 0.25].map((cx, i) => (
              <group key={`nc-${i}`} position={[cx, 0, L / 2 - 0.05]} rotation={[0, Math.PI, 0]}>
                <mesh position={[0, 0.24, 0]} castShadow>
                  <boxGeometry args={[0.38, 0.04, 0.38]} />
                  <meshStandardMaterial color="#1e293b" />
                </mesh>
                <mesh position={[0, 0.52, -0.17]} castShadow>
                  <boxGeometry args={[0.36, 0.45, 0.03]} />
                  <meshStandardMaterial color="#1e293b" />
                </mesh>
              </group>
            ))}
            {/* South 2 chairs */}
            {[-W * 0.25, W * 0.25].map((cx, i) => (
              <group key={`sc-${i}`} position={[cx, 0, -L / 2 + 0.05]} rotation={[0, 0, 0]}>
                <mesh position={[0, 0.24, 0]} castShadow>
                  <boxGeometry args={[0.38, 0.04, 0.38]} />
                  <meshStandardMaterial color="#1e293b" />
                </mesh>
                <mesh position={[0, 0.52, -0.17]} castShadow>
                  <boxGeometry args={[0.36, 0.45, 0.03]} />
                  <meshStandardMaterial color="#1e293b" />
                </mesh>
              </group>
            ))}
          </group>
        )
      }

      // 14. ROUND BISTRO TABLE
      case 'dining-bistro-round': {
        return (
          <group>
            {/* Circular Table Top */}
            <mesh position={[0, H - 0.02, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[W / 2, W / 2, 0.035, 32]} />
              <meshStandardMaterial color={primaryColor} roughness={0.35} />
            </mesh>
            {/* Pedestal Column */}
            <mesh position={[0, H / 2, 0]}>
              <cylinderGeometry args={[0.04, 0.04, H, 16]} />
              <meshStandardMaterial color="#0f172a" metalness={0.7} />
            </mesh>
            {/* Weighted Disc Base */}
            <mesh position={[0, 0.015, 0]}>
              <cylinderGeometry args={[W * 0.3, W * 0.3, 0.03, 32]} />
              <meshStandardMaterial color="#0f172a" metalness={0.7} />
            </mesh>
          </group>
        )
      }

      // 15. MODERN ARC FLOOR LAMP
      case 'lamp-floor-arc': {
        return (
          <group>
            {/* Heavy Base Disc */}
            <mesh position={[0, 0.02, 0]} castShadow>
              <cylinderGeometry args={[0.18, 0.18, 0.04, 24]} />
              <meshStandardMaterial color="#0f172a" metalness={0.8} />
            </mesh>
            {/* Vertical Pole */}
            <mesh position={[0, H * 0.5, 0]}>
              <cylinderGeometry args={[0.012, 0.012, H, 12]} />
              <meshStandardMaterial color="#0f172a" metalness={0.8} />
            </mesh>
            {/* Drum Shade */}
            <mesh position={[0, H - 0.12, 0]} castShadow>
              <cylinderGeometry args={[0.18, 0.2, 0.24, 24]} />
              <meshStandardMaterial color="#fef3c7" emissive="#f59e0b" emissiveIntensity={0.6} roughness={0.9} />
            </mesh>
          </group>
        )
      }

      // 16. INDOOR PLANT
      case 'plant-ficus': {
        const potH = H * 0.38
        return (
          <group>
            {/* Ceramic Pot */}
            <mesh position={[0, potH / 2, 0]} castShadow>
              <cylinderGeometry args={[W * 0.42, W * 0.32, potH, 24]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.3} />
            </mesh>
            {/* Soil Bed */}
            <mesh position={[0, potH - 0.02, 0]}>
              <cylinderGeometry args={[W * 0.4, W * 0.4, 0.03, 16]} />
              <meshStandardMaterial color="#3f2e1e" roughness={0.9} />
            </mesh>
            {/* Lush Foliage (3 tiered spheres) */}
            <mesh position={[0, potH + 0.25, 0]} castShadow>
              <sphereGeometry args={[W * 0.42, 16, 16]} />
              <meshStandardMaterial color="#10b981" roughness={0.8} />
            </mesh>
            <mesh position={[W * 0.12, potH + 0.45, 0]} castShadow>
              <sphereGeometry args={[W * 0.32, 16, 16]} />
              <meshStandardMaterial color="#059669" roughness={0.8} />
            </mesh>
            <mesh position={[-W * 0.1, potH + 0.6, 0]} castShadow>
              <sphereGeometry args={[W * 0.25, 16, 16]} />
              <meshStandardMaterial color="#047857" roughness={0.8} />
            </mesh>
          </group>
        )
      }

      // DEFAULT FALLBACK BLOCK
      default: {
        return (
          <mesh position={[0, H / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[W, H, L]} />
            <meshStandardMaterial color={primaryColor} roughness={0.5} />
          </mesh>
        )
      }
    }
  }

  return (
    <group
      position={[position[0], 0, position[2]]}
      rotation={[0, rotationY, 0]}
      onClick={onClick}
    >
      {/* 1. SELECTION / COLLISION BOUNDING HALO */}
      {(isSelected || isColliding) && (
        <group position={[0, 0.01, 0]}>
          {/* Ground Footprint Outline */}
          <lineSegments>
            <edgesGeometry args={[new (THREE as any).BoxGeometry(W + 0.04, 0.02, L + 0.04)]} />
            <lineBasicMaterial color={isColliding ? '#ef4444' : accentColor} linewidth={2} />
          </lineSegments>

          {/* Glowing Translucent Footprint Fill */}
          <mesh position={[0, 0.005, 0]}>
            <planeGeometry args={[W + 0.02, L + 0.02]} />
            <meshBasicMaterial
              color={isColliding ? '#ef4444' : accentColor}
              transparent
              opacity={isColliding ? 0.35 : 0.18}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}

      {/* 2. RENDER PROCEDURAL 3D FURNITURE */}
      {renderMeshContent()}
    </group>
  )
}
