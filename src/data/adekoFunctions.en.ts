import { LocalizedAdekoFunction } from '../types'

/**
 * English Function Definitions for AdekoLib
 * 
 * This file contains all function definitions in English.
 * These are the original definitions from adekoFunctionsComplete.ts
 */

export const englishFunctionDefinitions: LocalizedAdekoFunction[] = [
  // GEOMETRIC TRANSFORMATIONS
  {
    name: 'rotate',
    description: 'Rotates a polygon around a reference point by the specified angle. Supports both clockwise and counter-clockwise rotation.',
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
    description: 'Translates a polygon by moving it in a specified direction and distance using polar coordinates.',
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
    name: 'moveWithDeltaVec',
    description: 'Moves points by adding a delta vector to each point. Simple vector addition.',
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
    name: 'mirror',
    description: 'Mirrors a polygon over the specified axis. Handles bulge values correctly for arcs.',
    parameters: [
      { name: 'pointTable', type: 'table', description: 'Array of points to mirror' },
      { name: 'axis', type: 'string', description: 'Mirror axis: "x", "y", or "xy"' },
      { name: 'X', type: 'number', description: 'X-coordinate of mirror line' },
      { name: 'Y', type: 'number', description: 'Y-coordinate of mirror line' }
    ],
    returnType: 'table',
    returnDescription: 'Mirrored polygon as array of points',
    example: 'local mirrored = ADekoLib.mirror(points, "x", 100, 0)',
    category: 'Geometric Transformations',
    subcategory: 'Basic Transformations',
    tags: ['mirror', 'reflection', 'symmetry'],
    complexity: 'basic',
    usage: 'Use to create symmetric shapes or flip objects across an axis',
    seeAlso: ['rotate', 'translate']
  },

  // POINT & VECTOR OPERATIONS
  {
    name: 'distance',
    description: 'Calculates the 2D Euclidean distance between two points.',
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
    description: 'Calculates the 3D Euclidean distance between two points including Z-coordinate.',
    parameters: [
      { name: 'p1', type: 'table', description: 'First point {x, y, z}' },
      { name: 'p2', type: 'table', description: 'Second point {x, y, z}' }
    ],
    returnType: 'number',
    returnDescription: '3D distance between the two points',
    example: 'local dist = ADekoLib.distance3D({0, 0, 0}, {1, 1, 1})',
    category: 'Point & Vector Operations',
    subcategory: 'Point Operations',
    tags: ['distance', '3D', 'measurement'],
    complexity: 'basic',
    usage: 'Use for 3D distance calculations in spatial operations',
    seeAlso: ['distance', 'vecNormalize']
  },
  {
    name: 'angle',
    description: 'Calculates the angle from point p1 to point p2 in degrees (0-360).',
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
    description: 'Returns a point at polar coordinates relative to a base point.',
    parameters: [
      { name: 'p1', type: 'table', description: 'Base point {x, y}' },
      { name: 'theta', type: 'number', description: 'Angle in degrees' },
      { name: 'distance', type: 'number', description: 'Distance from base point' }
    ],
    returnType: 'table',
    returnDescription: 'New point at polar coordinates {x, y}',
    example: 'local point = ADekoLib.polar({0, 0}, 45, 10)',
    category: 'Point & Vector Operations',
    subcategory: 'Point Operations',
    tags: ['polar', 'coordinates', 'positioning'],
    complexity: 'basic',
    usage: 'Use to position points at specific angles and distances',
    seeAlso: ['angle', 'distance']
  },
  {
    name: 'ptAdd',
    description: 'Adds two points or vectors component-wise.',
    parameters: [
      { name: 'p1', type: 'table', description: 'First point/vector {x, y, z}' },
      { name: 'p2', type: 'table', description: 'Second point/vector {x, y, z}' }
    ],
    returnType: 'table',
    returnDescription: 'Sum of the two points/vectors',
    example: 'local sum = ADekoLib.ptAdd({1, 2, 3}, {4, 5, 6})',
    category: 'Point & Vector Operations',
    subcategory: 'Vector Operations',
    tags: ['addition', 'vector', 'arithmetic'],
    complexity: 'basic',
    usage: 'Use for vector addition and point displacement operations',
    seeAlso: ['ptSubtract', 'moveWithDeltaVec']
  },
  {
    name: 'ptSubtract',
    description: 'Subtracts the second point from the first point component-wise.',
    parameters: [
      { name: 'p1', type: 'table', description: 'First point/vector {x, y, z}' },
      { name: 'p2', type: 'table', description: 'Second point/vector {x, y, z}' }
    ],
    returnType: 'table',
    returnDescription: 'Difference of the two points/vectors',
    example: 'local diff = ADekoLib.ptSubtract({5, 7, 9}, {1, 2, 3})',
    category: 'Point & Vector Operations',
    subcategory: 'Vector Operations',
    tags: ['subtraction', 'vector', 'arithmetic'],
    complexity: 'basic',
    usage: 'Use to find displacement vectors or relative positions',
    seeAlso: ['ptAdd', 'distance']
  },
  {
    name: 'vecNormalize',
    description: 'Normalizes a vector to unit length (magnitude = 1).',
    parameters: [
      { name: 'v1', type: 'table', description: 'Vector to normalize {x, y, z}' }
    ],
    returnType: 'table',
    returnDescription: 'Normalized vector with magnitude 1',
    example: 'local unit = ADekoLib.vecNormalize({3, 4, 0})',
    category: 'Point & Vector Operations',
    subcategory: 'Vector Operations',
    tags: ['normalize', 'vector', 'unit'],
    complexity: 'intermediate',
    usage: 'Use to get direction vectors or normalize for calculations',
    seeAlso: ['vecScale', 'distance3D']
  },
  {
    name: 'vecScale',
    description: 'Scales a vector by a scalar factor.',
    parameters: [
      { name: 'v1', type: 'table', description: 'Vector to scale {x, y, z}' },
      { name: 'scale', type: 'number', description: 'Scale factor' }
    ],
    returnType: 'table',
    returnDescription: 'Scaled vector',
    example: 'local scaled = ADekoLib.vecScale({1, 2, 3}, 2.5)',
    category: 'Point & Vector Operations',
    subcategory: 'Vector Operations',
    tags: ['scale', 'vector', 'multiply'],
    complexity: 'basic',
    usage: 'Use to change vector magnitude while preserving direction',
    seeAlso: ['vecNormalize', 'vecNegate']
  },
  {
    name: 'vecNegate',
    description: 'Negates a vector (reverses its direction).',
    parameters: [
      { name: 'v1', type: 'table', description: 'Vector to negate {x, y, z}' }
    ],
    returnType: 'table',
    returnDescription: 'Negated vector',
    example: 'local opposite = ADekoLib.vecNegate({1, 2, 3})',
    category: 'Point & Vector Operations',
    subcategory: 'Vector Operations',
    tags: ['negate', 'vector', 'reverse'],
    complexity: 'basic',
    usage: 'Use to reverse vector direction',
    seeAlso: ['vecScale', 'ptSubtract']
  },

  // SHAPE GENERATION
  {
    name: 'circle',
    description: 'Creates a circle using bulge values for smooth curves. Uses 4 points with bulges.',
    parameters: [
      { name: 'p', type: 'table', description: 'Center point {x, y}' },
      { name: 'r', type: 'number', description: 'Radius of the circle' }
    ],
    returnType: 'void',
    returnDescription: 'Creates circle geometry in current shape',
    example: 'ADekoLib.circle({50, 50}, 25)',
    category: 'Shape Generation',
    subcategory: 'Basic Shapes',
    tags: ['circle', 'shape', 'geometry'],
    complexity: 'basic',
    usage: 'Use to create circular shapes for holes, decorative elements, or boundaries',
    seeAlso: ['ellipse', 'hole']
  },
  {
    name: 'rectangle',
    description: 'Creates a rectangle between two diagonal points with optional rounded corners.',
    parameters: [
      { name: 'p1', type: 'table', description: 'First corner point {x, y}' },
      { name: 'p2', type: 'table', description: 'Opposite corner point {x, y}' },
      { name: 'bulge', type: 'number', description: 'Optional bulge for rounded corners', optional: true, defaultValue: 0 }
    ],
    returnType: 'void',
    returnDescription: 'Creates rectangle geometry in current shape',
    example: 'ADekoLib.rectangle({0, 0}, {100, 50})',
    category: 'Shape Generation',
    subcategory: 'Basic Shapes',
    tags: ['rectangle', 'shape', 'basic'],
    complexity: 'basic',
    usage: 'Use to create rectangular shapes for panels, frames, or boundaries',
    seeAlso: ['line', 'makePart']
  },
  {
    name: 'line',
    description: 'Creates a line segment between two points with optional bulge for arcs.',
    parameters: [
      { name: 'p1', type: 'table', description: 'Start point {x, y}' },
      { name: 'p2', type: 'table', description: 'End point {x, y}' },
      { name: 'bulge', type: 'number', description: 'Optional bulge for arc', optional: true, defaultValue: 0 }
    ],
    returnType: 'void',
    returnDescription: 'Creates line geometry in current shape',
    example: 'ADekoLib.line({0, 0}, {100, 0})',
    category: 'Shape Generation',
    subcategory: 'Basic Shapes',
    tags: ['line', 'segment', 'basic'],
    complexity: 'basic',
    usage: 'Use to create straight edges, construction lines, or simple paths',
    seeAlso: ['polyline', 'dashLine']
  },
  {
    name: 'dashLine',
    description: 'Creates a dashed line between two points with specified number of segments.',
    parameters: [
      { name: 'pt1', type: 'table', description: 'Start point {x, y, z}' },
      { name: 'pt2', type: 'table', description: 'End point {x, y, z}' },
      { name: 'segCou', type: 'number', description: 'Number of dash segments', optional: true, defaultValue: 10 }
    ],
    returnType: 'void',
    returnDescription: 'Creates dashed line geometry',
    example: 'ADekoLib.dashLine({0, 0}, {100, 0}, 5)',
    category: 'Shape Generation',
    subcategory: 'Basic Shapes',
    tags: ['dash', 'line', 'segments'],
    complexity: 'intermediate',
    usage: 'Use to create dashed lines for construction or visual guides',
    seeAlso: ['line', 'polyline']
  },
  {
    name: 'ellipse',
    description: 'Creates an ellipse with specified width, height, and number of segments.',
    parameters: [
      { name: 'centerPoint', type: 'table', description: 'Center point {x, y}' },
      { name: 'width', type: 'number', description: 'Width of the ellipse' },
      { name: 'height', type: 'number', description: 'Height of the ellipse' },
      { name: 'noOfSegments', type: 'number', description: 'Number of line segments to approximate ellipse' }
    ],
    returnType: 'table',
    returnDescription: 'Array of points representing the ellipse',
    example: 'local ellipsePoints = ADekoLib.ellipse({50, 50}, 80, 40, 32)',
    category: 'Shape Generation',
    subcategory: 'Advanced Shapes',
    tags: ['ellipse', 'oval', 'curve'],
    complexity: 'intermediate',
    usage: 'Use to create oval shapes or elliptical boundaries',
    seeAlso: ['circle', 'ellipticArc']
  },
  {
    name: 'ellipticArc',
    description: 'Creates an elliptical arc with specified parameters and angle range.',
    parameters: [
      { name: 'centerPoint', type: 'table', description: 'Center point {x, y}' },
      { name: 'width', type: 'number', description: 'Width of the ellipse' },
      { name: 'height', type: 'number', description: 'Height of the ellipse' },
      { name: 'noOfSegments', type: 'number', description: 'Number of line segments' },
      { name: 'startAngle', type: 'number', description: 'Start angle in degrees' },
      { name: 'endAngle', type: 'number', description: 'End angle in degrees' }
    ],
    returnType: 'table',
    returnDescription: 'Array of points representing the elliptical arc',
    example: 'local arc = ADekoLib.ellipticArc({50, 50}, 80, 40, 16, 0, 90)',
    category: 'Shape Generation',
    subcategory: 'Advanced Shapes',
    tags: ['ellipse', 'arc', 'curve'],
    complexity: 'intermediate',
    usage: 'Use to create partial elliptical curves',
    seeAlso: ['ellipse', 'circularArc']
  },
  {
    name: 'circularArc',
    description: 'Creates a circular arc with specified diameter and angle range.',
    parameters: [
      { name: 'centerPoint', type: 'table', description: 'Center point {x, y}' },
      { name: 'diameter', type: 'number', description: 'Diameter of the circle' },
      { name: 'noOfSegments', type: 'number', description: 'Number of line segments' },
      { name: 'startAngle', type: 'number', description: 'Start angle in degrees' },
      { name: 'endAngle', type: 'number', description: 'End angle in degrees' }
    ],
    returnType: 'table',
    returnDescription: 'Array of points representing the circular arc',
    example: 'local arc = ADekoLib.circularArc({50, 50}, 40, 16, 0, 90)',
    category: 'Shape Generation',
    subcategory: 'Advanced Shapes',
    tags: ['arc', 'circle', 'curve'],
    complexity: 'intermediate',
    usage: 'Use to create smooth curved paths or decorative arcs',
    seeAlso: ['ellipticArc', 'circle']
  },

  // POLYLINE OPERATIONS
  {
    name: 'polyline',
    description: 'Creates a polyline from a variable number of points. Supports bulge values for arcs.',
    parameters: [
      { name: '...', type: 'table', description: 'Variable number of points {x, y, z, bulge}' }
    ],
    returnType: 'void',
    returnDescription: 'Creates polyline geometry in current shape',
    example: 'ADekoLib.polyline({0,0}, {100,0}, {100,50}, {0,50})',
    category: 'Polyline Operations',
    subcategory: 'Creation',
    tags: ['polyline', 'path', 'shape'],
    complexity: 'basic',
    usage: 'Use to create complex paths and shapes from multiple connected points',
    seeAlso: ['line', 'polylineimp']
  },
  {
    name: 'polylineimp',
    description: 'Creates a polyline from an array of points. Alternative to polyline() for large point arrays.',
    parameters: [
      { name: 'inputPoints', type: 'table', description: 'Array of points defining the polyline' }
    ],
    returnType: 'void',
    returnDescription: 'Creates polyline geometry in current shape',
    example: 'ADekoLib.polylineimp({{0,0}, {100,0}, {100,50}, {0,50}})',
    category: 'Polyline Operations',
    subcategory: 'Creation',
    tags: ['polyline', 'array', 'path'],
    complexity: 'basic',
    usage: 'Use when you have points in an array or for programmatically generated paths',
    seeAlso: ['polyline', 'joinPolylines']
  },

  // MACHINING OPERATIONS
  {
    name: 'groove',
    description: 'Creates a linear groove (cut) between two points with specified depth.',
    parameters: [
      { name: 'startPoint', type: 'table', description: 'Start point of groove {x, y}' },
      { name: 'endPoint', type: 'table', description: 'End point of groove {x, y}' },
      { name: 'depth', type: 'number', description: 'Depth of the groove (negative for cuts)' }
    ],
    returnType: 'void',
    returnDescription: 'Creates groove machining operation',
    example: 'ADekoLib.groove({10, 10}, {90, 10}, -5)',
    category: 'Machining Operations',
    subcategory: 'Basic Operations',
    tags: ['groove', 'machining', 'cut'],
    complexity: 'basic',
    usage: 'Use to create linear cuts for joinery, decoration, or functional grooves',
    seeAlso: ['hole', 'pocket']
  },
  {
    name: 'hole',
    description: 'Creates a circular hole at the specified location with given radius and depth.',
    parameters: [
      { name: 'centerPoint', type: 'table', description: 'Center point of hole {x, y}' },
      { name: 'radius', type: 'number', description: 'Radius of the hole' },
      { name: 'depth', type: 'number', description: 'Depth of the hole (negative for cuts)' }
    ],
    returnType: 'void',
    returnDescription: 'Creates hole machining operation',
    example: 'ADekoLib.hole({50, 50}, 5, -10)',
    category: 'Machining Operations',
    subcategory: 'Basic Operations',
    tags: ['hole', 'drilling', 'machining'],
    complexity: 'basic',
    usage: 'Use to create holes for screws, dowels, or decorative purposes',
    seeAlso: ['circle', 'pocket']
  },
  {
    name: 'pocket',
    description: 'Creates a rectangular pocket (area removal) with tool compensation.',
    parameters: [
      { name: 'firstPoint', type: 'table', description: 'First corner of pocket {x, y}' },
      { name: 'secondPoint', type: 'table', description: 'Opposite corner of pocket {x, y}' },
      { name: 'depth', type: 'number', description: 'Depth of the pocket (negative)' },
      { name: 'cToolDiameter', type: 'number', description: 'Cutting tool diameter' }
    ],
    returnType: 'void',
    returnDescription: 'Creates pocket machining operation',
    example: 'ADekoLib.pocket({10, 10}, {90, 40}, -5, 6)',
    category: 'Machining Operations',
    subcategory: 'Basic Operations',
    tags: ['pocket', 'machining', 'area-removal'],
    complexity: 'intermediate',
    usage: 'Use to remove material from rectangular areas for recesses or clearances',
    seeAlso: ['inclinedPocket', 'cleanCorners']
  },

  // NEWLY ADDED FUNCTIONS - FIRST BATCH (114-128)
  {
    name: 'node',
    description: 'Creates points with bulges. Original name for point() function.',
    parameters: [
      { name: 'x', type: 'number', description: 'X-coordinate' },
      { name: 'y', type: 'number', description: 'Y-coordinate' },
      { name: 'z', type: 'number', description: 'Z-coordinate', optional: true, defaultValue: 0 },
      { name: 'bulge', type: 'number', description: 'Bulge value for arc', optional: true, defaultValue: 0 }
    ],
    returnType: 'void',
    returnDescription: 'Creates a point in current shape',
    example: 'ADekoLib.node(10, 20, 0, 0)',
    category: 'Shape Generation',
    subcategory: 'Basic Shapes',
    tags: ['node', 'point', 'basic'],
    complexity: 'basic',
    usage: 'Use to create individual points when building shapes manually',
    seeAlso: ['point', 'nextShape']
  },
  {
    name: 'nodeSize',
    description: 'Returns the number of points for a given shape. Original name for pointSize().',
    parameters: [
      { name: 'dataIndex', type: 'number', description: 'Shape index' }
    ],
    returnType: 'number',
    returnDescription: 'Number of points in the shape',
    example: 'local pointCount = ADekoLib.nodeSize(1)',
    category: 'Analysis & Testing',
    subcategory: 'Data Query',
    tags: ['node', 'count', 'query', 'shape'],
    complexity: 'basic',
    usage: 'Use to get the number of points in a specific shape',
    seeAlso: ['dataSize', 'nodeFeature']
  },
  {
    name: 'nodeFeature',
    description: 'Returns x, y, z, and bulge of a point for a given shape. Original name for pointFeature().',
    parameters: [
      { name: 'xyzbulge', type: 'number', description: 'Feature type: 0=X, 1=Y, 2=Z, 3=bulge' },
      { name: 'dataIndex', type: 'number', description: 'Shape index' },
      { name: 'pointIndex', type: 'number', description: 'Point index' }
    ],
    returnType: 'number',
    returnDescription: 'The requested coordinate or bulge value',
    example: 'local x = ADekoLib.nodeFeature(0, 1, 1) -- Get X of first point',
    category: 'Analysis & Testing',
    subcategory: 'Data Query',
    tags: ['node', 'coordinate', 'bulge', 'query'],
    complexity: 'intermediate',
    usage: 'Use to extract specific coordinate values from points',
    seeAlso: ['nodeSize', 'dataSize']
  },
  {
    name: 'nextNode',
    description: 'Moves the point index forward. Used internally. Original name for nextPoint().',
    parameters: [],
    returnType: 'void',
    returnDescription: 'Advances to next point',
    example: 'ADekoLib.nextNode() -- Internal use',
    category: 'Utilities',
    subcategory: 'System Functions',
    tags: ['internal', 'node', 'index'],
    complexity: 'advanced',
    usage: 'Internal function for point management',
    seeAlso: ['nextPoint', 'node']
  },
  {
    name: 'showPoints',
    description: 'Enables/disables the display of points as small circles for visualization.',
    parameters: [
      { name: 'show', type: 'boolean', description: 'True to show points, false to hide' }
    ],
    returnType: 'void',
    returnDescription: 'Sets point visibility mode',
    example: 'ADekoLib.showPoints(true)',
    category: 'Utilities',
    subcategory: 'Visualization',
    tags: ['points', 'visualization', 'debug'],
    complexity: 'basic',
    usage: 'Use to visualize point locations during development',
    seeAlso: ['labelPoints', 'enableListing']
  },
  {
    name: 'unpack',
    description: 'Unpacks a table into individual values. Lua standard function wrapper.',
    parameters: [
      { name: 'table', type: 'table', description: 'Table to unpack' }
    ],
    returnType: 'multiple',
    returnDescription: 'Individual values from the table',
    example: 'local x, y, z = ADekoLib.unpack({1, 2, 3})',
    category: 'Utilities',
    subcategory: 'Data Processing',
    tags: ['unpack', 'table', 'utility'],
    complexity: 'basic',
    usage: 'Use to convert table elements to individual arguments',
    seeAlso: ['checkInput', 'deepcopy']
  },
  {
    name: 'validateNumber',
    description: 'Validates that a value is a valid number and optionally within a range.',
    parameters: [
      { name: 'value', type: 'any', description: 'Value to validate' },
      { name: 'min', type: 'number', description: 'Minimum allowed value', optional: true },
      { name: 'max', type: 'number', description: 'Maximum allowed value', optional: true }
    ],
    returnType: 'boolean',
    returnDescription: 'True if value is a valid number within range',
    example: 'local valid = ADekoLib.validateNumber(value, 0, 100)',
    category: 'Analysis & Testing',
    subcategory: 'Validation',
    tags: ['validation', 'number', 'range'],
    complexity: 'basic',
    usage: 'Use to validate numeric inputs before processing',
    seeAlso: ['areRoughlyEqual', 'checkFuzzy']
  },
  {
    name: 'sortCCW',
    description: 'Sorts points in counter-clockwise order around their centroid.',
    parameters: [
      { name: 'points', type: 'table', description: 'Array of points to sort' }
    ],
    returnType: 'table',
    returnDescription: 'Points sorted in counter-clockwise order',
    example: 'local sorted = ADekoLib.sortCCW(polygonPoints)',
    category: 'Utilities',
    subcategory: 'Sorting',
    tags: ['sort', 'counter-clockwise', 'polygon'],
    complexity: 'intermediate',
    usage: 'Use to ensure consistent polygon winding for area calculations',
    seeAlso: ['sortCW', 'center']
  },
  {
    name: 'sortCW',
    description: 'Sorts points in clockwise order around their centroid.',
    parameters: [
      { name: 'points', type: 'table', description: 'Array of points to sort' }
    ],
    returnType: 'table',
    returnDescription: 'Points sorted in clockwise order',
    example: 'local sorted = ADekoLib.sortCW(polygonPoints)',
    category: 'Utilities',
    subcategory: 'Sorting',
    tags: ['sort', 'clockwise', 'polygon'],
    complexity: 'intermediate',
    usage: 'Use to ensure consistent polygon winding for machining operations',
    seeAlso: ['sortCCW', 'center']
  },
  {
    name: 'yIntercept',
    description: 'Calculates the Y-intercept of a line passing through two points.',
    parameters: [
      { name: 'x1', type: 'number', description: 'X-coordinate of first point' },
      { name: 'y1', type: 'number', description: 'Y-coordinate of first point' },
      { name: 'x2', type: 'number', description: 'X-coordinate of second point' },
      { name: 'y2', type: 'number', description: 'Y-coordinate of second point' }
    ],
    returnType: 'number',
    returnDescription: 'Y-intercept value',
    example: 'local b = ADekoLib.yIntercept(0, 5, 10, 15) -- Returns 5',
    category: 'Point & Vector Operations',
    subcategory: 'Line Operations',
    tags: ['intercept', 'line', 'geometry'],
    complexity: 'basic',
    usage: 'Use to find where a line crosses the Y-axis',
    seeAlso: ['slope', 'lineLineIntersection']
  },
  {
    name: 'radius',
    description: 'Calculates the radius of a circle passing through three points.',
    parameters: [
      { name: 'p1', type: 'table', description: 'First point {x, y}' },
      { name: 'p2', type: 'table', description: 'Second point {x, y}' },
      { name: 'p3', type: 'table', description: 'Third point {x, y}' }
    ],
    returnType: 'number',
    returnDescription: 'Radius of the circle',
    example: 'local r = ADekoLib.radius({0, 0}, {10, 0}, {5, 5})',
    category: 'Point & Vector Operations',
    subcategory: 'Circle Operations',
    tags: ['radius', 'circle', 'geometry'],
    complexity: 'intermediate',
    usage: 'Use to find the radius of a circle defined by three points',
    seeAlso: ['bulge', 'circularArc']
  },
  {
    name: 'scaleDepth',
    description: 'Scales the Z-coordinates (depth) of points by a factor.',
    parameters: [
      { name: 'points', type: 'table', description: 'Array of points with Z-coordinates' },
      { name: 'scaleFactor', type: 'number', description: 'Scale factor for Z-coordinates' }
    ],
    returnType: 'table',
    returnDescription: 'Points with scaled Z-coordinates',
    example: 'local scaled = ADekoLib.scaleDepth(points3D, 2.0)',
    category: 'Point & Vector Operations',
    subcategory: 'Vector Operations',
    tags: ['scale', 'depth', '3D'],
    complexity: 'basic',
    usage: 'Use to adjust depth values for 3D operations',
    seeAlso: ['vecScale', 'removeBackgroundAtTop']
  }
]
