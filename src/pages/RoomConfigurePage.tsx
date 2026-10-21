import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Save, 
  RotateCcw, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Ruler, 
  DoorOpen, 
  Square, 
  ArrowRight,
  Check
} from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { FormField, Input, Select } from '@/components/common/Form'
import { Modal } from '@/components/common/Modal'
import { RoomBlueprint2D } from '@/components/blueprint/RoomBlueprint2D'
import { 
  getProjectById, 
  updateProject 
} from '@/utils/storage'
import { 
  validateRoomConfiguration, 
  ensureRoomConfiguration,
  getWallLength,
  metersToFeet,
  feetToMeters
} from '@/utils/geometry'
import { useDisclosure } from '@/hooks/useDisclosure'
import type { RoomProject, MeasurementUnit, RoomType } from '@/types/project'
import type { 
  WallId, 
  RoomDoor, 
  RoomWindow, 
  RoomConfiguration, 
  SwingDirection 
} from '@/types/geometry'

export const RoomConfigurePage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [project, setProject] = useState<RoomProject | null>(null)
  const [loading, setLoading] = useState(true)

  // Local Editable Configuration State
  const [config, setConfig] = useState<RoomConfiguration | null>(null)
  const [originalConfig, setOriginalConfig] = useState<RoomConfiguration | null>(null)
  const [unit, setUnit] = useState<MeasurementUnit>('metres')
  const [projectName, setProjectName] = useState('')
  const [roomType, setRoomType] = useState<RoomType>('Living Room')

  // Selection State
  const [selectedWallId, setSelectedWallId] = useState<WallId>('South')
  const [selectedOpeningId, setSelectedOpeningId] = useState<string | null>(null)
  const [selectedOpeningType, setSelectedOpeningType] = useState<'door' | 'window' | null>(null)

  // Modals
  const { isOpen: isDeleteOpeningOpen, open: openDeleteOpening, close: closeDeleteOpening } = useDisclosure()
  const { isOpen: isResetOpen, open: openReset, close: closeReset } = useDisclosure()
  const { isOpen: isSaveSuccessOpen, open: openSaveSuccess, close: closeSaveSuccess } = useDisclosure()

  // Load project on mount
  useEffect(() => {
    if (id) {
      const found = getProjectById(id)
      if (found) {
        setProject(found)
        setProjectName(found.name)
        setRoomType(found.roomType)
        setUnit(found.unit)
        const initialConfig = ensureRoomConfiguration(found)
        setConfig(initialConfig)
        setOriginalConfig(JSON.parse(JSON.stringify(initialConfig)))
      }
    }
    setLoading(false)
  }, [id])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center font-mono text-slate-400">
        Loading room blueprint configuration...
      </div>
    )
  }

  if (!project || !config) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <Badge variant="rose" className="mb-3">404 Not Found</Badge>
        <h1 className="text-2xl font-bold text-white">Project Not Found</h1>
        <p className="mt-2 text-sm text-slate-400">The requested room model could not be found.</p>
        <Link to="/dashboard" className="mt-6 inline-block">
          <Button variant="primary" size="sm">Return to Dashboard</Button>
        </Link>
      </div>
    )
  }

  // Live Geometry Validation
  const validationResult = validateRoomConfiguration(config)
  const hasUnsavedChanges = JSON.stringify(config) !== JSON.stringify(originalConfig) || projectName !== project.name

  // Conversion helper for inputs
  const toDisplay = (meters: number) => {
    return unit === 'feet' ? metersToFeet(meters) : meters
  }

  const toMeters = (displayVal: number) => {
    return unit === 'feet' ? feetToMeters(displayVal) : displayVal
  }

  // Handlers for Room Dimensions
  const handleDimensionChange = (key: 'widthMeters' | 'lengthMeters' | 'ceilingHeightMeters', value: number) => {
    const meters = toMeters(value)
    setConfig((prev) => (prev ? { ...prev, [key]: Number(meters.toFixed(2)) } : null))
  }

  // Handlers for Add Opening
  const handleAddDoor = () => {
    if (!config) return
    const wallLength = getWallLength(selectedWallId, config.widthMeters, config.lengthMeters)
    const doorWidth = 0.9
    const offset = Math.max(0.1, Math.min(1.0, wallLength - doorWidth - 0.2))

    const newDoor: RoomDoor = {
      id: `door-${Date.now().toString(36)}`,
      name: `Door (${selectedWallId})`,
      wallId: selectedWallId,
      widthMeters: doorWidth,
      heightMeters: 2.1,
      offsetMeters: Number(offset.toFixed(2)),
      swingDirection: 'inward-right',
    }

    setConfig({
      ...config,
      doors: [...config.doors, newDoor],
    })
    setSelectedOpeningId(newDoor.id)
    setSelectedOpeningType('door')
  }

  const handleAddWindow = () => {
    if (!config) return
    const wallLength = getWallLength(selectedWallId, config.widthMeters, config.lengthMeters)
    const windowWidth = 1.4
    const offset = Math.max(0.2, Math.min(1.2, wallLength - windowWidth - 0.2))

    const newWindow: RoomWindow = {
      id: `win-${Date.now().toString(36)}`,
      name: `Window (${selectedWallId})`,
      wallId: selectedWallId,
      widthMeters: windowWidth,
      heightMeters: 1.2,
      offsetMeters: Number(offset.toFixed(2)),
      sillHeightMeters: 0.9,
    }

    setConfig({
      ...config,
      windows: [...config.windows, newWindow],
    })
    setSelectedOpeningId(newWindow.id)
    setSelectedOpeningType('window')
  }

  // Handlers for updating selected opening
  const updateDoor = (doorId: string, updates: Partial<RoomDoor>) => {
    if (!config) return
    setConfig({
      ...config,
      doors: config.doors.map((d) => (d.id === doorId ? { ...d, ...updates } : d)),
    })
  }

  const updateWindow = (winId: string, updates: Partial<RoomWindow>) => {
    if (!config) return
    setConfig({
      ...config,
      windows: config.windows.map((w) => (w.id === winId ? { ...w, ...updates } : w)),
    })
  }

  // Delete selected opening
  const handleDeleteOpening = () => {
    if (!config || !selectedOpeningId) return
    if (selectedOpeningType === 'door') {
      setConfig({
        ...config,
        doors: config.doors.filter((d) => d.id !== selectedOpeningId),
      })
    } else if (selectedOpeningType === 'window') {
      setConfig({
        ...config,
        windows: config.windows.filter((w) => w.id !== selectedOpeningId),
      })
    }
    setSelectedOpeningId(null)
    setSelectedOpeningType(null)
    closeDeleteOpening()
  }

  // Save handler
  const handleSave = () => {
    if (!config) return
    const updated = updateProject(project.id, {
      name: projectName.trim() || project.name,
      roomType,
      unit,
      configuration: config,
      width: unit === 'metres' ? config.widthMeters : metersToFeet(config.widthMeters),
      length: unit === 'metres' ? config.lengthMeters : metersToFeet(config.lengthMeters),
      ceilingHeight: unit === 'metres' ? config.ceilingHeightMeters : metersToFeet(config.ceilingHeightMeters),
      area: unit === 'metres' 
        ? Number((config.widthMeters * config.lengthMeters).toFixed(1))
        : Number((metersToFeet(config.widthMeters) * metersToFeet(config.lengthMeters)).toFixed(1)),
    })

    if (updated) {
      setProject(updated)
      setOriginalConfig(JSON.parse(JSON.stringify(config)))
      openSaveSuccess()
    }
  }

  // Reset handler
  const handleReset = () => {
    if (originalConfig) {
      setConfig(JSON.parse(JSON.stringify(originalConfig)))
      setProjectName(project.name)
      setSelectedOpeningId(null)
      closeReset()
    }
  }

  // Continue to 3D Design
  const handleContinue = () => {
    if (!validationResult.isValid) return
    handleSave()
    navigate(`/design/${project.id}`)
  }

  // Active selected opening object
  const selectedDoor = selectedOpeningType === 'door' ? config.doors.find((d) => d.id === selectedOpeningId) : null
  const selectedWindow = selectedOpeningType === 'window' ? config.windows.find((w) => w.id === selectedOpeningId) : null

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Top Header Bar & Progress Indicator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-blue-500/15">
        <div className="flex items-center gap-3">
          <Link
            to={`/design/${project.id}`}
            className="p-2 rounded-xl glass-panel text-slate-400 hover:text-white transition-colors"
            title="Back to Overview"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">Blueprint Studio</span>
              {hasUnsavedChanges && (
                <Badge variant="amber" dot className="text-[9px]">
                  Unsaved Changes
                </Badge>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              {projectName || project.name}
            </h1>
          </div>
        </div>

        {/* Four-Stage Linear Workflow Progress Bar */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/30 border border-blue-500/50 text-white font-semibold">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span>1. Room Setup</span>
          </div>
          <span className="text-slate-600">→</span>
          <Link
            to={`/design/${project.id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-panel text-cyan-300 hover:text-white transition-colors"
            title="View 3D Digital Twin"
          >
            <span>2. 3D Design</span>
            <span className="text-[9px] uppercase px-1 rounded bg-blue-600/40 text-blue-200 font-bold">Ready</span>
          </Link>
          <span className="text-slate-600">→</span>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-panel text-slate-500">
            <span>3. Optimize</span>
          </div>
          <span className="text-slate-600">→</span>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-panel text-slate-500">
            <span>4. Walkthrough</span>
          </div>
        </div>

        {/* Global Action CTAs */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={openReset}
            disabled={!hasUnsavedChanges}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Reset
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSave}
            disabled={!validationResult.isValid}
            leftIcon={<Save className="w-3.5 h-3.5 text-blue-400" />}
          >
            Save Blueprint
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleContinue}
            disabled={!validationResult.isValid}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            className="glow-blue"
          >
            Continue to 3D
          </Button>
        </div>
      </div>

      {/* THREE-PANEL STUDIO WORKSPACE LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-5">
        {/* ========================================================= */}
        {/* PANEL 1 (LEFT): ROOM PROPERTIES & OPENING CREATION TOOLS   */}
        {/* ========================================================= */}
        <div className="lg:col-span-3 space-y-4">
          {/* Room Dimensions Card */}
          <Card variant="default" className="p-4.5">
            <CardHeader className="mb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-blue-400" />
                  <span>Room Perimeter</span>
                </CardTitle>
                {/* Unit Switcher */}
                <div className="flex items-center bg-[#090E1A] p-0.5 rounded-lg border border-blue-500/20 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setUnit('metres')}
                    className={`px-2 py-0.5 rounded ${unit === 'metres' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                  >
                    m
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnit('feet')}
                    className={`px-2 py-0.5 rounded ${unit === 'feet' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                  >
                    ft
                  </button>
                </div>
              </div>
              <CardDescription className="text-xs">
                Rectangular bounds in {unit}.
              </CardDescription>
            </CardHeader>

            <div className="space-y-3">
              <FormField label="Project Name">
                <Input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Project name"
                />
              </FormField>

              <div className="grid grid-cols-2 gap-2.5">
                <FormField label={`Width (${unit === 'metres' ? 'm' : 'ft'})`}>
                  <Input
                    type="number"
                    step="0.1"
                    value={toDisplay(config.widthMeters)}
                    onChange={(e) => handleDimensionChange('widthMeters', parseFloat(e.target.value) || 1.5)}
                  />
                </FormField>
                <FormField label={`Length (${unit === 'metres' ? 'm' : 'ft'})`}>
                  <Input
                    type="number"
                    step="0.1"
                    value={toDisplay(config.lengthMeters)}
                    onChange={(e) => handleDimensionChange('lengthMeters', parseFloat(e.target.value) || 1.5)}
                  />
                </FormField>
              </div>

              <FormField label={`Ceiling Height (${unit === 'metres' ? 'm' : 'ft'})`}>
                <Input
                  type="number"
                  step="0.1"
                  value={toDisplay(config.ceilingHeightMeters)}
                  onChange={(e) => handleDimensionChange('ceilingHeightMeters', parseFloat(e.target.value) || 2.0)}
                />
              </FormField>
            </div>
          </Card>

          {/* Opening Creation Tools */}
          <Card variant="default" className="p-4.5">
            <CardHeader className="mb-3">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <DoorOpen className="w-4 h-4 text-emerald-400" />
                <span>Wall Opening Tools</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Select wall target and insert openings.
              </CardDescription>
            </CardHeader>

            <div className="space-y-3">
              <FormField label="Active Target Wall">
                <div className="grid grid-cols-4 gap-1.5 text-xs font-mono">
                  {(['North', 'East', 'South', 'West'] as WallId[]).map((wId) => (
                    <button
                      key={wId}
                      type="button"
                      onClick={() => setSelectedWallId(wId)}
                      className={`py-1.5 rounded-lg border text-center transition-all ${
                        selectedWallId === wId
                          ? 'bg-blue-600 text-white border-blue-400 shadow-sm font-bold'
                          : 'bg-[#090E1A] text-slate-400 border-blue-500/20 hover:text-white'
                      }`}
                    >
                      {wId[0]}
                    </button>
                  ))}
                </div>
              </FormField>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleAddDoor}
                  leftIcon={<Plus className="w-3.5 h-3.5 text-emerald-400" />}
                  className="text-xs"
                >
                  Add Door
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleAddWindow}
                  leftIcon={<Plus className="w-3.5 h-3.5 text-cyan-400" />}
                  className="text-xs"
                >
                  Add Window
                </Button>
              </div>
            </div>
          </Card>

          {/* Wall Openings Inventory */}
          <Card variant="outline" className="p-4">
            <CardHeader className="mb-2">
              <CardTitle className="text-xs font-mono uppercase text-slate-400">
                Opening Inventory ({config.doors.length + config.windows.length})
              </CardTitle>
            </CardHeader>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 text-xs">
              {config.doors.map((door) => (
                <button
                  key={door.id}
                  type="button"
                  onClick={() => {
                    setSelectedOpeningId(door.id)
                    setSelectedOpeningType('door')
                    setSelectedWallId(door.wallId)
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-lg border text-left transition-colors ${
                    selectedOpeningId === door.id
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                      : 'bg-[#090E1A] border-blue-500/15 text-slate-300 hover:border-blue-500/30'
                  }`}
                >
                  <span className="font-medium truncate">{door.name}</span>
                  <span className="text-[10px] font-mono text-slate-400">{door.wallId}</span>
                </button>
              ))}

              {config.windows.map((win) => (
                <button
                  key={win.id}
                  type="button"
                  onClick={() => {
                    setSelectedOpeningId(win.id)
                    setSelectedOpeningType('window')
                    setSelectedWallId(win.wallId)
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-lg border text-left transition-colors ${
                    selectedOpeningId === win.id
                      ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-200'
                      : 'bg-[#090E1A] border-blue-500/15 text-slate-300 hover:border-blue-500/30'
                  }`}
                >
                  <span className="font-medium truncate">{win.name}</span>
                  <span className="text-[10px] font-mono text-slate-400">{win.wallId}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* ========================================================= */}
        {/* PANEL 2 (CENTER): LIVE 2D INTERACTIVE SVG BLUEPRINT       */}
        {/* ========================================================= */}
        <div className="lg:col-span-6 h-[550px] lg:h-[720px] flex flex-col">
          <RoomBlueprint2D
            configuration={config}
            unit={unit}
            selectedWallId={selectedWallId}
            selectedOpeningId={selectedOpeningId}
            onSelectWall={(wallId) => {
              setSelectedWallId(wallId)
            }}
            onSelectOpening={(opId, type) => {
              setSelectedOpeningId(opId)
              setSelectedOpeningType(type)
              const wall = type === 'door' 
                ? config.doors.find((d) => d.id === opId)?.wallId
                : config.windows.find((w) => w.id === opId)?.wallId
              if (wall) setSelectedWallId(wall)
            }}
            onUpdateDoorOffset={(doorId, newOffset) => {
              updateDoor(doorId, { offsetMeters: newOffset })
            }}
            onUpdateWindowOffset={(winId, newOffset) => {
              updateWindow(winId, { offsetMeters: newOffset })
            }}
            validationErrors={validationResult.errors}
          />
        </div>

        {/* ========================================================= */}
        {/* PANEL 3 (RIGHT): SELECTED OPENING INSPECTOR & VALIDATION  */}
        {/* ========================================================= */}
        <div className="lg:col-span-3 space-y-4">
          {/* Selected Item Property Inspector */}
          {selectedDoor ? (
            <Card variant="default" className="p-4.5 border-emerald-500/30">
              <CardHeader className="mb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                    <DoorOpen className="w-4 h-4 text-emerald-400" />
                    <span>Door Properties</span>
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedOpeningId(null)
                      setSelectedOpeningType(null)
                    }}
                    className="h-6 text-[11px] px-2 text-slate-400"
                  >
                    Close
                  </Button>
                </div>
                <CardDescription className="text-xs">
                  Offset measured from {selectedDoor.wallId} wall start.
                </CardDescription>
              </CardHeader>

              <div className="space-y-3">
                <FormField label="Display Name">
                  <Input
                    value={selectedDoor.name}
                    onChange={(e) => updateDoor(selectedDoor.id, { name: e.target.value })}
                  />
                </FormField>

                <FormField label="Wall Placement">
                  <Select
                    value={selectedDoor.wallId}
                    onChange={(e) => updateDoor(selectedDoor.id, { wallId: e.target.value as WallId })}
                  >
                    <option value="North" className="bg-[#0B1120] text-white">North Wall</option>
                    <option value="East" className="bg-[#0B1120] text-white">East Wall</option>
                    <option value="South" className="bg-[#0B1120] text-white">South Wall</option>
                    <option value="West" className="bg-[#0B1120] text-white">West Wall</option>
                  </Select>
                </FormField>

                <div className="grid grid-cols-2 gap-2">
                  <FormField label={`Width (${unit === 'metres' ? 'm' : 'ft'})`}>
                    <Input
                      type="number"
                      step="0.05"
                      value={toDisplay(selectedDoor.widthMeters)}
                      onChange={(e) => updateDoor(selectedDoor.id, { widthMeters: toMeters(parseFloat(e.target.value) || 0.6) })}
                    />
                  </FormField>
                  <FormField label={`Height (${unit === 'metres' ? 'm' : 'ft'})`}>
                    <Input
                      type="number"
                      step="0.05"
                      value={toDisplay(selectedDoor.heightMeters)}
                      onChange={(e) => updateDoor(selectedDoor.id, { heightMeters: toMeters(parseFloat(e.target.value) || 2.0) })}
                    />
                  </FormField>
                </div>

                <FormField label={`Position Offset (${unit === 'metres' ? 'm' : 'ft'})`}>
                  <Input
                    type="number"
                    step="0.05"
                    value={toDisplay(selectedDoor.offsetMeters)}
                    onChange={(e) => updateDoor(selectedDoor.id, { offsetMeters: toMeters(parseFloat(e.target.value) || 0) })}
                  />
                </FormField>

                <FormField label="Swing Arc Direction">
                  <Select
                    value={selectedDoor.swingDirection}
                    onChange={(e) => updateDoor(selectedDoor.id, { swingDirection: e.target.value as SwingDirection })}
                  >
                    <option value="inward-right" className="bg-[#0B1120] text-white">Inward Right (Standard)</option>
                    <option value="inward-left" className="bg-[#0B1120] text-white">Inward Left</option>
                    <option value="outward-right" className="bg-[#0B1120] text-white">Outward Right</option>
                    <option value="outward-left" className="bg-[#0B1120] text-white">Outward Left</option>
                  </Select>
                </FormField>

                <div className="pt-2">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={openDeleteOpening}
                    leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                    className="w-full text-xs"
                  >
                    Remove Door
                  </Button>
                </div>
              </div>
            </Card>
          ) : selectedWindow ? (
            <Card variant="default" className="p-4.5 border-cyan-500/30">
              <CardHeader className="mb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                    <Square className="w-4 h-4 text-cyan-400" />
                    <span>Window Properties</span>
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedOpeningId(null)
                      setSelectedOpeningType(null)
                    }}
                    className="h-6 text-[11px] px-2 text-slate-400"
                  >
                    Close
                  </Button>
                </div>
                <CardDescription className="text-xs">
                  Offset measured from {selectedWindow.wallId} wall start.
                </CardDescription>
              </CardHeader>

              <div className="space-y-3">
                <FormField label="Display Name">
                  <Input
                    value={selectedWindow.name}
                    onChange={(e) => updateWindow(selectedWindow.id, { name: e.target.value })}
                  />
                </FormField>

                <FormField label="Wall Placement">
                  <Select
                    value={selectedWindow.wallId}
                    onChange={(e) => updateWindow(selectedWindow.id, { wallId: e.target.value as WallId })}
                  >
                    <option value="North" className="bg-[#0B1120] text-white">North Wall</option>
                    <option value="East" className="bg-[#0B1120] text-white">East Wall</option>
                    <option value="South" className="bg-[#0B1120] text-white">South Wall</option>
                    <option value="West" className="bg-[#0B1120] text-white">West Wall</option>
                  </Select>
                </FormField>

                <div className="grid grid-cols-2 gap-2">
                  <FormField label={`Width (${unit === 'metres' ? 'm' : 'ft'})`}>
                    <Input
                      type="number"
                      step="0.05"
                      value={toDisplay(selectedWindow.widthMeters)}
                      onChange={(e) => updateWindow(selectedWindow.id, { widthMeters: toMeters(parseFloat(e.target.value) || 0.6) })}
                    />
                  </FormField>
                  <FormField label={`Height (${unit === 'metres' ? 'm' : 'ft'})`}>
                    <Input
                      type="number"
                      step="0.05"
                      value={toDisplay(selectedWindow.heightMeters)}
                      onChange={(e) => updateWindow(selectedWindow.id, { heightMeters: toMeters(parseFloat(e.target.value) || 1.0) })}
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <FormField label={`Position Offset (${unit === 'metres' ? 'm' : 'ft'})`}>
                    <Input
                      type="number"
                      step="0.05"
                      value={toDisplay(selectedWindow.offsetMeters)}
                      onChange={(e) => updateWindow(selectedWindow.id, { offsetMeters: toMeters(parseFloat(e.target.value) || 0) })}
                    />
                  </FormField>
                  <FormField label={`Sill Height (${unit === 'metres' ? 'm' : 'ft'})`}>
                    <Input
                      type="number"
                      step="0.05"
                      value={toDisplay(selectedWindow.sillHeightMeters)}
                      onChange={(e) => updateWindow(selectedWindow.id, { sillHeightMeters: toMeters(parseFloat(e.target.value) || 0.8) })}
                    />
                  </FormField>
                </div>

                <div className="pt-2">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={openDeleteOpening}
                    leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                    className="w-full text-xs"
                  >
                    Remove Window
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card variant="default" className="p-4.5">
              <CardHeader className="mb-2">
                <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  <span>{selectedWallId} Wall Inspector</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Click any door or window on the blueprint to edit its position and dimensions.
                </CardDescription>
              </CardHeader>
              <div className="p-3 rounded-xl bg-[#090E1A] border border-blue-500/15 text-xs font-mono space-y-1.5 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Wall Span:</span>
                  <span className="text-white font-bold">{toDisplay(getWallLength(selectedWallId, config.widthMeters, config.lengthMeters))} {unit === 'metres' ? 'm' : 'ft'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Doors on Wall:</span>
                  <span className="text-emerald-400">{config.doors.filter((d) => d.wallId === selectedWallId).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Windows on Wall:</span>
                  <span className="text-cyan-400">{config.windows.filter((w) => w.wallId === selectedWallId).length}</span>
                </div>
              </div>
            </Card>
          )}

          {/* Validation Feedback Telemetry Card */}
          <Card variant="outline" className={`p-4 ${validationResult.isValid ? 'border-emerald-500/30' : 'border-rose-500/40'}`}>
            <CardHeader className="mb-2">
              <div className="flex items-center gap-2">
                {validationResult.isValid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                )}
                <CardTitle className="text-xs font-mono uppercase text-white">
                  Spatial Geometry Validation
                </CardTitle>
              </div>
            </CardHeader>

            {validationResult.isValid ? (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  Blueprint Validated
                </p>
                <p className="text-[11px] text-emerald-400/80 leading-relaxed">
                  All openings fit within wall bounds with zero collision overlaps. Ready for 3D extrusion in Phase 4.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {validationResult.errors.map((err, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-300 flex items-start gap-2"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-400" />
                    <span className="leading-relaxed">{err.message}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Delete Opening Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpeningOpen}
        onClose={closeDeleteOpening}
        title="Remove Wall Opening"
        description="Are you sure you want to remove this opening from the blueprint?"
        footer={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={closeDeleteOpening}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteOpening}>
              Confirm Remove
            </Button>
          </div>
        }
      >
        <p className="text-sm text-slate-300">
          This will delete the selected opening from the wall and restore the solid wall segment.
        </p>
      </Modal>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={isResetOpen}
        onClose={closeReset}
        title="Discard Unsaved Changes"
        description="Revert all changes made during this editing session?"
        footer={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={closeReset}>
              Keep Editing
            </Button>
            <Button variant="danger" size="sm" onClick={handleReset}>
              Discard Changes
            </Button>
          </div>
        }
      >
        <p className="text-sm text-slate-300">
          All modifications to room dimensions, door positions, and window dimensions since your last save will be discarded.
        </p>
      </Modal>

      {/* Save Success Notification Modal */}
      <Modal
        isOpen={isSaveSuccessOpen}
        onClose={closeSaveSuccess}
        title="Blueprint Configuration Saved"
        description="Geometry parameters updated and persisted to local workspace."
        footer={
          <Button variant="primary" size="sm" onClick={closeSaveSuccess}>
            Continue Editing
          </Button>
        }
      >
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 space-y-1">
          <p className="font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Saved to Local Project Storage
          </p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Your rectangular perimeter, wall thickness, doors, and windows are now saved in project telemetry.
          </p>
        </div>
      </Modal>
    </div>
  )
}
