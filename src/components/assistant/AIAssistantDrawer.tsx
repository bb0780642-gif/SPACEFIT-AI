import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Sparkles,
  X,
  Send,
  Mic,
  MicOff,
  Settings,
  Trash2,
  Globe,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import { ChatMessageList } from './ChatMessageList'
import { SuggestedPromptChips } from './SuggestedPromptChips'
import { ApiKeyModal } from './ApiKeyModal'
import type {
  ChatMessage,
  SupportedLanguage,
  DetectedLanguage,
  ToolCall,
  SpatialToolContext,
} from '@/types/assistant'
import type { CandidateLayout } from '@/types/optimizer'
import { detectLanguage } from '@/utils/nlp/languageDetector'
import { parseIntentDeterministically, buildToolCallFromIntent } from '@/utils/nlp/intentParser'
import { executeToolAction } from '@/utils/nlp/toolRegistry'
import {
  callGeminiAssistant,
  getGeminiApiKey,
} from '@/utils/nlp/geminiService'
import {
  generateOptimizationResponse,
  generateAddFurnitureResponse,
  generateValidationResponse,
} from '@/utils/nlp/responseGenerator'
import {
  isSpeechRecognitionSupported,
  createSpeechRecognizer,
} from '@/utils/nlp/voiceService'

interface AIAssistantDrawerProps {
  isOpen: boolean
  onClose: () => void
  context: SpatialToolContext
  onPreviewCandidate?: (candidate: CandidateLayout | null) => void
}

