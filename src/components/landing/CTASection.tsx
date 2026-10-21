import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Layers, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'

export const CTASection: React.FC = () => {
  return (
    <section className="py-20 relative z-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl glass-panel-elevated p-8 sm:p-14 border border-blue-500/30 overflow-hidden text-center shadow-2xl">
          {/* Background Ambient Glow */}
          <div className="absolute top-0 right-1/4 w-80 h-80 bg-blue-500/15 rounded-full blur-[90px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-purple-500/15 rounded-full blur-[90px] pointer-events-none" />

          <Badge variant="blue" className="mb-4">
            Phase 1 Ready
          </Badge>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white max-w-2xl mx-auto">
            Ready to Experience the Next Dimension of Space Planning?
          </h2>

          <p className="mt-4 text-slate-300 text-sm sm:text-lg max-w-xl mx-auto leading-relaxed">
            Test the UI foundation today and step into the future of interactive 3D digital twins and collision-aware layout engineering.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/design/new" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto glow-blue shadow-blue-500/30 font-semibold"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Create New Room Design
              </Button>
            </Link>
            <Link to="/dashboard" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
                leftIcon={<Layers className="w-4 h-4 text-cyan-400" />}
              >
                Open Dashboard Preview
              </Button>
            </Link>
          </div>

          <div className="mt-10 pt-6 border-t border-blue-500/15 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Zero Clashing Tolerance
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-400" />
              Standard Metric & Imperial Grids
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-purple-400" />
              Phase 2 3D Engine Ready
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
