import { AdekoFunction, FunctionCategory } from '../types'

// Function categories for organization
export const functionCategories: FunctionCategory[] = [
  {
    name: 'Geometric Transformations',
    description: 'Functions for rotating, translating, mirroring, and transforming geometric objects',
    icon: '🔄',
    subcategories: [
      {
        name: 'Basic Transformations',
        description: 'Rotate, translate, mirror operations',
        functions: ['rotate', 'translate', 'mirror', 'moveWithDeltaVec']
      }
    ]
  },
  {
    name: 'Point & Vector Operations',
    description: 'Operations on points and vectors including addition, subtraction, normalization',
    icon: '📍',
    subcategories: [
      {
        name: 'Point Operations',
        description: 'Basic point arithmetic and operations',
        functions: ['ptAdd', 'ptSubtract', 'distance', 'distance3D', 'angle', 'polar']
      },
      {
        name: 'Vector Operations',
        description: 'Vector manipulation functions',
        functions: ['vecNormalize', 'vecScale', 'vecNegate']
      }
    ]
  },
  {
    name: 'Shape Generation',
    description: 'Functions for creating basic and complex geometric shapes',
    icon: '⭕',
    subcategories: [
      {
        name: 'Basic Shapes',
        description: 'Circles, rectangles, lines',
        functions: ['circle', 'rectangle', 'line', 'dashLine']
      },
      {
        name: 'Advanced Shapes',
        description: 'Ellipses, arcs, and complex curves',
        functions: ['ellipse', 'ellipticArc', 'circularArc']
      }
    ]
  },
  {
    name: 'Machining Operations',
    description: 'CNC machining operations like pockets, grooves, and holes',
    icon: '🔧',
    subcategories: [
      {
        name: 'Basic Operations',
        description: 'Simple machining operations',
        functions: ['groove', 'hole', 'pocket']
      },
      {
        name: 'Advanced Operations',
        description: 'Complex machining patterns',
        functions: ['inclinedPocket', 'inclinedPocket2', 'sunkenFrame', 'sunkenFrameAny', 'cleanCorners']
      }
    ]
  },
  {
    name: 'Polyline Operations',
    description: 'Working with polylines, paths, and complex curves',
    icon: '📏',
    subcategories: [
      {
        name: 'Creation',
        description: 'Creating polylines and paths',
        functions: ['polyline', 'polylineimp', 'joinPolylines']
      },
      {
        name: 'Modification',
        description: 'Modifying existing polylines',
        functions: ['offSet', 'reducePolyline', 'removeBackgroundAtTop']
      }
    ]
  },
  {
    name: 'Analysis & Testing',
    description: 'Geometric analysis and testing functions',
    icon: '🔍',
    subcategories: [
      {
        name: 'Geometric Tests',
        description: 'Testing geometric relationships',
        functions: ['isPointInsidePolygon', 'areParallell', 'areRoughlyEqual', 'isMiddle']
      },
      {
        name: 'Intersections',
        description: 'Finding intersection points',
        functions: ['lineLineIntersection', 'circleCircleIntersection', 'circleLineIntersection', 'ellipseLineIntersection']
      }
    ]
  },
  {
    name: 'Data Management',
    description: 'Managing shapes, parts, and product data',
    icon: '💾',
    subcategories: [
      {
        name: 'Shape Management',
        description: 'Working with individual shapes',
        functions: ['node', 'nextShape', 'nextNode', 'deleteLastShape', 'deleteLastPoint']
      },
      {
        name: 'Part Management',
        description: 'Creating and managing parts',
        functions: ['makePart', 'makePartShape', 'packIntoPart', 'createEdgeBands']
      },
      {
        name: 'Product Management',
        description: 'Managing complete products',
        functions: ['startProduct', 'finishProduct', 'start', 'finish']
      }
    ]
  },
  {
    name: 'Utilities',
    description: 'Helper functions and utilities',
    icon: '🛠️',
    subcategories: [
      {
        name: 'Data Processing',
        description: 'Processing and manipulating data',
        functions: ['deepcopy', 'split', 'parseModelParameters', 'swap']
      },
      {
        name: 'Validation',
        description: 'Validating inputs and data',
        functions: ['validateNumber', 'checkFuzzy', 'checkInput']
      }
    ]
  },
  {
    name: 'moveWithDeltaVec',
    description: 'Moves points by adding a delta vector to each point',
    parameters: [
      { name: 'pointTable', type: 'table', description: 'Array of points to move' },
      { name: 'vec', type: 'table', description: 'Delta vector {dx, dy, dz}' }
    ],
    returnType: 'table',
    returnDescription: 'Moved points with delta vector applied',
    example: 'local moved = ADekoLib.moveWithDeltaVec(points, {10, 20, 5})',
    category: 'Geometric Transformations',
    subcategory: 'Basic Transformations',
    tags: ['move', 'vector', 'translation'],
    complexity: 'basic',
    usage: 'Use for simple vector-based movement of point collections',
    seeAlso: ['translate', 'ptAdd']
  },
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
    name: 'distance3D',
    description: 'Calculates the 3D distance between two points',
    parameters: [
      { name: 'p1', type: 'table', description: 'First point {x, y, z}' },
      { name: 'p2', type: 'table', description: 'Second point {x, y, z}' }
    ],
    returnType: 'number',
    returnDescription: '3D distance between the two points',
    example: 'local dist = ADekoLib.distance3D({0, 0, 0}, {1, 1, 1}) -- Returns sqrt(3)',
    category: 'Point & Vector Operations',
    subcategory: 'Point Operations',
    tags: ['distance', '3D', 'measurement'],
    complexity: 'basic',
    usage: 'Use for 3D distance calculations in spatial operations',
    seeAlso: ['distance', 'vecNormalize']
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
  {
    name: 'ptAdd',
    description: 'Adds two points or vectors component-wise',
    parameters: [
      { name: 'p1', type: 'table', description: 'First point/vector {x, y, z}' },
      { name: 'p2', type: 'table', description: 'Second point/vector {x, y, z}' }
    ],
    returnType: 'table',
    returnDescription: 'Sum of the two points/vectors',
    example: 'local sum = ADekoLib.ptAdd({1, 2, 3}, {4, 5, 6}) -- Returns {5, 7, 9}',
    category: 'Point & Vector Operations',
    subcategory: 'Point Operations',
    tags: ['addition', 'vector', 'arithmetic'],
    complexity: 'basic',
    usage: 'Use for vector addition and point displacement operations',
    seeAlso: ['ptSubtract', 'moveWithDeltaVec']
  },
  {
    name: 'ptSubtract',
    description: 'Subtracts the second point from the first point component-wise',
    parameters: [
      { name: 'p1', type: 'table', description: 'First point/vector {x, y, z}' },
      { name: 'p2', type: 'table', description: 'Second point/vector {x, y, z}' }
    ],
    returnType: 'table',
    returnDescription: 'Difference of the two points/vectors',
    example: 'local diff = ADekoLib.ptSubtract({5, 7, 9}, {1, 2, 3}) -- Returns {4, 5, 6}',
    category: 'Point & Vector Operations',
    subcategory: 'Point Operations',
    tags: ['subtraction', 'vector', 'arithmetic'],
    complexity: 'basic',
    usage: 'Use to find displacement vectors or relative positions',
    seeAlso: ['ptAdd', 'distance']
  },
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
  },
  {
    name: 'polyline',
    description: 'Creates a polyline from a series of points',
    parameters: [
      { name: '...', type: 'table', description: 'Variable number of points {x, y, z, bulge}' }
    ],
    returnType: 'void',
    returnDescription: 'Creates polyline geometry in current shape',
    example: 'ADekoLib.polyline({0,0}, {100,0}, {100,50}, {0,50}) -- Rectangle',
    category: 'Polyline Operations',
    subcategory: 'Creation',
    tags: ['polyline', 'path', 'shape'],
    complexity: 'basic',
    usage: 'Use to create complex paths and shapes from multiple connected points',
    seeAlso: ['line', 'polylineimp']
  },
  {
    name: 'offSet',
    description: 'Creates an offset polyline at a specified distance from the original',
    parameters: [
      { name: 'inputPoints', type: 'table', description: 'Array of points defining the original polyline' },
      { name: 'value', type: 'number', description: 'Offset distance (positive for outward, negative for inward)' }
    ],
    returnType: 'table',
    returnDescription: 'Offset polyline as array of points',
    example: 'local offset = ADekoLib.offSet(originalPoints, 5) -- Offset 5 units outward',
    category: 'Polyline Operations',
    subcategory: 'Modification',
    tags: ['offset', 'polyline', 'parallel'],
    complexity: 'intermediate',
    usage: 'Use to create parallel paths for toolpaths, borders, or clearances',
    seeAlso: ['polyline', 'sunkenFrameAny']
  },
  {
    name: 'isPointInsidePolygon',
    description: 'Tests whether a point lies inside a polygon using ray casting algorithm',
    parameters: [
      { name: 'point', type: 'table', description: 'Test point {x, y}' },
      { name: 'polygon', type: 'table', description: 'Array of points defining the polygon' }
    ],
    returnType: 'boolean',
    returnDescription: 'True if point is inside polygon, false otherwise',
    example: 'local inside = ADekoLib.isPointInsidePolygon({50, 50}, rectanglePoints)',
    category: 'Analysis & Testing',
    subcategory: 'Geometric Tests',
    tags: ['point-in-polygon', 'collision', 'geometry'],
    complexity: 'intermediate',
    usage: 'Use for collision detection, area validation, or geometric analysis',
    seeAlso: ['areParallell', 'distance']
  },
  {
    name: 'lineLineIntersection',
    description: 'Finds the intersection point of two lines or line segments',
    parameters: [
      { name: 'p1', type: 'table', description: 'First point of first line {x, y}' },
      { name: 'p2', type: 'table', description: 'Second point of first line {x, y}' },
      { name: 'p3', type: 'table', description: 'First point of second line {x, y}' },
      { name: 'p4', type: 'table', description: 'Second point of second line {x, y}' },
      { name: 'onSegment', type: 'boolean', description: 'If true, only check segment intersection', optional: true, defaultValue: false }
    ],
    returnType: 'table|null',
    returnDescription: 'Intersection point {x, y} or null if no intersection',
    example: 'local intersection = ADekoLib.lineLineIntersection({0,0}, {10,10}, {0,10}, {10,0})',
    category: 'Analysis & Testing',
    subcategory: 'Intersections',
    tags: ['intersection', 'lines', 'geometry'],
    complexity: 'intermediate',
    usage: 'Use to find where lines cross for trimming, extending, or geometric analysis',
    seeAlso: ['circleLineIntersection', 'ellipseLineIntersection']
  },
  {
    name: 'makePart',
    description: 'Creates a rectangular part with specified dimensions',
    parameters: [
      { name: 'width', type: 'number', description: 'Width of the part' },
      { name: 'height', type: 'number', description: 'Height of the part' },
      { name: '...', type: 'table', description: 'Optional custom shape points', optional: true }
    ],
    returnType: 'void',
    returnDescription: 'Creates part geometry',
    example: 'ADekoLib.makePart(600, 400) -- 600x400 rectangular part',
    category: 'Data Management',
    subcategory: 'Part Management',
    tags: ['part', 'panel', 'manufacturing'],
    complexity: 'basic',
    usage: 'Use to create the main panel shape for furniture parts',
    seeAlso: ['makePartShape', 'packIntoPart']
  },
  {
    name: 'setFace',
    description: 'Sets the current working face for subsequent operations',
    parameters: [
      { name: 'faceName', type: 'string', description: 'Face name: "top", "bottom", "left", "right", "front", "rear"' }
    ],
    returnType: 'void',
    returnDescription: 'Sets the current face orientation',
    example: 'ADekoLib.setFace("top") -- Work on the top face',
    category: 'Data Management',
    subcategory: 'Shape Management',
    tags: ['face', 'orientation', '3D'],
    complexity: 'intermediate',
    usage: 'Use to specify which face of a 3D part to work on for machining operations',
    seeAlso: ['moveToFace', 'setLayer']
  },
  {
    name: 'setLayer',
    description: 'Sets the current layer for subsequent geometry',
    parameters: [
      { name: 'layerName', type: 'string', description: 'Name of the layer' }
    ],
    returnType: 'void',
    returnDescription: 'Sets the current layer',
    example: 'ADekoLib.setLayer("PANEL") -- Set layer to PANEL',
    category: 'Data Management',
    subcategory: 'Shape Management',
    tags: ['layer', 'organization', 'CAD'],
    complexity: 'basic',
    usage: 'Use to organize geometry into different layers for different operations',
    seeAlso: ['setThickness', 'setFace']
  },
  {
    name: 'setThickness',
    description: 'Sets the thickness (Z-depth) for subsequent geometry',
    parameters: [
      { name: 'thickness', type: 'number', description: 'Thickness value (negative for cuts)' }
    ],
    returnType: 'void',
    returnDescription: 'Sets the current thickness',
    example: 'ADekoLib.setThickness(-5) -- Set cutting depth to 5mm',
    category: 'Data Management',
    subcategory: 'Shape Management',
    tags: ['thickness', 'depth', 'machining'],
    complexity: 'basic',
    usage: 'Use to specify cutting depth or material thickness for operations',
    seeAlso: ['setLayer', 'groove']
  }
]

