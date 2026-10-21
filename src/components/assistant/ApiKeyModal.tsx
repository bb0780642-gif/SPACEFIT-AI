import React, { useState, useEffect } from 'react'
import { Key, Shield, Check, ExternalLink, Trash2, X } from 'lucide-react'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import { getGeminiApiKey, setGeminiApiKey } from '@/utils/nlp/geminiService'

interface ApiKeyModalProps {
  isOpen: boolean
  onClose: () => void
  onKeySaved: (key: string) => void
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onKeySaved,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [hasEnvKey, setHasEnvKey] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const current = getGeminiApiKey()
      const envKey = import.meta.env.VITE_GEMINI_API_KEY
      setHasEnvKey(Boolean(envKey && envKey.trim().length > 0))
      setApiKeyInput(current || '')
      setSavedSuccess(false)
    }
  }, [isOpen])

  const handleSave = () => {
    setGeminiApiKey(apiKeyInput)
    onKeySaved(apiKeyInput)
    setSavedSuccess(true)
    setTimeout(() => {
      setSavedSuccess(false)
      onClose()
    }, 1000)
  }

  const handleClear = () => {
    setGeminiApiKey('')
    setApiKeyInput('')
    onKeySaved('')
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Multilingual AI Assistant Settings"
      description="Configure Google Gemini API for real-time generative conversational tool calling."
      size="md"
    >
      <div className="space-y-5 text-xs font-mono">
        {/* Info Box */}
        <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-slate-300 space-y-2">
          <div className="flex items-center gap-2 text-cyan-300 font-bold">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>Secure Client-Side API Configuration</span>
          </div>
          <p className="leading-relaxed">
            SpaceFit AI uses <strong>Google Gemini</strong> to parse complex multilingual natural-language instructions (English, Tamil, Thanglish, and Hindi) into validated 3D spatial actions.
          </p>
          <p className="text-[11px] text-slate-400">
            Keys are never committed to git and are stored solely in your local browser session storage or via <code>VITE_GEMINI_API_KEY</code> in <code>.env</code>.
          </p>
        </div>

        {hasEnvKey && (
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>Detected <code>VITE_GEMINI_API_KEY</code> in environment file (.env).</span>
          </div>
        )}

        {/* Input */}
        <div className="space-y-2">
          <label className="block text-slate-300 font-semibold flex items-center justify-between">
            <span>Gemini API Key</span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 underline text-[11px]"
            >
              <span>Get Free Key at Google AI Studio</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </label>
          <div className="relative">
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-blue-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 pr-10 font-mono text-xs"
            />
            {apiKeyInput && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-rose-400"
                title="Clear Key"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-blue-500/15">
          <Button variant="ghost" size="sm" onClick={onClose} leftIcon={<X className="w-3.5 h-3.5" />}>
            Cancel
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            leftIcon={savedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Key className="w-3.5 h-3.5" />}
            className="glow-blue bg-gradient-to-r from-blue-600 to-cyan-600"
          >
            {savedSuccess ? 'Saved!' : 'Save Key'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
