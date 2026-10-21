import { describe, it, expect, vi } from 'vitest'
import { executeToolAction } from './toolRegistry'
import type { SpatialToolContext } from '@/types/assistant'
import type { RoomConfiguration } from '@/types/geometry'
import type { PlacedFurniture } from '@/types/furniture'
import type { FurnitureValidationResult } from '@/types/furniture'

const mockConfiguration: RoomConfiguration = {
  schemaVersion: '3.0',
  shape: 'rectangular',
  widthMeters: 4.5,
  lengthMeters: 5.5,
  ceilingHeightMeters: 2.8,
  wallThicknessMeters: 0.15,
  doors: [
    {
      id: 'door-1',
      name: 'Main Door',
      wallId: 'North',
      offsetMeters: 1.0,
      widthMeters: 0.9,
      heightMeters: 2.1,
      swingDirection: 'inward-left',
    },
  ],
  windows: [
    {
      id: 'win-1',
      name: 'East Window',
      wallId: 'East',
      offsetMeters: 1.5,
      widthMeters: 1.4,
      heightMeters: 1.2,
      sillHeightMeters: 0.9,
    },
  ],
}

const mockFurniture: PlacedFurniture[] = [
  {
    id: 'furn-bed',
    catalogId: 'bed-queen',
    name: 'Queen Platform Bed',
    category: 'beds',
    meshType: 'bed-queen',
    color: '#1e293b',
    dimensions: { widthMeters: 1.6, lengthMeters: 2.1, heightMeters: 1.05 },
    position: [0, 0, 0],
    rotationY: 0,
  },
]

const mockValidation: FurnitureValidationResult = {
  isValid: true,
  hasWarnings: false,
  errors: [],
  warnings: [],
  collisionCountsByItem: {},
}

describe('NLP Tool Registry', () => {
  it('executes get_room_info accurately', () => {
    const context: SpatialToolContext = {
      projectId: 'proj-1',
      projectName: 'Master Bedroom',
      roomConfiguration: mockConfiguration,
      furniture: mockFurniture,
      validationResult: mockValidation,
      onAddFurniture: vi.fn(),
      onUpdateFurniture: vi.fn(),
      onRemoveFurniture: vi.fn(),
      onApplyOptimizedLayout: vi.fn(),
      onUndo: vi.fn(),
      onPreviewCandidate: vi.fn(),
    }

    const result = executeToolAction('get_room_info', {}, context)
    expect(result.success).toBe(true)
    expect(result.resultData).toMatchObject({
      name: 'Master Bedroom',
      floorArea: expect.stringContaining('24.8 m²'),
      doorsCount: 1,
      windowsCount: 1,
      furnitureCount: 1,
    })
  })

  it('executes list_furniture accurately', () => {
    const context: SpatialToolContext = {
      projectId: 'proj-1',
      projectName: 'Master Bedroom',
      roomConfiguration: mockConfiguration,
      furniture: mockFurniture,
      validationResult: mockValidation,
      onAddFurniture: vi.fn(),
      onUpdateFurniture: vi.fn(),
      onRemoveFurniture: vi.fn(),
      onApplyOptimizedLayout: vi.fn(),
      onUndo: vi.fn(),
      onPreviewCandidate: vi.fn(),
    }

    const result = executeToolAction('list_furniture', {}, context)
    expect(result.success).toBe(true)
    expect(result.message).toContain('Queen Platform Bed')
  })

  it('executes add_furniture and calls callback', () => {
    const onAdd = vi.fn()
    const context: SpatialToolContext = {
      projectId: 'proj-1',
      projectName: 'Master Bedroom',
      roomConfiguration: mockConfiguration,
      furniture: mockFurniture,
      validationResult: mockValidation,
      onAddFurniture: onAdd,
      onUpdateFurniture: vi.fn(),
      onRemoveFurniture: vi.fn(),
      onApplyOptimizedLayout: vi.fn(),
      onUndo: vi.fn(),
      onPreviewCandidate: vi.fn(),
    }

    const result = executeToolAction('add_furniture', { catalogId: 'desk-workstation' }, context)
    expect(result.success).toBe(true)
    expect(onAdd).toHaveBeenCalledTimes(1)
    expect(result.message).toContain('Workstation Desk')
  })

  it('executes optimize_layout and returns candidates', () => {
    const context: SpatialToolContext = {
      projectId: 'proj-1',
      projectName: 'Master Bedroom',
      roomConfiguration: mockConfiguration,
      furniture: mockFurniture,
      validationResult: mockValidation,
      onAddFurniture: vi.fn(),
      onUpdateFurniture: vi.fn(),
      onRemoveFurniture: vi.fn(),
      onApplyOptimizedLayout: vi.fn(),
      onUndo: vi.fn(),
      onPreviewCandidate: vi.fn(),
    }

    const result = executeToolAction(
      'optimize_layout',
      { mode: 'movement-first', deskNearWindow: true },
      context
    )
    expect(result.success).toBe(true)
    expect((result.resultData as any).candidates.length).toBeGreaterThan(0)
  })

  it('executes validate_geometry and reports zero collisions', () => {
    const context: SpatialToolContext = {
      projectId: 'proj-1',
      projectName: 'Master Bedroom',
      roomConfiguration: mockConfiguration,
      furniture: mockFurniture,
      validationResult: mockValidation,
      onAddFurniture: vi.fn(),
      onUpdateFurniture: vi.fn(),
      onRemoveFurniture: vi.fn(),
      onApplyOptimizedLayout: vi.fn(),
      onUndo: vi.fn(),
      onPreviewCandidate: vi.fn(),
    }

    const result = executeToolAction('validate_geometry', {}, context)
    expect(result.success).toBe(true)
    expect(result.message).toContain('zero collisions')
  })

  it('handles unknown tool gracefully', () => {
    const context: SpatialToolContext = {
      projectId: 'proj-1',
      projectName: 'Master Bedroom',
      roomConfiguration: mockConfiguration,
      furniture: mockFurniture,
      validationResult: mockValidation,
      onAddFurniture: vi.fn(),
      onUpdateFurniture: vi.fn(),
      onRemoveFurniture: vi.fn(),
      onApplyOptimizedLayout: vi.fn(),
      onUndo: vi.fn(),
      onPreviewCandidate: vi.fn(),
    }

    const result = executeToolAction('unsupported_action' as any, {}, context)
    expect(result.success).toBe(false)
  })

  it('executes compare_layouts, save_layout_version, and export_design_report cleanly', () => {
    const context: SpatialToolContext = {
      projectId: 'proj-1',
      projectName: 'Master Bedroom',
      roomConfiguration: mockConfiguration,
      furniture: mockFurniture,
      validationResult: mockValidation,
      onAddFurniture: vi.fn(),
      onUpdateFurniture: vi.fn(),
      onRemoveFurniture: vi.fn(),
      onApplyOptimizedLayout: vi.fn(),
      onUndo: vi.fn(),
      onPreviewCandidate: vi.fn(),
    }

    const cmp = executeToolAction('compare_layouts', {}, context)
    expect(cmp.success).toBe(true)
    expect(cmp.message).toContain('Layout comparison')

    const save = executeToolAction('save_layout_version', { name: 'My Test Setup' }, context)
    expect(save.success).toBe(true)
    expect(save.message).toContain('My Test Setup')

    const exp = executeToolAction('export_design_report', {}, context)
    expect(exp.success).toBe(true)
    expect(exp.message).toContain('Spatial design report')
  })
})
