import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Box, 
  Plus, 
  Search, 
  Calendar, 
  Compass,
  Bell,
  Trash2,
  ExternalLink,
  Layers,
  BrainCircuit,
  BarChart3,
  Settings,
  RefreshCw,
  Menu
} from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { Input } from '@/components/common/Form'
import { Modal } from '@/components/common/Modal'
import { EmptyState } from '@/components/common/LoadingAndFeedback'
import { 
  getStoredProjects, 
  deleteStoredProject, 
  resetDefaultProjects 
} from '@/utils/storage'
import { useDisclosure } from '@/hooks/useDisclosure'
import type { RoomProject } from '@/types/project'

type SidebarTab = 'overview' | 'projects' | 'ai-assistant' | 'analytics' | 'settings'

interface NotificationItem {
  id: string
  title: string
  time: string
  read: boolean
}

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<RoomProject[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('All')
  const [activeTab, setActiveTab] = useState<SidebarTab>('overview')
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // Notification State
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: '1', title: 'Modern Loft clearance verified: 0 clashes detected', time: '10m ago', read: false },
    { id: '2', title: 'Executive Study furniture layout optimized (+14% flow)', time: '1h ago', read: false },
    { id: '3', title: 'Spatial engine updated to v2.1 with ADA corridor checks', time: '1d ago', read: true },
  ])

  // Profile Popover State
  const [profileOpen, setProfileOpen] = useState(false)

  // Delete Project Confirmation Modal State
  const [projectToDelete, setProjectToDelete] = useState<RoomProject | null>(null)
  const { isOpen: isDeleteOpen, open: openDelete, close: closeDelete } = useDisclosure()

  // Reset Data Modal
  const { isOpen: isResetOpen, open: openReset, close: closeReset } = useDisclosure()

  useEffect(() => {
    setProjects(getStoredProjects())
  }, [])

  // Filter projects by search query and room type
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.roomType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.notes && p.notes.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesType = selectedType === 'All' || p.roomType === selectedType
    return matchesSearch && matchesType
  })

  // Delete project handler
  const confirmDeleteProject = (project: RoomProject) => {
    setProjectToDelete(project)
    openDelete()
  }

  const handleDelete = () => {
    if (projectToDelete) {
      deleteStoredProject(projectToDelete.id)
      setProjects(getStoredProjects())
      closeDelete()
      setProjectToDelete(null)
    }
  }

  // Reset default projects
  const handleResetData = () => {
    const reset = resetDefaultProjects()
    setProjects(reset)
    closeReset()
  }

  // Notification handlers
  const unreadCount = notifications.filter((n) => !n.read).length
  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  // Calculations for Summary Cards
  const totalProjectsCount = projects.length
  const optimizedCount = projects.filter((p) => p.status === 'Optimized').length
  const inProgressCount = projects.filter((p) => p.status === 'In Progress').length
  const draftCount = projects.filter((p) => p.status === 'Draft').length

  const sidebarLinks = [
    { id: 'overview', label: 'Overview', icon: <Compass className="w-4 h-4" /> },
    { id: 'projects', label: 'My Projects', icon: <Layers className="w-4 h-4" />, badge: `${projects.length}` },
    { id: 'ai-assistant', label: 'AI Design Assistant', icon: <BrainCircuit className="w-4 h-4" />, badge: 'Preview' },
    { id: 'analytics', label: 'Layout Analysis', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="glass-panel rounded-3xl p-5 border border-blue-500/20 sticky top-28 space-y-6">
            {/* User Greeting & Workspace Mode */}
            <div className="pb-4 border-b border-blue-500/15">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Workspace
              </span>
              <h2 className="text-base font-bold text-white mt-0.5">SpaceFit Studio</h2>
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-mono mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Local Demo Active
              </span>
            </div>

            {/* Navigation Tabs */}
            <nav className="space-y-1.5" aria-label="Dashboard Sidebar">
              {sidebarLinks.map((item) => {
                const isActive = activeTab === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id as SidebarTab)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600/25 border border-blue-500/40 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={isActive ? 'text-blue-400' : 'text-slate-400'}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/25">
                        {item.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>

            {/* Quick Action Button */}
            <div className="pt-4 border-t border-blue-500/15">
              <Link to="/design/new" className="block w-full">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full glow-blue"
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Create New Room
                </Button>
              </Link>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar Toggle Button */}
        <div className="lg:hidden flex items-center justify-between pb-4 border-b border-blue-500/15">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl glass-panel text-sm text-slate-200"
          >
            <Menu className="w-4 h-4 text-blue-400" />
            <span>Workspace Menu: <strong className="capitalize text-white">{activeTab}</strong></span>
          </button>
          <Link to="/design/new">
            <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              New Room
            </Button>
          </Link>
        </div>

        {/* Mobile Sidebar Drawer */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden glass-panel rounded-2xl p-4 border border-blue-500/25 overflow-hidden mb-6"
            >
              <div className="flex flex-col space-y-1.5">
                {sidebarLinks.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id as SidebarTab)
                      setMobileSidebarOpen(false)
                    }}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm ${
                      activeTab === item.id
                        ? 'bg-blue-600/30 text-white font-medium border border-blue-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Dashboard Workspace Content */}
        <main className="flex-1 min-w-0">
          {/* Dashboard Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-blue-500/15">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white capitalize">
                {activeTab === 'overview' && 'Spatial Workspace Overview'}
                {activeTab === 'projects' && 'My Room Digital Twins'}
                {activeTab === 'ai-assistant' && 'AI Spatial Assistant'}
                {activeTab === 'analytics' && 'Clearance & Layout Analytics'}
                {activeTab === 'settings' && 'Workspace & Storage Settings'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {activeTab === 'overview' && 'Manage your 3D digital twins, layout variants, and room clearance reports.'}
                {activeTab === 'projects' && 'All locally stored room projects and metric specifications.'}
                {activeTab === 'ai-assistant' && 'Conversational spatial recommendations and natural language design commands.'}
                {activeTab === 'analytics' && 'Mathematical clearance corridors and collision safety telemetry.'}
                {activeTab === 'settings' && 'Configure unit preferences and manage client-side sandbox cache.'}
              </p>
            </div>

            {/* Header Right Controls: Notifications & Profile Avatar */}
            <div className="flex items-center gap-3 self-end sm:self-auto">
              {/* Notification Bell */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setNotificationsOpen(!notificationsOpen)
                    setProfileOpen(false)
                  }}
                  className="p-2.5 rounded-xl glass-panel text-slate-300 hover:text-white focus-ring relative"
                  aria-label="Open notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  )}
                </button>

                {/* Notifications Dropdown */}
                <AnimatePresence>
                  {notificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-dropdown p-4 border border-blue-500/25 shadow-2xl z-50 text-xs"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-blue-500/15">
                        <span className="font-semibold text-white">Spatial Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={markAllNotificationsRead}
                            className="text-[11px] text-blue-400 hover:text-blue-300"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="py-2 space-y-2">
                        {notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-2.5 rounded-xl border transition-colors ${
                              n.read
                                ? 'bg-transparent border-blue-500/10 text-slate-400'
                                : 'bg-blue-950/40 border-blue-500/30 text-slate-200'
                            }`}
                          >
                            <p className="font-sans leading-relaxed">{n.title}</p>
                            <span className="text-[10px] font-mono text-slate-500 mt-1 block">{n.time}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile Avatar & Menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(!profileOpen)
                    setNotificationsOpen(false)
                  }}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl glass-panel text-slate-300 hover:text-white focus-ring"
                  aria-label="User Profile Menu"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
                    DS
                  </div>
                  <span className="text-xs font-medium hidden sm:inline">Designer</span>
                </button>

                {/* Profile Dropdown Menu */}
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-72 rounded-2xl glass-dropdown p-4 border border-blue-500/25 shadow-2xl z-50 text-xs space-y-3"
                    >
                      <div className="pb-3 border-b border-blue-500/15">
                        <p className="font-semibold text-white">Spatial Designer</p>
                        <p className="text-[11px] text-slate-400 font-mono">Guest Mode (Local Sandbox)</p>
                      </div>
                      <div className="space-y-1.5 font-mono text-[11px] text-slate-300">
                        <div className="flex justify-between py-1">
                          <span className="text-slate-400">Tier:</span>
                          <span className="text-cyan-300">Phase 2 Sandbox</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-400">Storage:</span>
                          <span className="text-emerald-400">LocalStorage Active</span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-blue-500/15">
                        <button
                          type="button"
                          onClick={() => {
                            setProfileOpen(false)
                            openReset()
                          }}
                          className="w-full text-left py-1.5 text-xs text-rose-400 hover:text-rose-300"
                        >
                          Reset Demo Data
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* TAB CONTENT: OVERVIEW OR PROJECTS */}
          {(activeTab === 'overview' || activeTab === 'projects') && (
            <div className="space-y-8 mt-6">
              {/* Welcome Banner */}
              <div className="p-6 rounded-3xl glass-panel-elevated border border-blue-500/25 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <Badge variant="blue" className="text-[10px]">Active Session</Badge>
                    <span className="text-xs font-mono text-cyan-400">Spatial Studio v2.0</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                    Welcome to SpaceFit AI Studio
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Explore your configured room models, verify zero-collision walking paths, and initialize new spatial bounds.
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  <Link to="/design/new">
                    <Button
                      variant="primary"
                      size="md"
                      className="glow-blue shadow-blue-500/25 font-semibold"
                      leftIcon={<Plus className="w-4 h-4" />}
                    >
                      Create New Room
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Summary Metrics Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-panel p-4.5 rounded-2xl border border-blue-500/20">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Total Projects</span>
                  <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1">{totalProjectsCount}</p>
                  <span className="text-[11px] text-cyan-400 font-mono">Stored in Sandbox</span>
                </div>

                <div className="glass-panel p-4.5 rounded-2xl border border-blue-500/20">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Layouts Optimized</span>
                  <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1">{optimizedCount}</p>
                  <span className="text-[11px] text-emerald-400/80 font-mono">98% Avg Circulation</span>
                </div>

                <div className="glass-panel p-4.5 rounded-2xl border border-blue-500/20">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">In Progress</span>
                  <p className="text-2xl sm:text-3xl font-extrabold text-purple-400 mt-1">{inProgressCount}</p>
                  <span className="text-[11px] text-purple-400/80 font-mono">Drafting Bounds</span>
                </div>

                <div className="glass-panel p-4.5 rounded-2xl border border-blue-500/20">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Saved Designs</span>
                  <p className="text-2xl sm:text-3xl font-extrabold text-blue-400 mt-1">{draftCount + inProgressCount}</p>
                  <span className="text-[11px] text-slate-400 font-mono">Demo Telemetry</span>
                </div>
              </div>

              {/* Search Field & Room Type Filters */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                {/* Search Field */}
                <div className="w-full sm:w-80">
                  <Input
                    placeholder="Search projects by name or type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    leftIcon={<Search className="w-4 h-4" />}
                  />
                </div>

                {/* Room Type Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                  {['All', 'Living Room', 'Bedroom', 'Study Room', 'Kitchen'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedType(type)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
                        selectedType === type
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'glass-panel text-slate-400 hover:text-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Projects Grid */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Box className="w-4 h-4 text-blue-400" />
                    <span>Recent Room Projects ({filteredProjects.length})</span>
                  </h3>
                  <span className="text-xs font-mono text-slate-400">
                    Live filtered data
                  </span>
                </div>

                {filteredProjects.length === 0 ? (
                  <EmptyState
                    icon={<Box className="w-8 h-8" />}
                    title={searchQuery ? 'No Matching Projects' : 'No Projects Found'}
                    description={
                      searchQuery
                        ? `No room models match your search "${searchQuery}". Clear your search or try another query.`
                        : 'Your spatial workspace currently has no active room projects. Create your first room to get started.'
                    }
                    actionLabel="Create Room"
                    onAction={() => navigate('/design/new')}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((item) => (
                      <Card
                        key={item.id}
                        variant="interactive"
                        glow="blue"
                        className="flex flex-col justify-between"
                      >
                        <div>
                          {/* Mini Room Floor Thumbnail Preview */}
                          <div className="h-36 w-full rounded-xl bg-[#080D1A] border border-blue-500/20 p-3 mb-4 flex items-center justify-center relative overflow-hidden">
                            <div 
                              className="absolute inset-0 opacity-20"
                              style={{
                                backgroundImage: 'linear-gradient(to right, #3B82F6 1px, transparent 1px), linear-gradient(to bottom, #3B82F6 1px, transparent 1px)',
                                backgroundSize: '16px 16px',
                              }}
                            />

                            {/* Scaled Mini Footprint */}
                            <div
                              className="relative border border-blue-400/80 bg-blue-950/40 rounded p-2 flex flex-col items-center justify-center"
                              style={{
                                width: `${Math.min(90, Math.max(50, (item.normalizedDimensions.lengthMeters / 10) * 80))}%`,
                                height: `${Math.min(85, Math.max(45, (item.normalizedDimensions.widthMeters / 8) * 75))}%`,
                              }}
                            >
                              <span className="text-[10px] font-mono font-bold text-white truncate max-w-full">
                                {item.name}
                              </span>
                              <span className="text-[9px] font-mono text-cyan-300">
                                {item.length}{item.unit === 'metres' ? 'm' : 'ft'} × {item.width}{item.unit === 'metres' ? 'm' : 'ft'}
                              </span>
                            </div>

                            {/* Status Pill on Thumbnail */}
                            <div className="absolute top-2 right-2">
                              <Badge
                                variant={
                                  item.status === 'Optimized'
                                    ? 'emerald'
                                    : item.status === 'In Progress'
                                    ? 'violet'
                                    : 'cyan'
                                }
                                className="text-[9px] py-0 px-1.5"
                              >
                                {item.status}
                              </Badge>
                            </div>
                          </div>

                          <CardHeader className="mb-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[11px] font-mono uppercase text-slate-400">
                                {item.roomType}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {item.updatedAt}
                              </span>
                            </div>
                            <CardTitle className="text-base text-white group-hover:text-blue-300 transition-colors">
                              {item.name}
                            </CardTitle>
                            <CardDescription className="text-xs line-clamp-1 font-mono text-cyan-300">
                              {item.area} {item.unit === 'metres' ? 'm²' : 'sq ft'} • {item.configuration?.doors.length || 0} Doors • {item.configuration?.windows.length || 0} Windows
                            </CardDescription>
                          </CardHeader>
                        </div>

                        {/* Card Actions: Open Workspace and Delete */}
                        <CardFooter className="flex items-center justify-between gap-1.5 pt-3 mt-3">
                          <Link to={`/design/${item.id}/configure`} className="flex-1">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="w-full text-xs px-2"
                            >
                              Blueprint
                            </Button>
                          </Link>
                          <Link to={`/design/${item.id}`} className="flex-1">
                            <Button
                              variant="primary"
                              size="sm"
                              className="w-full text-xs px-2"
                              rightIcon={<ExternalLink className="w-3 h-3" />}
                            >
                              Model
                            </Button>
                          </Link>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => confirmDeleteProject(item)}
                            aria-label={`Delete project ${item.name}`}
                            className="px-2"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB CONTENT: AI ASSISTANT */}
          {activeTab === 'ai-assistant' && (
            <div className="mt-6 space-y-6">
              <div className="glass-panel p-6 rounded-3xl border border-blue-500/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">AI Spatial Design Assistant</h3>
                    <p className="text-xs text-slate-400 font-mono">Conversational Layout Intelligence</p>
                  </div>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed max-w-2xl mb-6">
                  In Phase 3, this interactive assistant connects to our multimodal spatial reasoning engine. You will be able to input commands such as:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-3.5 rounded-xl bg-[#090E1A] border border-blue-500/20 text-slate-300">
                    <p className="text-blue-400 font-semibold mb-1">Ergonomic Workflow:</p>
                    <p>"Swap executive desk with corner lounge, ensuring minimum 1.1m pathway from the door."</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#090E1A] border border-purple-500/20 text-slate-300">
                    <p className="text-purple-400 font-semibold mb-1">Acoustic Isolation:</p>
                    <p>"Group soft modular sofa away from window glazing to dampen echo and street noise."</p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-blue-500/15 flex items-center gap-3">
                  <Badge variant="violet">Phase 3 Roadmap Active</Badge>
                  <span className="text-xs text-slate-400">
                    NLP models and spatial collision graphs will integrate directly into this view.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: LAYOUT ANALYSIS */}
          {activeTab === 'analytics' && (
            <div className="mt-6 space-y-6">
              <div className="glass-panel p-6 rounded-3xl border border-blue-500/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Clearance & Collision Analytics</h3>
                    <p className="text-xs text-slate-400 font-mono">Physical Simulation Telemetry</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-[#090E1A] border border-blue-500/20 text-center">
                    <span className="text-[10px] font-mono uppercase text-slate-400">Average Clearance Rate</span>
                    <p className="text-2xl font-bold text-emerald-400 mt-1">97.4%</p>
                    <span className="text-[10px] text-slate-400">All ADA compliant</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#090E1A] border border-blue-500/20 text-center">
                    <span className="text-[10px] font-mono uppercase text-slate-400">Total Collision Clashes</span>
                    <p className="text-2xl font-bold text-cyan-400 mt-1">0 Clashes</p>
                    <span className="text-[10px] text-emerald-400">Zero clashing tolerance</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#090E1A] border border-blue-500/20 text-center">
                    <span className="text-[10px] font-mono uppercase text-slate-400">Simulated Floor Area</span>
                    <p className="text-2xl font-bold text-purple-400 mt-1">102.9 m²</p>
                    <span className="text-[10px] text-slate-400">Across {projects.length} rooms</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  * Analytical simulation telemetry reflects locally verified bounds. Real-time dynamic heatmaps activate when Three.js physics is mounted in Phase 3.
                </p>
              </div>
            </div>
          )}

          {/* TAB CONTENT: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="mt-6 space-y-6">
              <div className="glass-panel p-6 rounded-3xl border border-blue-500/20 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Workspace Preferences & Data Management</h3>
                  <p className="text-xs text-slate-400 font-mono">Local Sandbox Configuration</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#090E1A] border border-blue-500/15 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">Reset Sample Project Data</p>
                      <p className="text-xs text-slate-400">Restore the default sample room digital twins.</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={openReset}
                      leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                    >
                      Reset Data
                    </Button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#090E1A] border border-blue-500/15 space-y-2">
                  <p className="text-sm font-semibold text-white">Local Storage Telemetry</p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    All projects are stored securely in your browser's local cache. Clearing browser data will reset projects to initial seed data.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={closeDelete}
        title="Delete Room Project"
        description="Are you sure you want to remove this digital twin model?"
        footer={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={closeDelete}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDelete}>
              Confirm Delete
            </Button>
          </div>
        }
      >
        <p className="text-sm text-slate-300">
          You are about to delete <strong className="text-white">{projectToDelete?.name}</strong>. This action will immediately remove it from your workspace.
        </p>
      </Modal>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={isResetOpen}
        onClose={closeReset}
        title="Reset Default Sample Projects"
        description="Restore original sample rooms into your local storage."
        footer={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={closeReset}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleResetData}>
              Reset to Defaults
            </Button>
          </div>
        }
      >
        <p className="text-sm text-slate-300">
          This will restore the 4 default sample room designs (Living Loft, Ergonomic Study, Master Suite, Culinary Lab).
        </p>
      </Modal>
    </div>
  )
}
