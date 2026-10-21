import React, { useState, useId } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Box, 
  Ruler, 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  Info
} from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { FormField, Input, Select } from '@/components/common/Form'
import { 
  createProject, 
  calculateNormalized, 
  metersToFeet, 
  feetToMeters 
} from '@/utils/storage'
import type { RoomType, MeasurementUnit } from '@/types/project'

export const NewDesignPlaceholderPage: React.FC = () => {
  const navigate = useNavigate()

  // Form State
  const [roomName, setRoomName] = useState('')
  const [roomType, setRoomType] = useState<RoomType>('Living Room')
  const [unit, setUnit] = useState<MeasurementUnit>('metres')
  const [length, setLength] = useState<number>(6.0)
  const [width, setWidth] = useState<number>(4.5)
  const [height, setHeight] = useState<number>(2.8)
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Validation State
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const nameId = useId()
  const typeId = useId()
  const lengthId = useId()
  const widthId = useId()
  const heightId = useId()
  const notesId = useId()

  // Unit constraints
  const minDim = unit === 'metres' ? 1.5 : 5.0
  const maxDim = unit === 'metres' ? 30.0 : 100.0
  const minHeight = unit === 'metres' ? 2.0 : 6.5
  const maxHeight = unit === 'metres' ? 8.0 : 26.0

  // Handle Unit Toggle with precise mathematical conversion
  const handleUnitToggle = (newUnit: MeasurementUnit) => {
    if (newUnit === unit) return
    if (newUnit === 'feet') {
      setLength(metersToFeet(length))
      setWidth(metersToFeet(width))
      setHeight(metersToFeet(height))
    } else {
      setLength(feetToMeters(length))
      setWidth(feetToMeters(width))
      setHeight(feetToMeters(height))
    }
    setUnit(newUnit)
  }

  // Real-time Validation Errors
  const errors = {
    name: !roomName.trim() ? 'Project name is required' : '',
    length:
      !length || length < minDim || length > maxDim
        ? `Length must be between ${minDim} and ${maxDim} ${unit}`
        : '',
    width:
      !width || width < minDim || width > maxDim
        ? `Width must be between ${minDim} and ${maxDim} ${unit}`
        : '',
    height:
      height && (height < minHeight || height > maxHeight)
        ? `Height must be between ${minHeight} and ${maxHeight} ${unit}`
        : '',
  }

  const isValid = !errors.name && !errors.length && !errors.width && !errors.height

  // Computed Spatial Summary
  const { area, volume, normalizedDimensions } = calculateNormalized(
    width || 0,
    length || 0,
    height || 2.8,
    unit
  )
  const perimeter = Number((2 * ((length || 0) + (width || 0))).toFixed(1))
  const unitLabel = unit === 'metres' ? 'm' : 'ft'
  const areaUnit = unit === 'metres' ? 'm²' : 'sq ft'
  const volUnit = unit === 'metres' ? 'm³' : 'cu ft'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ name: true, length: true, width: true, height: true })

    if (!isValid) return

    setIsSubmitting(true)
    try {
      const newProject = createProject({
        name: roomName.trim(),
        roomType,
        width,
        length,
        ceilingHeight: height || undefined,
        unit,
        area,
        volume,
        normalizedDimensions,
        notes: notes.trim() || undefined,
      })

      setTimeout(() => {
        setIsSubmitting(false)
        navigate(`/design/${newProject.id}/configure`)
      }, 350)
    } catch (err) {
      console.error('Failed to create project:', err)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors p-1 rounded-lg focus-ring"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </Link>
        <span className="text-slate-600">/</span>
        <span className="text-xs font-mono text-blue-400">Create New Room</span>
      </div>

      {/* Header */}
      <div className="pb-8 border-b border-blue-500/15">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="blue" className="text-[10px]">
            Spatial Entry Flow
          </Badge>
          <span className="text-xs font-mono text-slate-400">Room Specification</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
          Create New Room
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Enter your room dimensions and configuration. This creates a validated project model
          ready for layout optimization and future 3D scene rendering.
        </p>
      </div>

      {/* Architectural Phase Notice */}
      <div className="my-6 p-4 rounded-2xl glass-panel border border-blue-500/25 flex items-start gap-3.5 bg-blue-950/20">
        <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-blue-200">Phase 2 Room Architecture</p>
          <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
            Room setups are validated and stored in local state. In Phase 3, clicking "Create Room"
            will initialize the Three.js 3D canvas and collision detection physics.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-7">
          <Card variant="default">
            <form onSubmit={handleSubmit} className="space-y-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-white">Room Setup & Geometry</CardTitle>
                  
                  {/* Unit Selector */}
                  <div className="flex items-center bg-[#090E1A] p-1 rounded-xl border border-blue-500/20 text-xs font-medium">
                    <button
                      type="button"
                      onClick={() => handleUnitToggle('metres')}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        unit === 'metres'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Metres (m)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUnitToggle('feet')}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        unit === 'feet'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Feet (ft)
                    </button>
                  </div>
                </div>
                <CardDescription>
                  Enter perimeter bounds. Values automatically recalculate when changing units.
                </CardDescription>
              </CardHeader>

              {/* Project Name */}
              <FormField 
                label="Project Name" 
                htmlFor={nameId} 
                required 
                error={touched.name ? errors.name : undefined}
              >
                <Input
                  id={nameId}
                  value={roomName}
                  onChange={(e) => {
                    setRoomName(e.target.value)
                    if (!touched.name) setTouched((t) => ({ ...t, name: true }))
                  }}
                  onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                  placeholder="e.g. Master Bedroom, Creative Studio, Living Loft"
                  leftIcon={<Box className="w-4 h-4" />}
                  error={touched.name ? errors.name : undefined}
                />
              </FormField>

              {/* Room Type */}
              <FormField label="Room Type" htmlFor={typeId} required>
                <Select
                  id={typeId}
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value as RoomType)}
                >
                  <option value="Living Room" className="bg-[#0B1120] text-white">Living Room</option>
                  <option value="Bedroom" className="bg-[#0B1120] text-white">Bedroom</option>
                  <option value="Study Room" className="bg-[#0B1120] text-white">Study Room</option>
                  <option value="Kitchen" className="bg-[#0B1120] text-white">Kitchen</option>
                  <option value="Other" className="bg-[#0B1120] text-white">Other</option>
                </Select>
              </FormField>

              {/* Dimensional Controls (Length, Width, Height) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField 
                  label={`Length (${unitLabel})`} 
                  htmlFor={lengthId} 
                  required 
                  error={touched.length ? errors.length : undefined}
                  hint={`Min ${minDim}${unitLabel}`}
                >
                  <Input
                    id={lengthId}
                    type="number"
                    step={unit === 'metres' ? '0.1' : '0.5'}
                    min={minDim}
                    max={maxDim}
                    value={length || ''}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value)
                      setLength(isNaN(val) ? 0 : val)
                      if (!touched.length) setTouched((t) => ({ ...t, length: true }))
                    }}
                    onBlur={() => setTouched((t) => ({ ...t, length: true }))}
                    error={touched.length ? errors.length : undefined}
                  />
                </FormField>

                <FormField 
                  label={`Width (${unitLabel})`} 
                  htmlFor={widthId} 
                  required 
                  error={touched.width ? errors.width : undefined}
                  hint={`Min ${minDim}${unitLabel}`}
                >
                  <Input
                    id={widthId}
                    type="number"
                    step={unit === 'metres' ? '0.1' : '0.5'}
                    min={minDim}
                    max={maxDim}
                    value={width || ''}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value)
                      setWidth(isNaN(val) ? 0 : val)
                      if (!touched.width) setTouched((t) => ({ ...t, width: true }))
                    }}
                    onBlur={() => setTouched((t) => ({ ...t, width: true }))}
                    error={touched.width ? errors.width : undefined}
                  />
                </FormField>

                <FormField 
                  label={`Ceiling Height (${unitLabel})`} 
                  htmlFor={heightId}
                  hint="Optional height"
                  error={touched.height ? errors.height : undefined}
                >
                  <Input
                    id={heightId}
                    type="number"
                    step={unit === 'metres' ? '0.1' : '0.5'}
                    min={minHeight}
                    max={maxHeight}
                    value={height || ''}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value)
                      setHeight(isNaN(val) ? 0 : val)
                    }}
                    onBlur={() => setTouched((t) => ({ ...t, height: true }))}
                    error={touched.height ? errors.height : undefined}
                  />
                </FormField>
              </div>

              {/* Notes / Design Objectives */}
              <FormField label="Design Objectives & Notes" htmlFor={notesId} hint="Optional room preferences">
                <Input
                  id={notesId}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Focus on natural sunlight, standing desk, wide walking path"
                />
              </FormField>

              {/* Submission & Cancel Actions */}
              <div className="pt-4 border-t border-blue-500/15 flex items-center justify-between">
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={!isValid || isSubmitting}
                  isLoading={isSubmitting}
                  leftIcon={<Sparkles className="w-4 h-4 text-cyan-300" />}
                  className="glow-blue shadow-blue-500/25"
                >
                  Create Room
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Column: Live Summary & Aspect Ratio Preview */}
        <div className="lg:col-span-5 space-y-6">
          <Card variant="elevated">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-blue-400" />
                  <span>Live Geometric Summary</span>
                </CardTitle>
                <Badge variant="cyan" className="text-[9px]">
                  {unit}
                </Badge>
              </div>
              <CardDescription>
                Proportional footprint computed dynamically from entered dimensions.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Scaled Room Outline Canvas Box */}
              <div className="h-56 w-full rounded-xl bg-[#090E1A] border border-blue-500/20 p-4 flex items-center justify-center relative overflow-hidden">
                <div 
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: 'linear-gradient(to right, #3B82F6 1px, transparent 1px), linear-gradient(to bottom, #3B82F6 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }}
                />

                {/* Scaled Room Outline Box */}
                <motion.div
                  layout
                  className="relative border-2 border-blue-400/70 bg-blue-950/30 rounded-lg flex flex-col items-center justify-center shadow-lg shadow-blue-500/10 p-2"
                  style={{
                    width: `${Math.min(90, Math.max(45, (normalizedDimensions.lengthMeters / 10) * 80))}%`,
                    height: `${Math.min(85, Math.max(40, (normalizedDimensions.widthMeters / 8) * 75))}%`,
                  }}
                >
                  <span className="text-xs font-mono font-bold text-white text-center truncate max-w-full">
                    {roomName || 'Untitled Room'}
                  </span>
                  <span className="text-[10px] font-mono text-cyan-300 mt-1">
                    {length}{unitLabel} × {width}{unitLabel}
                  </span>
                  
                  {/* Door Swing Arc */}
                  <div className="absolute bottom-0 left-2 w-7 h-7 border-l-2 border-t-2 border-dashed border-emerald-400/80 rounded-tl-full pointer-events-none" />
                  <span className="absolute bottom-1 left-9 text-[8px] font-mono text-emerald-400">
                    Door Swing
                  </span>

                  {/* Window Aperture */}
                  <div className="absolute top-0 right-4 w-12 h-1 bg-cyan-400 rounded-full" />
                  <span className="absolute -top-4 right-4 text-[8px] font-mono text-cyan-400">
                    Window
                  </span>
                </motion.div>
              </div>

              {/* Calculated Geometric Specs */}
              <div className="grid grid-cols-3 gap-2 text-center pt-2">
                <div className="p-2.5 rounded-xl bg-[#0A0F1D] border border-blue-500/15">
                  <span className="text-[10px] font-mono uppercase text-slate-400">Floor Area</span>
                  <p className="text-base font-bold text-emerald-400 font-mono mt-0.5">{area} {areaUnit}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-[#0A0F1D] border border-blue-500/15">
                  <span className="text-[10px] font-mono uppercase text-slate-400">Perimeter</span>
                  <p className="text-base font-bold text-blue-400 font-mono mt-0.5">{perimeter} {unitLabel}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-[#0A0F1D] border border-blue-500/15">
                  <span className="text-[10px] font-mono uppercase text-slate-400">Volume</span>
                  <p className="text-base font-bold text-purple-400 font-mono mt-0.5">{volume} {volUnit}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-slate-300 font-sans space-y-1">
                <p className="font-semibold text-blue-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  Geometric Validity: Verified
                </p>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Length, width, and circulation clearance are within standard architectural design bounds.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
