import type { AdekoFunction, FunctionCategory } from '@/types'

// Function categories for organization
export const functionCategories: FunctionCategory[] = [
  {
    name: 'Geometric Transformations',
    icon: '🔄',
    description: 'Functions for rotating, translating, mirroring, and scaling shapes'
  },
  {
    name: 'Point & Vector Operations',
    icon: '📐',
    description: 'Functions for point calculations, distances, angles, and vector operations'
  },
  {
    name: 'Shape Generation',
    icon: '⭕',
    description: 'Functions for creating basic and complex geometric shapes'
  },
  {
    name: 'Machining Operations',
    icon: '🔧',
    description: 'Functions for creating machining operations like holes, grooves, and pockets'
  }
]

// All AdekoLib functions with complete documentation
export const allAdekoFunctions: AdekoFunction[] = [
  // Geometric Transformations
  {
    name: 'rotate',
    description: 'Rotates a polygon around a reference point by the specified angle',
    parameters: [
      { name: 'polygon', type: 'table', description: 'Array of points representing the polygon' },
      { name: 'reference', type: 'table', description: 'Reference point {x, y} for rotation center' },
      { name: 'theta', type: 'number', description: 'Rotation angle in degrees' }
    ],
    returnType: 'table',
    returnDescription: 'New polygon with all points rotated around the reference point',
    example: 'local rotated = ADekoLib.rotate({{0,0}, {10,0}, {10,10}, {0,10}}, {5,5}, 45)',
    category: 'Geometric Transformations',
    subcategory: 'Basic Transformations',
    tags: ['rotation', 'transform', 'polygon'],
    complexity: 'basic',
    usage: 'Use to rotate shapes around a pivot point for positioning or orientation changes',
    seeAlso: ['translate', 'mirror', 'angle']
  },
  {
    name: 'translate',
    description: 'Translates (moves) a polygon by moving all points in a specified direction and distance',
    parameters: [
      { name: 'pointTable', type: 'table', description: 'Array of points to translate' },
      { name: 'theta', type: 'number', description: 'Direction angle in degrees' },
      { name: 'distance', type: 'number', description: 'Distance to move in the specified direction' }
    ],
    returnType: 'table',
    returnDescription: 'New polygon with all points moved by the specified distance and direction',
    example: 'local moved = ADekoLib.translate(points, 90, 50) -- Move 50 units upward',
    category: 'Geometric Transformations',
    subcategory: 'Basic Transformations',
    tags: ['translation', 'move', 'polygon'],
    complexity: 'basic',
    usage: 'Use to move shapes to different positions while maintaining orientation',
    seeAlso: ['rotate', 'moveWithDeltaVec', 'polar']
  },
  {
    name: 'mirror',
    description: 'Mirrors (reflects) a polygon over a specified axis or point',
    parameters: [
      { name: 'pointTable', type: 'table', description: 'Array of points to mirror' },
      { name: 'axis', type: 'string', description: 'Mirror axis: "x", "y", or "xy"' },
      { name: 'X', type: 'number', description: 'X-coordinate of the mirror line or point' },
      { name: 'Y', type: 'number', description: 'Y-coordinate of the mirror line or point' }
    ],
    returnType: 'table',
    returnDescription: 'New polygon with all points mirrored across the specified axis',
    example: 'local mirrored = ADekoLib.mirror(points, "x", 100, 0) -- Mirror over vertical line at x=100',
    category: 'Geometric Transformations',
    subcategory: 'Basic Transformations',
    tags: ['mirror', 'reflection', 'symmetry'],
    complexity: 'basic',
    usage: 'Use to create symmetric shapes or flip objects across an axis',
    seeAlso: ['rotate', 'translate']
  },
  // Point & Vector Operations
  {
    name: 'distance',
    description: 'Calculates the 2D distance between two points',
    parameters: [
      { name: 'p1', type: 'table', description: 'First point {x, y}' },
      { name: 'p2', type: 'table', description: 'Second point {x, y}' }
    ],
    returnType: 'number',
    returnDescription: 'Distance between the two points',
    example: 'local dist = ADekoLib.distance({0, 0}, {3, 4}) -- Returns 5',
    category: 'Point & Vector Operations',
    subcategory: 'Point Operations',
    tags: ['distance', 'measurement', 'geometry'],
    complexity: 'basic',
    usage: 'Use to measure distances for positioning, validation, or calculations',
    seeAlso: ['distance3D', 'angle']
  },
  {
    name: 'angle',
    description: 'Calculates the angle from point p1 to point p2 in degrees',
    parameters: [
      { name: 'p1', type: 'table', description: 'Starting point {x, y}' },
      { name: 'p2', type: 'table', description: 'Ending point {x, y}' }
    ],
    returnType: 'number',
    returnDescription: 'Angle in degrees (0-360)',
    example: 'local angle = ADekoLib.angle({0, 0}, {1, 1}) -- Returns 45',
    category: 'Point & Vector Operations',
    subcategory: 'Point Operations',
    tags: ['angle', 'direction', 'geometry'],
    complexity: 'basic',
    usage: 'Use to determine direction between points for rotation or orientation',
    seeAlso: ['polar', 'rotate']
  },
  {
    name: 'polar',
    description: 'Returns a point at polar coordinates relative to a base point',
    parameters: [
      { name: 'p1', type: 'table', description: 'Base point {x, y}' },
      { name: 'theta', type: 'number', description: 'Angle in degrees' },
      { name: 'distance', type: 'number', description: 'Distance from base point' }
    ],
    returnType: 'table',
    returnDescription: 'New point at polar coordinates {x, y}',
    example: 'local point = ADekoLib.polar({0, 0}, 45, 10) -- Point 10 units at 45 degrees',
    category: 'Point & Vector Operations',
    subcategory: 'Point Operations',
    tags: ['polar', 'coordinates', 'positioning'],
    complexity: 'basic',
    usage: 'Use to position points at specific angles and distances',
    seeAlso: ['angle', 'distance']
  },
  // Shape Generation
  {
    name: 'circle',
    description: 'Creates a circle using bulge values for smooth curves',
    parameters: [
      { name: 'p', type: 'table', description: 'Center point {x, y}' },
      { name: 'r', type: 'number', description: 'Radius of the circle' }
    ],
    returnType: 'void',
    returnDescription: 'Creates circle geometry in current shape',
    example: 'ADekoLib.circle({50, 50}, 25) -- Circle at (50,50) with radius 25',
    category: 'Shape Generation',
    subcategory: 'Basic Shapes',
    tags: ['circle', 'shape', 'geometry'],
    complexity: 'basic',
    usage: 'Use to create circular shapes for holes, decorative elements, or boundaries',
    seeAlso: ['ellipse', 'hole']
  },
  {
    name: 'rectangle',
    description: 'Creates a rectangle between two diagonal points',
    parameters: [
      { name: 'p1', type: 'table', description: 'First corner point {x, y}' },
      { name: 'p2', type: 'table', description: 'Opposite corner point {x, y}' },
      { name: 'bulge', type: 'number', description: 'Optional bulge for rounded corners', optional: true, defaultValue: 0 }
    ],
    returnType: 'void',
    returnDescription: 'Creates rectangle geometry in current shape',
    example: 'ADekoLib.rectangle({0, 0}, {100, 50}) -- Rectangle from origin to (100,50)',
    category: 'Shape Generation',
    subcategory: 'Basic Shapes',
    tags: ['rectangle', 'shape', 'basic'],
    complexity: 'basic',
    usage: 'Use to create rectangular shapes for panels, frames, or boundaries',
    seeAlso: ['line', 'makePart']
  },
  {
    name: 'line',
    description: 'Creates a line segment between two points',
    parameters: [
      { name: 'p1', type: 'table', description: 'Start point {x, y}' },
      { name: 'p2', type: 'table', description: 'End point {x, y}' },
      { name: 'bulge', type: 'number', description: 'Optional bulge for arc', optional: true, defaultValue: 0 }
    ],
    returnType: 'void',
    returnDescription: 'Creates line geometry in current shape',
    example: 'ADekoLib.line({0, 0}, {100, 0}) -- Horizontal line 100 units long',
    category: 'Shape Generation',
    subcategory: 'Basic Shapes',
    tags: ['line', 'segment', 'basic'],
    complexity: 'basic',
    usage: 'Use to create straight edges, construction lines, or simple paths',
    seeAlso: ['polyline', 'dashLine']
  },
  // Machining Operations
  {
    name: 'hole',
    description: 'Creates a circular hole at the specified location',
    parameters: [
      { name: 'centerPoint', type: 'table', description: 'Center point of hole {x, y}' },
      { name: 'radius', type: 'number', description: 'Radius of the hole' },
      { name: 'depth', type: 'number', description: 'Depth of the hole' }
    ],
    returnType: 'void',
    returnDescription: 'Creates hole machining operation',
    example: 'ADekoLib.hole({50, 50}, 5, -10) -- 10mm deep hole with 5mm radius',
    category: 'Machining Operations',
    subcategory: 'Basic Operations',
    tags: ['hole', 'drilling', 'machining'],
    complexity: 'basic',
    usage: 'Use to create holes for screws, dowels, or decorative purposes',
    seeAlso: ['circle', 'pocket']
  },
  {
    name: 'groove',
    description: 'Creates a groove (linear cut) between two points',
    parameters: [
      { name: 'startPoint', type: 'table', description: 'Start point of groove {x, y}' },
      { name: 'endPoint', type: 'table', description: 'End point of groove {x, y}' },
      { name: 'depth', type: 'number', description: 'Depth of the groove' }
    ],
    returnType: 'void',
    returnDescription: 'Creates groove machining operation',
    example: 'ADekoLib.groove({10, 10}, {90, 10}, -5) -- 5mm deep groove',
    category: 'Machining Operations',
    subcategory: 'Basic Operations',
    tags: ['groove', 'machining', 'cut'],
    complexity: 'basic',
    usage: 'Use to create linear cuts for joinery, decoration, or functional grooves',
    seeAlso: ['hole', 'pocket']
  },
  {
    name: 'pocket',
    description: 'Creates a rectangular pocket (area removal) between two points',
    parameters: [
      { name: 'firstPoint', type: 'table', description: 'First corner of pocket {x, y}' },
      { name: 'secondPoint', type: 'table', description: 'Opposite corner of pocket {x, y}' },
      { name: 'depth', type: 'number', description: 'Depth of the pocket' },
      { name: 'cToolDiameter', type: 'number', description: 'Cutting tool diameter' }
    ],
    returnType: 'void',
    returnDescription: 'Creates pocket machining operation',
    example: 'ADekoLib.pocket({10, 10}, {90, 40}, -5, 6) -- Pocket with 6mm tool',
    category: 'Machining Operations',
    subcategory: 'Basic Operations',
    tags: ['pocket', 'machining', 'area-removal'],
    complexity: 'intermediate',
    usage: 'Use to remove material from rectangular areas for recesses or clearances',
    seeAlso: ['inclinedPocket', 'cleanCorners']
  }
]

// Export the complete function catalog
export const adekoFunctions: AdekoFunction[] = allAdekoFunctions

// Export default as the main function array
export default adekoFunctions
