import React from 'react'
import { Ruler, BrainCircuit, PlayCircle, SplitSquareVertical, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/common/Badge'

export const WorkflowSection: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Define Your Room',
      desc: 'Enter room length, width, and ceiling height. Position doors, windows, and structural obstacles with precision.',
      icon: <Ruler className="w-5 h-5 text-blue-400" />,
      color: 'blue',
    },
    {
      step: '02',
      title: 'Design & Optimize',
      desc: 'Our spatial layout engine calculates ergonomic pathways, focal points, and zero-collision furniture clusters.',
      icon: <BrainCircuit className="w-5 h-5 text-purple-400" />,
      color: 'purple',
    },
    {
      step: '03',
      title: 'Walk Through',
      desc: 'Inspect your 3D digital twin at eye level to experience real volumetric proportions and accessibility corridors.',
      icon: <PlayCircle className="w-5 h-5 text-cyan-400" />,
      color: 'cyan',
    },
    {
      step: '04',
      title: 'Compare Results',
      desc: 'Examine before-and-after spatial metrics, circulation efficiency gains, and export furniture layout specifications.',
      icon: <SplitSquareVertical className="w-5 h-5 text-emerald-400" />,
      color: 'emerald',
    },
  ]

  return (
    <section id="how-it-works" className="py-20 sm:py-28 relative z-10 border-t border-blue-500/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="violet" className="mb-3">
            How It Works
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Connected Four-Step Spatial Workflow
          </h2>
          <p className="mt-3 text-slate-300 text-sm sm:text-base">
            From initial perimeter dimensions to verified 3D layout optimization in minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((item, index) => (
            <div
              key={item.step}
              className="glass-panel p-6 rounded-2xl border border-blue-500/20 relative group hover:border-blue-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span className="text-2xl font-black font-mono text-slate-600 group-hover:text-blue-400 transition-colors">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>

              {/* Connecting arrow indicator for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-20 text-blue-500/40">
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
