import React, { useState, useMemo } from 'react'
import {
  Search,
  Plus,
  X,
  Bed,
  Armchair,
  Table,
  Archive,
  Utensils,
  Sparkles,
  Layers,
  Check
} from 'lucide-react'
import { FURNITURE_CATALOG } from '@/data/furnitureCatalog'
import type { FurnitureCategory, FurnitureCatalogItem } from '@/types/furniture'
import { Badge } from '@/components/common/Badge'

interface FurnitureCatalogDrawerProps {
  isOpen: boolean
  onClose: () => void
  onAddFurniture: (catalogItem: FurnitureCatalogItem) => void
  unit?: 'metres' | 'feet'
}

export const FurnitureCatalogDrawer: React.FC<FurnitureCatalogDrawerProps> = ({
  isOpen,
  onClose,
  onAddFurniture,
  unit = 'metres',
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<FurnitureCategory | 'all'>('all')
  const [addedItemId, setAddedItemId] = useState<string | null>(null)

  const categories: { id: FurnitureCategory | 'all'; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All Items', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'beds', label: 'Beds', icon: <Bed className="w-3.5 h-3.5" /> },
    { id: 'seating', label: 'Seating', icon: <Armchair className="w-3.5 h-3.5" /> },
    { id: 'tables', label: 'Tables & Desks', icon: <Table className="w-3.5 h-3.5" /> },
    { id: 'storage', label: 'Storage', icon: <Archive className="w-3.5 h-3.5" /> },
    { id: 'dining', label: 'Dining', icon: <Utensils className="w-3.5 h-3.5" /> },
    { id: 'decor', label: 'Decor & Lamps', icon: <Sparkles className="w-3.5 h-3.5" /> },
  ]

  const filteredItems = useMemo(() => {
    return FURNITURE_CATALOG.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
      return matchesCategory && matchesSearch
    })
  }, [searchQuery, selectedCategory])

  if (!isOpen) return null

  const formatDim = (m: number) => {
    if (unit === 'feet') {
      return `${(m * 3.28084).toFixed(1)}ft`
    }
    return `${m.toFixed(2)}m`
  }

  const handleAdd = (item: FurnitureCatalogItem) => {
    onAddFurniture(item)
    setAddedItemId(item.id)
    setTimeout(() => setAddedItemId(null), 1500)
  }

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-950/95 border-l border-blue-500/25 shadow-2xl backdrop-blur-2xl flex flex-col transition-all">
      {/* Header */}
      <div className="p-5 border-b border-blue-500/15 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Armchair className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Furniture Catalog</h3>
            <p className="text-xs text-slate-400 font-mono">17 Architectural 3D Objects</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-xl glass-panel text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-4 border-b border-blue-500/10">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search beds, sofas, desks, chairs..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#090E1A] border border-blue-500/20 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 font-mono"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-1 no-scrollbar text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-slate-500 font-mono text-xs">
            No furniture matching "{searchQuery}" in this category.
          </div>
        ) : (
          filteredItems.map((item) => {
            const isJustAdded = addedItemId === item.id
            const d = item.defaultDimensions

            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-[#080D19] border border-blue-500/15 hover:border-blue-500/35 transition-all flex flex-col justify-between gap-3 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                      {item.name}
                    </h4>
                    <Badge variant="blue" className="text-[10px] capitalize">
                      {item.category}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mb-2">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-cyan-400">
                    <span className="px-2 py-0.5 rounded bg-blue-950/60 border border-blue-500/20">
                      W: {formatDim(d.widthMeters)}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-blue-950/60 border border-blue-500/20">
                      L: {formatDim(d.lengthMeters)}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-blue-950/60 border border-blue-500/20">
                      H: {formatDim(d.heightMeters)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    {item.allowedColors.slice(0, 4).map((c, idx) => (
                      <span
                        key={idx}
                        className="w-3.5 h-3.5 rounded-full border border-slate-700 inline-block shadow-sm"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAdd(item)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isJustAdded
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/25'
                    }`}
                  >
                    {isJustAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Added!</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to Room</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
