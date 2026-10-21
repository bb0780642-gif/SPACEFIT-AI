import React from 'react'
import {
  RotateCw,
  Copy,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Magnet,
  Maximize2,
  Palette
} from 'lucide-react'
import type { PlacedFurniture, FurnitureCollisionIssue } from '@/types/furniture'
import { FURNITURE_CATALOG } from '@/data/furnitureCatalog'
import { metersToFeet, feetToMeters } from '@/utils/geometry'

interface FurnitureInspectorProps {
  furniture: PlacedFurniture
  collisionIssues: FurnitureCollisionIssue[]
  onUpdate: (updated: PlacedFurniture) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
  onSnapToWall: (id: string) => void
  unit?: 'metres' | 'feet'
}

export const FurnitureInspector: React.FC<FurnitureInspectorProps> = ({
  furniture,
  collisionIssues,
  onUpdate,
  onDuplicate,
  onDelete,
  onSnapToWall,
  unit = 'metres',
}) => {
  const catalogItem = FURNITURE_CATALOG.find((c) => c.id === furniture.catalogId)
  const limits = catalogItem?.dimensionLimits || {
    minWidth: 0.3,
    maxWidth: 3.5,
    minLength: 0.3,
    maxLength: 3.5,
    minHeight: 0.3,
    maxHeight: 2.8,
  }

  // Unit conversion helpers
  const toDisplay = (m: number) => {
    return unit === 'feet' ? Number(metersToFeet(m).toFixed(2)) : Number(m.toFixed(2))
  }
  const toMeters = (v: number) => {
    return unit === 'feet' ? feetToMeters(v) : v
  }

  const unitSuffix = unit === 'feet' ? 'ft' : 'm'

  // Position change handlers
  const handlePositionX = (val: number) => {
    const meters = toMeters(val)
    onUpdate({
      ...furniture,
      position: [meters, 0, furniture.position[2]],
    })
  }

  const handlePositionZ = (val: number) => {
    const meters = toMeters(val)
    onUpdate({
      ...furniture,
      position: [furniture.position[0], 0, meters],
    })
  }

  // Rotation handlers
  const handleRotateDeg = (deltaDeg: number) => {
    const deltaRad = (deltaDeg * Math.PI) / 180
    let nextRot = (furniture.rotationY + deltaRad) % (Math.PI * 2)
    if (nextRot < 0) nextRot += Math.PI * 2
    onUpdate({
      ...furniture,
      rotationY: Number(nextRot.toFixed(4)),
    })
  }

  const handleSetRotationDeg = (deg: number) => {
    const rad = (deg * Math.PI) / 180
    onUpdate({
      ...furniture,
      rotationY: rad,
    })
  }

  // Dimensions change handlers
  const handleDimensionChange = (key: 'widthMeters' | 'lengthMeters' | 'heightMeters', displayVal: number) => {
    const meters = Math.max(0.1, toMeters(displayVal))
    onUpdate({
      ...furniture,
      dimensions: {
        ...furniture.dimensions,
        [key]: Number(meters.toFixed(2)),
      },
    })
  }

  const currentDeg = Math.round(((furniture.rotationY * 180) / Math.PI) % 360)
  const normalizedDeg = currentDeg < 0 ? currentDeg + 360 : currentDeg

  const itemErrors = collisionIssues.filter((c) => c.severity === 'error')
  const itemWarnings = collisionIssues.filter((c) => c.severity === 'warning')

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* 1. Header with Status Banner */}
      <div className="flex items-start justify-between gap-2 pb-3 border-b border-blue-500/15">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-sm">{furniture.name}</span>
            <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
              {furniture.category}
            </span>
          </div>
          <span className="text-slate-500 text-[11px]">ID: {furniture.id}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onDuplicate(furniture.id)}
            className="p-1.5 rounded-lg glass-panel text-slate-400 hover:text-white"
            title="Duplicate Object"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(furniture.id)}
            className="p-1.5 rounded-lg glass-panel text-rose-400 hover:text-rose-300 hover:bg-rose-950/30"
            title="Delete Object"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Collision Alerts */}
      {itemErrors.length > 0 && (
        <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/40 text-rose-300 space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Placement Violation</span>
          </div>
          {itemErrors.map((err, i) => (
            <p key={i} className="text-[11px] text-rose-200/90 leading-tight">
              • {err.message}
            </p>
          ))}
        </div>
      )}

      {itemWarnings.length > 0 && itemErrors.length === 0 && (
        <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-300 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Clearance Warning</span>
          </div>
          {itemWarnings.map((w, i) => (
            <p key={i} className="text-[11px] text-amber-200/90 leading-tight">
              • {w.message}
            </p>
          ))}
        </div>
      )}

      {itemErrors.length === 0 && itemWarnings.length === 0 && (
        <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 text-[11px]">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Valid Placement &amp; Clearance</span>
        </div>
      )}

      {/* 2. Position Controls */}
      <div className="p-3 rounded-xl bg-[#090E1A] border border-blue-500/15 space-y-2.5">
        <span className="text-slate-400 font-bold block text-[11px]">Floor Position</span>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-slate-500 text-[10px] block mb-1">X Coord ({unitSuffix})</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                step="0.1"
                value={toDisplay(furniture.position[0])}
                onChange={(e) => handlePositionX(parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-blue-500/20 text-white text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-500 text-[10px] block mb-1">Z Coord ({unitSuffix})</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                step="0.1"
                value={toDisplay(furniture.position[2])}
                onChange={(e) => handlePositionZ(parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-blue-500/20 text-white text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Quick Align to Wall */}
        <button
          type="button"
          onClick={() => onSnapToWall(furniture.id)}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-xs font-bold transition-colors"
        >
          <Magnet className="w-3.5 h-3.5" />
          <span>Snap to Closest Wall</span>
        </button>
      </div>

      {/* 3. Rotation Controls */}
      <div className="p-3 rounded-xl bg-[#090E1A] border border-blue-500/15 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 font-bold text-[11px]">Rotation</span>
          <span className="text-cyan-400 font-bold">{normalizedDeg}°</span>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {[0, 90, 180, 270].map((deg) => (
            <button
              key={deg}
              type="button"
              onClick={() => handleSetRotationDeg(deg)}
              className={`py-1 rounded-lg text-xs font-bold transition-all ${
                Math.abs(normalizedDeg - deg) < 5
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {deg}°
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleRotateDeg(45)}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs"
          >
            <RotateCw className="w-3 h-3 text-cyan-400" />
            <span>+45°</span>
          </button>
          <button
            type="button"
            onClick={() => handleRotateDeg(90)}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs"
          >
            <RotateCw className="w-3 h-3 text-cyan-400" />
            <span>+90°</span>
          </button>
        </div>
      </div>

      {/* 4. Dimensions Resizing */}
      <div className="p-3 rounded-xl bg-[#090E1A] border border-blue-500/15 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 font-bold text-[11px] flex items-center gap-1.5">
            <Maximize2 className="w-3 h-3 text-blue-400" />
            <span>Dimensions ({unitSuffix})</span>
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-slate-500 text-[10px] block mb-1">Width</label>
            <input
              type="number"
              step="0.05"
              min={toDisplay(limits.minWidth)}
              max={toDisplay(limits.maxWidth)}
              value={toDisplay(furniture.dimensions.widthMeters)}
              onChange={(e) => handleDimensionChange('widthMeters', parseFloat(e.target.value) || 0.5)}
              className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-blue-500/20 text-white text-xs font-mono"
            />
          </div>
          <div>
            <label className="text-slate-500 text-[10px] block mb-1">Length</label>
            <input
              type="number"
              step="0.05"
              min={toDisplay(limits.minLength)}
              max={toDisplay(limits.maxLength)}
              value={toDisplay(furniture.dimensions.lengthMeters)}
              onChange={(e) => handleDimensionChange('lengthMeters', parseFloat(e.target.value) || 0.5)}
              className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-blue-500/20 text-white text-xs font-mono"
            />
          </div>
          <div>
            <label className="text-slate-500 text-[10px] block mb-1">Height</label>
            <input
              type="number"
              step="0.05"
              min={toDisplay(limits.minHeight)}
              max={toDisplay(limits.maxHeight)}
              value={toDisplay(furniture.dimensions.heightMeters)}
              onChange={(e) => handleDimensionChange('heightMeters', parseFloat(e.target.value) || 0.5)}
              className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-blue-500/20 text-white text-xs font-mono"
            />
          </div>
        </div>
      </div>

      {/* 5. Color Customization */}
      {catalogItem && catalogItem.allowedColors.length > 1 && (
        <div className="p-3 rounded-xl bg-[#090E1A] border border-blue-500/15 space-y-2">
          <span className="text-slate-400 font-bold text-[11px] flex items-center gap-1.5">
            <Palette className="w-3 h-3 text-cyan-400" />
            <span>Finish &amp; Upholstery</span>
          </span>
          <div className="flex items-center gap-2 pt-1">
            {catalogItem.allowedColors.map((c, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onUpdate({ ...furniture, color: c })}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${
                  furniture.color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
