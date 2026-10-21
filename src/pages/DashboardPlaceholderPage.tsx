import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Box, 
  Plus, 
  Search, 
  Footprints, 
  ShieldCheck, 
  ExternalLink,
  Info,
  Calendar,
  Compass
} from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { Input } from '@/components/common/Form'
import { Modal } from '@/components/common/Modal'
import { EmptyState } from '@/components/common/LoadingAndFeedback'
import { useDisclosure } from '@/hooks/useDisclosure'

export const DashboardPlaceholderPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'archived'>('all')
  const { isOpen, open, close } = useDisclosure()
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  const projects = [
    {
      id: 'proj-1',
      title: 'Nordic Living Loft',
      type: 'Living Space',
      dimensions: '6.4m × 4.8m (30.7 m²)',
      efficiency: '98.2%',
      clearance: '1.2m corridors',
      status: 'Optimal',
      updatedAt: '2 hours ago',
      color: 'blue',
    },
    {
      id: 'proj-2',
      title: 'Executive Ergonomic Studio',
      type: 'Workspace',
      dimensions: '5.2m × 4.0m (20.8 m²)',
      efficiency: '96.5%',
      clearance: '1.0m corridors',
      status: 'Optimal',
      updatedAt: 'Yesterday',
      color: 'violet',
    },
    {
      id: 'proj-3',
      title: 'Minimalist Master Suite',
      type: 'Bedroom',
      dimensions: '5.8m × 4.2m (24.4 m²)',
      efficiency: '99.0%',
      clearance: '1.1m corridors',
      status: 'Optimal',
      updatedAt: '3 days ago',
      color: 'cyan',
    },
  ]

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleInspect = (projectTitle: string) => {
    setSelectedProject(projectTitle)
    open()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-blue-500/15">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="blue" className="text-[10px]">
              Workspace Shell
            </Badge>
            <span className="text-xs font-mono text-slate-400">Phase 1 Preview</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Spatial Design Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your 3D digital twins, spatial reports, and layout variants in one workspace.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/design/new">
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
              className="glow-blue shadow-blue-500/25"
            >
              New Room Design
            </Button>
          </Link>
        </div>
      </div>

      {/* Phase 1 Notice Callout */}
      <div className="my-6 p-4 rounded-2xl glass-panel border border-blue-500/25 flex items-start gap-3.5 bg-blue-950/20">
        <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-blue-200">Phase 1 UI Foundation Architecture</p>
          <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
            This dashboard demonstrates the application shell, component hierarchy, search filters, and modal inspection.
            In Phase 2, this view will connect to Three.js persistence, room serialization, and real-time multi-room synchronizations.
          </p>
        </div>
      </div>

      {/* Spatial Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass-panel p-4 rounded-2xl border border-blue-500/15">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Digital Twins</span>
          <p className="text-2xl font-bold text-white mt-1">3 Models</p>
          <span className="text-[11px] text-emerald-400 font-mono">100% Geometry Verified</span>
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-blue-500/15">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Average Clearance</span>
          <p className="text-2xl font-bold text-emerald-400 mt-1">97.9%</p>
          <span className="text-[11px] text-slate-400 font-mono">ADA Compliant Corridors</span>
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-blue-500/15">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Simulated Area</span>
          <p className="text-2xl font-bold text-cyan-400 mt-1">75.9 m²</p>
          <span className="text-[11px] text-slate-400 font-mono">3 Active Suites</span>
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-blue-500/15">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Collision State</span>
          <p className="text-2xl font-bold text-blue-400 mt-1">0 Clashes</p>
          <span className="text-[11px] text-emerald-400 font-mono">Zero Clashing Tolerance</span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search room models or types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center bg-[#0B1120] p-1 rounded-xl border border-blue-500/20 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'all' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Active Twins ({projects.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('archived')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'archived' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Archived (0)
            </button>
          </div>
        </div>
      </div>

      {/* Project Cards or Empty State */}
      {activeTab === 'archived' || filteredProjects.length === 0 ? (
        <EmptyState
          icon={<Box className="w-7 h-7" />}
          title={activeTab === 'archived' ? 'No Archived Models' : 'No Room Models Found'}
          description={
            activeTab === 'archived'
              ? 'Archived digital twins and previous revisions will appear here once generated in Phase 2.'
              : `No rooms matched "${searchQuery}". Try modifying your search criteria or create a new room.`
          }
          actionLabel="Create New Room"
          onAction={() => window.location.assign('/design/new')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} variant="interactive" glow="blue" className="flex flex-col justify-between">
              <div>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="blue" className="text-[10px]">
                      {project.type}
                    </Badge>
                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {project.updatedAt}
                    </span>
                  </div>
                  <CardTitle className="text-lg text-white">
                    {project.title}
                  </CardTitle>
                  <CardDescription className="font-mono text-xs text-blue-300">
                    {project.dimensions}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-[#0A0F1D] border border-blue-500/10">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-blue-400" />
                      Efficiency Score
                    </span>
                    <span className="font-mono font-semibold text-emerald-400">{project.efficiency}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-[#0A0F1D] border border-blue-500/10">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Footprints className="w-3.5 h-3.5 text-emerald-400" />
                      Corridor Clearance
                    </span>
                    <span className="font-mono text-slate-200">{project.clearance}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-[#0A0F1D] border border-blue-500/10">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                      Clash Tolerance
                    </span>
                    <span className="font-mono text-cyan-300">0 Collisions</span>
                  </div>
                </CardContent>
              </div>

              <CardFooter className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleInspect(project.title)}
                  className="w-full text-xs"
                  rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                >
                  Inspect Spatial Specs
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Reusable Modal Demonstration for Project Inspection */}
      <Modal
        isOpen={isOpen}
        onClose={close}
        title={
          <div className="flex items-center gap-2">
            <Box className="w-5 h-5 text-blue-400" />
            <span>Digital Twin Specification</span>
          </div>
        }
        description="Architectural bounds and physics profile verification for this model."
        footer={
          <Button variant="primary" size="sm" onClick={close}>
            Done Inspecting
          </Button>
        }
      >
        <div className="space-y-4 pt-2">
          <div className="p-3.5 rounded-xl bg-[#090E1A] border border-blue-500/20 font-mono text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Target Model:</span>
              <span className="text-white font-semibold">{selectedProject}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Coordinate System:</span>
              <span className="text-cyan-400">Metric Cartesian (XYZ Right-Handed)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Mesh Resolution:</span>
              <span className="text-purple-400">High-Precision Adaptive Polygons</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Collision Mesh:</span>
              <span className="text-emerald-400">Discrete Convex Polyhedra</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            In Phase 2, this dialogue will include live WebGL export controls (GLTF, OBJ, IFC),
            walkthrough physics playback, and real-time bill-of-materials calculations.
          </p>
        </div>
      </Modal>
    </div>
  )
}
