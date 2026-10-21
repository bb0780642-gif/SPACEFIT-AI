import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface AnimatedBackgroundProps {
  intensity?: 'subtle' | 'normal' | 'vibrant'
  showGrid?: boolean
  showParticles?: boolean
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  intensity = 'normal',
  showGrid = true,
  showParticles = true,
}) => {
  const reducedMotion = useReducedMotion()

  // Generate sparse particle coordinates deterministically
  const particles = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => ({
      id: i,
      x: `${(i * 19 + 7) % 94}%`,
      y: `${(i * 23 + 13) % 90}%`,
      size: (i % 3) + 2,
      duration: 18 + (i % 5) * 4,
      delay: (i % 4) * 2,
      opacity: 0.2 + (i % 3) * 0.15,
      color: i % 2 === 0 ? 'rgba(96, 165, 250, 0.7)' : 'rgba(167, 139, 250, 0.7)',
    }))
  }, [])

  // Opacity multipliers based on intensity
  const opacityMultiplier = intensity === 'subtle' ? 0.6 : intensity === 'vibrant' ? 1.3 : 1.0

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#070B14]"
    >
      {/* 1. Deep Radial Vignette */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,#0D1326_0%,#070B14_75%)] opacity-95" 
      />

      {/* 2. Technical Architectural Grid with Radial Mask */}
      {showGrid && (
        <div
          className="absolute inset-0 tech-grid opacity-60"
          style={{
            maskImage: 'radial-gradient(ellipse 70% 65% at 50% 30%, black 20%, transparent 85%)',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 65% at 50% 30%, black 20%, transparent 85%)',
          }}
        />
      )}

      {/* 3. Floating Ambient Glow Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Orb A: Electric Blue (Top-Left / Center) */}
        <motion.div
          className="absolute rounded-full pointer-events-none transform-gpu"
          style={{
            width: '650px',
            height: '650px',
            left: '12%',
            top: '5%',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.16) 0%, rgba(37, 99, 235, 0.05) 50%, transparent 70%)',
            filter: 'blur(70px)',
            opacity: 0.9 * opacityMultiplier,
          }}
          animate={
            reducedMotion
              ? undefined
              : {
                  x: [0, 40, -30, 0],
                  y: [0, -35, 25, 0],
                  scale: [1, 1.08, 0.96, 1],
                }
          }
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Orb B: Elegant Violet (Top-Right / Center) */}
        <motion.div
          className="absolute rounded-full pointer-events-none transform-gpu"
          style={{
            width: '600px',
            height: '600px',
            right: '10%',
            top: '12%',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.14) 0%, rgba(124, 58, 237, 0.04) 50%, transparent 70%)',
            filter: 'blur(75px)',
            opacity: 0.85 * opacityMultiplier,
          }}
          animate={
            reducedMotion
              ? undefined
              : {
                  x: [0, -45, 35, 0],
                  y: [0, 40, -30, 0],
                  scale: [1, 0.95, 1.06, 1],
                }
          }
          transition={{
            duration: 26,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />

        {/* Orb C: Deep Indigo Anchor (Bottom Center) */}
        <motion.div
          className="absolute rounded-full pointer-events-none transform-gpu"
          style={{
            width: '800px',
            height: '500px',
            left: '25%',
            bottom: '-10%',
            background: 'radial-gradient(ellipse, rgba(30, 58, 138, 0.12) 0%, rgba(13, 20, 38, 0.05) 60%, transparent 80%)',
            filter: 'blur(90px)',
            opacity: 0.7 * opacityMultiplier,
          }}
          animate={
            reducedMotion
              ? undefined
              : {
                  scale: [1, 1.05, 1],
                  opacity: [0.6 * opacityMultiplier, 0.8 * opacityMultiplier, 0.6 * opacityMultiplier],
                }
          }
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* 4. Sparse Technical Ambient Particles */}
      {showParticles && (
        <div className="absolute inset-0">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full"
              style={{
                left: p.x,
                top: p.y,
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
              }}
              animate={
                reducedMotion
                  ? { opacity: p.opacity }
                  : {
                      y: [0, -18, 0],
                      x: [0, (p.id % 2 === 0 ? 1 : -1) * 8, 0],
                      opacity: [p.opacity * 0.4, p.opacity, p.opacity * 0.4],
                    }
              }
              transition={{
                duration: p.duration,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: p.delay,
              }}
            />
          ))}
        </div>
      )}

      {/* 5. Subtle Technical Scanline Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '100% 4px',
        }}
      />
    </div>
  )
}
