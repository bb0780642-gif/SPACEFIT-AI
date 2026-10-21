import React, { useState } from 'react'
import { 
  Box, 
  Sparkles, 
  SplitSquareVertical, 
  CheckCircle2, 
  Cpu,
  Footprints,
  Palette
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'

interface FeatureItem {
  id: string
  title: string
  category: string
  badge?: string
  description: string
  icon: React.ReactNode
  accentColor: string
  highlights: string[]
}

export const FeaturesSection: React.FC = () => {
  const [selectedFeature, setSelectedFeature] = useState<string>('3d-twin')

  const features: FeatureItem[] = [
    {
      id: '3d-twin',
      title: 'Interactive 3D Digital Twin',
      category: 'Visualization Engine',
      badge: 'Core Architecture',
      accentColor: 'blue',
      icon: <Box className="w-5 h-5 text-blue-400" />,
      description:
        'Convert architectural room dimensions into high-fidelity 3D spatial digital twins with realistic lighting, door sweeps, and wall boundaries.',
      highlights: [
        'Accurate metric & imperial dimensional constraints',
        'Wall, window aperture, and door swing modeling',
        'Lightweight Three.js WebGL geometry pipeline',
      ],
    },
    {
      id: 'layout-opt',
      title: 'Intelligent Layout Optimization',
      category: 'Spatial Intelligence',
      badge: 'Algorithmic Engine',
      accentColor: 'violet',
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
      description:
        'Algorithmic placement rules optimize furniture based on ergonomics, natural light, circulation flow, and user preferences.',
      highlights: [
        'Circulation efficiency index scoring',
        'Focal point and ergonomic sightline balancing',
        'Automatic modular cluster generation',
      ],
    },
    {
      id: 'nlp-assistant',
      title: 'Multilingual NLP AI Assistant',
      category: 'Natural Language',
      badge: 'Conversational',
      accentColor: 'cyan',
      icon: <Cpu className="w-5 h-5 text-cyan-400" />,
      description:
        'Instruct SpaceFit AI in plain language across multiple languages to rearrange layouts, maximize workspace, or swap aesthetics.',
      highlights: [
        'Semantic parsing of intent, style, and room constraints',
        'Multilingual prompt comprehension (English, Spanish, French, etc.)',
        'Context-aware spatial reasoning and advice',
      ],
    },
    {
      id: 'clearance-analysis',
      title: 'Movement & Clearance Analysis',
      category: 'Physics & Clearance',
      badge: 'Safety Engine',
      accentColor: 'emerald',
      icon: <Footprints className="w-5 h-5 text-emerald-400" />,
      description:
        'Mathematical bounding analysis evaluates human walking corridors and door clearance arcs to guarantee zero physical clashing.',
      highlights: [
        'Real-time clearance heatmap visualization',
        'Minimum 0.9m ADA-compliant pathway verification',
        'Interactive collision flags and auto-snapping',
      ],
    },
    {
      id: 'before-after',
      title: 'Before-and-After Comparison',
      category: 'Spatial Analytics',
      badge: 'Analytics',
      accentColor: 'amber',
      icon: <SplitSquareVertical className="w-5 h-5 text-amber-400" />,
      description:
        'Contrast existing cluttered floor plans against AI-optimized layouts with side-by-side metric analytics and circulation gains.',
      highlights: [
        'Interactive split-slider visual comparison',
        'Circulation gain & usable square footage metrics',
        'Exportable architectural summary sheets',
      ],
    },
    {
      id: 'personalized-design',
      title: 'Personalized Room Design',
      category: 'Design Intelligence',
      badge: 'Adaptive',
      accentColor: 'rose',
      icon: <Palette className="w-5 h-5 text-rose-400" />,
      description:
        'Tailor layouts to personal lifestyles—from dual-monitor streaming desks to serene sleep zones—matching color palettes and furniture aesthetics.',
      highlights: [
        'Lifestyle profile matching (Work, Rest, Entertain)',
        'Ergonomic posture and reachability zones',
        'Curated aesthetic materials and palette pairings',
      ],
    },
  ]

  return (
    <section id="features" className="py-20 sm:py-28 relative z-10 border-t border-blue-500/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="blue" className="mb-3">
            Product Capabilities
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Engineered for Precision Spatial Intelligence
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300">
            SpaceFit AI eliminates spatial guesswork. Explore the architectural capabilities planned for
            the intelligent 3D room platform.
          </p>
          <p className="mt-2 text-xs font-mono text-slate-400">
            * Capability overview — Procedural 3D engine and AI models integrate in subsequent phases.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const isSelected = selectedFeature === feature.id
            return (
              <Card
                key={feature.id}
                variant="interactive"
                glow={feature.accentColor === 'blue' ? 'blue' : 'violet'}
                onClick={() => setSelectedFeature(feature.id)}
                className={`flex flex-col justify-between ${
                  isSelected ? 'border-blue-500/50 bg-[#131E38]' : ''
                }`}
              >
                <div>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        {feature.icon}
                      </div>
                      {feature.badge && (
                        <Badge
                          variant={
                            feature.accentColor === 'violet'
                              ? 'violet'
                              : feature.accentColor === 'emerald'
                              ? 'emerald'
                              : feature.accentColor === 'cyan'
                              ? 'cyan'
                              : feature.accentColor === 'rose'
                              ? 'rose'
                              : feature.accentColor === 'amber'
                              ? 'amber'
                              : 'blue'
                          }
                          className="text-[10px]"
                        >
                          {feature.badge}
                        </Badge>
                      )}
                    </div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                      {feature.category}
                    </span>
                    <CardTitle className="text-lg mt-1 text-white group-hover:text-blue-300 transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>

                  <CardDescription className="mb-6">
                    {feature.description}
                  </CardDescription>
                </div>

                <CardContent className="pt-4 border-t border-blue-500/10">
                  <ul className="space-y-2 text-xs text-slate-300 font-sans">
                    {feature.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
