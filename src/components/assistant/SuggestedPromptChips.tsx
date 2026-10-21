import React from 'react'
import { Sparkles } from 'lucide-react'
import type { SupportedLanguage } from '@/types/assistant'

interface SuggestedPromptChipsProps {
  language: SupportedLanguage
  onSelectPrompt: (prompt: string) => void
  disabled?: boolean
}

export const SuggestedPromptChips: React.FC<SuggestedPromptChipsProps> = ({
  language,
  onSelectPrompt,
  disabled,
}) => {
  const getPrompts = (): { label: string; prompt: string }[] => {
    switch (language) {
      case 'ta':
        return [
          {
            label: 'நடைபாதை அதிகமாக்கு',
            prompt: 'என் அறையில் நடப்பதற்கு அதிக இடம் இருக்கும்படி தளவமைப்பை மாற்று.',
          },
          {
            label: 'கட்டில் & மேஜை சேர்',
            prompt: 'அறைக்குள் ஒரு குயின் பெட் மற்றும் மேஜை சேர்.',
          },
          {
            label: 'மோதல்களை சரிபார்',
            prompt: 'அறையில் ஏதேனும் மோதல்கள் அல்லது தடைகள் உள்ளதா என்று சரிபார்.',
          },
          {
            label: 'அறை அளவுகள்',
            prompt: 'அறையின் பரிமாணங்கள் மற்றும் பரப்பளவு என்ன?',
          },
        ]

      case 'thanglish':
        return [
          {
            label: 'Max Walking Space',
            prompt: 'En room-la walking space adhigama irukka bed and table-ai arrange pannu.',
          },
          {
            label: 'Add Queen Bed',
            prompt: 'Oru queen bed add pannu.',
          },
          {
            label: 'Study Layout Near Window',
            prompt: 'Desk-ai window pakkathula daylight kedaikura maari study layout optimize pannu.',
          },
          {
            label: 'Check Collisions',
            prompt: 'Room-la edhavadhu collision irukka nu check pannu.',
          },
        ]

      case 'hi':
        return [
          {
            label: 'वॉकिंग स्पेस बढ़ाओ',
            prompt: 'कमरे में चलने के लिए ज्यादा जगह बनाने हेतु फर्नीचर अरेंज करो।',
          },
          {
            label: 'बेड और मेज जोड़ो',
            prompt: 'कमरे में एक क्वीन बेड और स्टडी डेस्क जोड़ो।',
          },
          {
            label: 'टक्कर की जांच करो',
            prompt: 'कमरे में फर्नीचर की टक्कर और क्लीयरेंस चेक करो।',
          },
          {
            label: 'कमरे का आकार',
            prompt: 'कमरे का आकार और फ्लोर एरिया कितना है?',
          },
        ]

      case 'en':
      case 'auto':
      default:
        return [
          {
            label: 'Max Walking Space',
            prompt: 'Arrange the furniture to maximize open walking and circulation space.',
          },
          {
            label: 'Add Queen Bed & Desk',
            prompt: 'Add a queen platform bed and a workstation desk.',
          },
          {
            label: 'Study & Natural Light',
            prompt: 'Optimize the layout for study productivity with desk near the window.',
          },
          {
            label: 'Validate Clearances',
            prompt: 'Check for furniture collisions and entrance clearance issues.',
          },
        ]
    }
  }

  const prompts = getPrompts()

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
        <Sparkles className="w-3 h-3 text-cyan-400" />
        <span>Suggested Prompts:</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {prompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            disabled={disabled}
            onClick={() => onSelectPrompt(p.prompt)}
            className="px-2.5 py-1 rounded-lg bg-blue-950/60 hover:bg-blue-900/60 border border-blue-500/25 hover:border-cyan-500/50 text-[11px] font-mono text-slate-300 hover:text-cyan-200 transition-all text-left shadow-sm disabled:opacity-50"
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  )
}
