import type { RoomProject, MeasurementUnit } from '@/types/project'
import { ensureRoomConfiguration, metersToFeet, feetToMeters } from './geometry'

const STORAGE_KEY = 'spacefit_projects_v2'

export { metersToFeet, feetToMeters }

export function calculateNormalized(
  width: number,
  length: number,
  height = 2.8,
  unit: MeasurementUnit
) {
  const widthMeters = unit === 'metres' ? width : feetToMeters(width)
  const lengthMeters = unit === 'metres' ? length : feetToMeters(length)
  const heightMeters = unit === 'metres' ? height : feetToMeters(height)

  const areaMeters = Number((widthMeters * lengthMeters).toFixed(1))
  const volumeMeters = Number((widthMeters * lengthMeters * heightMeters).toFixed(1))

  const area = unit === 'metres' ? areaMeters : Number((width * length).toFixed(1))
  const volume = unit === 'metres' ? volumeMeters : Number((width * length * height).toFixed(1))

  return {
    area,
    volume,
    normalizedDimensions: {
      widthMeters,
      lengthMeters,
      areaMeters,
      volumeMeters,
    },
  }
}

const DEFAULT_SAMPLE_PROJECTS: RoomProject[] = [
  {
    id: 'proj-loft-01',
    name: 'Modern Minimalist Loft',
    roomType: 'Living Room',
    width: 4.8,
    length: 6.4,
    ceilingHeight: 3.0,
    unit: 'metres',
    area: 30.7,
    volume: 92.1,
    normalizedDimensions: {
      widthMeters: 4.8,
      lengthMeters: 6.4,
      areaMeters: 30.7,
      volumeMeters: 92.1,
    },
    efficiencyScore: 98,
    clearanceRate: 96.4,
    collisionsCount: 0,
    status: 'Optimized',
    createdAt: '2026-03-12T10:00:00.000Z',
    updatedAt: '15 mins ago',
    notes: 'Dual circulation pathways configured with open lounge layout and natural light orientation.',
    accentColor: 'blue',
    configuration: {
      schemaVersion: '3.0',
      shape: 'rectangular',
      widthMeters: 4.8,
      lengthMeters: 6.4,
      ceilingHeightMeters: 3.0,
      wallThicknessMeters: 0.15,
      doors: [
        {
          id: 'door-loft-main',
          name: 'South Entry Door',
          wallId: 'South',
          widthMeters: 0.9,
          heightMeters: 2.1,
          offsetMeters: 0.8,
          swingDirection: 'inward-right',
        },
      ],
      windows: [
        {
          id: 'win-loft-north',
          name: 'North Panorama Window',
          wallId: 'North',
          widthMeters: 2.0,
          heightMeters: 1.5,
          offsetMeters: 1.4,
          sillHeightMeters: 0.8,
        },
        {
          id: 'win-loft-east',
          name: 'East Balcony Light',
          wallId: 'East',
          widthMeters: 1.2,
          heightMeters: 1.4,
          offsetMeters: 2.5,
          sillHeightMeters: 0.9,
        },
      ],
    },
    furniture: [
      {
        id: 'furn-loft-sofa',
        catalogId: 'sofa-3seat',
        name: '3-Seater Minimalist Sofa',
        category: 'seating',
        meshType: 'sofa-3seat',
        color: '#2563eb',
        dimensions: { widthMeters: 2.2, lengthMeters: 0.95, heightMeters: 0.82 },
        position: [0, 0, 0.8],
        rotationY: 0,
      },
      {
        id: 'furn-loft-coffee',
        catalogId: 'table-coffee',
        name: 'Minimalist Coffee Table',
        category: 'tables',
        meshType: 'table-coffee',
        color: '#1e293b',
        dimensions: { widthMeters: 1.2, lengthMeters: 0.6, heightMeters: 0.42 },
        position: [0, 0, -0.2],
        rotationY: 0,
      },
      {
        id: 'furn-loft-plant',
        catalogId: 'plant-ficus',
        name: 'Indoor Ficus Plant',
        category: 'decor',
        meshType: 'plant-ficus',
        color: '#10b981',
        dimensions: { widthMeters: 0.5, lengthMeters: 0.5, heightMeters: 1.25 },
        position: [-1.8, 0, 2.2],
        rotationY: 0,
      },
    ],
  },
  {
    id: 'proj-studio-02',
    name: 'Executive Ergonomic Study',
    roomType: 'Study Room',
    width: 4.0,
    length: 5.2,
    ceilingHeight: 2.8,
    unit: 'metres',
    area: 20.8,
    volume: 58.2,
    normalizedDimensions: {
      widthMeters: 4.0,
      lengthMeters: 5.2,
      areaMeters: 20.8,
      volumeMeters: 58.2,
    },
    efficiencyScore: 96,
    clearanceRate: 95.1,
    collisionsCount: 0,
    status: 'Optimized',
    createdAt: '2026-03-10T14:30:00.000Z',
    updatedAt: '2 hours ago',
    notes: 'Standing desk zone with acoustic sound barrier and 1.2m wheelchair-accessible door sweep.',
    accentColor: 'violet',
    configuration: {
      schemaVersion: '3.0',
      shape: 'rectangular',
      widthMeters: 4.0,
      lengthMeters: 5.2,
      ceilingHeightMeters: 2.8,
      wallThicknessMeters: 0.15,
      doors: [
        {
          id: 'door-study-entry',
          name: 'Corridor Entry',
          wallId: 'South',
          widthMeters: 0.9,
          heightMeters: 2.1,
          offsetMeters: 0.6,
          swingDirection: 'inward-left',
        },
      ],
      windows: [
        {
          id: 'win-study-desk',
          name: 'Desk Natural Light',
          wallId: 'East',
          widthMeters: 1.5,
          heightMeters: 1.2,
          offsetMeters: 1.5,
          sillHeightMeters: 0.95,
        },
      ],
    },
  },
  {
    id: 'proj-suite-03',
    name: 'Primary Master Suite',
    roomType: 'Bedroom',
    width: 4.2,
    length: 5.8,
    ceilingHeight: 2.7,
    unit: 'metres',
    area: 24.4,
    volume: 65.9,
    normalizedDimensions: {
      widthMeters: 4.2,
      lengthMeters: 5.8,
      areaMeters: 24.4,
      volumeMeters: 65.9,
    },
    efficiencyScore: 94,
    clearanceRate: 97.2,
    collisionsCount: 0,
    status: 'In Progress',
    createdAt: '2026-03-08T09:15:00.000Z',
    updatedAt: 'Yesterday',
    notes: 'King bed placement with 1.1m perimeter clearance and bedside lighting conduit verification.',
    accentColor: 'cyan',
    configuration: {
      schemaVersion: '3.0',
      shape: 'rectangular',
      widthMeters: 4.2,
      lengthMeters: 5.8,
      ceilingHeightMeters: 2.7,
      wallThicknessMeters: 0.15,
      doors: [
        {
          id: 'door-suite-entry',
          name: 'Hallway Door',
          wallId: 'West',
          widthMeters: 0.9,
          heightMeters: 2.1,
          offsetMeters: 0.8,
          swingDirection: 'inward-right',
        },
      ],
      windows: [
        {
          id: 'win-suite-morning',
          name: 'Morning Light Window',
          wallId: 'North',
          widthMeters: 1.8,
          heightMeters: 1.3,
          offsetMeters: 1.2,
          sillHeightMeters: 0.85,
        },
      ],
    },
  },
  {
    id: 'proj-culinary-04',
    name: 'Open Culinary & Dining Lab',
    roomType: 'Kitchen',
    width: 4.5,
    length: 6.0,
    ceilingHeight: 2.9,
    unit: 'metres',
    area: 27.0,
    volume: 78.3,
    normalizedDimensions: {
      widthMeters: 4.5,
      lengthMeters: 6.0,
      areaMeters: 27.0,
      volumeMeters: 78.3,
    },
    efficiencyScore: 92,
    clearanceRate: 94.0,
    collisionsCount: 0,
    status: 'Draft',
    createdAt: '2026-03-05T16:45:00.000Z',
    updatedAt: '3 days ago',
    notes: 'Island counter work triangle calculation with double refrigerator opening radius clearance.',
    accentColor: 'emerald',
    configuration: {
      schemaVersion: '3.0',
      shape: 'rectangular',
      widthMeters: 4.5,
      lengthMeters: 6.0,
      ceilingHeightMeters: 2.9,
      wallThicknessMeters: 0.15,
      doors: [
        {
          id: 'door-kitchen-entry',
          name: 'Dining Entry',
          wallId: 'West',
          widthMeters: 1.0,
          heightMeters: 2.1,
          offsetMeters: 1.2,
          swingDirection: 'inward-left',
        },
      ],
      windows: [
        {
          id: 'win-kitchen-sink',
          name: 'Sink Line Window',
          wallId: 'North',
          widthMeters: 1.4,
          heightMeters: 1.1,
          offsetMeters: 1.6,
          sillHeightMeters: 1.0,
        },
      ],
    },
  },
]

