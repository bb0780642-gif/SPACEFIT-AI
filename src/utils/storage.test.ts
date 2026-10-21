import { describe, it, expect, beforeEach } from 'vitest'
import {
  getStoredProjects,
  getProjectById,
  updateProject,
  saveProjectVersion,
  renameProjectVersion,
  deleteProjectVersion,
  getProjectVersions,
  resetDefaultProjects,
} from './storage'
import type { LayoutVersion } from '@/types/comparison'

describe('Project Storage & Version Management Engine', () => {
  beforeEach(() => {
    resetDefaultProjects()
  })

  it('loads default sample projects reliably', () => {
    const projects = getStoredProjects()
    expect(projects.length).toBeGreaterThanOrEqual(1)
    expect(projects[0].id).toBe('proj-loft-01')
  })

  it('retrieves project by ID', () => {
    const project = getProjectById('proj-loft-01')
    expect(project).toBeDefined()
    expect(project?.name).toBe('Modern Minimalist Loft')
  })

  it('saves, retrieves, renames, and deletes layout versions', () => {
    const projectId = 'proj-loft-01'

    const testVersion: LayoutVersion = {
      id: 'ver-test-1',
      name: 'Option A - Study Corner',
      createdAt: new Date().toISOString(),
      furniture: [],
      source: 'manual',
      notes: 'Initial test setup',
    }

    // 1. Save version
    const afterSave = saveProjectVersion(projectId, testVersion)
    expect(afterSave.some((v) => v.id === 'ver-test-1')).toBe(true)

    const retrieved = getProjectVersions(projectId)
    expect(retrieved.length).toBe(afterSave.length)
    expect(retrieved[0].name).toBe('Option A - Study Corner')

    // 2. Rename version
    const afterRename = renameProjectVersion(projectId, 'ver-test-1', 'Option A - Workstation Focus')
    const renamed = afterRename.find((v) => v.id === 'ver-test-1')
    expect(renamed?.name).toBe('Option A - Workstation Focus')

    // 3. Delete version
    const afterDelete = deleteProjectVersion(projectId, 'ver-test-1')
    expect(afterDelete.some((v) => v.id === 'ver-test-1')).toBe(false)
  })

  it('updates project furniture state and maintains persistence', () => {
    const projectId = 'proj-loft-01'
    const updated = updateProject(projectId, {
      status: 'Optimized',
    })
    expect(updated?.status).toBe('Optimized')

    const reloaded = getProjectById(projectId)
    expect(reloaded?.status).toBe('Optimized')
  })
})
