import type { SpatialToolContext, ToolName } from '@/types/assistant'
import type { OptimizationMode } from '@/types/optimizer'
import type { MovementPresetDestination } from '@/types/movement'
import { FURNITURE_CATALOG } from '@/data/furnitureCatalog'
import { generateOptimizedLayouts } from '@/utils/layoutOptimizer'
import { metersToFeet } from '@/utils/geometry'
import {
  analyzeMovementPath,
  getDoorEntrancePoint,
  getPresetDestinationPoint,
} from '@/utils/movement/pathfinding'

/**
 * Gemini-compatible Function Declarations
 */
export const GEMINI_TOOL_DECLARATIONS = [
  {
    name: 'get_room_info',
    description: 'Get room dimensions, boundary sizes, wall perimeter, doors, windows, and area.',
    parameters: {
      type: 'OBJECT',
      properties: {},
    },
  },
  {
    name: 'list_furniture',
    description: 'List all furniture currently placed in the room with coordinates and categories.',
    parameters: {
      type: 'OBJECT',
      properties: {},
    },
  },
  {
    name: 'add_furniture',
    description: 'Add a new piece of furniture from the catalog into the room (e.g., bed, desk, chair, sofa, wardrobe).',
    parameters: {
      type: 'OBJECT',
      properties: {
        catalogId: {
          type: 'STRING',
          description: 'Catalog item ID or common name (e.g. "bed-queen", "desk-workstation", "chair-office", "sofa-3seat", "wardrobe-double").',
        },
      },
      required: ['catalogId'],
    },
  },
  {
    name: 'remove_furniture',
    description: 'Remove an existing furniture item by ID or name.',
    parameters: {
      type: 'OBJECT',
      properties: {
        furnitureId: {
          type: 'STRING',
          description: 'The ID or exact name of the placed furniture to remove.',
        },
      },
      required: ['furnitureId'],
    },
  },
  {
    name: 'rotate_furniture',
    description: 'Rotate a placed furniture item by an angle in degrees (e.g., 90, 180, 270).',
    parameters: {
      type: 'OBJECT',
      properties: {
        furnitureId: {
          type: 'STRING',
          description: 'The ID or name of the furniture item to rotate.',
        },
        degrees: {
          type: 'NUMBER',
          description: 'Rotation angle in degrees (positive or negative, commonly 90).',
        },
      },
      required: ['furnitureId'],
    },
  },
  {
    name: 'validate_geometry',
    description: 'Run geometric collision detection and clearance checks on the current furniture layout.',
    parameters: {
      type: 'OBJECT',
      properties: {},
    },
  },
  {
    name: 'optimize_layout',
    description: 'Optimize the room furniture layout based on room geometry, doorways, windows, and design priorities.',
    parameters: {
      type: 'OBJECT',
      properties: {
        mode: {
          type: 'STRING',
          description: 'Optimization strategy: "movement-first", "space-saver", "comfort-focus", "study-productivity", or "balanced".',
          enum: ['movement-first', 'space-saver', 'comfort-focus', 'study-productivity', 'balanced'],
        },
        deskNearWindow: {
          type: 'BOOLEAN',
          description: 'Prioritize placing study desks directly facing or near natural window daylight.',
        },
      },
    },
  },
  {
    name: 'explain_warnings',
    description: 'Explain any current collisions, wall penetrations, or door buffer clearance issues with actionable advice.',
    parameters: {
      type: 'OBJECT',
      properties: {},
    },
  },
  {
    name: 'analyze_movement_path',
    description: 'Analyze walking route clearance from the door to furniture destinations (e.g. bed, desk, wardrobe).',
    parameters: {
      type: 'OBJECT',
      properties: {
        destination: {
          type: 'STRING',
          description: 'Preset target: "door-to-bed", "door-to-desk", "door-to-wardrobe", "door-to-sofa", or "bed-to-window".',
          enum: ['door-to-bed', 'door-to-desk', 'door-to-wardrobe', 'door-to-sofa', 'bed-to-window'],
        },
        clearanceMeters: {
          type: 'NUMBER',
          description: 'Configured walking clearance in meters (e.g. 0.6).',
        },
      },
    },
  },
  {
    name: 'undo_last_action',
    description: 'Undo the last furniture change or layout operation.',
    parameters: {
      type: 'OBJECT',
      properties: {},
    },
  },
  {
    name: 'compare_layouts',
    description: 'Compare the current room layout with an optimization candidate or saved version to see differences in floor space, violations, and walking paths.',
    parameters: {
      type: 'OBJECT',
      properties: {},
    },
  },
  {
    name: 'save_layout_version',
    description: 'Save the current room arrangement as a named version snapshot.',
    parameters: {
      type: 'OBJECT',
      properties: {
        name: {
          type: 'STRING',
          description: 'Descriptive title for the saved layout version (e.g., "Minimalist Setup", "Optimized V1").',
        },
      },
    },
  },
  {
    name: 'export_design_report',
    description: 'Generate and display an architectural design specification report with dimensioned blueprints, CAD schedule, and analytics.',
    parameters: {
      type: 'OBJECT',
      properties: {},
    },
  },
]