const INITIAL_MESSAGES: Record<SupportedLanguage, string> = {
  auto: 'Hello! I am your SpaceFit AI assistant. I can optimize your furniture layout, add new items, inspect spatial clearances, and check collisions. You can talk to me in English, Tamil (தமிழ்), Thanglish, or Hindi (हिन्दी)!',
  en: 'Hello! I am your SpaceFit AI assistant. How would you like to arrange your room today?',
  ta: 'வணக்கம்! நான் உங்கள் SpaceFit AI உதவியாளர். உங்கள் அறையின் தளவமைப்பை நடைபாதைக்கேற்ப மாற்றலாம் அல்லது புதிய பொருட்களை சேர்க்கலாம்.',
  thanglish: 'Vanakkam! Naan unga SpaceFit AI assistant. "En room-la walking space adhigama arrange pannu" nu sollunga, naan layout ready pandren!',
  hi: 'नमस्ते! मैं आपका SpaceFit AI सहायक हूँ। आप कमरे का लेआउट अनुकूलित करने या नया फर्नीचर जोड़ने के लिए कह सकते हैं।',
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  context,
  onPreviewCandidate,
}) => {
  const [preferredLanguage, setPreferredLanguage] = useState<SupportedLanguage>('auto')
  const [inputText, setInputText] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [speechRecognizer, setSpeechRecognizer] = useState<any | null>(null)

  // Messages list state
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'init-msg',
      role: 'assistant',
      content: INITIAL_MESSAGES.auto,
      timestamp: Date.now(),
      detectedLanguage: 'en',
      source: 'local_parser',
    },
  ])

  useEffect(() => {
    setApiKey(getGeminiApiKey())
  }, [isOpen])

  // Context summary string for LLM
  const roomSummary = useMemo(() => {
    const cfg = context.roomConfiguration
    const furn = context.furniture
    const area = (cfg.widthMeters * cfg.lengthMeters).toFixed(1)
    const errs = context.validationResult.errors.length
    return `Room Name: ${context.projectName}
Dimensions: ${cfg.widthMeters}m width × ${cfg.lengthMeters}m length (Area: ${area} m², Ceiling: ${cfg.ceilingHeightMeters}m)
Placed Furniture (${furn.length} items): ${furn.map((f) => `${f.name} at (${f.position[0]}, ${f.position[2]})`).join(', ')}
Doors: ${cfg.doors.length}, Windows: ${cfg.windows.length}
Collision Errors: ${errs}`
  }, [context])

  // Clean speech recognizer on unmount or close
  useEffect(() => {
    return () => {
      if (speechRecognizer) {
        try {
          speechRecognizer.abort()
        } catch {
          // ignore
        }
      }
    }
  }, [speechRecognizer])

  // Toggle voice recognition
  const handleToggleVoice = () => {
    if (isListening) {
      if (speechRecognizer) {
        try {
          speechRecognizer.stop()
        } catch {
          // ignore
        }
      }
      setIsListening(false)
      return
    }

    if (!isSpeechRecognitionSupported()) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.')
      return
    }

    const langToUse: DetectedLanguage =
      preferredLanguage === 'auto' ? 'en' : (preferredLanguage as DetectedLanguage)

    const recognizer = createSpeechRecognizer(
      langToUse,
      (transcript) => {
        setInputText(transcript)
        setIsListening(false)
      },
      (err) => {
        console.warn('Speech error:', err)
        setIsListening(false)
      },
      () => {
        setIsListening(false)
      }
    )

    if (recognizer) {
      setSpeechRecognizer(recognizer)
      try {
        recognizer.start()
        setIsListening(true)
      } catch (e) {
        console.error('Could not start speech recognition', e)
        setIsListening(false)
      }
    }
  }

  // Handle Confirming a Tool Call
  const handleConfirmToolCall = useCallback(
    (tc: ToolCall) => {
      // Execute tool
      const execResult = executeToolAction(tc.tool, tc.parameters, context)

      // Update tool call state in messages
      setMessages((prev) =>
        prev.map((msg) => {
          if (!msg.toolCalls) return msg
          return {
            ...msg,
            toolCalls: msg.toolCalls.map((t) =>
              t.id === tc.id
                ? {
                    ...t,
                    status: execResult.success ? 'executed' : 'failed',
                    errorMessage: execResult.success ? undefined : execResult.message,
                  }
                : t
            ),
          }
        })
      )

      // Add assistant confirmation response
      if (tc.tool === 'apply_candidate_layout' || tc.tool === 'optimize_layout') {
        const confirmMsg: ChatMessage = {
          id: `sys-${Date.now()}`,
          role: 'assistant',
          content: `Layout applied to the 3D room model! Coordinates have been updated and saved to project history.`,
          timestamp: Date.now(),
          detectedLanguage: 'en',
          source: 'local_parser',
        }
        setMessages((prev) => [...prev, confirmMsg])
      }
    },
    [context]
  )

  // Handle Cancelling a Tool Call
  const handleCancelToolCall = useCallback((tc: ToolCall) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (!msg.toolCalls) return msg
        return {
          ...msg,
          toolCalls: msg.toolCalls.map((t) =>
            t.id === tc.id ? { ...t, status: 'cancelled' } : t
          ),
        }
      })
    )
  }, [])

  // Execute user message
  const handleSendMessage = async (textToSend?: string) => {
    const raw = (textToSend || inputText).trim()
    if (!raw || isThinking) return

    setInputText('')
    const detected = detectLanguage(raw)
    const effectiveLanguage: DetectedLanguage =
      preferredLanguage !== 'auto'
        ? (preferredLanguage as DetectedLanguage)
        : detected.language

    // 1. Add User Message
    const userMessageId = `user-${Date.now()}`
    const userMsg: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: raw,
      timestamp: Date.now(),
      detectedLanguage: effectiveLanguage,
    }
    setMessages((prev) => [...prev, userMsg])
    setIsThinking(true)

    // Check if Gemini API Key is configured
    const activeKey = getGeminiApiKey()

    if (activeKey) {
      // --- GEMINI LIVE LLM CALL ---
      try {
        const historyForGemini = messages
          .filter((m) => m.role === 'user' || m.role === 'assistant')
          .slice(-6)
          .map((m) => ({
            role: (m.role === 'user' ? 'user' : 'model') as 'user' | 'model',
            parts: [{ text: m.content }],
          }))

        const geminiRes = await callGeminiAssistant(
          raw,
          historyForGemini,
          roomSummary,
          effectiveLanguage
        )

        if (geminiRes.success) {
          // If Gemini requested tool calls, prepare them
          const executedToolCalls: ToolCall[] = []
          let responseText = geminiRes.content

          if (geminiRes.toolCalls && geminiRes.toolCalls.length > 0) {
            for (const tc of geminiRes.toolCalls) {
              if (tc.requiresConfirmation) {
                // If it is optimize_layout, run calculation first so candidate preview data is ready
                if (tc.tool === 'optimize_layout') {
                  const exec = executeToolAction(tc.tool, tc.parameters, context)
                  tc.resultData = exec.resultData
                  if (exec.success && (exec.resultData as any)?.candidates?.length) {
                    responseText =
                      responseText ||
                      generateOptimizationResponse(
                        (exec.resultData as any).candidates,
                        (tc.parameters.mode as string) || 'movement-first',
                        effectiveLanguage
                      )
                  }
                }
                executedToolCalls.push(tc)
              } else {
                // Execute safe tool immediately
                const exec = executeToolAction(tc.tool, tc.parameters, context)
                tc.status = exec.success ? 'executed' : 'failed'
                tc.resultData = exec.resultData
                if (!responseText) {
                  responseText = exec.message
                }
                executedToolCalls.push(tc)
              }
            }
          }

          const assistantMsg: ChatMessage = {
            id: `asst-${Date.now()}`,
            role: 'assistant',
            content: responseText || 'Done.',
            timestamp: Date.now(),
            detectedLanguage: effectiveLanguage,
            toolCalls: executedToolCalls.length > 0 ? executedToolCalls : undefined,
            source: 'gemini_api',
          }
          setMessages((prev) => [...prev, assistantMsg])
          setIsThinking(false)
          return
        } else {
          // Gemini failed (invalid key, rate limit, or network)
          console.warn('Gemini API call failed:', geminiRes.errorMessage)
          // Fall through to deterministic parser with explicit notice
        }
      } catch (e) {
        console.error('Error invoking Gemini:', e)
      }
    }

    // --- DETERMINISTIC MULTILINGUAL SPATIAL PARSER (OFFLINE / FALLBACK) ---
    const intentRes = parseIntentDeterministically(raw, preferredLanguage)

    if (intentRes.intent === 'clarification_needed') {
      const clarifyMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: intentRes.clarifyingQuestion || 'Could you clarify that request?',
        timestamp: Date.now(),
        detectedLanguage: intentRes.language,
        source: 'local_parser',
      }
      setMessages((prev) => [...prev, clarifyMsg])
      setIsThinking(false)
      return
    }

    const toolCall = buildToolCallFromIntent(intentRes)
    if (!toolCall) {
      setIsThinking(false)
      return
    }

    let replyText = ''
    if (toolCall.tool === 'optimize_layout') {
      // Run candidate calculation for preview
      const exec = executeToolAction('optimize_layout', toolCall.parameters, context)
      toolCall.resultData = exec.resultData
      if (exec.success && (exec.resultData as any)?.candidates?.length) {
        replyText = generateOptimizationResponse(
          (exec.resultData as any).candidates,
          (toolCall.parameters.mode as string) || 'movement-first',
          effectiveLanguage
        )
      } else {
        replyText = exec.message
      }
    } else if (toolCall.requiresConfirmation) {
      replyText = `Please confirm before executing: ${toolCall.description}`
    } else {
      // Safe tool execution immediately
      const exec = executeToolAction(toolCall.tool, toolCall.parameters, context)
      toolCall.status = exec.success ? 'executed' : 'failed'
      toolCall.resultData = exec.resultData
      if (toolCall.tool === 'add_furniture' && exec.success) {
        replyText = generateAddFurnitureResponse(
          (exec.resultData as any)?.name || 'item',
          effectiveLanguage
        )
      } else if (toolCall.tool === 'validate_geometry' && exec.success) {
        replyText = generateValidationResponse(
          context.validationResult.isValid,
          context.validationResult.errors.length,
          context.validationResult.warnings.length,
          effectiveLanguage
        )
      } else {
        replyText = exec.message
      }
    }

    const assistantMsg: ChatMessage = {
      id: `asst-${Date.now()}`,
      role: 'assistant',
      content: replyText,
      timestamp: Date.now(),
      detectedLanguage: effectiveLanguage,
      toolCalls: [toolCall],
      source: 'local_parser',
    }
    setMessages((prev) => [...prev, assistantMsg])
    setIsThinking(false)
  }

  const handleClearHistory = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        role: 'assistant',
        content: INITIAL_MESSAGES[preferredLanguage] || INITIAL_MESSAGES.auto,
        timestamp: Date.now(),
        detectedLanguage: 'en',
        source: 'local_parser',
      },
    ])
  }

  const getPlaceholderText = () => {
    switch (preferredLanguage) {
      case 'ta':
        return 'அறை மாற்றங்களை தமிழில் கேளுங்கள் (எ.கா: நடைபாதை அதிகமாக்கு)...'
      case 'thanglish':
        return 'Thanglish-la sollunga (e.g. En room-la walking space adhigama arrange pannu)...'
      case 'hi':
        return 'कमरे के लेआउट के लिए कहें (उदा: वॉकिंग स्पेस बढ़ाओ)...'
      case 'en':
      case 'auto':
      default:
        return 'Ask SpaceFit AI (e.g., "Arrange for max walking space" or "Add queen bed")...'
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-slate-950/95 border-l border-blue-500/30 backdrop-blur-2xl shadow-2xl flex flex-col font-mono text-xs animate-slideInRight">
        {/* Header */}
        <div className="p-4 border-b border-blue-500/20 bg-gradient-to-r from-blue-950/80 via-slate-950 to-purple-950/80 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm">SpaceFit AI</span>
                <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30">
                  NLP Assistant
                </span>
              </div>
              <div className="text-[10px] text-slate-400">
                Multilingual Spatial Intelligence
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Language Selector Dropdown */}
            <div className="relative flex items-center">
              <Globe className="w-3.5 h-3.5 text-slate-400 mr-1" />
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value as SupportedLanguage)}
                className="bg-slate-900 border border-blue-500/30 rounded-lg px-2 py-1 text-[11px] text-cyan-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
                title="Select Assistant Language"
              >
                <option value="auto">Auto Detect</option>
                <option value="en">English</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="thanglish">Thanglish</option>
                <option value="hi">हिन्दी (Hindi)</option>
              </select>
            </div>

            {/* API Key Settings Button */}
            <button
              type="button"
              onClick={() => setIsApiKeyModalOpen(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Assistant API Configuration"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Clear History Button */}
            <button
              type="button"
              onClick={handleClearHistory}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              title="Clear Conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Close Drawer Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Active Room Telemetry Strip */}
        <div className="px-4 py-2 bg-blue-950/40 border-b border-blue-500/15 flex items-center justify-between text-[11px] text-slate-300 shrink-0">
          <div className="flex items-center gap-2 truncate">
            <span className="text-cyan-400 font-semibold">{context.projectName}</span>
            <span className="text-slate-600">•</span>
            <span>{context.furniture.length} items</span>
          </div>
          <Badge
            variant={context.validationResult.isValid ? 'emerald' : 'rose'}
            className="text-[9px] py-0 px-1.5"
          >
            {context.validationResult.isValid ? 'SAT Valid' : `${context.validationResult.errors.length} Issues`}
          </Badge>
        </div>

        {/* LLM Status Banner */}
        <div className="px-4 py-1.5 bg-slate-900/60 border-b border-blue-500/10 flex items-center justify-between text-[10px] text-slate-400 shrink-0">
          {apiKey ? (
            <span className="flex items-center gap-1.5 text-purple-300">
              <CheckCircle2 className="w-3 h-3 text-purple-400" />
              <span>Gemini 2.5 Flash Connected (Live Tool Calling)</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-cyan-300">
              <ShieldCheck className="w-3 h-3 text-cyan-400" />
              <span>Deterministic Spatial NLP Active (Offline Mode)</span>
            </span>
          )}

          {!apiKey && (
            <button
              type="button"
              onClick={() => setIsApiKeyModalOpen(true)}
              className="text-cyan-400 hover:underline font-bold text-[10px]"
            >
              + Add Key
            </button>
          )}
        </div>

        {/* Messages List Area */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col">
          <ChatMessageList
            messages={messages}
            isThinking={isThinking}
            onConfirmToolCall={handleConfirmToolCall}
            onCancelToolCall={handleCancelToolCall}
            onPreviewCandidate={onPreviewCandidate}
            context={context}
          />
        </div>

        {/* Suggested Prompts Footer Strip */}
        <div className="p-3 border-t border-blue-500/15 bg-slate-950/90 shrink-0">
          <SuggestedPromptChips
            language={preferredLanguage}
            onSelectPrompt={(p) => handleSendMessage(p)}
            disabled={isThinking}
          />
        </div>

        {/* Chat Input Bar */}
        <div className="p-3.5 border-t border-blue-500/20 bg-slate-950 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
            className="flex items-center gap-2"
          >
            {/* Voice Input Microphone Button */}
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`p-2.5 rounded-xl border transition-all ${
                isListening
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse'
                  : 'bg-slate-900 border-blue-500/30 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/50'
              }`}
              title={isListening ? 'Stop Listening' : 'Speak Instruction (STT)'}
            >
              {isListening ? (
                <MicOff className="w-4 h-4 text-rose-400" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={getPlaceholderText()}
              disabled={isThinking}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-blue-500/30 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-cyan-400 transition-colors"
            />

            {/* Send Button */}
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!inputText.trim() || isThinking}
              className="glow-blue bg-gradient-to-r from-blue-600 to-cyan-600 px-3.5 py-2.5"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onKeySaved={(newKey) => setApiKey(newKey)}
      />
    </>
  )
}