// Start of function definitions - Basic Geometric Transformations
export const adekoFunctions: AdekoFunction[] = [
  {
    name: 'rotate',
    description: 'Rotates a polygon around a reference point by the specified angle',
    parameters: [
      { name: 'polygon', type: 'table', description: 'Array of points representing the polygon' },
      { name: 'reference', type: 'table', description: 'Reference point {x, y} for rotation center' },
      { name: 'theta', type: 'number', description: 'Rotation angle in degrees' }
    ],
    returnType: 'table',
    returnDescription: 'Rotated polygon as array of points',
    example: 'local rotated = ADekoLib.rotate({{0,0}, {10,0}, {10,10}}, {5,5}, 45)',
    category: 'Geometric Transformations',
    subcategory: 'Basic Transformations',
    tags: ['rotation', 'transform', 'polygon'],
    complexity: 'basic',
    usage: 'Use to rotate shapes around a pivot point for positioning or orientation changes',
    seeAlso: ['translate', 'mirror']
  },
  {
    name: 'translate',
    description: 'Translates a polygon by moving it in a specified direction and distance',
    parameters: [
      { name: 'pointTable', type: 'table', description: 'Array of points to translate' },
      { name: 'theta', type: 'number', description: 'Direction angle in degrees' },
      { name: 'distance', type: 'number', description: 'Distance to move' }
    ],
    returnType: 'table',
    returnDescription: 'Translated polygon as array of points',
    example: 'local moved = ADekoLib.translate(points, 90, 50) -- Move 50 units upward',
    category: 'Geometric Transformations',
    subcategory: 'Basic Transformations',
    tags: ['translation', 'move', 'polygon'],
    complexity: 'basic',
    usage: 'Use to move shapes to different positions while maintaining orientation',
    seeAlso: ['rotate', 'moveWithDeltaVec']
  },
  {
    name: 'mirror',
    description: 'Mirrors a polygon over the specified axis',
    parameters: [
      { name: 'pointTable', type: 'table', description: 'Array of points to mirror' },
      { name: 'axis', type: 'string', description: 'Mirror axis: "x", "y", or "xy"' },
      { name: 'X', type: 'number', description: 'X-coordinate of mirror line' },
      { name: 'Y', type: 'number', description: 'Y-coordinate of mirror line' }
    ],
    returnType: 'table',
    returnDescription: 'Mirrored polygon as array of points',
    example: 'local mirrored = ADekoLib.mirror(points, "x", 100, 0) -- Mirror over vertical line at x=100',
    category: 'Geometric Transformations',
    subcategory: 'Basic Transformations',
    tags: ['mirror', 'reflection', 'symmetry'],
    complexity: 'basic',
    usage: 'Use to create symmetric shapes or flip objects across an axis',
    seeAlso: ['rotate', 'translate']
  }
]
