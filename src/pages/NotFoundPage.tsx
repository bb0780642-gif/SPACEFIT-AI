import React from 'react'
import { Link } from 'react-router-dom'
import { Box, Home, Compass } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 mx-auto mb-6 shadow-lg shadow-blue-500/20">
        <Box className="w-8 h-8 rotate-12" />
      </div>

      <Badge variant="rose" className="mb-3">
        404 — Coordinate Out of Bounds
      </Badge>

      <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
        Spatial Plane Not Found
      </h1>

      <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed max-w-md mx-auto">
        The requested coordinate or room route does not exist within the SpaceFit AI application schema.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link to="/">
          <Button variant="primary" size="md" leftIcon={<Home className="w-4 h-4" />}>
            Return to Landing
          </Button>
        </Link>
        <Link to="/dashboard">
          <Button variant="secondary" size="md" leftIcon={<Compass className="w-4 h-4 text-blue-400" />}>
            Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}
