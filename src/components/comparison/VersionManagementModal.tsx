import React, { useState } from 'react'
import {
  History,
  Save,
  RotateCcw,
  Edit2,
  Trash2,
  Check,
  X,
  Clock,
  ArrowRightLeft
} from 'lucide-react'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import type { LayoutVersion } from '@/types/comparison'
import type { PlacedFurniture } from '@/types/furniture'

interface VersionManagementModalProps {
  isOpen: boolean
  onClose: () => void
  versions: LayoutVersion[]
  currentFurniture: PlacedFurniture[]
  onSaveVersion: (name: string, notes?: string) => void
  onRenameVersion: (versionId: string, newName: string) => void
  onDeleteVersion: (versionId: string) => void
  onRestoreVersion: (version: LayoutVersion) => void
  onCompareVersion?: (version: LayoutVersion) => void
}

export const VersionManagementModal: React.FC<VersionManagementModalProps> = ({
  isOpen,
  onClose,
  versions,
  currentFurniture,
  onSaveVersion,
  onRenameVersion,
  onDeleteVersion,
  onRestoreVersion,
  onCompareVersion,
}) => {
  const [newVersionName, setNewVersionName] = useState('')
  const [newVersionNotes, setNewVersionNotes] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [confirmRestoreId, setConfirmRestoreId] = useState<string | null>(null)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newVersionName.trim()) return
    onSaveVersion(newVersionName.trim(), newVersionNotes.trim() || undefined)
    setNewVersionName('')
    setNewVersionNotes('')
  }

  const startRename = (v: LayoutVersion) => {
    setEditingId(v.id)
    setEditingName(v.name)
  }

  const applyRename = (versionId: string) => {
    if (editingName.trim()) {
      onRenameVersion(versionId, editingName.trim())
    }
    setEditingId(null)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Layout Version & Snapshot Management"
      size="lg"
    >
      <div className="space-y-6">
        {/* Form: Save Current Layout Snapshot */}
        <form
          onSubmit={handleSave}
          className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-4 space-y-3"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Save className="w-4 h-4 text-indigo-400" />
            <span>Save Current Layout as Named Version</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <input
                type="text"
                placeholder="e.g. Minimalist Workstation Setup"
                value={newVersionName}
                onChange={(e) => setNewVersionName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <Button
                type="submit"
                variant="primary"
                className="w-full text-xs py-2 gap-1.5"
                disabled={!newVersionName.trim()}
              >
                <Save className="w-3.5 h-3.5" />
                Snapshot ({currentFurniture.length} items)
              </Button>
            </div>
          </div>

          <input
            type="text"
            placeholder="Optional design notes (e.g. Desk adjacent to daylight window)"
            value={newVersionNotes}
            onChange={(e) => setNewVersionNotes(e.target.value)}
            className="w-full bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-1.5 text-xs text-slate-300 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </form>

        {/* Saved Versions List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" />
              Saved Version History ({versions.length})
            </h4>
          </div>

          {versions.length === 0 ? (
            <div className="text-center py-8 bg-slate-900/40 rounded-xl border border-slate-800 text-slate-400 text-sm">
              <p>No saved layout versions yet.</p>
              <p className="text-xs text-slate-400 mt-1">
                Save your current arrangement above to compare, restore, or export later.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {versions.map((v) => {
                const isEditing = editingId === v.id
                const isDeleting = confirmDeleteId === v.id
                const isRestoring = confirmRestoreId === v.id

                return (
                  <div
                    key={v.id}
                    className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex-1">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-slate-100 focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => applyRename(v.id)}
                            className="p-1 text-emerald-400 hover:text-emerald-300"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1 text-slate-400 hover:text-slate-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-slate-100">
                            {v.name}
                          </span>
                          <Badge variant="cyan" className="text-[10px]">
                            {v.source}
                          </Badge>
                          <span className="text-xs text-slate-400">
                            ({v.furniture.length} items)
                          </span>
                        </div>
                      )}

                      <div className="text-[11px] text-slate-400 flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(v.createdAt).toLocaleDateString()} {new Date(v.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {v.notes && <span className="italic truncate max-w-xs">{v.notes}</span>}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isRestoring ? (
                        <div className="flex items-center gap-2 bg-amber-950/60 border border-amber-500/40 px-2 py-1 rounded">
                          <span className="text-xs text-amber-300">Restore this?</span>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => {
                              onRestoreVersion(v)
                              setConfirmRestoreId(null)
                              onClose()
                            }}
                          >
                            Yes
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setConfirmRestoreId(null)}
                          >
                            No
                          </Button>
                        </div>
                      ) : isDeleting ? (
                        <div className="flex items-center gap-2 bg-rose-950/60 border border-rose-500/40 px-2 py-1 rounded">
                          <span className="text-xs text-rose-300">Delete?</span>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => {
                              onDeleteVersion(v.id)
                              setConfirmDeleteId(null)
                            }}
                          >
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setConfirmDeleteId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <>
                          {onCompareVersion && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                onCompareVersion(v)
                                onClose()
                              }}
                              className="text-xs px-2 py-1"
                              title="Compare with current"
                            >
                              <ArrowRightLeft className="w-3 h-3 mr-1" />
                              Compare
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setConfirmRestoreId(v.id)}
                            className="text-xs px-2 py-1"
                            title="Restore this layout"
                          >
                            <RotateCcw className="w-3 h-3 mr-1" />
                            Restore
                          </Button>

                          <button
                            onClick={() => startRename(v)}
                            className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors"
                            title="Rename version"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setConfirmDeleteId(v.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                            title="Delete version"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-800">
          <Button variant="outline" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  )
}
