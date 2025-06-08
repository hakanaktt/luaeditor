import { AdekoFunction, FunctionCategory } from '../types'
import { allAdekoFunctions } from './adekoFunctionsComplete'

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
  },
  // Continue with more functions...
  {
    name: 'unpack',
    description: 'Alternative to table.unpack for larger tables. Recursively unpacks table elements.',
    parameters: [
      { name: 't', type: 'table', description: 'Table to unpack' },
      { name: 'i', type: 'number', description: 'Starting index (optional)', optional: true, defaultValue: 1 }
    ],
    returnType: 'multiple',
    returnDescription: 'All table elements as separate return values',
    example: 'local a, b, c = ADekoLib.unpack({1, 2, 3})',
    category: 'Utilities',
    subcategory: 'Data Processing',
    tags: ['unpack', 'table', 'utility'],
    complexity: 'basic',
    usage: 'Use when table.unpack fails with large tables or when you need custom unpacking',
    seeAlso: ['deepcopy', 'joinPolylines']
  },
  {
    name: 'removeBackgroundAtTop',
    description: 'Removes background from a polyline based on Z-threshold. Useful for image scan processing.',
    parameters: [
      { name: 'polyline', type: 'table', description: 'Input polyline with Z-coordinates' },
      { name: 'threshold', type: 'number', description: 'Z-threshold for background removal' }
    ],
    returnType: 'table',
    returnDescription: 'Filtered polyline with background removed',
    example: 'local filtered = ADekoLib.removeBackgroundAtTop(scanData, 5)',
    category: 'Polyline Operations',
    subcategory: 'Modification',
    tags: ['filter', 'background', 'image', 'scan'],
    complexity: 'advanced',
    usage: 'Use for processing scanned image data or removing noise from 3D polylines',
    seeAlso: ['reducePolyline', 'scaleDepth']
  },
  {
    name: 'reducePolyline',
    description: 'Merges same-direction segments to reduce polyline complexity without detail loss.',
    parameters: [
      { name: 'polyline', type: 'table', description: 'Input polyline to reduce' }
    ],
    returnType: 'table',
    returnDescription: 'Simplified polyline with fewer points',
    example: 'local simplified = ADekoLib.reducePolyline(complexPath)',
    category: 'Polyline Operations',
    subcategory: 'Modification',
    tags: ['simplify', 'optimize', 'reduce'],
    complexity: 'intermediate',
    usage: 'Use to optimize polylines for faster processing or smaller file sizes',
    seeAlso: ['removeBackgroundAtTop', 'areParallell']
  },
  {
    name: 'areParallell',
    description: 'Tests if three points are collinear (on the same line). Uses distance comparison.',
    parameters: [
      { name: 'p1', type: 'table', description: 'First point {x, y, z}' },
      { name: 'p2', type: 'table', description: 'Second point {x, y, z}' },
      { name: 'p3', type: 'table', description: 'Third point {x, y, z}' }
    ],
    returnType: 'boolean',
    returnDescription: 'True if points are collinear, false otherwise',
    example: 'local isCollinear = ADekoLib.areParallell({0,0}, {5,5}, {10,10})',
    category: 'Analysis & Testing',
    subcategory: 'Geometric Tests',
    tags: ['collinear', 'parallel', 'geometry'],
    complexity: 'intermediate',
    usage: 'Use to detect straight line segments or validate geometric relationships',
    seeAlso: ['distance3D', 'areRoughlyEqual']
  },
  {
    name: 'scaleDepth',
    description: 'Scales Z-coordinates of points to fit within specified depth range.',
    parameters: [
      { name: 'points', type: 'table', description: 'Array of points with Z-coordinates' },
      { name: 'zMin', type: 'number', description: 'Minimum Z value for output' },
      { name: 'zMax', type: 'number', description: 'Maximum Z value for output' }
    ],
    returnType: 'table',
    returnDescription: 'Points with scaled Z-coordinates',
    example: 'local scaled = ADekoLib.scaleDepth(points, -10, 0)',
    category: 'Point & Vector Operations',
    subcategory: 'Point Operations',
    tags: ['scale', 'depth', 'normalize'],
    complexity: 'intermediate',
    usage: 'Use to normalize depth values for consistent machining operations',
    seeAlso: ['scaleHorizontal', 'scaleVertical']
  },
  {
    name: 'scaleVertical',
    description: 'Scales Y-coordinates of points to fit within specified vertical range.',
    parameters: [
      { name: 'points', type: 'table', description: 'Array of points to scale' },
      { name: 'yMin', type: 'number', description: 'Minimum Y value for output' },
      { name: 'yMax', type: 'number', description: 'Maximum Y value for output' }
    ],
    returnType: 'table',
    returnDescription: 'Points with scaled Y-coordinates',
    example: 'local scaled = ADekoLib.scaleVertical(points, 0, 100)',
    category: 'Point & Vector Operations',
    subcategory: 'Point Operations',
    tags: ['scale', 'vertical', 'normalize'],
    complexity: 'intermediate',
    usage: 'Use to fit shapes within specific height constraints',
    seeAlso: ['scaleHorizontal', 'scaleDepth']
  },
  {
    name: 'scaleHorizontal',
    description: 'Scales X-coordinates of points to fit within specified horizontal range.',
    parameters: [
      { name: 'points', type: 'table', description: 'Array of points to scale' },
      { name: 'xMin', type: 'number', description: 'Minimum X value for output' },
      { name: 'xMax', type: 'number', description: 'Maximum X value for output' }
    ],
    returnType: 'table',
    returnDescription: 'Points with scaled X-coordinates',
    example: 'local scaled = ADekoLib.scaleHorizontal(points, 0, 200)',
    category: 'Point & Vector Operations',
    subcategory: 'Point Operations',
    tags: ['scale', 'horizontal', 'normalize'],
    complexity: 'intermediate',
    usage: 'Use to fit shapes within specific width constraints',
    seeAlso: ['scaleVertical', 'scaleDepth']
  },
  {
    name: 'joinPolylines',
    description: 'Joins two polylines into a single continuous polyline.',
    parameters: [
      { name: 'poly1', type: 'table', description: 'First polyline' },
      { name: 'poly2', type: 'table', description: 'Second polyline to append' }
    ],
    returnType: 'table',
    returnDescription: 'Combined polyline',
    example: 'local combined = ADekoLib.joinPolylines(path1, path2)',
    category: 'Polyline Operations',
    subcategory: 'Creation',
    tags: ['join', 'combine', 'polyline'],
    complexity: 'basic',
    usage: 'Use to create continuous paths from separate polyline segments',
    seeAlso: ['polyline', 'polylineimp']
  },
  {
    name: 'circularArc',
    description: 'Creates a polygonal approximation of a circular arc with specified parameters.',
    parameters: [
      { name: 'centerPoint', type: 'table', description: 'Center point of the arc {x, y}' },
      { name: 'diameter', type: 'number', description: 'Diameter of the circle' },
      { name: 'noOfSegments', type: 'number', description: 'Number of line segments to approximate arc' },
      { name: 'startAngle', type: 'number', description: 'Start angle in degrees' },
      { name: 'endAngle', type: 'number', description: 'End angle in degrees' }
    ],
    returnType: 'table',
    returnDescription: 'Array of points representing the arc',
    example: 'local arc = ADekoLib.circularArc({50, 50}, 40, 16, 0, 90)',
    category: 'Shape Generation',
    subcategory: 'Advanced Shapes',
    tags: ['arc', 'circle', 'curve'],
    complexity: 'intermediate',
    usage: 'Use to create smooth curved paths or decorative arcs',
    seeAlso: ['ellipticArc', 'circle']
  }
]