/**
 * Executes an allowlisted tool action safely using the SpatialToolContext.
 */
export function executeToolAction(
  tool: ToolName,
  parameters: Record<string, unknown>,
  context: SpatialToolContext
): { success: boolean; message: string; resultData?: unknown } {
  const {
    roomConfiguration,
    furniture,
    validationResult,
    onAddFurniture,
    onUpdateFurniture,
    onRemoveFurniture,
    onApplyOptimizedLayout,
    onUndo,
  } = context

  switch (tool) {
    case 'get_room_info': {
      const area = (roomConfiguration.widthMeters * roomConfiguration.lengthMeters).toFixed(1)
      const sqft = (roomConfiguration.widthMeters * roomConfiguration.lengthMeters * 10.7639).toFixed(1)
      const info = {
        name: context.projectName,
        dimensions: `${roomConfiguration.widthMeters.toFixed(2)}m × ${roomConfiguration.lengthMeters.toFixed(2)}m (${metersToFeet(roomConfiguration.widthMeters).toFixed(1)}ft × ${metersToFeet(roomConfiguration.lengthMeters).toFixed(1)}ft)`,
        ceilingHeight: `${roomConfiguration.ceilingHeightMeters.toFixed(2)}m`,
        floorArea: `${area} m² (${sqft} sq ft)`,
        doorsCount: roomConfiguration.doors.length,
        windowsCount: roomConfiguration.windows.length,
        furnitureCount: furniture.length,
      }
      return {
        success: true,
        message: `Room "${context.projectName}": ${info.dimensions}, Floor area: ${info.floorArea}. Doors: ${info.doorsCount}, Windows: ${info.windowsCount}, Current items: ${info.furnitureCount}.`,
        resultData: info,
      }
    }

    case 'list_furniture': {
      if (furniture.length === 0) {
        return {
          success: true,
          message: 'The room is currently unfurnished (0 items placed).',
          resultData: [],
        }
      }
      const list = furniture.map((f, i) => ({
        index: i + 1,
        id: f.id,
        name: f.name,
        category: f.category,
        position: `(${f.position[0].toFixed(2)}m, ${f.position[2].toFixed(2)}m)`,
        rotation: `${Math.round((f.rotationY * 180) / Math.PI)}°`,
      }))
      const names = list.map((l) => `${l.name} at ${l.position}`).join(', ')
      return {
        success: true,
        message: `Current furniture (${furniture.length} items): ${names}.`,
        resultData: list,
      }
    }

    case 'add_furniture': {
      const catalogQuery = String(parameters.catalogId || parameters.name || '').toLowerCase()
      // Match by exact id or fuzzy catalog name / category / tags
      const matched =
        FURNITURE_CATALOG.find((c) => c.id.toLowerCase() === catalogQuery) ||
        FURNITURE_CATALOG.find((c) => c.name.toLowerCase().includes(catalogQuery)) ||
        FURNITURE_CATALOG.find((c) => c.category.toLowerCase().includes(catalogQuery)) ||
        FURNITURE_CATALOG.find((c) => c.tags.some((t) => catalogQuery.includes(t)))

      if (!matched) {
        return {
          success: false,
          message: `Could not locate catalog item matching "${catalogQuery}". Available items include: Queen Bed, Single Daybed, Workstation Desk, Task Chair, 3-Seater Sofa, Lounge Armchair, Double Wardrobe, Bookshelf, Coffee Table, Nightstand, Dining Set.`,
        }
      }

      onAddFurniture(matched)
      return {
        success: true,
        message: `Added ${matched.name} to the room.`,
        resultData: matched,
      }
    }

    case 'remove_furniture': {
      const query = String(parameters.furnitureId || parameters.name || '').toLowerCase()
      const target =
        furniture.find((f) => f.id.toLowerCase() === query) ||
        furniture.find((f) => f.name.toLowerCase().includes(query)) ||
        furniture.find((f) => f.category.toLowerCase().includes(query))

      if (!target) {
        return {
          success: false,
          message: `Cannot find placed furniture matching "${query}". Currently placed: ${furniture.map((f) => f.name).join(', ')}.`,
        }
      }

      onRemoveFurniture(target.id)
      return {
        success: true,
        message: `Removed ${target.name} from the room.`,
        resultData: target,
      }
    }

    case 'rotate_furniture': {
      const query = String(parameters.furnitureId || parameters.name || '').toLowerCase()
      const target =
        furniture.find((f) => f.id.toLowerCase() === query) ||
        furniture.find((f) => f.name.toLowerCase().includes(query))

      if (!target) {
        return {
          success: false,
          message: `Cannot find placed furniture to rotate matching "${query}".`,
        }
      }

      const degrees = typeof parameters.degrees === 'number' ? parameters.degrees : 90
      const radDelta = (degrees * Math.PI) / 180
      const nextRotation = (target.rotationY + radDelta) % (2 * Math.PI)

      onUpdateFurniture({
        ...target,
        rotationY: nextRotation,
      })

      return {
        success: true,
        message: `Rotated ${target.name} by ${degrees}°. New orientation: ${Math.round((nextRotation * 180) / Math.PI)}°.`,
        resultData: { id: target.id, rotationY: nextRotation },
      }
    }

    case 'validate_geometry': {
      const errCount = validationResult.errors.length
      const warnCount = validationResult.warnings.length
      if (validationResult.isValid && !validationResult.hasWarnings) {
        return {
          success: true,
          message: `Geometry validated: All ${furniture.length} items have zero collisions, proper wall containment, and clear door entrance clearances.`,
          resultData: validationResult,
        }
      }
      return {
        success: true,
        message: `Geometry check found ${errCount} error(s) and ${warnCount} warning(s). Run explain_warnings for details.`,
        resultData: validationResult,
      }
    }

    case 'optimize_layout': {
      const mode = (parameters.mode as OptimizationMode) || 'movement-first'
      const deskNearWindow = Boolean(parameters.deskNearWindow ?? true)

      const optResult = generateOptimizedLayouts(furniture, roomConfiguration, {
        mode,
        deskNearWindow,
        bedPlacement: 'against-wall',
        clearEntranceBuffer: 0.8,
        minWalkingClearance: 0.6,
      })

      if (!optResult.success || optResult.candidates.length === 0) {
        return {
          success: false,
          message: `Layout optimization could not produce a feasible arrangement: ${optResult.infeasibleReason || 'Space constraints exceeded.'} Suggestions: ${optResult.suggestions?.join(', ') || 'Remove an item or enlarge room.'}`,
          resultData: optResult,
        }
      }

      return {
        success: true,
        message: `Generated ${optResult.candidates.length} candidate layout(s) for ${mode.replace(/-/g, ' ')} strategy. Top candidate score: ${optResult.candidates[0].score.overallScore}/100.`,
        resultData: optResult,
      }
    }

    case 'apply_candidate_layout': {
      const candidate = parameters.candidate as any
      if (!candidate || !candidate.furniture) {
        return {
          success: false,
          message: 'No valid candidate layout provided to apply.',
        }
      }
      onApplyOptimizedLayout(candidate)
      return {
        success: true,
        message: `Applied layout "${candidate.title}". Furniture coordinates have been updated in the 3D scene.`,
        resultData: candidate,
      }
    }

    case 'explain_warnings': {
      const errs = validationResult.errors
      const warns = validationResult.warnings
      if (errs.length === 0 && warns.length === 0) {
        return {
          success: true,
          message: 'No collisions or clearance warnings detected. The room layout is completely unobstructed.',
        }
      }
      const errDescriptions = errs.map((e: { message: string }) => `• ${e.message}`).join('\n')
      const warnDescriptions = warns.map((w: { message: string }) => `• ${w.message}`).join('\n')
      return {
        success: true,
        message: `Spatial Issues:\n${errDescriptions}\n${warnDescriptions}`,
        resultData: { errors: errs, warnings: warns },
      }
    }

    case 'undo_last_action': {
      onUndo()
      return {
        success: true,
        message: 'Undid the last action. Furniture layout restored to previous state.',
      }
    }

    case 'clear_all_furniture': {
      // Clear furniture one by one or reset
      furniture.forEach((f) => onRemoveFurniture(f.id))
      return {
        success: true,
        message: 'Cleared all furniture from the room.',
      }
    }

    case 'analyze_movement_path': {
      const preset = (parameters.destination as MovementPresetDestination) || 'door-to-bed'
      const clr = typeof parameters.clearanceMeters === 'number' ? parameters.clearanceMeters : 0.6
      const door = getDoorEntrancePoint(roomConfiguration)
      const target = getPresetDestinationPoint(preset, roomConfiguration, furniture)
      const pathRes = analyzeMovementPath(
        roomConfiguration,
        furniture,
        door.point,
        target.point,
        clr,
        'Main Door',
        target.label
      )
      if (pathRes.status === 'blocked') {
        return {
          success: false,
          message: `Movement route blocked: ${pathRes.blockedReason || 'No continuous walkway satisfies clearance.'} ${pathRes.actionableSuggestion || ''}`,
          resultData: pathRes,
        }
      }
      if (pathRes.status === 'bottleneck') {
        return {
          success: true,
          message: `Route analyzed (${pathRes.lengthMeters}m): Narrow clearance bottleneck detected (${pathRes.minClearanceMeters}m vs required ${clr}m).`,
          resultData: pathRes,
        }
      }
      return {
        success: true,
        message: `Clear walking route verified from ${pathRes.startLabel} to ${pathRes.destinationLabel}: ${pathRes.lengthMeters}m (~${(pathRes.lengthMeters / 1.2).toFixed(1)}s walk), minimum clearance ${pathRes.minClearanceMeters}m.`,
        resultData: pathRes,
      }
    }

    case 'compare_layouts': {
      if (context.onOpenComparison) context.onOpenComparison()
      return {
        success: true,
        message: 'Layout comparison opened. You can evaluate side-by-side Top-Down 2D floorplans, area deltas, and corridor trade-offs.',
        resultData: { action: 'open_comparison' },
      }
    }

    case 'save_layout_version': {
      const name = String(parameters.name || 'AI Snapshot').trim()
      if (context.onSaveVersion) context.onSaveVersion(name)
      return {
        success: true,
        message: `Layout version "${name}" snapshot registered with ${furniture.length} items.`,
        resultData: { action: 'save_version', name },
      }
    }

    case 'export_design_report': {
      if (context.onOpenReport) context.onOpenReport()
      return {
        success: true,
        message: 'Spatial design report ready with blueprint specifications, PDF printable view, and CSV furniture schedules.',
        resultData: { action: 'export_report' },
      }
    }

    default:
      return {
        success: false,
        message: `Unsupported tool action: ${String(tool)}`,
      }
  }
}
