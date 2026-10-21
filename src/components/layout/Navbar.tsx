import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Box, 
  Menu, 
  X, 
  Sparkles, 
  LayoutDashboard, 
  PlusCircle, 
  LogIn,
  BrainCircuit,
  Workflow,
  CheckCircle2,
  Info
} from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import { Modal } from '@/components/common/Modal'
import { useScrollPosition } from '@/hooks/useScrollPosition'
import { useDisclosure } from '@/hooks/useDisclosure'
import { cn } from '@/utils/cn'

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isScrolled } = useScrollPosition()
  const location = useLocation()
  const navigate = useNavigate()
  const { isOpen: isSignInOpen, open: openSignIn, close: closeSignIn } = useDisclosure()

  const navLinks = [
    { label: 'Features', href: '/#features', id: 'features' },
    { label: 'How It Works', href: '/#how-it-works', id: 'how-it-works' },
    { label: 'AI Assistant', href: '/#ai-assistant', id: 'ai-assistant', badge: 'Preview' },
    { label: 'Dashboard', href: '/dashboard' },
  ]

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, sectionId?: string) => {
    if (sectionId) {
      if (location.pathname === '/') {
        e.preventDefault()
        const el = document.getElementById(sectionId)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' })
        }
      } else {
        // Navigate to home with anchor
        navigate(`/${href}`)
      }
      setMobileMenuOpen(false)
    }
  }

  const isActive = (path: string) => {
    if (path.startsWith('/#')) return false
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
          isScrolled
            ? 'bg-[#070B14]/90 backdrop-blur-xl border-b border-blue-500/15 shadow-lg shadow-black/30 py-3'
            : 'bg-transparent py-5'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Brand Wordmark & Logo */}
            <Link
              to="/"
              className="flex items-center gap-3 group focus-ring rounded-xl p-1"
              aria-label="SpaceFit AI Home"
            >
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-[1px] shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
                <div className="w-full h-full bg-[#0A0F1D] rounded-[11px] flex items-center justify-center">
                  <Box className="w-5 h-5 text-blue-400 group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping opacity-75" />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400" />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-extrabold tracking-tight text-white font-sans">
                    SPACE<span className="text-blue-400">FIT</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border border-blue-500/30">
                    AI
                  </span>
                </div>
                <span className="text-[10px] tracking-wider uppercase text-slate-400 font-mono hidden sm:block">
                  Spatial Intelligence
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 glass-panel px-4 py-1.5 rounded-full border border-blue-500/15" aria-label="Main Navigation">
              {navLinks.map((link) => {
                const active = isActive(link.href)
                return (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={(e) => handleNavClick(e, link.href, link.id)}
                    className={cn(
                      'relative px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors focus-ring flex items-center gap-1.5',
                      active
                        ? 'text-white'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    )}
                  >
                    {active && (
                      <motion.div
                        layoutId="navPill"
                        className="absolute inset-0 bg-blue-600/20 border border-blue-500/40 rounded-full"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{link.label}</span>
                    {link.badge && (
                      <Badge variant="cyan" className="relative z-10 text-[9px] py-0 px-1.5">
                        {link.badge}
                      </Badge>
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Desktop Action CTAs (Sign In & Start Designing) */}
            <div className="hidden sm:flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={openSignIn}
                leftIcon={<LogIn className="w-4 h-4 text-slate-400" />}
                className="text-slate-300 hover:text-white"
              >
                Sign In
              </Button>
              <Link to="/design/new">
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Sparkles className="w-4 h-4 text-cyan-300" />}
                  className="shadow-blue-500/20 glow-blue"
                >
                  Start Designing
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-xl text-slate-300 hover:text-white glass-panel focus-ring"
                aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden border-b border-blue-500/20 bg-[#0A0F1D]/95 backdrop-blur-2xl px-6 py-6 overflow-hidden"
            >
              <div className="flex flex-col space-y-3">
                <Link
                  to="/#features"
                  onClick={(e) => handleNavClick(e, '/#features', 'features')}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-200 hover:bg-white/5 font-medium"
                >
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span>Features</span>
                </Link>
                <Link
                  to="/#how-it-works"
                  onClick={(e) => handleNavClick(e, '/#how-it-works', 'how-it-works')}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-200 hover:bg-white/5 font-medium"
                >
                  <Workflow className="w-4 h-4 text-purple-400" />
                  <span>How It Works</span>
                </Link>
                <Link
                  to="/#ai-assistant"
                  onClick={(e) => handleNavClick(e, '/#ai-assistant', 'ai-assistant')}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-200 hover:bg-white/5 font-medium"
                >
                  <div className="flex items-center gap-3">
                    <BrainCircuit className="w-4 h-4 text-cyan-400" />
                    <span>AI Assistant</span>
                  </div>
                  <Badge variant="cyan" className="text-[10px]">Preview</Badge>
                </Link>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-200 hover:bg-white/5 font-medium"
                >
                  <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                  <span>Dashboard Workspace</span>
                </Link>

                <div className="pt-4 border-t border-blue-500/15 flex flex-col gap-3">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      openSignIn()
                    }}
                    leftIcon={<LogIn className="w-4 h-4" />}
                    className="w-full"
                  >
                    Sign In / Access Demo
                  </Button>
                  <Link
                    to="/design/new"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full"
                  >
                    <Button
                      variant="primary"
                      size="md"
                      className="w-full"
                      leftIcon={<PlusCircle className="w-4 h-4" />}
                    >
                      Start Designing
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Sign In & Demo Access Dialog */}
      <Modal
        isOpen={isSignInOpen}
        onClose={closeSignIn}
        title={
          <div className="flex items-center gap-2">
            <LogIn className="w-5 h-5 text-blue-400" />
            <span>SpaceFit AI Studio Access</span>
          </div>
        }
        description="Demo workspace and account mode status."
        footer={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={closeSignIn}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                closeSignIn()
                navigate('/dashboard')
              }}
            >
              Continue to Dashboard
            </Button>
          </div>
        }
      >
        <div className="space-y-4 pt-2">
          <div className="p-4 rounded-xl bg-[#090E1A] border border-blue-500/20 font-mono text-xs space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Current Session:</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Local Sandbox Active
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Storage Engine:</span>
              <span className="text-cyan-300">Client LocalStorage</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Account Type:</span>
              <span className="text-purple-300">Designer Guest Tier</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-500/25 flex items-start gap-3">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300 leading-relaxed">
              SpaceFit AI operates in an unrestricted local client sandbox for Phase 2. All room setups, dimensional modifications, and layout mockups persist directly in your browser. Cloud multi-user authentication will activate in Phase 4.
            </p>
          </div>
        </div>
      </Modal>
    </>
  )
}
