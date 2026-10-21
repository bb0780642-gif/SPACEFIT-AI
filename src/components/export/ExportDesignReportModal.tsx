import React, { useMemo } from 'react'
import {
  Printer,
  FileSpreadsheet,
  FileCode,
  Footprints,
  Maximize2
} from 'lucide-react'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import { RoomFloorplanSVG } from '@/components/blueprint/RoomFloorplanSVG'
import type { RoomProject } from '@/types/project'
import type { RoomConfiguration } from '@/types/geometry'
import type { PlacedFurniture } from '@/types/furniture'
import {
  computeLayoutStats,
  exportFurnitureToCSV,
} from '@/utils/analytics/layoutMetrics'

interface ExportDesignReportModalProps {
  isOpen: boolean
  onClose: () => void
  project: RoomProject
  roomConfig: RoomConfiguration
  furniture: PlacedFurniture[]
  unit?: 'metres' | 'feet'
}

export const ExportDesignReportModal: React.FC<ExportDesignReportModalProps> = ({
  isOpen,
  onClose,
  project,
  roomConfig,
  furniture,
  unit = 'metres',
}) => {
  const stats = useMemo(() => {
    return computeLayoutStats(furniture, roomConfig, project.name)
  }, [furniture, roomConfig, project.name])

  const totalAreaStr = unit === 'metres'
    ? `${stats.totalRoomAreaMeters} m²`
    : `${Number((stats.totalRoomAreaMeters * 10.7639).toFixed(1))} sq ft`

  const occupiedAreaStr = unit === 'metres'
    ? `${stats.occupiedAreaMeters} m²`
    : `${Number((stats.occupiedAreaMeters * 10.7639).toFixed(1))} sq ft`

  const unoccupiedAreaStr = unit === 'metres'
    ? `${stats.unoccupiedAreaMeters} m²`
    : `${Number((stats.unoccupiedAreaMeters * 10.7639).toFixed(1))} sq ft`

  // 1. Action: Print / PDF
  const handlePrint = () => {
    window.print()
  }

  // 2. Action: Export JSON Blueprint
  const handleExportJSON = () => {
    const reportData = {
      projectMetadata: {
        id: project.id,
        name: project.name,
        roomType: project.roomType,
        exportedAt: new Date().toISOString(),
        version: 'SpaceFit-AI-3.0',
      },
      roomConfiguration: roomConfig,
      placedFurniture: furniture,
      spatialAnalytics: stats,
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-blueprint.spacefit.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // 3. Action: Export CSV Schedule
  const handleExportCSV = () => {
    const csvContent = exportFurnitureToCSV(furniture)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-furniture-schedule.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Exportable Spatial Design Report"
      size="xl"
    >
      <div className="space-y-6">
        {/* Export Action Bar */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <Badge variant="cyan">
              Report Engine Ready
            </Badge>
            <span className="text-xs text-slate-300">
              Printable specifications, vector blueprint & CAD schedule exports
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="gap-1.5 text-xs text-slate-200"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              Download CSV Schedule
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportJSON}
              className="gap-1.5 text-xs text-slate-200"
            >
              <FileCode className="w-3.5 h-3.5 text-indigo-400" />
              Download JSON Blueprint
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handlePrint}
              className="gap-1.5 text-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save as PDF
            </Button>
          </div>
        </div>

        {/* Printable Specification Document Content */}
        <div
          id="spacefit-printable-report"
          className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 lg:p-8 space-y-6 text-slate-100 print:bg-white print:text-black print:p-0 print:border-none"
        >
          {/* Header */}
          <div className="border-b border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 print:text-blue-600">
                  SpaceFit AI — Architectural Spatial Report
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-white print:text-black">
                {project.name}
              </h1>
              <p className="text-xs text-slate-400 print:text-gray-600 mt-1">
                Room Category: {project.roomType} • Dimensions: {roomConfig.widthMeters}m × {roomConfig.lengthMeters}m (Ceiling: {roomConfig.ceilingHeightMeters}m)
              </p>
            </div>

            <div className="text-right text-xs text-slate-400 print:text-gray-600">
              <p>Generated: {new Date().toLocaleDateString()}</p>
              <p className="mt-0.5">Project ID: {project.id}</p>
              <Badge variant="emerald" className="mt-1">
                Composite Score: {stats.score?.overallScore} / 100
              </Badge>
            </div>
          </div>

          {/* Executive Spatial Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 print:border-gray-300 print:bg-gray-50">
              <span className="text-xs text-slate-400 print:text-gray-500 block">Total Room Area</span>
              <span className="text-lg font-bold text-white print:text-black">{totalAreaStr}</span>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 print:border-gray-300 print:bg-gray-50">
              <span className="text-xs text-slate-400 print:text-gray-500 block">Furniture Footprint</span>
              <span className="text-lg font-bold text-amber-400 print:text-amber-700">{occupiedAreaStr}</span>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 print:border-gray-300 print:bg-gray-50">
              <span className="text-xs text-slate-400 print:text-gray-500 block">Free Circulation Space</span>
              <span className="text-lg font-bold text-emerald-400 print:text-green-700">
                {unoccupiedAreaStr} ({stats.unoccupiedPercent}%)
              </span>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 print:border-gray-300 print:bg-gray-50">
              <span className="text-xs text-slate-400 print:text-gray-500 block">Boundary Status</span>
              <span className="text-lg font-bold text-cyan-400 print:text-blue-700">
                {stats.hardViolationsCount === 0 ? '0 Collisions (Safe)' : `${stats.hardViolationsCount} Errors`}
              </span>
            </div>
          </div>

          {/* Top-Down Blueprint Specification */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-200 print:text-black uppercase tracking-wider flex items-center gap-2">
              <Maximize2 className="w-4 h-4 text-cyan-400 print:text-blue-600" />
              Dimensioned 2D Top-Down Spatial Blueprint
            </h3>

            <div className="bg-slate-950/90 rounded-2xl overflow-hidden border border-slate-800 print:border-gray-400 p-4 min-h-[360px] flex items-center justify-center">
              <RoomFloorplanSVG
                configuration={roomConfig}
                furniture={furniture}
                movementPath={stats.movementPath}
                unit={unit}
              />
            </div>
          </div>

          {/* Furniture Inventory Specification Schedule */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-200 print:text-black uppercase tracking-wider flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-indigo-400 print:text-indigo-600" />
              Furniture Schedule & Spatial Coordinates ({furniture.length} Items)
            </h3>

            <div className="overflow-x-auto rounded-xl border border-slate-800 print:border-gray-300">
              <table className="w-full text-left text-xs text-slate-300 print:text-black">
                <thead className="bg-slate-950/80 print:bg-gray-100 text-slate-400 print:text-gray-600 uppercase tracking-wider border-b border-slate-800 print:border-gray-300">
                  <tr>
                    <th className="p-3">Item Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Dimensions (W × L × H)</th>
                    <th className="p-3">Coordinates (X, Z)</th>
                    <th className="p-3">Rotation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 print:divide-gray-200">
                  {furniture.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/30">
                      <td className="p-3 font-medium text-white print:text-black">{item.name}</td>
                      <td className="p-3 capitalize">{item.category}</td>
                      <td className="p-3">
                        {item.dimensions.widthMeters.toFixed(2)}m × {item.dimensions.lengthMeters.toFixed(2)}m × {item.dimensions.heightMeters.toFixed(2)}m
                      </td>
                      <td className="p-3 font-mono">
                        ({item.position[0].toFixed(2)}, {item.position[2].toFixed(2)})
                      </td>
                      <td className="p-3">{Math.round((item.rotationY * 180) / Math.PI)}°</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Movement & Walking Route Findings */}
          <div className="bg-slate-950/70 rounded-xl p-4 border border-slate-800 print:border-gray-300 space-y-2 text-xs">
            <h4 className="font-semibold text-slate-200 print:text-black flex items-center gap-2">
              <Footprints className="w-4 h-4 text-cyan-400 print:text-blue-600" />
              Movement Navigation & Path Feasibility Assessment
            </h4>
            <p className="text-slate-300 print:text-gray-700">
              Primary passage from <span className="font-medium text-white print:text-black">{stats.movementPath?.startLabel}</span> to <span className="font-medium text-white print:text-black">{stats.movementPath?.destinationLabel}</span>:
              {' '}Status is <span className="font-bold text-cyan-300 print:text-blue-700">{stats.movementPath?.status?.toUpperCase()}</span> with a measured walking route of{' '}
              <span className="font-bold">{stats.movementPath?.lengthMeters ?? 0}m</span> and minimum transit clearance of <span className="font-bold">{stats.movementPath?.minClearanceMeters}m</span>.
            </p>
          </div>

          {/* Limitations and Assumptions */}
          <div className="border-t border-slate-800 pt-4 text-[11px] text-slate-400 print:text-gray-500 space-y-1">
            <p className="font-semibold text-slate-300 print:text-gray-700">
              Engineering Limitations & Disclaimers
            </p>
            <p>
              This report is generated algorithmically by SpaceFit AI using 2D/3D Separating Axis Theorem (SAT) geometric collision models and 8-connected A* corridor pathfinding.
              Calculations assume planar floors and vertical walls. Values reflect geometric spatial navigation feasibility and do not constitute certified architectural, ADA accessibility compliance, or local life-safety code approval.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-800 print:hidden">
          <Button variant="outline" onClick={onClose}>
            Close Report
          </Button>
        </div>
      </div>
    </Modal>
  )
}