export function getStoredProjects(): RoomProject[] {
  if (typeof window === 'undefined') return DEFAULT_SAMPLE_PROJECTS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SAMPLE_PROJECTS))
      return DEFAULT_SAMPLE_PROJECTS
    }
    const parsed: RoomProject[] = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_SAMPLE_PROJECTS
    }

    // Seamless backward-compatible migration: ensure configuration exists on each project
    return parsed.map((p) => ({
      ...p,
      configuration: ensureRoomConfiguration(p),
    }))
  } catch (err) {
    console.warn('Failed to access localStorage, using fallback seed data:', err)
    return DEFAULT_SAMPLE_PROJECTS
  }
}

export function saveStoredProjects(projects: RoomProject[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
  } catch (err) {
    console.warn('Failed to save to localStorage:', err)
  }
}

export function getProjectById(id: string): RoomProject | undefined {
  const projects = getStoredProjects()
  const found = projects.find((p) => p.id === id)
  if (!found) return undefined
  return {
    ...found,
    configuration: ensureRoomConfiguration(found),
    furniture: found.furniture || [],
  }
}

export function createProject(
  data: Omit<RoomProject, 'id' | 'createdAt' | 'updatedAt' | 'efficiencyScore' | 'clearanceRate' | 'collisionsCount' | 'status'>
): RoomProject {
  const projects = getStoredProjects()
  const id = `proj-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`
  const now = new Date().toISOString()

  // Ensure configuration is initialized and synchronized
  const configuration = data.configuration || ensureRoomConfiguration(data)

  const newProject: RoomProject = {
    ...data,
    id,
    efficiencyScore: 95 + Math.floor(Math.random() * 5),
    clearanceRate: 94 + Number((Math.random() * 5).toFixed(1)),
    collisionsCount: 0,
    status: 'Draft',
    createdAt: now,
    updatedAt: 'Just now',
    configuration,
    furniture: data.furniture || [],
  }

  const updated = [newProject, ...projects]
  saveStoredProjects(updated)
  return newProject
}

