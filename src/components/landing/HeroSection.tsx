import React from 'react'
import { Link } from 'react-router-dom'
import { motion, type Variants } from 'framer-motion'
import { Sparkles, ArrowRight, Compass, ShieldCheck, Box, Sliders, Layers } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import { InteractiveRoomPreview } from '@/components/landing/InteractiveRoomPreview'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export const HeroSection: React.FC = () => {
  const reducedMotion = useReducedMotion()

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: reducedMotion ? 0 : 0.12,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: reducedMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
    },
  }

  return (
    <section className="relative pt-6 pb-20 sm:pb-28 overflow-hidden">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
      >
        {/* Top Feature Pill */}
        <motion.div variants={itemVariants} className="inline-flex items-center justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 backdrop-blur-md shadow-inner">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-medium text-blue-200">
              Phase 2 Product Architecture & Workspace
            </span>
            <Badge variant="blue" className="text-[9px] py-0 px-1.5">Active</Badge>
          </div>
        </motion.div>

        {/* Primary Headline */}
        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.12]"
        >
          Design Smarter.{' '}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            Live Better.
          </span>
        </motion.h1>

        {/* Subtitle / Product Description */}
        <motion.p
          variants={itemVariants}
          className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed"
        >
          Create intelligent room layouts, explore immersive 3D spaces, and optimize every inch with an AI-powered design companion.
        </motion.p>

        {/* Action CTAs */}
        <motion.div
          variants={itemVariants}
          className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto"
        >
          <Link to="/design/new" className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto glow-blue shadow-blue-500/30 font-semibold"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Start Designing
            </Button>
          </Link>
          <Link to="/dashboard" className="w-full sm:w-auto">
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto text-slate-200 hover:text-white"
              leftIcon={<Compass className="w-4 h-4 text-blue-400" />}
            >
              Explore the Platform
            </Button>
          </Link>
        </motion.div>

        {/* Floating Informational Labels & Room Preview Composition */}
        <motion.div variants={itemVariants} className="relative mt-14 max-w-5xl mx-auto">
          {/* Floating Pill A: Smart Layout */}
          <div className="hidden md:flex absolute -top-5 left-8 z-20 items-center gap-2 px-3.5 py-1.5 rounded-xl glass-dropdown border border-blue-400/30 text-xs font-mono text-blue-200 shadow-xl animate-bounce [animation-duration:4s]">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Smart Layout: 98% Circulation</span>
          </div>

          {/* Floating Pill B: Space Analysis */}
          <div className="hidden md:flex absolute -top-5 right-8 z-20 items-center gap-2 px-3.5 py-1.5 rounded-xl glass-dropdown border border-emerald-400/30 text-xs font-mono text-emerald-200 shadow-xl animate-bounce [animation-duration:5s]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Space Analysis: 0 Clashes</span>
          </div>

          {/* Floating Pill C: 3D Preview */}
          <div className="hidden md:flex absolute -bottom-5 right-12 z-20 items-center gap-2 px-3.5 py-1.5 rounded-xl glass-dropdown border border-purple-400/30 text-xs font-mono text-purple-200 shadow-xl">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>3D Preview: Product Visualization</span>
          </div>

          {/* Interactive Room Preview Canvas */}
          <InteractiveRoomPreview />
        </motion.div>

        {/* Key Platform Highlights */}
        <motion.div
          variants={itemVariants}
          className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto text-left"
        >
          <div className="glass-panel p-3.5 rounded-xl border border-blue-500/15 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-400 shrink-0">
              <Box className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">3D Digital Twin</p>
              <p className="text-[11px] text-slate-400">Accurate scale & bounds</p>
            </div>
          </div>

          <div className="glass-panel p-3.5 rounded-xl border border-blue-500/15 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Multilingual NLP</p>
              <p className="text-[11px] text-slate-400">Prompt to room layout</p>
            </div>
          </div>

          <div className="glass-panel p-3.5 rounded-xl border border-blue-500/15 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Zero Collision</p>
              <p className="text-[11px] text-slate-400">Real-time clash engine</p>
            </div>
          </div>

          <div className="glass-panel p-3.5 rounded-xl border border-blue-500/15 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center text-cyan-400 shrink-0">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Walking Clearance</p>
              <p className="text-[11px] text-slate-400">Ergonomic pathways</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