/**
 * Comprehensive AdekoLib Function Catalog
 *
 * This catalog contains detailed documentation for all AdekoLib functions,
 * organized by category and complexity level. Each function includes:
 *
 * - Complete parameter documentation with types and descriptions
 * - Return value information
 * - Working code examples
 * - Usage guidelines and best practices
 * - Related function recommendations
 * - Complexity level indicators
 * - Searchable tags for easy discovery
 *
 * Categories:
 * - Geometric Transformations: rotate, translate, mirror, etc.
 * - Point & Vector Operations: distance, angle, polar, etc.
 * - Shape Generation: circle, rectangle, ellipse, etc.
 * - Machining Operations: groove, hole, pocket, etc.
 * - Polyline Operations: polyline, offset, join, etc.
 * - Analysis & Testing: intersection, collision, validation
 * - Data Management: parts, layers, faces, nodes
 * - Utilities: copy, validation, conversion, etc.
 */

// Export the complete function catalog
export const adekoFunctions: AdekoFunction[] = allAdekoFunctions

// Legacy export for backward compatibility
export const basicAdekoFunctions: AdekoFunction[] = [
  {
    name: 'rotate',
    description: 'Rotates a polygon around a reference point by the specified angle. Supports both clockwise and counter-clockwise rotation. All points in the polygon are rotated by the same angle around the reference point, maintaining the shape\'s proportions and relative positions.',
    parameters: [
      {
        name: 'polygon',
        type: 'table',
        description: 'Array of points representing the polygon. Each point should be in format {x, y} or {x, y, z, bulge}. The polygon can be open or closed.'
      },
      {
        name: 'reference',
        type: 'table',
        description: 'Reference point {x, y} that serves as the center of rotation. This point remains stationary while all polygon points rotate around it.'
      },
      {
        name: 'theta',
        type: 'number',
        description: 'Rotation angle in degrees. Positive values rotate counter-clockwise, negative values rotate clockwise. Can be any real number.'
      }
    ],
    returnType: 'table',
    returnDescription: 'New polygon with all points rotated around the reference point. Maintains the same structure as input polygon including any Z-coordinates and bulge values.',
    example: 'local rotated = ADekoLib.rotate({{0,0}, {10,0}, {10,10}, {0,10}}, {5,5}, 45) -- Rotate square 45° around center',
    category: 'Geometric Transformations',
    subcategory: 'Basic Transformations',
    tags: ['rotation', 'transform', 'polygon', 'geometry', 'orientation'],
    complexity: 'basic',
    usage: 'Use to rotate shapes around a pivot point for positioning, orientation changes, or creating rotated patterns. Essential for aligning parts or creating angular arrangements.',
    seeAlso: ['translate', 'mirror', 'angle']
  },
  {
    name: 'translate',
    description: 'Translates (moves) a polygon by moving all points in a specified direction and distance. Unlike simple coordinate addition, this function uses polar coordinates to move the shape at a specific angle, making it ideal for directional movements and positioning.',
    parameters: [
      {
        name: 'pointTable',
        type: 'table',
        description: 'Array of points to translate. Each point should be in format {x, y} or {x, y, z, bulge}. All points are moved by the same vector.'
      },
      {
        name: 'theta',
        type: 'number',
        description: 'Direction angle in degrees (0° = positive X-axis, 90° = positive Y-axis). Determines the direction of movement.'
      },
      {
        name: 'distance',
        type: 'number',
        description: 'Distance to move in the specified direction. Positive values move in the theta direction, negative values move opposite.'
      }
    ],
    returnType: 'table',
    returnDescription: 'New polygon with all points moved by the specified distance and direction. Preserves all original point attributes including Z-coordinates and bulge values.',
    example: 'local moved = ADekoLib.translate(points, 90, 50) -- Move 50 units upward (90° direction)',
    category: 'Geometric Transformations',
    subcategory: 'Basic Transformations',
    tags: ['translation', 'move', 'polygon', 'positioning', 'direction'],
    complexity: 'basic',
    usage: 'Use to move shapes to different positions while maintaining orientation. Perfect for positioning parts, creating offsets, or arranging multiple copies of a shape.',
    seeAlso: ['rotate', 'moveWithDeltaVec', 'polar']
  },
  {
    name: 'mirror',
    description: 'Mirrors (reflects) a polygon over a specified axis or point. Creates a symmetric copy of the shape across the mirror line. Automatically handles bulge values for arcs, reversing their direction to maintain proper arc orientation after mirroring.',
    parameters: [
      {
        name: 'pointTable',
        type: 'table',
        description: 'Array of points to mirror. Each point should be in format {x, y} or {x, y, z, bulge}. All points are reflected across the specified axis.'
      },
      {
        name: 'axis',
        type: 'string',
        description: 'Mirror axis type: "x" (vertical line), "y" (horizontal line), or "xy" (point reflection). Determines the type of mirroring operation.'
      },
      {
        name: 'X',
        type: 'number',
        description: 'X-coordinate of the mirror line or point. For "x" axis: the X position of vertical mirror line. For "xy": the X coordinate of mirror point.'
      },
      {
        name: 'Y',
        type: 'number',
        description: 'Y-coordinate of the mirror line or point. For "y" axis: the Y position of horizontal mirror line. For "xy": the Y coordinate of mirror point.'
      }
    ],
    returnType: 'table',
    returnDescription: 'New polygon with all points mirrored across the specified axis. Bulge values are automatically negated for proper arc direction. Preserves Z-coordinates.',
    example: 'local mirrored = ADekoLib.mirror(points, "x", 100, 0) -- Mirror over vertical line at x=100',
    category: 'Geometric Transformations',
    subcategory: 'Basic Transformations',
    tags: ['mirror', 'reflection', 'symmetry', 'flip', 'axis'],
    complexity: 'basic',
    usage: 'Use to create symmetric shapes, flip objects across an axis, or generate left/right handed versions of parts. Essential for creating symmetric furniture components.',
    seeAlso: ['rotate', 'translate', 'sortCW', 'sortCCW']
  }
]