export function updateProject(id: string, updates: Partial<RoomProject>): RoomProject | undefined {
  const projects = getStoredProjects()
  const index = projects.findIndex((p) => p.id === id)
  if (index === -1) return undefined

  const existing = projects[index]
  const updatedProject: RoomProject = {
    ...existing,
    ...updates,
    updatedAt: 'Just now',
  }

  if (updates.furniture !== undefined) {
    updatedProject.furniture = updates.furniture
  }

  // If configuration was updated, synchronize dimensions
  if (updates.configuration) {
    updatedProject.configuration = updates.configuration
    updatedProject.normalizedDimensions = {
      widthMeters: updates.configuration.widthMeters,
      lengthMeters: updates.configuration.lengthMeters,
      areaMeters: Number((updates.configuration.widthMeters * updates.configuration.lengthMeters).toFixed(1)),
      volumeMeters: Number((updates.configuration.widthMeters * updates.configuration.lengthMeters * updates.configuration.ceilingHeightMeters).toFixed(1)),
    }
  }

  projects[index] = updatedProject
  saveStoredProjects(projects)
  return updatedProject
}

export function deleteStoredProject(id: string): boolean {
  const projects = getStoredProjects()
  const filtered = projects.filter((p) => p.id !== id)
  if (filtered.length !== projects.length) {
    saveStoredProjects(filtered)
    return true
  }
  return false
}

export function resetDefaultProjects(): RoomProject[] {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SAMPLE_PROJECTS))
    } catch (e) {
      console.warn('localStorage reset failed', e)
    }
  }
  return DEFAULT_SAMPLE_PROJECTS
}

/**
 * Saves a new named layout version to the project.
 */
export function saveProjectVersion(
  projectId: string,
  version: import('@/types/comparison').LayoutVersion
): import('@/types/comparison').LayoutVersion[] {
  const project = getProjectById(projectId)
  if (!project) return []
  const existingVersions = project.savedVersions || []
  const updatedVersions = [version, ...existingVersions.filter((v) => v.id !== version.id)]
  updateProject(projectId, { savedVersions: updatedVersions })
  return updatedVersions
}

/**
 * Renames an existing layout version.
 */
export function renameProjectVersion(
  projectId: string,
  versionId: string,
  newName: string
): import('@/types/comparison').LayoutVersion[] {
  const project = getProjectById(projectId)
  if (!project || !project.savedVersions) return []
  const updatedVersions = project.savedVersions.map((v) =>
    v.id === versionId ? { ...v, name: newName.trim() } : v
  )
  updateProject(projectId, { savedVersions: updatedVersions })
  return updatedVersions
}

/**
 * Deletes a layout version after user confirmation.
 */
export function deleteProjectVersion(
  projectId: string,
  versionId: string
): import('@/types/comparison').LayoutVersion[] {
  const project = getProjectById(projectId)
  if (!project || !project.savedVersions) return []
  const updatedVersions = project.savedVersions.filter((v) => v.id !== versionId)
  updateProject(projectId, { savedVersions: updatedVersions })
  return updatedVersions
}

/**
 * Retrieves all saved layout versions for a project.
 */
export function getProjectVersions(projectId: string): import('@/types/comparison').LayoutVersion[] {
  const project = getProjectById(projectId)
  return project?.savedVersions || []
}

