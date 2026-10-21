import React, { useRef, useEffect } from 'react'
import {
  User,
  Bot,
  Volume2,
  VolumeX,
  Sparkles,
  Cpu
} from 'lucide-react'
import { Badge } from '@/components/common/Badge'
import { ActionPreviewCard } from './ActionPreviewCard'
import type { ChatMessage, ToolCall, SpatialToolContext } from '@/types/assistant'
import type { CandidateLayout } from '@/types/optimizer'
import { speakText, stopSpeech, isSpeechSynthesisSupported } from '@/utils/nlp/voiceService'

interface ChatMessageListProps {
  messages: ChatMessage[]
  isThinking: boolean
  onConfirmToolCall: (toolCall: ToolCall) => void
  onCancelToolCall: (toolCall: ToolCall) => void
  onPreviewCandidate?: (candidate: CandidateLayout | null) => void
  context?: SpatialToolContext
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  isThinking,
  onConfirmToolCall,
  onCancelToolCall,
  onPreviewCandidate,
  context,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null)
  const [speakingId, setSpeakingId] = React.useState<string | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking])

  const handleSpeak = (msg: ChatMessage) => {
    if (speakingId === msg.id) {
      stopSpeech()
      setSpeakingId(null)
    } else {
      stopSpeech()
      speakText(msg.content, msg.detectedLanguage || 'en')
      setSpeakingId(msg.id)
    }
  }

  const getLanguageLabel = (lang?: string) => {
    switch (lang) {
      case 'ta':
        return 'தமிழ்'
      case 'thanglish':
        return 'Thanglish'
      case 'hi':
        return 'हिन्दी'
      case 'en':
      default:
        return 'English'
    }
  }

  return (
    <div className="flex-1 overflow-y-auto space-y-4 pr-1 font-mono text-xs">
      {messages.map((msg) => {
        const isUser = msg.role === 'user'

        return (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border ${
                isUser
                  ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                  : 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
              }`}
            >
              {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[85%] rounded-2xl p-3.5 space-y-2 border ${
                isUser
                  ? 'bg-blue-600 text-white border-blue-400/40 rounded-tr-sm shadow-md'
                  : 'bg-slate-900/90 text-slate-200 border-blue-500/20 rounded-tl-sm shadow-lg'
              }`}
            >
              {/* Message Header info for Assistant */}
              {!isUser && (
                <div className="flex items-center justify-between gap-2 border-b border-blue-500/10 pb-1.5 text-[10px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    {msg.source === 'gemini_api' ? (
                      <span className="flex items-center gap-1 text-purple-300">
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        <span>Gemini 2.5</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-cyan-300">
                        <Cpu className="w-3 h-3 text-cyan-400" />
                        <span>Spatial NLP</span>
                      </span>
                    )}

                    <span className="text-slate-600">•</span>
                    <Badge variant="subtle" className="text-[9px] px-1.5 py-0">
                      {getLanguageLabel(msg.detectedLanguage)}
                    </Badge>
                  </div>

                  {isSpeechSynthesisSupported() && (
                    <button
                      type="button"
                      onClick={() => handleSpeak(msg)}
                      className="text-slate-400 hover:text-cyan-300 p-0.5"
                      title={speakingId === msg.id ? 'Stop Voice' : 'Listen Voice'}
                    >
                      {speakingId === msg.id ? (
                        <VolumeX className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              )}

              {/* Text Content */}
              <div className="whitespace-pre-wrap leading-relaxed text-xs">
                {msg.content}
              </div>

              {/* Tool Calls */}
              {msg.toolCalls && msg.toolCalls.length > 0 && (
                <div className="space-y-2 pt-1">
                  {msg.toolCalls.map((tc) => (
                    <ActionPreviewCard
                      key={tc.id}
                      toolCall={tc}
                      onConfirm={onConfirmToolCall}
                      onCancel={onCancelToolCall}
                      onPreviewCandidate={onPreviewCandidate}
                      context={context}
                    />
                  ))}
                </div>
              )}

              {/* Timestamp */}
              <div className="text-[10px] text-slate-400/80 text-right">
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        )
      })}

      {/* Thinking Indicator */}
      {isThinking && (
        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
            <Bot className="w-3.5 h-3.5" />
          </div>
          <div className="p-3 rounded-2xl bg-slate-900 border border-cyan-500/30 text-cyan-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs">Processing spatial intent &amp; room model...</span>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
