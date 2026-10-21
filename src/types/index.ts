export * from './project'
export * from './geometry'
export * from './furniture'
export * from './optimizer'
export * from './assistant'
export * from './movement'
export * from './comparison'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ComponentSize = 'sm' | 'md' | 'lg'

export interface NavItem {
  label: string
  href: string
  badge?: string
  isExternal?: boolean
}

export interface FeatureCardItem {
  id: string
  title: string
  description: string
  iconName: string
  category: '3D Twin' | 'Spatial AI' | 'Physics & Walk' | 'Analytics'
  statusBadge?: string
  highlights: string[]
}

export interface RoomPreviewMetric {
  label: string
  value: string
  change?: string
  status: 'optimal' | 'warning' | 'alert'
}

export interface LayoutPreset {
  id: string
  title: string
  roomType: string
  dimensions: string
  efficiencyScore: number
  clearanceRate: number
  thumbnailUrl?: string
}
