import React, { useState } from 'react'
import { 
  BrainCircuit, 
  Send, 
  Sparkles, 
  Languages 
} from 'lucide-react'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'

export const AIAssistantSection: React.FC = () => {
  const samplePrompts = [
    {
      lang: 'English',
      prompt: 'Optimize my studio for a standing desk and acoustic quiet zone.',
      response: 'Adjusted study layout: Stationed standing desk near east window (natural lighting index 94%). Placed acoustic credenza along party wall with 1.2m main walking corridor.',
      metrics: { clearance: '98%', circulation: 'Optimal', clashes: '0' },
    },
    {
      lang: 'Spanish',
      prompt: 'Reorganizar el dormitorio para maximizar la luz matutina.',
      response: 'Disposición recalculada: Cama orientada a 45° respecto al ventanal este. Zona de paso principal despejada a 1.15m sin interferencia con el giro de la puerta.',
      metrics: { clearance: '96%', circulation: 'Excelente', clashes: '0' },
    },
    {
      lang: 'French',
      prompt: 'Aménager un espace de travail ergonomique avec passage de 1.1m.',
      response: 'Configuration validée: Bureau modulaire positionné avec couloir de circulation conforme PMR (1.12m). Dégagement armoire optimisé.',
      metrics: { clearance: '97%', circulation: 'Conforme', clashes: '0' },
    },
  ]

  const [activePromptIndex, setActivePromptIndex] = useState(0)
  const current = samplePrompts[activePromptIndex]

  return (
    <section id="ai-assistant" className="py-20 sm:py-28 relative z-10 border-t border-blue-500/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="cyan" className="mb-3">
            Natural Language Intelligence
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Multilingual Conversational Design Assistant
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300">
            Describe spatial needs in your preferred language. SpaceFit AI translates conversational prompts
            into validated 3D metric constraints and ergonomic layouts.
          </p>
        </div>

        <div className="max-w-4xl mx-auto glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-blue-500/25 shadow-2xl relative overflow-hidden">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-blue-500/15">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-white">SpaceFit Design Agent</h3>
                  <Badge variant="violet" className="text-[9px]">Preview Mockup</Badge>
                </div>
                <p className="text-xs text-slate-400 font-mono">Semantic Room Geometry Engine</p>
              </div>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center gap-1.5 bg-[#090E1A] p-1 rounded-xl border border-blue-500/15 text-xs">
              <Languages className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
              {samplePrompts.map((p, idx) => (
                <button
                  key={p.lang}
                  type="button"
                  onClick={() => setActivePromptIndex(idx)}
                  className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                    activePromptIndex === idx
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p.lang}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Chat Stream Simulation */}
          <div className="py-6 space-y-4">
            {/* User message */}
            <div className="flex items-start justify-end gap-3">
              <div className="bg-blue-600/30 border border-blue-500/40 rounded-2xl rounded-tr-sm p-4 max-w-lg text-sm text-slate-100 shadow-lg">
                <p className="font-sans">{current.prompt}</p>
                <span className="text-[10px] font-mono text-blue-300 mt-2 block">
                  Input: Natural Language ({current.lang})
                </span>
              </div>
            </div>

            {/* AI Assistant response */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-cyan-300 shrink-0 mt-1">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="glass-panel rounded-2xl rounded-tl-sm p-4.5 max-w-xl text-sm border border-blue-500/20 space-y-3">
                <p className="text-slate-200 leading-relaxed">{current.response}</p>

                {/* Spatial Validation Telemetry */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-blue-500/15 text-xs font-mono">
                  <div className="p-2 rounded-lg bg-[#0A0F1D] border border-blue-500/10">
                    <span className="text-[10px] text-slate-400 uppercase block">Walk Clearance</span>
                    <span className="text-emerald-400 font-bold">{current.metrics.clearance}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#0A0F1D] border border-blue-500/10">
                    <span className="text-[10px] text-slate-400 uppercase block">Circulation</span>
                    <span className="text-blue-300 font-bold">{current.metrics.circulation}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#0A0F1D] border border-blue-500/10">
                    <span className="text-[10px] text-slate-400 uppercase block">Clashes</span>
                    <span className="text-cyan-300 font-bold">{current.metrics.clashes}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Input Bar Mockup */}
          <div className="pt-4 border-t border-blue-500/15 flex items-center gap-3">
            <div className="flex-1 bg-[#090E1A] border border-blue-500/25 rounded-xl px-4 py-3 text-xs text-slate-400 flex items-center justify-between">
              <span className="truncate">Ask AI to modify furniture, adjust clearances, or recalculate lighting...</span>
              <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">Active in Phase 3</span>
            </div>
            <Button variant="primary" size="sm" disabled leftIcon={<Send className="w-3.5 h-3.5" />}>
              Send
            </Button>
          </div>

          {/* Honest Notice Callout */}
          <div className="mt-4 text-center">
            <span className="text-[11px] font-mono text-slate-500">
              * Interactive conversational preview showcasing multilingual prompt parsing and spatial metric synthesis. Live LLM execution connects in Phase 3.
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
