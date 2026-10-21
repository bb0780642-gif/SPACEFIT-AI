import { useState, useCallback, useEffect } from 'react'
import type { PlacedFurniture } from '@/types/furniture'

export function useFurnitureHistory(initialState: PlacedFurniture[] = []) {
  const [history, setHistory] = useState<PlacedFurniture[][]>([initialState])
  const [currentIndex, setCurrentIndex] = useState(0)

  const current = history[currentIndex] || []

  const canUndo = currentIndex > 0
  const canRedo = currentIndex < history.length - 1

  const pushState = useCallback((nextState: PlacedFurniture[]) => {
    setHistory((prev) => {
      // Discard future history
      const trimmed = prev.slice(0, currentIndex + 1)
      return [...trimmed, nextState]
    })
    setCurrentIndex((prev) => prev + 1)
  }, [currentIndex])

  const undo = useCallback(() => {
    if (canUndo) {
      setCurrentIndex((prev) => prev - 1)
    }
  }, [canUndo])

  const redo = useCallback(() => {
    if (canRedo) {
      setCurrentIndex((prev) => prev + 1)
    }
  }, [canRedo])

  const resetHistory = useCallback((state: PlacedFurniture[]) => {
    setHistory([state])
    setCurrentIndex(0)
  }, [])

  // Keyboard shortcut listener (Ctrl+Z / Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          e.preventDefault()
          redo()
        } else {
          e.preventDefault()
          undo()
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault()
        redo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

  return {
    furniture: current,
    canUndo,
    canRedo,
    undo,
    redo,
    setFurniture: pushState,
    resetHistory,
  }
}
