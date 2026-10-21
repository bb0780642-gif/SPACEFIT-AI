import React, { useState, useEffect, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { 
  Box, 
  ArrowLeft, 
  Ruler, 
  ShieldCheck, 
  Calendar, 
  Footprints, 
  Trash2,
  DoorOpen,
  Layers,
  Sparkles,
  ExternalLink,
  Plus,
  Save,
  Check,
  AlertTriangle,
  Armchair,
  Wand2,
  ArrowLeftRight,
  BarChart3,
  FileText,
  History
} from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { Modal } from '@/components/common/Modal'
import { RoomBlueprint2D } from '@/components/blueprint/RoomBlueprint2D'
import { RoomScene3D } from '@/components/scene3d/RoomScene3D'
import type { SelectedItemState } from '@/components/scene3d/types'
import { FurnitureCatalogDrawer } from '@/components/furniture/FurnitureCatalogDrawer'
import { FurnitureInspector } from '@/components/furniture/FurnitureInspector'
import { LayoutOptimizationModal } from '@/components/optimizer/LayoutOptimizationModal'
import { LayoutPreviewBar } from '@/components/optimizer/LayoutPreviewBar'
import { AIAssistantDrawer } from '@/components/assistant/AIAssistantDrawer'
import { MovementAnalysisPanel } from '@/components/movement/MovementAnalysisPanel'
import { LayoutComparisonModal } from '@/components/comparison/LayoutComparisonModal'
import { LayoutAnalyticsModal } from '@/components/analytics/LayoutAnalyticsModal'
import { VersionManagementModal } from '@/components/comparison/VersionManagementModal'
import { ExportDesignReportModal } from '@/components/export/ExportDesignReportModal'
import {
  analyzeMovementPath,
  getDoorEntrancePoint,
  getPresetDestinationPoint,
} from '@/utils/movement/pathfinding'
import { useFurnitureHistory } from '@/hooks/useFurnitureHistory'
import { validateFurnitureLayout, snapFurnitureToNearestWall } from '@/utils/collision'
import {
  getProjectById,
  deleteStoredProject,
  updateProject,
  saveProjectVersion,
  renameProjectVersion,
  deleteProjectVersion,
} from '@/utils/storage'
import { createLayoutVersionSnapshot } from '@/utils/analytics/layoutMetrics'
import { generateOptimizedLayouts } from '@/utils/layoutOptimizer'
import { ensureRoomConfiguration, metersToFeet } from '@/utils/geometry'
import { useDisclosure } from '@/hooks/useDisclosure'
import type { RoomProject } from '@/types/project'
import type { WallId } from '@/types/geometry'
import type { PlacedFurniture, FurnitureCatalogItem } from '@/types/furniture'
import type { CandidateLayout } from '@/types/optimizer'
import type { SpatialToolContext } from '@/types/assistant'
import type { MovementPresetDestination } from '@/types/movement'
import type { LayoutVersion } from '@/types/comparison'

export const RoomWorkspacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<RoomProject | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewTab, setViewTab] = useState<'3d' | '2d'>('3d')
  const [isCatalogOpen, setIsCatalogOpen] = useState(false)
  const [isOptimizerOpen, setIsOptimizerOpen] = useState(false)
  const [isAssistantOpen, setIsAssistantOpen] = useState(false)
  const [isWalkthroughActive, setIsWalkthroughActive] = useState(false)
  const [isComparisonOpen, setIsComparisonOpen] = useState(false)
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false)
  const [isVersionsOpen, setIsVersionsOpen] = useState(false)
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [savedVersions, setSavedVersions] = useState<LayoutVersion[]>([])
  const [movementPreset, setMovementPreset] = useState<MovementPresetDestination>('door-to-bed')
  const [configuredClearance, setConfiguredClearance] = useState<number>(0.6)
  const [showMovementPath, setShowMovementPath] = useState(true)
  const [previewCandidate, setPreviewCandidate] = useState<CandidateLayout | null>(null)
  const [saveToast, setSaveToast] = useState(false)

  // Selected spatial element state
  const [selectedItem, setSelectedItem] = useState<SelectedItemState>({
    type: 'room',
    id: null,
  })

  // Undo / Redo history for furniture
  const {
    furniture,
    setFurniture,
    canUndo,
    canRedo,
    undo,
    redo,
    resetHistory,
  } = useFurnitureHistory([])

  const { isOpen: isDeleteOpen, open: openDelete, close: closeDelete } = useDisclosure()
  const { isOpen: isSpecsOpen, open: openSpecs, close: closeSpecs } = useDisclosure()

  useEffect(() => {
    if (id) {
      const found = getProjectById(id)
      if (found) {
        setProject(found)
        resetHistory(found.furniture || [])
        setSavedVersions(found.savedVersions || [])
      } else {
        setProject(null)
      }
    }
    setLoading(false)
  }, [id, resetHistory])

  // Displayed furniture in the 3D scene (swaps to candidate during preview)
  const displayedFurniture = useMemo(() => {
    return previewCandidate ? previewCandidate.furniture : furniture
  }, [previewCandidate, furniture])

  // Collision and Boundary Validation on displayed furniture
  const validationResult = useMemo(() => {
    if (!project) {
      return { isValid: true, hasWarnings: false, errors: [], warnings: [], collisionCountsByItem: {} }
    }
    const config = project.configuration || ensureRoomConfiguration(project)
    return validateFurnitureLayout(displayedFurniture, config)
  }, [displayedFurniture, project])

  // Real-time synchronization of Movement Path Analysis
  const movementPathResult = useMemo(() => {
    if (!project) return null
    const config = project.configuration || ensureRoomConfiguration(project)
    const door = getDoorEntrancePoint(config)
    const target = getPresetDestinationPoint(movementPreset, config, displayedFurniture)

    return analyzeMovementPath(
      config,
      displayedFurniture,
      door.point,
      target.point,
      configuredClearance,
      'Main Entrance',
      target.label
    )
  }, [project, displayedFurniture, movementPreset, configuredClearance])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center font-mono text-slate-400">
        Loading room digital twin workspace...
      </div>
    )
  }

  if (!project) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mx-auto mb-6">
          <Box className="w-8 h-8" />
        </div>
        <Badge variant="rose" className="mb-3">
          Project Not Found
        </Badge>
        <h1 className="text-3xl font-extrabold text-white">Room Model Not Located</h1>
        <p className="mt-3 text-slate-400 text-sm">
          The requested project record does not exist or may have been deleted from local storage.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/dashboard">
            <Button variant="primary" size="md">
              Return to Dashboard
            </Button>
          </Link>
          <Link to="/design/new">
            <Button variant="secondary" size="md">
              Create New Room
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const configuration = project.configuration || ensureRoomConfiguration(project)

  const handleDelete = () => {
    deleteStoredProject(project.id)
    closeDelete()
    navigate('/dashboard')
  }

  // Save furniture changes to storage
  const handleSaveLayout = () => {
    if (!project) return
    const updated = updateProject(project.id, {
      furniture,
      collisionsCount: validationResult.errors.length,
    })
    if (updated) setProject(updated)
    setSaveToast(true)
    setTimeout(() => setSaveToast(false), 2000)
  }

  // Handle Add Furniture from catalog
  const handleAddFurniture = (catalogItem: FurnitureCatalogItem) => {
    const newId = `furn-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`
    const offsetIndex = furniture.length
    const offsetX = (offsetIndex % 3 - 1) * 0.4
    const offsetZ = (Math.floor(offsetIndex / 3) - 1) * 0.4

    const newItem: PlacedFurniture = {
      id: newId,
      catalogId: catalogItem.id,
      name: catalogItem.name,
      category: catalogItem.category,
      meshType: catalogItem.meshType,
      color: catalogItem.defaultColor,
      dimensions: { ...catalogItem.defaultDimensions },
      position: [Number(offsetX.toFixed(2)), 0, Number(offsetZ.toFixed(2))],
      rotationY: 0,
    }

    const nextFurniture = [...furniture, newItem]
    setFurniture(nextFurniture)
    setSelectedItem({ type: 'furniture', id: newItem.id, furnitureId: newItem.id })

    if (project) {
      updateProject(project.id, {
        furniture: nextFurniture,
        collisionsCount: validationResult.errors.length,
      })
    }
  }

  // Handle Update Furniture
  const handleUpdateFurniture = (updated: PlacedFurniture) => {
    const nextFurniture = furniture.map((f) => (f.id === updated.id ? updated : f))
    setFurniture(nextFurniture)
    if (project) {
      updateProject(project.id, {
        furniture: nextFurniture,
        collisionsCount: validationResult.errors.length,
      })
    }
  }

  // Handle Duplicate Furniture
  const handleDuplicateFurniture = (dupId: string) => {
    const original = furniture.find((f) => f.id === dupId)
    if (!original) return

    const newId = `furn-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`
    const clone: PlacedFurniture = {
      ...original,
      id: newId,
      name: `${original.name} (Copy)`,
      position: [
        Number((original.position[0] + 0.3).toFixed(2)),
        0,
        Number((original.position[2] + 0.3).toFixed(2)),
      ],
    }

    const nextFurniture = [...furniture, clone]
    setFurniture(nextFurniture)
    setSelectedItem({ type: 'furniture', id: clone.id, furnitureId: clone.id })
    if (project) {
      updateProject(project.id, {
        furniture: nextFurniture,
        collisionsCount: validationResult.errors.length,
      })
    }
  }

  // Handle Delete Furniture
  const handleDeleteFurniture = (delId: string) => {
    const nextFurniture = furniture.filter((f) => f.id !== delId)
    setFurniture(nextFurniture)
    setSelectedItem({ type: 'room', id: null })
    if (project) {
      updateProject(project.id, {
        furniture: nextFurniture,
        collisionsCount: validationResult.errors.length,
      })
    }
  }

  // Handle Snap to Wall
  const handleSnapToWall = (snapId: string) => {
    if (!project) return
    const target = furniture.find((f) => f.id === snapId)
    if (!target) return
    const config = project.configuration || ensureRoomConfiguration(project)
    const snapped = snapFurnitureToNearestWall(target, config.widthMeters, config.lengthMeters)

    handleUpdateFurniture({
      ...target,
      position: snapped.position,
      rotationY: snapped.rotationY,
    })
  }

  // Handle Applying Optimized Candidate Layout
  const handleApplyOptimizedLayout = (cand: CandidateLayout) => {
    setFurniture(cand.furniture)
    setPreviewCandidate(null)
    if (project) {
      updateProject(project.id, {
        furniture: cand.furniture,
        status: 'Optimized',
      })
    }
    setSaveToast(true)
    setTimeout(() => setSaveToast(false), 2000)
  }

  // Dynamic Optimizer Candidates for Comparison & Analytics
  const optimizerCandidates = useMemo(() => {
    if (!project) return []
    const config = project.configuration || ensureRoomConfiguration(project)
    return generateOptimizedLayouts(furniture, config, {
      mode: 'balanced',
      deskNearWindow: true,
      bedPlacement: 'against-wall',
      clearEntranceBuffer: 0.8,
      minWalkingClearance: 0.6,
    }).candidates
  }, [project, furniture])

  // Version Management Actions
  const handleSaveVersion = (name: string, notes?: string) => {
    if (!project) return
    const snapshot = createLayoutVersionSnapshot(name, furniture, 'manual', notes)
    const updated = saveProjectVersion(project.id, snapshot)
    setSavedVersions(updated)
    setSaveToast(true)
    setTimeout(() => setSaveToast(false), 2000)
  }

  const handleRenameVersion = (versionId: string, newName: string) => {
    if (!project) return
    const updated = renameProjectVersion(project.id, versionId, newName)
    setSavedVersions(updated)
  }

  const handleDeleteVersion = (versionId: string) => {
    if (!project) return
    const updated = deleteProjectVersion(project.id, versionId)
    setSavedVersions(updated)
  }

  const handleRestoreVersion = (v: LayoutVersion) => {
    setFurniture(v.furniture)
    if (project) {
      updateProject(project.id, {
        furniture: v.furniture,
      })
    }
    setSaveToast(true)
    setTimeout(() => setSaveToast(false), 2000)
  }

  const handleApplyLayoutFromComparison = (newFurniture: PlacedFurniture[], _title: string) => {
    setFurniture(newFurniture)
    if (project) {
      updateProject(project.id, {
        furniture: newFurniture,
        status: 'Optimized',
      })
    }
    setSaveToast(true)
    setTimeout(() => setSaveToast(false), 2000)
  }

  // Spatial context for AI Assistant tool calling
  const spatialContext: SpatialToolContext = useMemo(() => {
    return {
      projectId: project.id,
      projectName: project.name,
      roomConfiguration: configuration,
      furniture: displayedFurniture,
      validationResult,
      onAddFurniture: handleAddFurniture,
      onUpdateFurniture: handleUpdateFurniture,
      onRemoveFurniture: handleDeleteFurniture,
      onApplyOptimizedLayout: handleApplyOptimizedLayout,
      onUndo: undo,
      onPreviewCandidate: setPreviewCandidate,
      onOpenComparison: () => setIsComparisonOpen(true),
      onSaveVersion: (vName: string) => handleSaveVersion(vName),
      onOpenReport: () => setIsExportOpen(true),
    }
  }, [
    project.id,
    project.name,
    configuration,
    displayedFurniture,
    validationResult,
    handleAddFurniture,
    handleUpdateFurniture,
    handleDeleteFurniture,
    handleApplyOptimizedLayout,
    undo,
    handleSaveVersion,
  ])

  const unitLabel = project.unit === 'metres' ? 'm' : 'ft'
  const areaUnit = project.unit === 'metres' ? 'm²' : 'sq ft'
  const volUnit = project.unit === 'metres' ? 'm³' : 'cu ft'

  // Selected item object lookup
  const selectedFurniture =
    selectedItem.type === 'furniture' && selectedItem.id
      ? displayedFurniture.find((f) => f.id === selectedItem.id)
      : null

  const selectedFurnitureIssues = selectedFurniture
    ? [
        ...validationResult.errors.filter((e) => e.furnitureId === selectedFurniture.id),
        ...validationResult.warnings.filter((w) => w.furnitureId === selectedFurniture.id),
      ]
    : []

  const selectedDoor =
    selectedItem.type === 'door' && selectedItem.id
      ? configuration.doors.find((d) => d.id === selectedItem.id)
      : null

  const selectedWindow =
    selectedItem.type === 'window' && selectedItem.id
      ? configuration.windows.find((w) => w.id === selectedItem.id)
      : null

  const formatLen = (m: number) => {
    if (project.unit === 'feet') return `${metersToFeet(m).toFixed(1)} ft`
    return `${m.toFixed(2)} m`
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Breadcrumbs & Quick CTAs */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Link to="/dashboard" className="hover:text-white transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-blue-400 truncate max-w-xs">{project.name}</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* AI Assistant Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAssistantOpen(true)}
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />}
            className="glow-blue bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 border border-cyan-400/30"
          >
            AI Assistant
          </Button>

          {/* First-Person Walkthrough Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setViewTab('3d')
              setIsWalkthroughActive(true)
            }}
            leftIcon={<Footprints className="w-3.5 h-3.5 text-cyan-400" />}
            className="border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/10"
          >
            Walkthrough
          </Button>

          {/* Compare Layouts Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsComparisonOpen(true)}
            leftIcon={<ArrowLeftRight className="w-3.5 h-3.5 text-indigo-400" />}
            className="border-indigo-500/30 text-indigo-200 hover:bg-indigo-500/10"
          >
            Compare
          </Button>

          {/* Spatial Analytics Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAnalyticsOpen(true)}
            leftIcon={<BarChart3 className="w-3.5 h-3.5 text-cyan-400" />}
            className="border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/10"
          >
            Analytics
          </Button>

          {/* Versions Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsVersionsOpen(true)}
            leftIcon={<History className="w-3.5 h-3.5 text-amber-400" />}
            className="border-amber-500/30 text-amber-200 hover:bg-amber-500/10"
          >
            Versions ({savedVersions.length})
          </Button>

          {/* Export Design Report Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExportOpen(true)}
            leftIcon={<FileText className="w-3.5 h-3.5 text-emerald-400" />}
            className="border-emerald-500/30 text-emerald-200 hover:bg-emerald-500/10"
          >
            Report
          </Button>

          {/* AI Optimizer Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsOptimizerOpen(true)}
            leftIcon={<Wand2 className="w-3.5 h-3.5 text-cyan-300" />}
          >
            Optimize
          </Button>

          {/* Add Furniture Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsCatalogOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Furniture
          </Button>

          {/* Save Layout Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveLayout}
            leftIcon={saveToast ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5 text-cyan-400" />}
          >
            {saveToast ? 'Saved!' : 'Save'}
          </Button>

          <Link to={`/design/${project.id}/configure`}>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<DoorOpen className="w-3.5 h-3.5" />}
            >
              Blueprint
            </Button>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={openSpecs}
            leftIcon={<Ruler className="w-3.5 h-3.5" />}
          >
            Telemetry
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={openDelete}
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Project Header & Six-Stage Linear Workflow Status Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-blue-500/15">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <Badge variant="blue" className="text-[10px]">
              {project.roomType}
            </Badge>
            <Badge
              variant={
                validationResult.isValid
                  ? 'emerald'
                  : 'rose'
              }
              className="text-[10px]"
            >
              {validationResult.isValid ? 'Layout Valid' : `${validationResult.errors.length} Collision Alert`}
            </Badge>
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Created {new Date(project.createdAt).toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            {project.name}
          </h1>
          <p className="text-xs sm:text-sm font-mono text-cyan-300 mt-1">
            Boundary: {project.length}{unitLabel} × {project.width}{unitLabel}
            {project.ceilingHeight && ` × ${project.ceilingHeight}${unitLabel}`} • Furniture: {displayedFurniture.length} items • Doors: {configuration.doors.length} • Windows: {configuration.windows.length}
          </p>
        </div>

        {/* 6-Stage Primary Workflow Progress Indicator */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 text-xs font-mono">
          <Link
            to={`/design/${project.id}/configure`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-300 hover:border-emerald-400 transition-colors"
            title="Configure Room Dimensions & Openings"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>1. Room Setup</span>
          </Link>
          <span className="text-slate-600">→</span>
          <div
            onClick={() => setIsCatalogOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-blue-500/40 text-blue-300 font-semibold cursor-pointer hover:border-blue-400 transition-colors"
            title="Furnish Room"
          >
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span>2. Furnish</span>
          </div>
          <span className="text-slate-600">→</span>
          <div
            onClick={() => setIsOptimizerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/30 border border-purple-500/60 text-white font-semibold shadow-lg shadow-purple-500/20 cursor-pointer hover:bg-purple-600/40 transition-all"
            title="Open Layout Optimizer"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>3. Optimize</span>
          </div>
          <span className="text-slate-600">→</span>
          <div
            onClick={() => {
              setViewTab('3d')
              setIsWalkthroughActive(true)
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-900/60 to-cyan-900/60 border border-cyan-500/60 text-cyan-200 font-semibold shadow-lg shadow-cyan-500/20 cursor-pointer hover:bg-cyan-600/40 transition-all"
            title="Start First-Person 3D Walkthrough"
          >
            <Footprints className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
            <span>4. Walkthrough</span>
          </div>
          <span className="text-slate-600">→</span>
          <div
            onClick={() => setIsComparisonOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-900/40 border border-indigo-500/50 text-indigo-200 font-semibold cursor-pointer hover:bg-indigo-600/30 transition-all"
            title="Compare Layouts & View Analytics"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-400" />
            <span>5. Compare</span>
          </div>
          <span className="text-slate-600">→</span>
          <div
            onClick={() => setIsExportOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/50 border border-emerald-500/50 text-emerald-200 font-semibold cursor-pointer hover:bg-emerald-600/30 transition-all"
            title="Generate Exportable Design Report"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>6. Export Report</span>
          </div>
        </div>
      </div>

      {/* Main Studio Viewport Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        {/* Left: Viewport Canvas (3D Digital Twin / 2D Blueprint Tabs) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Active Preview Bar */}
          {previewCandidate && (
            <LayoutPreviewBar
              candidate={previewCandidate}
              onApply={() => handleApplyOptimizedLayout(previewCandidate)}
              onCancel={() => setPreviewCandidate(null)}
            />
          )}

          {/* View Mode Tab Switcher */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 bg-[#090E1A] p-1 rounded-2xl border border-blue-500/20 text-xs font-mono">
              <button
                type="button"
                onClick={() => setViewTab('3d')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                  viewTab === '3d'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>3D Digital Twin</span>
              </button>
              <button
                type="button"
                onClick={() => setViewTab('2d')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                  viewTab === '2d'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>2D Architectural Blueprint</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsOptimizerOpen(true)}
                className="text-xs font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1.5 transition-colors font-bold"
              >
                <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>AI Layout Optimizer</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCatalogOpen(true)}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Furniture</span>
              </button>

              <Link
                to={`/design/${project.id}/configure`}
                className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>Edit Walls</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Interactive Viewport Container */}
          <div className="h-[520px] sm:h-[600px]">
            {viewTab === '3d' ? (
              <RoomScene3D
                configuration={configuration}
                unit={project.unit}
                selectedItem={selectedItem}
                furniture={displayedFurniture}
                collisionIssues={[...validationResult.errors, ...validationResult.warnings]}
                onSelectWall={(wallId: WallId) =>
                  setSelectedItem({ type: 'wall', id: wallId, wallId })
                }
                onSelectOpening={(opId: string, type: 'door' | 'window', wallId: WallId) =>
                  setSelectedItem({ type, id: opId, wallId })
                }
                onSelectFurniture={(furnId: string) =>
                  setSelectedItem({ type: 'furniture', id: furnId, furnitureId: furnId })
                }
                onSelectRoom={() => setSelectedItem({ type: 'room', id: null })}
                onOpenCatalog={() => setIsCatalogOpen(true)}
                canUndo={canUndo}
                canRedo={canRedo}
                onUndo={undo}
                onRedo={redo}
                isWalkthroughActive={isWalkthroughActive}
                onToggleWalkthrough={() => setIsWalkthroughActive((prev) => !prev)}
                onExitWalkthrough={() => setIsWalkthroughActive(false)}
                movementPathResult={movementPathResult}
                showMovementPath={showMovementPath}
              />
            ) : (
              <RoomBlueprint2D
                configuration={configuration}
                unit={project.unit}
                selectedWallId={selectedItem.wallId || null}
                selectedOpeningId={selectedItem.id || null}
                onSelectWall={(wallId) =>
                  setSelectedItem({ type: 'wall', id: wallId, wallId })
                }
                onSelectOpening={(opId) => {
                  const isDoor = configuration.doors.some((d) => d.id === opId)
                  setSelectedItem({
                    type: isDoor ? 'door' : 'window',
                    id: opId,
                  })
                }}
              />
            )}
          </div>

          {/* Spatial Collision & Engine Status */}
          <div className="p-4 rounded-2xl glass-panel bg-blue-950/20 border border-blue-500/20 flex items-start gap-3.5">
            <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 space-y-1">
              <p className="font-semibold text-cyan-200">Interactive 3D Digital Twin &amp; Optimization Engine</p>
              <p className="text-slate-400 leading-relaxed font-sans">
                Real-time SAT collision checks guarantee zero overlaps and unobstructed doorways. Click "Optimize Layout" to
                generate 3 distinct candidate arrangements according to Movement First, Space Saving, Comfort, or Study goals.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Selected Element Inspector & Spatial Metrics */}
        <div className="lg:col-span-4 space-y-6">
          {/* AI Layout Optimizer CTA Card */}
          <Card variant="outline" className="border-purple-500/35 bg-purple-950/15 p-5 text-center space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto">
              <Wand2 className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Intelligent Layout Optimizer</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-sans mt-1">
                Generate 3 feasible, constraint-validated furniture layouts tailored to your movement and comfort goals.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsOptimizerOpen(true)}
              leftIcon={<Sparkles className="w-3.5 h-3.5 text-cyan-300" />}
              className="w-full text-xs bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-lg shadow-purple-500/25"
            >
              Generate Optimal Layouts
            </Button>
          </Card>

          {/* Movement & Walking Circulation Analysis Panel */}
          <MovementAnalysisPanel
            selectedPreset={movementPreset}
            onSelectPreset={(p) => setMovementPreset(p)}
            configuredClearance={configuredClearance}
            onChangeClearance={(v) => setConfiguredClearance(v)}
            pathResult={movementPathResult}
            showPath3D={showMovementPath}
            onToggleShowPath3D={() => setShowMovementPath((prev) => !prev)}
            onEnterWalkthrough={() => {
              setViewTab('3d')
              setIsWalkthroughActive(true)
            }}
            unit={project.unit}
          />

          {/* 1. SELECTION INSPECTOR */}
          <Card variant="default" className="border-blue-500/25">
            <CardHeader>
              <CardTitle className="text-base text-white flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Box className="w-4 h-4 text-cyan-400" />
                  <span>Spatial Inspector</span>
                </span>
                <Badge
                  variant={
                    selectedItem.type === 'furniture'
                      ? selectedFurnitureIssues.some((c) => c.severity === 'error')
                        ? 'rose'
                        : 'cyan'
                      : selectedItem.type === 'door'
                      ? 'cyan'
                      : selectedItem.type === 'window'
                      ? 'amber'
                      : selectedItem.type === 'wall'
                      ? 'blue'
                      : 'emerald'
                  }
                  className="text-[10px] capitalize"
                >
                  {selectedItem.type || 'Room'}
                </Badge>
              </CardTitle>
              <CardDescription>
                {selectedItem.type === 'furniture'
                  ? 'Selected furniture properties & transform'
                  : selectedItem.type === 'door'
                  ? 'Selected door aperture properties'
                  : selectedItem.type === 'window'
                  ? 'Selected window opening properties'
                  : selectedItem.type === 'wall'
                  ? `Selected ${selectedItem.wallId} wall boundary`
                  : 'Room digital twin & furniture inventory'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 font-mono text-xs">
              {/* FURNITURE INSPECTOR */}
              {selectedFurniture && (
                <FurnitureInspector
                  furniture={selectedFurniture}
                  collisionIssues={selectedFurnitureIssues}
                  onUpdate={handleUpdateFurniture}
                  onDuplicate={handleDuplicateFurniture}
                  onDelete={handleDeleteFurniture}
                  onSnapToWall={handleSnapToWall}
                  unit={project.unit}
                />
              )}

              {/* DOOR INSPECTOR */}
              {selectedDoor && (
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-[#090E1A] border border-cyan-500/20 space-y-1.5">
                    <div className="text-white font-bold">{selectedDoor.name}</div>
                    <div className="flex justify-between text-slate-400">
                      <span>Wall:</span>
                      <span className="text-cyan-300">{selectedDoor.wallId}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Width:</span>
                      <span className="text-white">{formatLen(selectedDoor.widthMeters)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Height:</span>
                      <span className="text-white">{formatLen(selectedDoor.heightMeters)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Wall Offset:</span>
                      <span className="text-white">{formatLen(selectedDoor.offsetMeters)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Swing Direction:</span>
                      <span className="text-slate-200 capitalize">{selectedDoor.swingDirection}</span>
                    </div>
                  </div>
                  <Link to={`/design/${project.id}/configure`} className="block">
                    <Button variant="secondary" size="sm" className="w-full text-xs">
                      Edit Opening in Studio
                    </Button>
                  </Link>
                </div>
              )}

              {/* WINDOW INSPECTOR */}
              {selectedWindow && (
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-[#090E1A] border border-amber-500/20 space-y-1.5">
                    <div className="text-white font-bold">{selectedWindow.name}</div>
                    <div className="flex justify-between text-slate-400">
                      <span>Wall:</span>
                      <span className="text-amber-300">{selectedWindow.wallId}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Width:</span>
                      <span className="text-white">{formatLen(selectedWindow.widthMeters)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Height:</span>
                      <span className="text-white">{formatLen(selectedWindow.heightMeters)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Sill Height:</span>
                      <span className="text-white">{formatLen(selectedWindow.sillHeightMeters)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Wall Offset:</span>
                      <span className="text-white">{formatLen(selectedWindow.offsetMeters)}</span>
                    </div>
                  </div>
                  <Link to={`/design/${project.id}/configure`} className="block">
                    <Button variant="secondary" size="sm" className="w-full text-xs">
                      Edit Opening in Studio
                    </Button>
                  </Link>
                </div>
              )}

              {/* WALL INSPECTOR */}
              {selectedItem.type === 'wall' && (
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-[#090E1A] border border-blue-500/20 space-y-1.5">
                    <div className="text-white font-bold">{selectedItem.wallId} Wall</div>
                    <div className="flex justify-between text-slate-400">
                      <span>Span:</span>
                      <span className="text-white">
                        {selectedItem.wallId === 'North' || selectedItem.wallId === 'South'
                          ? formatLen(configuration.widthMeters)
                          : formatLen(configuration.lengthMeters)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Ceiling Height:</span>
                      <span className="text-white">{formatLen(configuration.ceilingHeightMeters)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Wall Thickness:</span>
                      <span className="text-white">
                        {formatLen(configuration.wallThicknessMeters || 0.15)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Openings:</span>
                      <span className="text-cyan-300">
                        {configuration.doors.filter((d) => d.wallId === selectedItem.wallId).length} doors,{' '}
                        {configuration.windows.filter((w) => w.wallId === selectedItem.wallId).length} windows
                      </span>
                    </div>
                  </div>
                  <Link to={`/design/${project.id}/configure`} className="block">
                    <Button variant="secondary" size="sm" className="w-full text-xs">
                      Modify Wall Openings
                    </Button>
                  </Link>
                </div>
              )}

              {/* ROOM / INVENTORY OVERVIEW */}
              {(selectedItem.type === 'room' || !selectedItem.type) && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-[#090E1A] border border-blue-500/15 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Interior Floor:</span>
                      <span className="text-white">{project.area} {areaUnit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Enclosed Volume:</span>
                      <span className="text-purple-300">{project.volume ? `${project.volume} ${volUnit}` : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Furniture:</span>
                      <span className="text-cyan-400 font-bold">{displayedFurniture.length} items</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Collisions / Overlaps:</span>
                      <span className={validationResult.errors.length > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                        {validationResult.errors.length}
                      </span>
                    </div>
                  </div>

                  {/* Quick Furniture List */}
                  {displayedFurniture.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] text-slate-400 font-bold block">Room Furniture</span>
                      <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                        {displayedFurniture.map((f) => {
                          const hasErr = (validationResult.collisionCountsByItem[f.id] || 0) > 0
                          return (
                            <button
                              key={f.id}
                              type="button"
                              onClick={() => setSelectedItem({ type: 'furniture', id: f.id, furnitureId: f.id })}
                              className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-left border border-slate-800 transition-colors"
                            >
                              <span className="truncate text-slate-200">{f.name}</span>
                              {hasErr && <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setIsCatalogOpen(true)}
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                      className="flex-1 text-xs"
                    >
                      Add Furniture
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsOptimizerOpen(true)}
                      leftIcon={<Wand2 className="w-3.5 h-3.5 text-cyan-300" />}
                      className="flex-1 text-xs"
                    >
                      Optimize
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 2. SPATIAL METRICS */}
          <Card variant="default">
            <CardHeader>
              <CardTitle className="text-base text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Spatial Metrics</span>
              </CardTitle>
              <CardDescription>
                Real-time geometric validation and clearance analysis.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#090E1A] border border-blue-500/15 text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Footprints className="w-3.5 h-3.5 text-blue-400" />
                  Efficiency Score
                </span>
                <span className="font-mono font-bold text-emerald-400">
                  {Math.max(60, 98 - validationResult.errors.length * 12)}%
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#090E1A] border border-blue-500/15 text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Armchair className="w-3.5 h-3.5 text-cyan-400" />
                  Placed Furniture
                </span>
                <span className="font-mono font-bold text-slate-200">{displayedFurniture.length} Pieces</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#090E1A] border border-blue-500/15 text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Collision Faults
                </span>
                <span className={`font-mono font-bold ${validationResult.errors.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {validationResult.errors.length} Detected
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#090E1A] border border-blue-500/15 text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <DoorOpen className="w-3.5 h-3.5 text-emerald-400" />
                  Door Ingress Clearance
                </span>
                <span className="font-mono font-bold text-slate-200">
                  {validationResult.errors.some((e) => e.code === 'door_obstruction') ? 'Blocked' : 'Clear'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Intelligent Layout Optimization Modal */}
      <LayoutOptimizationModal
        isOpen={isOptimizerOpen}
        onClose={() => setIsOptimizerOpen(false)}
        furniture={furniture}
        configuration={configuration}
        onApplyLayout={handleApplyOptimizedLayout}
        onPreviewLayout={(cand) => setPreviewCandidate(cand)}
        previewCandidateId={previewCandidate?.id || null}
      />

      {/* Furniture Catalog Drawer */}
      <FurnitureCatalogDrawer
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        onAddFurniture={handleAddFurniture}
        unit={project.unit}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={closeDelete}
        title="Confirm Project Deletion"
        description="Are you sure you want to remove this room model from your workspace?"
        footer={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={closeDelete}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDelete}>
              Delete Project
            </Button>
          </div>
        }
      >
        <p className="text-sm text-slate-300">
          This will permanently delete <strong className="text-white">{project.name}</strong> from your local storage.
        </p>
      </Modal>

      {/* Spatial Telemetry Modal */}
      <Modal
        isOpen={isSpecsOpen}
        onClose={closeSpecs}
        title="Spatial Geometry Telemetry"
        description="Normalized metric and imperial geometry specifications."
        footer={
          <Button variant="primary" size="sm" onClick={closeSpecs}>
            Done
          </Button>
        }
      >
        <div className="space-y-3 font-mono text-xs">
          <div className="p-3.5 rounded-xl bg-[#090E1A] border border-blue-500/20 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Schema Version:</span>
              <span className="text-cyan-400">{configuration.schemaVersion}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Active Unit:</span>
              <span className="text-cyan-400">{project.unit}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Normalized Length:</span>
              <span className="text-white">{configuration.lengthMeters} meters</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Normalized Width:</span>
              <span className="text-white">{configuration.widthMeters} meters</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Ceiling Height:</span>
              <span className="text-white">{configuration.ceilingHeightMeters} meters</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Furniture Items:</span>
              <span className="text-white">{displayedFurniture.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Collision State:</span>
              <span className={validationResult.isValid ? 'text-emerald-400' : 'text-rose-400'}>
                {validationResult.isValid ? 'Zero Collisions' : `${validationResult.errors.length} Violations`}
              </span>
            </div>
          </div>
        </div>
      </Modal>

      {/* Layout Comparison Modal */}
      <LayoutComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        currentFurniture={furniture}
        roomConfig={configuration}
        candidates={optimizerCandidates}
        savedVersions={savedVersions}
        unit={project.unit}
        onApplyLayout={handleApplyLayoutFromComparison}
      />

      {/* Layout Analytics Dashboard Modal */}
      <LayoutAnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        furniture={furniture}
        roomConfig={configuration}
        candidates={optimizerCandidates}
        versions={savedVersions}
        unit={project.unit}
        onOpenComparison={() => {
          setIsAnalyticsOpen(false)
          setIsComparisonOpen(true)
        }}
      />

      {/* Layout Version Management Modal */}
      <VersionManagementModal
        isOpen={isVersionsOpen}
        onClose={() => setIsVersionsOpen(false)}
        versions={savedVersions}
        currentFurniture={furniture}
        onSaveVersion={handleSaveVersion}
        onRenameVersion={handleRenameVersion}
        onDeleteVersion={handleDeleteVersion}
        onRestoreVersion={handleRestoreVersion}
        onCompareVersion={() => {
          setIsVersionsOpen(false)
          setIsComparisonOpen(true)
        }}
      />

      {/* Exportable Spatial Design Report Modal */}
      <ExportDesignReportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        project={project}
        roomConfig={configuration}
        furniture={furniture}
        unit={project.unit}
      />

      {/* Floating Studio AI Assistant Trigger Pill */}
      {!isAssistantOpen && (
        <button
          type="button"
          onClick={() => setIsAssistantOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white font-mono text-xs font-bold shadow-2xl shadow-cyan-500/30 border border-cyan-400/40 hover:scale-105 active:scale-95 transition-all cursor-pointer glow-blue group"
          title="Open Multilingual AI Design Assistant (Voice & Chat)"
        >
          <Sparkles className="w-4 h-4 text-cyan-200 group-hover:rotate-12 transition-transform animate-pulse" />
          <span>AI Assistant (Voice &amp; NLP)</span>
          <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping ml-1" />
        </button>
      )}

      {/* Multilingual AI Assistant Drawer */}
      <AIAssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        context={spatialContext}
        onPreviewCandidate={setPreviewCandidate}
      />
    </div>
  )
}
