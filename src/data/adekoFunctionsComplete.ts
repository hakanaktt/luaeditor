import { AdekoFunction } from '../types'

/**
 * Complete AdekoLib Function Catalog - All 137 Functions
 * 
 * This file contains the complete documentation for all 137 functions
 * found in AdekoLib.lua, organized by category with detailed documentation.
 */

export const allAdekoFunctions: AdekoFunction[] = [
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
  {
    name: 'inclinedPocket',
    description: 'Creates an inclined pocket with variable depth across the area.',
    parameters: [
      { name: 'firstPoint', type: 'table', description: 'First corner {x, y}' },
      { name: 'secondPoint', type: 'table', description: 'Second corner {x, y}' },
      { name: 'depth', type: 'number', description: 'Maximum depth' },
      { name: 'step', type: 'number', description: 'Step distance between passes' },
      { name: 'toolDiameter', type: 'number', description: 'Tool diameter' },
      { name: 'direction', type: 'string', description: 'Direction: "h" or "v"' },
      { name: 'dontCreateReturnAsPolygon', type: 'boolean', description: 'Return as polygon flag', optional: true, defaultValue: false }
    ],
    returnType: 'void|table',
    returnDescription: 'Creates inclined pocket or returns polygon if flag set',
    example: 'ADekoLib.inclinedPocket({10, 10}, {90, 40}, -10, 5, 6, "h")',
    category: 'Machining Operations',
    subcategory: 'Advanced Operations',
    tags: ['pocket', 'inclined', 'variable-depth'],
    complexity: 'advanced',
    usage: 'Use for creating sloped surfaces or variable depth pockets',
    seeAlso: ['pocket', 'inclinedPocket2']
  },
  {
    name: 'inclinedPocket2',
    description: 'Alternative inclined pocket implementation with different parameters.',
    parameters: [
      { name: 'firstPoint', type: 'table', description: 'First corner {x, y}' },
      { name: 'secondPoint', type: 'table', description: 'Second corner {x, y}' },
      { name: 'depth', type: 'number', description: 'Depth value' },
      { name: 'step', type: 'number', description: 'Step distance' },
      { name: 'toolDiameter', type: 'number', description: 'Tool diameter' },
      { name: 'dontCreateReturnAsPolygon', type: 'boolean', description: 'Return flag', optional: true, defaultValue: false }
    ],
    returnType: 'void|table',
    returnDescription: 'Creates inclined pocket or returns polygon',
    example: 'ADekoLib.inclinedPocket2({10, 10}, {90, 40}, -10, 5, 6)',
    category: 'Machining Operations',
    subcategory: 'Advanced Operations',
    tags: ['pocket', 'inclined', 'alternative'],
    complexity: 'advanced',
    usage: 'Alternative method for creating inclined pockets',
    seeAlso: ['inclinedPocket', 'inclinedPocket2Prim']
  },
  {
    name: 'sunkenFrame',
    description: 'Creates a sunken frame with V-tool cutting around a rectangular area.',
    parameters: [
      { name: 'fp', type: 'table', description: 'First point {x, y}' },
      { name: 'sp', type: 'table', description: 'Second point {x, y}' },
      { name: 'depth', type: 'number', description: 'Frame depth' },
      { name: 'vToolAngle', type: 'number', description: 'V-tool angle in degrees' },
      { name: 'vToolDiameter', type: 'number', description: 'V-tool diameter' }
    ],
    returnType: 'void',
    returnDescription: 'Creates sunken frame machining operation',
    example: 'ADekoLib.sunkenFrame({10, 10}, {90, 40}, -3, 60, 8)',
    category: 'Machining Operations',
    subcategory: 'Advanced Operations',
    tags: ['frame', 'v-tool', 'decorative'],
    complexity: 'advanced',
    usage: 'Use to create decorative sunken frames around panels',
    seeAlso: ['sunkenFrameAny', 'cleanCorners']
  },
  {
    name: 'sunkenFrameAny',
    description: 'Creates a sunken frame for any polygon shape with V-tool cutting.',
    parameters: [
      { name: 'inputPoints', type: 'table', description: 'Array of points defining the shape' },
      { name: 'cornerArcDivider', type: 'number', description: 'Corner arc division factor' },
      { name: 'depth', type: 'number', description: 'Frame depth' },
      { name: 'vToolAngle', type: 'number', description: 'V-tool angle' },
      { name: 'vToolDiameter', type: 'number', description: 'V-tool diameter' },
      { name: 'reverseDirection', type: 'boolean', description: 'Reverse cutting direction', optional: true, defaultValue: false }
    ],
    returnType: 'void',
    returnDescription: 'Creates sunken frame for polygon',
    example: 'ADekoLib.sunkenFrameAny(polygonPoints, 4, -3, 60, 8)',
    category: 'Machining Operations',
    subcategory: 'Advanced Operations',
    tags: ['frame', 'polygon', 'v-tool'],
    complexity: 'advanced',
    usage: 'Use to create decorative frames around complex shapes',
    seeAlso: ['sunkenFrame', 'offSet']
  },
  {
    name: 'cleanCorners',
    description: 'Cleans corners of a rectangular area by removing material at corners.',
    parameters: [
      { name: 'firstPoint', type: 'table', description: 'First corner {x, y}' },
      { name: 'secondPoint', type: 'table', description: 'Second corner {x, y}' },
      { name: 'depth', type: 'number', description: 'Cleaning depth' },
      { name: 'cToolDiameter', type: 'number', description: 'Tool diameter' }
    ],
    returnType: 'void',
    returnDescription: 'Creates corner cleaning operations',
    example: 'ADekoLib.cleanCorners({10, 10}, {90, 40}, -2, 6)',
    category: 'Machining Operations',
    subcategory: 'Advanced Operations',
    tags: ['corners', 'cleaning', 'finishing'],
    complexity: 'intermediate',
    usage: 'Use to clean up corners after pocket operations',
    seeAlso: ['pocket', 'sunkenFrame']
  },

  // ANALYSIS & TESTING
  {
    name: 'isPointInsidePolygon',
    description: 'Tests whether a point lies inside a polygon using ray casting algorithm.',
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
    name: 'areParallell',
    description: 'Tests if three points are collinear (on the same line) using distance comparison.',
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
    name: 'areRoughlyEqual',
    description: 'Compares two numbers with tolerance for floating-point precision issues.',
    parameters: [
      { name: 'a', type: 'number', description: 'First number' },
      { name: 'b', type: 'number', description: 'Second number' },
      { name: 'Tolerance', type: 'number', description: 'Comparison tolerance', optional: true, defaultValue: 0.0000001 }
    ],
    returnType: 'boolean',
    returnDescription: 'True if numbers are approximately equal',
    example: 'local equal = ADekoLib.areRoughlyEqual(1.0000001, 1.0000002)',
    category: 'Analysis & Testing',
    subcategory: 'Validation',
    tags: ['comparison', 'tolerance', 'floating-point'],
    complexity: 'basic',
    usage: 'Use for robust floating-point number comparisons',
    seeAlso: ['checkFuzzy', 'validateNumber']
  },
  {
    name: 'areRotationsEqual',
    description: 'Compares two 3x3 rotation matrices for equality with tolerance.',
    parameters: [
      { name: 'a', type: 'table', description: 'First rotation matrix (3x3)' },
      { name: 'b', type: 'table', description: 'Second rotation matrix (3x3)' }
    ],
    returnType: 'boolean',
    returnDescription: 'True if rotation matrices are equal',
    example: 'local same = ADekoLib.areRotationsEqual(matrix1, matrix2)',
    category: 'Analysis & Testing',
    subcategory: 'Validation',
    tags: ['rotation', 'matrix', 'comparison'],
    complexity: 'advanced',
    usage: 'Use to compare 3D orientations or face directions',
    seeAlso: ['multiplyRotationMatrixes', 'setFace']
  },
  {
    name: 'checkFuzzy',
    description: 'Quick fuzzy comparison of two numbers with fixed small tolerance.',
    parameters: [
      { name: 'number1', type: 'number', description: 'First number' },
      { name: 'number2', type: 'number', description: 'Second number' }
    ],
    returnType: 'boolean',
    returnDescription: 'True if numbers are approximately equal',
    example: 'local equal = ADekoLib.checkFuzzy(1.0000001, 1.0000002)',
    category: 'Analysis & Testing',
    subcategory: 'Validation',
    tags: ['fuzzy', 'comparison', 'tolerance'],
    complexity: 'basic',
    usage: 'Use for quick approximate number comparisons',
    seeAlso: ['areRoughlyEqual', 'validateNumber']
  },
  {
    name: 'isMiddle',
    description: 'Tests if value b is between values a and c.',
    parameters: [
      { name: 'a', type: 'number', description: 'First boundary value' },
      { name: 'b', type: 'number', description: 'Test value' },
      { name: 'c', type: 'number', description: 'Second boundary value' }
    ],
    returnType: 'boolean',
    returnDescription: 'True if b is between a and c',
    example: 'local between = ADekoLib.isMiddle(10, 15, 20)',
    category: 'Analysis & Testing',
    subcategory: 'Validation',
    tags: ['range', 'between', 'validation'],
    complexity: 'basic',
    usage: 'Use to test if values are within ranges',
    seeAlso: ['areRoughlyEqual', 'checkFuzzy']
  },
  {
    name: 'lineLineIntersection',
    description: 'Finds intersection point of two lines or line segments.',
    parameters: [
      { name: 'p1', type: 'table', description: 'First point of first line {x, y}' },
      { name: 'p2', type: 'table', description: 'Second point of first line {x, y}' },
      { name: 'p3', type: 'table', description: 'First point of second line {x, y}' },
      { name: 'p4', type: 'table', description: 'Second point of second line {x, y}' },
      { name: 'onSegment', type: 'boolean', description: 'Check segment intersection only', optional: true, defaultValue: false }
    ],
    returnType: 'table|null',
    returnDescription: 'Intersection point {x, y} or null if no intersection',
    example: 'local intersection = ADekoLib.lineLineIntersection({0,0}, {10,10}, {0,10}, {10,0})',
    category: 'Analysis & Testing',
    subcategory: 'Intersections',
    tags: ['intersection', 'lines', 'geometry'],
    complexity: 'intermediate',
    usage: 'Use to find where lines cross for trimming or geometric analysis',
    seeAlso: ['circleLineIntersection', 'ellipseLineIntersection']
  },
  {
    name: 'circleLineIntersection',
    description: 'Finds intersection points between a circle and a line.',
    parameters: [
      { name: 'pc', type: 'table', description: 'Circle center point {x, y}' },
      { name: 'radius', type: 'number', description: 'Circle radius' },
      { name: 'p1', type: 'table', description: 'First point of line {x, y}' },
      { name: 'p2', type: 'table', description: 'Second point of line {x, y}' }
    ],
    returnType: 'table|boolean',
    returnDescription: 'Array of intersection points or false if no intersection',
    example: 'local intersections = ADekoLib.circleLineIntersection({0,0}, 5, {-10,0}, {10,0})',
    category: 'Analysis & Testing',
    subcategory: 'Intersections',
    tags: ['intersection', 'circle', 'line'],
    complexity: 'intermediate',
    usage: 'Use to find where lines intersect circles',
    seeAlso: ['lineLineIntersection', 'circleCircleIntersection']
  },
  {
    name: 'circleCircleIntersection',
    description: 'Finds intersection points between two circles.',
    parameters: [
      { name: 'p1', type: 'table', description: 'First circle center {x, y}' },
      { name: 'radius1', type: 'number', description: 'First circle radius' },
      { name: 'p2', type: 'table', description: 'Second circle center {x, y}' },
      { name: 'radius2', type: 'number', description: 'Second circle radius' }
    ],
    returnType: 'table|boolean',
    returnDescription: 'Array of intersection points or false if no intersection',
    example: 'local intersections = ADekoLib.circleCircleIntersection({0,0}, 5, {8,0}, 5)',
    category: 'Analysis & Testing',
    subcategory: 'Intersections',
    tags: ['intersection', 'circles', 'geometry'],
    complexity: 'intermediate',
    usage: 'Use to find where two circles intersect',
    seeAlso: ['circleLineIntersection', 'distance']
  },
  {
    name: 'ellipseLineIntersection',
    description: 'Finds intersection points between an ellipse and a line.',
    parameters: [
      { name: 'center', type: 'table', description: 'Ellipse center {x, y}' },
      { name: 'width', type: 'number', description: 'Ellipse width' },
      { name: 'height', type: 'number', description: 'Ellipse height' },
      { name: 'N', type: 'number', description: 'Number of segments for ellipse approximation' },
      { name: 'p1', type: 'table', description: 'First point of line {x, y}' },
      { name: 'p2', type: 'table', description: 'Second point of line {x, y}' }
    ],
    returnType: 'table',
    returnDescription: 'Array of intersection points',
    example: 'local intersections = ADekoLib.ellipseLineIntersection({0,0}, 10, 6, 32, {-15,0}, {15,0})',
    category: 'Analysis & Testing',
    subcategory: 'Intersections',
    tags: ['intersection', 'ellipse', 'line'],
    complexity: 'advanced',
    usage: 'Use to find where lines intersect ellipses',
    seeAlso: ['ellipticArcLineIntersection', 'circleLineIntersection']
  },
  {
    name: 'ellipticArcLineIntersection',
    description: 'Finds intersection points between an elliptical arc and a line.',
    parameters: [
      { name: 'center', type: 'table', description: 'Arc center {x, y}' },
      { name: 'width', type: 'number', description: 'Arc width' },
      { name: 'height', type: 'number', description: 'Arc height' },
      { name: 'N', type: 'number', description: 'Number of segments' },
      { name: 'startAngle', type: 'number', description: 'Start angle in degrees' },
      { name: 'endAngle', type: 'number', description: 'End angle in degrees' },
      { name: 'p1', type: 'table', description: 'First point of line {x, y}' },
      { name: 'p2', type: 'table', description: 'Second point of line {x, y}' }
    ],
    returnType: 'table',
    returnDescription: 'Array of intersection points',
    example: 'local intersections = ADekoLib.ellipticArcLineIntersection({0,0}, 10, 6, 16, 0, 90, {-5,0}, {5,10})',
    category: 'Analysis & Testing',
    subcategory: 'Intersections',
    tags: ['intersection', 'ellipse', 'arc', 'line'],
    complexity: 'advanced',
    usage: 'Use to find where lines intersect elliptical arcs',
    seeAlso: ['ellipseLineIntersection', 'ellipticArc']
  },

  // SORTING & ORGANIZATION
  {
    name: 'sortHorizontal',
    description: 'Sorts points horizontally by X-coordinate in ascending order.',
    parameters: [
      { name: 'points', type: 'table', description: 'Array of points to sort' }
    ],
    returnType: 'void',
    returnDescription: 'Sorts the input array in-place',
    example: 'ADekoLib.sortHorizontal(points) -- Sorts by X coordinate',
    category: 'Utilities',
    subcategory: 'Sorting',
    tags: ['sort', 'horizontal', 'x-coordinate'],
    complexity: 'basic',
    usage: 'Use to organize points from left to right',
    seeAlso: ['sortVertical', 'sortDepth']
  },
  {
    name: 'sortVertical',
    description: 'Sorts points vertically by Y-coordinate in ascending order.',
    parameters: [
      { name: 'points', type: 'table', description: 'Array of points to sort' }
    ],
    returnType: 'void',
    returnDescription: 'Sorts the input array in-place',
    example: 'ADekoLib.sortVertical(points) -- Sorts by Y coordinate',
    category: 'Utilities',
    subcategory: 'Sorting',
    tags: ['sort', 'vertical', 'y-coordinate'],
    complexity: 'basic',
    usage: 'Use to organize points from bottom to top',
    seeAlso: ['sortHorizontal', 'sortDepth']
  },
  {
    name: 'sortDepth',
    description: 'Sorts points by Z-coordinate (depth) in ascending order.',
    parameters: [
      { name: 'points', type: 'table', description: 'Array of points to sort' }
    ],
    returnType: 'void',
    returnDescription: 'Sorts the input array in-place',
    example: 'ADekoLib.sortDepth(points) -- Sorts by Z coordinate',
    category: 'Utilities',
    subcategory: 'Sorting',
    tags: ['sort', 'depth', 'z-coordinate'],
    complexity: 'basic',
    usage: 'Use to organize points by depth for 3D operations',
    seeAlso: ['sortHorizontal', 'sortVertical']
  },
  {
    name: 'sortCCW',
    description: 'Sorts points in counter-clockwise order around their centroid.',
    parameters: [
      { name: 'points', type: 'table', description: 'Array of points to sort' }
    ],
    returnType: 'void',
    returnDescription: 'Sorts the input array in-place',
    example: 'ADekoLib.sortCCW(points) -- Counter-clockwise order',
    category: 'Utilities',
    subcategory: 'Sorting',
    tags: ['sort', 'counter-clockwise', 'angular'],
    complexity: 'intermediate',
    usage: 'Use to create proper polygon winding for positive areas',
    seeAlso: ['sortCW', 'center']
  },
  {
    name: 'sortCW',
    description: 'Sorts points in clockwise order around their centroid.',
    parameters: [
      { name: 'points', type: 'table', description: 'Array of points to sort' }
    ],
    returnType: 'void',
    returnDescription: 'Sorts the input array in-place',
    example: 'ADekoLib.sortCW(points) -- Clockwise order',
    category: 'Utilities',
    subcategory: 'Sorting',
    tags: ['sort', 'clockwise', 'angular'],
    complexity: 'intermediate',
    usage: 'Use to create proper polygon winding for negative areas',
    seeAlso: ['sortCCW', 'center']
  },

  // SCALING OPERATIONS
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
    subcategory: 'Scaling',
    tags: ['scale', 'horizontal', 'normalize'],
    complexity: 'intermediate',
    usage: 'Use to fit shapes within specific width constraints',
    seeAlso: ['scaleVertical', 'scaleDepth']
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
    subcategory: 'Scaling',
    tags: ['scale', 'vertical', 'normalize'],
    complexity: 'intermediate',
    usage: 'Use to fit shapes within specific height constraints',
    seeAlso: ['scaleHorizontal', 'scaleDepth']
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
    subcategory: 'Scaling',
    tags: ['scale', 'depth', 'normalize'],
    complexity: 'intermediate',
    usage: 'Use to normalize depth values for consistent machining operations',
    seeAlso: ['scaleHorizontal', 'scaleVertical']
  },

  // MATHEMATICAL UTILITIES
  {
    name: 'unpack',
    description: 'Alternative to table.unpack for larger tables. Recursively unpacks table elements.',
    parameters: [
      { name: 't', type: 'table', description: 'Table to unpack' },
      { name: 'i', type: 'number', description: 'Starting index', optional: true, defaultValue: 1 }
    ],
    returnType: 'multiple',
    returnDescription: 'All elements of the table as separate return values',
    example: 'local a, b, c = ADekoLib.unpack({1, 2, 3})',
    category: 'Utilities',
    subcategory: 'Data Manipulation',
    tags: ['unpack', 'table', 'utility'],
    complexity: 'basic',
    usage: 'Use as alternative to table.unpack for larger tables',
    seeAlso: ['deepcopy']
  },
  {
    name: 'quadraticRoots',
    description: 'Returns quadratic roots of an equation ax² + bx + c = 0.',
    parameters: [
      { name: 'a', type: 'number', description: 'Coefficient of x²' },
      { name: 'b', type: 'number', description: 'Coefficient of x' },
      { name: 'c', type: 'number', description: 'Constant term' }
    ],
    returnType: 'number|boolean',
    returnDescription: 'Two roots or false if no real roots exist',
    example: 'local root1, root2 = ADekoLib.quadraticRoots(1, -5, 6)',
    category: 'Utilities',
    subcategory: 'Mathematical Functions',
    tags: ['quadratic', 'roots', 'equation', 'math'],
    complexity: 'intermediate',
    usage: 'Use to solve quadratic equations in geometric calculations',
    seeAlso: ['validateNumber', 'slope']
  },
  {
    name: 'radius',
    description: 'Returns radius of an arc between two points for a given bulge value.',
    parameters: [
      { name: 'p1', type: 'table', description: 'First point {x, y}' },
      { name: 'p2', type: 'table', description: 'Second point {x, y}' },
      { name: 'bulge', type: 'number', description: 'Bulge value of the arc' }
    ],
    returnType: 'number',
    returnDescription: 'Radius of the arc',
    example: 'local r = ADekoLib.radius({0, 0}, {10, 0}, 0.5)',
    category: 'Point & Vector Operations',
    subcategory: 'Arc Operations',
    tags: ['radius', 'arc', 'bulge', 'geometry'],
    complexity: 'intermediate',
    usage: 'Use to calculate arc radius from bulge values',
    seeAlso: ['bulge', 'circularArc']
  },
  {
    name: 'validateNumber',
    description: 'Check if input is actually a practically finite number (not NaN or infinite).',
    parameters: [
      { name: 'n', type: 'any', description: 'Value to validate' }
    ],
    returnType: 'boolean',
    returnDescription: 'True if input is a valid finite number',
    example: 'local isValid = ADekoLib.validateNumber(42.5)',
    category: 'Analysis & Testing',
    subcategory: 'Validation',
    tags: ['validation', 'number', 'finite', 'check'],
    complexity: 'basic',
    usage: 'Use to validate numeric inputs before calculations',
    seeAlso: ['areRoughlyEqual', 'checkFuzzy']
  },
  {
    name: 'yIntercept',
    description: 'Returns the y-intercept of a line given two points or a point and slope.',
    parameters: [
      { name: 'x', type: 'number', description: 'X-coordinate of known point' },
      { name: 'y', type: 'number', description: 'Y-coordinate of known point' },
      { name: '...', type: 'number', description: 'Either slope or second point coordinates' }
    ],
    returnType: 'number',
    returnDescription: 'Y-intercept of the line',
    example: 'local intercept = ADekoLib.yIntercept(2, 5, 1.5) -- point and slope',
    category: 'Point & Vector Operations',
    subcategory: 'Line Operations',
    tags: ['intercept', 'line', 'slope', 'geometry'],
    complexity: 'intermediate',
    usage: 'Use to find where a line crosses the Y-axis',
    seeAlso: ['slope', 'lineLineIntersection']
  },
  {
    name: 'checkInput',
    description: 'Handle variable-argument functions and whether they are passed as func{table} or func(unpack(table)).',
    parameters: [
      { name: '...', type: 'any', description: 'Variable arguments to process' }
    ],
    returnType: 'table',
    returnDescription: 'Normalized input as table',
    example: 'local input = ADekoLib.checkInput(1, 2, 3)',
    category: 'Utilities',
    subcategory: 'Input Processing',
    tags: ['input', 'arguments', 'variadic', 'utility'],
    complexity: 'advanced',
    usage: 'Use internally to handle variable argument functions',
    seeAlso: ['unpack']
  },
  {
    name: 'slope',
    description: 'Returns the slope of a line defined by two points.',
    parameters: [
      { name: 'x1', type: 'number', description: 'X-coordinate of first point' },
      { name: 'y1', type: 'number', description: 'Y-coordinate of first point' },
      { name: 'x2', type: 'number', description: 'X-coordinate of second point' },
      { name: 'y2', type: 'number', description: 'Y-coordinate of second point' }
    ],
    returnType: 'number|boolean',
    returnDescription: 'Slope of the line or false if vertical line',
    example: 'local m = ADekoLib.slope(0, 0, 10, 5) -- Returns 0.5',
    category: 'Point & Vector Operations',
    subcategory: 'Line Operations',
    tags: ['slope', 'line', 'gradient', 'geometry'],
    complexity: 'basic',
    usage: 'Use to calculate line slope for geometric analysis',
    seeAlso: ['yIntercept', 'angle']
  },
  {
    name: 'bulge',
    description: 'Returns the bulge of a line passing through 3 points where p2 is the middle point.',
    parameters: [
      { name: 'p1', type: 'table', description: 'First point {x, y}' },
      { name: 'p2', type: 'table', description: 'Middle point {x, y}' },
      { name: 'p3', type: 'table', description: 'Third point {x, y}' }
    ],
    returnType: 'number',
    returnDescription: 'Bulge value for the arc',
    example: 'local b = ADekoLib.bulge({0, 0}, {5, 5}, {10, 0})',
    category: 'Point & Vector Operations',
    subcategory: 'Arc Operations',
    tags: ['bulge', 'arc', 'curve', 'geometry'],
    complexity: 'intermediate',
    usage: 'Use to calculate bulge values for creating arcs',
    seeAlso: ['radius', 'circularArc']
  },

  // POLYLINE OPERATIONS (continued)
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
    subcategory: 'Modification',
    tags: ['join', 'combine', 'polyline'],
    complexity: 'basic',
    usage: 'Use to create continuous paths from separate polyline segments',
    seeAlso: ['polyline', 'polylineimp']
  },
  {
    name: 'offSet',
    description: 'Creates an offset polyline at a specified distance from the original.',
    parameters: [
      { name: 'inputPoints', type: 'table', description: 'Array of points defining the original polyline' },
      { name: 'value', type: 'number', description: 'Offset distance (positive for outward, negative for inward)' }
    ],
    returnType: 'table',
    returnDescription: 'Offset polyline as array of points',
    example: 'local offset = ADekoLib.offSet(originalPoints, 5)',
    category: 'Polyline Operations',
    subcategory: 'Modification',
    tags: ['offset', 'polyline', 'parallel'],
    complexity: 'intermediate',
    usage: 'Use to create parallel paths for toolpaths, borders, or clearances',
    seeAlso: ['polyline', 'sunkenFrameAny']
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
    name: 'removeBackgroundAtTop',
    description: 'Removes background from a polyline based on Z-threshold. Useful for image processing.',
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

  // UTILITY FUNCTIONS
  {
    name: 'deepcopy',
    description: 'Copies a table recursively, creating a complete independent copy.',
    parameters: [
      { name: 'orig', type: 'table', description: 'Original table to copy' }
    ],
    returnType: 'table',
    returnDescription: 'Deep copy of the original table',
    example: 'local copy = ADekoLib.deepcopy(originalTable)',
    category: 'Utilities',
    subcategory: 'Data Manipulation',
    tags: ['copy', 'table', 'recursive', 'clone'],
    complexity: 'basic',
    usage: 'Use to create independent copies of complex table structures',
    seeAlso: ['unpack']
  },
  {
    name: 'swap',
    description: 'Swaps two input values and returns them in reversed order.',
    parameters: [
      { name: 'p1', type: 'any', description: 'First value' },
      { name: 'p2', type: 'any', description: 'Second value' }
    ],
    returnType: 'multiple',
    returnDescription: 'The two values in swapped order',
    example: 'local b, a = ADekoLib.swap(a, b)',
    category: 'Utilities',
    subcategory: 'Data Manipulation',
    tags: ['swap', 'exchange', 'utility'],
    complexity: 'basic',
    usage: 'Use to exchange values or reverse order',
    seeAlso: ['deepcopy']
  },
  {
    name: 'split',
    description: 'Single character string splitter that divides a string by a separator.',
    parameters: [
      { name: 'inputstr', type: 'string', description: 'String to split' },
      { name: 'sep', type: 'string', description: 'Separator character', optional: true, defaultValue: 'whitespace' }
    ],
    returnType: 'table',
    returnDescription: 'Array of string parts',
    example: 'local parts = ADekoLib.split("a,b,c", ",")',
    category: 'Utilities',
    subcategory: 'String Processing',
    tags: ['split', 'string', 'separator', 'parse'],
    complexity: 'basic',
    usage: 'Use to parse delimited strings into arrays',
    seeAlso: ['parseModelParameters']
  },
  {
    name: 'center',
    description: 'Returns the geometric center (centroid) of a collection of points.',
    parameters: [
      { name: 'points', type: 'table', description: 'Array of points to find center of' }
    ],
    returnType: 'table',
    returnDescription: 'Center point {x, y}',
    example: 'local centerPt = ADekoLib.center({{0,0}, {10,0}, {10,10}, {0,10}})',
    category: 'Point & Vector Operations',
    subcategory: 'Point Operations',
    tags: ['center', 'centroid', 'average', 'geometry'],
    complexity: 'basic',
    usage: 'Use to find the center point of shapes or point collections',
    seeAlso: ['sortCCW', 'sortCW']
  },
  {
    name: 'error',
    description: 'Outputs an error message for a part with context information.',
    parameters: [
      { name: 'errorMessage', type: 'string', description: 'Error message to display', optional: true, defaultValue: 'N.A' }
    ],
    returnType: 'void',
    returnDescription: 'Outputs error message to console',
    example: 'ADekoLib.error("Invalid parameter value")',
    category: 'Utilities',
    subcategory: 'Error Handling',
    tags: ['error', 'message', 'debug', 'output'],
    complexity: 'basic',
    usage: 'Use to report errors during script execution',
    seeAlso: ['productError']
  },
  {
    name: 'productError',
    description: 'Outputs an error message for a product (module) with context information.',
    parameters: [
      { name: 'errorMessage', type: 'string', description: 'Error message to display', optional: true, defaultValue: 'N.A' }
    ],
    returnType: 'void',
    returnDescription: 'Outputs error message to console',
    example: 'ADekoLib.productError("Product validation failed")',
    category: 'Utilities',
    subcategory: 'Error Handling',
    tags: ['error', 'product', 'message', 'debug'],
    complexity: 'basic',
    usage: 'Use to report product-level errors during script execution',
    seeAlso: ['error']
  },

  // DEBUGGING & VISUALIZATION
  {
    name: 'labelPoints',
    description: 'Writes index numbers of points at their locations for debugging visualization.',
    parameters: [
      { name: 'points', type: 'table', description: 'Array of points to label' }
    ],
    returnType: 'void',
    returnDescription: 'Displays point indices as text',
    example: 'ADekoLib.labelPoints(polygonPoints)',
    category: 'Utilities',
    subcategory: 'Debugging',
    tags: ['label', 'debug', 'visualization', 'text'],
    complexity: 'basic',
    usage: 'Use for debugging to see point indices and locations',
    seeAlso: ['labelPoint', 'showPoints']
  },
  {
    name: 'labelPoint',
    description: 'Writes a custom message at a specific point location for debugging.',
    parameters: [
      { name: 'point', type: 'table', description: 'Point location {x, y}' },
      { name: 'message', type: 'string', description: 'Message to display' }
    ],
    returnType: 'void',
    returnDescription: 'Displays message as text at point',
    example: 'ADekoLib.labelPoint({50, 50}, "Center")',
    category: 'Utilities',
    subcategory: 'Debugging',
    tags: ['label', 'debug', 'text', 'annotation'],
    complexity: 'basic',
    usage: 'Use to annotate specific points with custom messages',
    seeAlso: ['labelPoints', 'showPoints']
  },
  {
    name: 'showPar',
    description: 'Depicts and writes the name of a parameter with visual representation.',
    parameters: [
      { name: 'p1', type: 'table', description: 'First point {x, y}' },
      { name: 'p2', type: 'table', description: 'Second point {x, y}' },
      { name: 'parName', type: 'string', description: 'Parameter name to display' },
      { name: 'thickness', type: 'number', description: 'Line thickness for visualization' }
    ],
    returnType: 'void',
    returnDescription: 'Creates visual parameter representation',
    example: 'ADekoLib.showPar({0, 0}, {100, 0}, "Width", 2)',
    category: 'Utilities',
    subcategory: 'Debugging',
    tags: ['parameter', 'visualization', 'annotation', 'debug'],
    complexity: 'intermediate',
    usage: 'Use to visually annotate parameters in technical drawings',
    seeAlso: ['labelPoint', 'labelPoints']
  },

  // PART MANAGEMENT
  {
    name: 'makePart',
    description: 'Creates either a rectangle binding box or an arbitrary polygon as the part shape.',
    parameters: [
      { name: 'width', type: 'number', description: 'Width of the part' },
      { name: 'height', type: 'number', description: 'Height of the part' },
      { name: '...', type: 'table', description: 'Optional polygon points for custom shape', optional: true }
    ],
    returnType: 'void',
    returnDescription: 'Creates part geometry',
    example: 'ADekoLib.makePart(100, 50) -- Rectangle part',
    category: 'Machining Operations',
    subcategory: 'Part Creation',
    tags: ['part', 'shape', 'rectangle', 'polygon'],
    complexity: 'basic',
    usage: 'Use to create the basic part shape before adding features',
    seeAlso: ['makePartShape', 'packIntoPart']
  },
  {
    name: 'makePartShape',
    description: 'Creates either a rectangle binding box or an arbitrary polygon as the part shape using global dimensions.',
    parameters: [
      { name: '...', type: 'table', description: 'Optional polygon points for custom shape', optional: true }
    ],
    returnType: 'void',
    returnDescription: 'Creates part geometry using global X,Y dimensions',
    example: 'ADekoLib.makePartShape() -- Uses global X,Y dimensions',
    category: 'Machining Operations',
    subcategory: 'Part Creation',
    tags: ['part', 'shape', 'global', 'dimensions'],
    complexity: 'basic',
    usage: 'Use to create part shape using predefined global dimensions',
    seeAlso: ['makePart', 'packIntoPart']
  },
  {
    name: 'packIntoPart',
    description: 'Packs all available geometries created thus far into a part with given properties.',
    parameters: [
      { name: 'thisPartIsADoor', type: 'boolean', description: 'Whether this part is a door' },
      { name: 'ignoreMaterialGrain', type: 'boolean', description: 'Whether to ignore material grain during nesting' },
      { name: 'description', type: 'string', description: 'Part description' },
      { name: 'width', type: 'number', description: 'Part width' },
      { name: 'height', type: 'number', description: 'Part height' },
      { name: 'name', type: 'string', description: 'Part name identifier' },
      { name: 'material', type: 'string', description: 'Material type' },
      { name: 'edgeBandLayerName0', type: 'string', description: 'Edge band layer name for edge 0', optional: true },
      { name: 'edgeBandThickness0', type: 'number', description: 'Edge band thickness for edge 0', optional: true }
    ],
    returnType: 'boolean',
    returnDescription: 'True if successful',
    example: 'ADekoLib.packIntoPart(false, false, "Panel", 100, 50, "P1", "MDF", "EDGE", 2)',
    category: 'Machining Operations',
    subcategory: 'Part Creation',
    tags: ['part', 'pack', 'geometry', 'properties'],
    complexity: 'advanced',
    usage: 'Use to finalize a part with all its geometries and properties',
    seeAlso: ['makePart', 'startProduct']
  },
  {
    name: 'partName',
    description: 'Returns the name of the part at the specified index.',
    parameters: [
      { name: 'partIndex', type: 'number', description: 'Index of the part' }
    ],
    returnType: 'string',
    returnDescription: 'Name of the part',
    example: 'local name = ADekoLib.partName(1)',
    category: 'Machining Operations',
    subcategory: 'Part Properties',
    tags: ['part', 'name', 'property', 'query'],
    complexity: 'basic',
    usage: 'Use to retrieve part names for identification',
    seeAlso: ['partDescription', 'partMaterial']
  },
  {
    name: 'partDescription',
    description: 'Returns the description of the part at the specified index.',
    parameters: [
      { name: 'partIndex', type: 'number', description: 'Index of the part' }
    ],
    returnType: 'string',
    returnDescription: 'Description of the part',
    example: 'local desc = ADekoLib.partDescription(1)',
    category: 'Machining Operations',
    subcategory: 'Part Properties',
    tags: ['part', 'description', 'property', 'query'],
    complexity: 'basic',
    usage: 'Use to retrieve part descriptions',
    seeAlso: ['partName', 'partMaterial']
  },
  {
    name: 'partMaterial',
    description: 'Returns the material of the part at the specified index.',
    parameters: [
      { name: 'partIndex', type: 'number', description: 'Index of the part' }
    ],
    returnType: 'string',
    returnDescription: 'Material of the part',
    example: 'local material = ADekoLib.partMaterial(1)',
    category: 'Machining Operations',
    subcategory: 'Part Properties',
    tags: ['part', 'material', 'property', 'query'],
    complexity: 'basic',
    usage: 'Use to retrieve part material information',
    seeAlso: ['partName', 'partDescription']
  },
  {
    name: 'partWidth',
    description: 'Returns the width of the part at the specified index.',
    parameters: [
      { name: 'partIndex', type: 'number', description: 'Index of the part' }
    ],
    returnType: 'number',
    returnDescription: 'Width of the part',
    example: 'local width = ADekoLib.partWidth(1)',
    category: 'Machining Operations',
    subcategory: 'Part Properties',
    tags: ['part', 'width', 'dimension', 'query'],
    complexity: 'basic',
    usage: 'Use to retrieve part width for calculations',
    seeAlso: ['partHeight', 'partName']
  },
  {
    name: 'partHeight',
    description: 'Returns the height of the part at the specified index.',
    parameters: [
      { name: 'partIndex', type: 'number', description: 'Index of the part' }
    ],
    returnType: 'number',
    returnDescription: 'Height of the part',
    example: 'local height = ADekoLib.partHeight(1)',
    category: 'Machining Operations',
    subcategory: 'Part Properties',
    tags: ['part', 'height', 'dimension', 'query'],
    complexity: 'basic',
    usage: 'Use to retrieve part height for calculations',
    seeAlso: ['partWidth', 'partName']
  },

  // COORDINATE SYSTEM & FACE OPERATIONS
  {
    name: 'setFace',
    description: 'Sets face for the next shapes: top, bottom, left, right, front, rear.',
    parameters: [
      { name: 'faceName', type: 'string', description: 'Face name: "top", "bottom", "left", "right", "front", "rear"' }
    ],
    returnType: 'void',
    returnDescription: 'Sets the current working face',
    example: 'ADekoLib.setFace("top")',
    category: 'Utilities',
    subcategory: 'Coordinate System',
    tags: ['face', 'orientation', 'coordinate', 'system'],
    complexity: 'intermediate',
    usage: 'Use to set the working face for 3D part operations',
    seeAlso: ['moveToFace', 'rotation']
  },
  {
    name: 'moveToFace',
    description: 'Moves the origin of coordinate system to current face.',
    parameters: [],
    returnType: 'void',
    returnDescription: 'Moves coordinate origin to current face',
    example: 'ADekoLib.moveToFace()',
    category: 'Utilities',
    subcategory: 'Coordinate System',
    tags: ['coordinate', 'origin', 'face', 'transform'],
    complexity: 'advanced',
    usage: 'Use to align coordinate system with the current working face',
    seeAlso: ['setFace', 'translation']
  },
  {
    name: 'rotation',
    description: 'Returns the rotation matrix elements for a given shape.',
    parameters: [
      { name: 'line', type: 'number', description: 'Matrix row (0-2)' },
      { name: 'column', type: 'number', description: 'Matrix column (0-2)' },
      { name: 'dataIndex', type: 'number', description: 'Shape data index' },
      { name: 'partIndex', type: 'number', description: 'Part index', optional: true }
    ],
    returnType: 'number',
    returnDescription: 'Rotation matrix element',
    example: 'local r11 = ADekoLib.rotation(0, 0, 1)',
    category: 'Utilities',
    subcategory: 'Coordinate System',
    tags: ['rotation', 'matrix', 'transform', 'orientation'],
    complexity: 'advanced',
    usage: 'Use to get rotation matrix elements for 3D transformations',
    seeAlso: ['translation', 'multiplyRotationMatrixes']
  },
  {
    name: 'translation',
    description: 'Returns the translation matrix elements for a given shape.',
    parameters: [
      { name: 'line', type: 'number', description: 'Matrix row (0-2)' },
      { name: 'dataIndex', type: 'number', description: 'Shape data index' },
      { name: 'partIndex', type: 'number', description: 'Part index', optional: true }
    ],
    returnType: 'number',
    returnDescription: 'Translation matrix element',
    example: 'local tx = ADekoLib.translation(0, 1)',
    category: 'Utilities',
    subcategory: 'Coordinate System',
    tags: ['translation', 'matrix', 'transform', 'position'],
    complexity: 'advanced',
    usage: 'Use to get translation matrix elements for 3D transformations',
    seeAlso: ['rotation', 'translationOffset']
  },
  {
    name: 'translationOffset',
    description: 'Scales the unit translation matrix.',
    parameters: [
      { name: 'unitTranslation', type: 'table', description: 'Unit translation vector' }
    ],
    returnType: 'table',
    returnDescription: 'Scaled translation vector',
    example: 'local scaled = ADekoLib.translationOffset({1, 0, 0})',
    category: 'Utilities',
    subcategory: 'Coordinate System',
    tags: ['translation', 'scale', 'matrix', 'offset'],
    complexity: 'advanced',
    usage: 'Use to scale translation vectors for coordinate transformations',
    seeAlso: ['translation', 'rotation']
  },
  {
    name: 'multiplyRotationMatrixes',
    description: 'Returns the product of two 3x3 rotation matrices.',
    parameters: [
      { name: 'm1', type: 'table', description: 'First 3x3 rotation matrix' },
      { name: 'm2', type: 'table', description: 'Second 3x3 rotation matrix' }
    ],
    returnType: 'table',
    returnDescription: 'Product of the two matrices',
    example: 'local result = ADekoLib.multiplyRotationMatrixes(matrix1, matrix2)',
    category: 'Utilities',
    subcategory: 'Coordinate System',
    tags: ['matrix', 'multiplication', 'rotation', 'transform'],
    complexity: 'advanced',
    usage: 'Use to combine rotation transformations',
    seeAlso: ['rotation', 'areRotationsEqual']
  },

  // LAYER & THICKNESS CONTROL
  {
    name: 'setLayer',
    description: 'Sets layername for the next shape.',
    parameters: [
      { name: 'layerName', type: 'string', description: 'Name of the layer' }
    ],
    returnType: 'void',
    returnDescription: 'Sets current layer',
    example: 'ADekoLib.setLayer("PANEL")',
    category: 'Utilities',
    subcategory: 'Layer Management',
    tags: ['layer', 'organization', 'cad'],
    complexity: 'basic',
    usage: 'Use to organize shapes into different layers',
    seeAlso: ['layerName', 'setThickness']
  },
  {
    name: 'setThickness',
    description: 'Sets thickness for the next shape.',
    parameters: [
      { name: 'thickness', type: 'number', description: 'Thickness value (negative for cuts)' }
    ],
    returnType: 'void',
    returnDescription: 'Sets current thickness',
    example: 'ADekoLib.setThickness(-5) -- 5mm deep cut',
    category: 'Utilities',
    subcategory: 'Layer Management',
    tags: ['thickness', 'depth', 'machining'],
    complexity: 'basic',
    usage: 'Use to set cutting depth or material thickness',
    seeAlso: ['thickness', 'setLayer']
  },
  {
    name: 'layerName',
    description: 'Returns the layername for a given shape.',
    parameters: [
      { name: 'dataIndex', type: 'number', description: 'Shape index' },
      { name: 'partIndex', type: 'number', description: 'Part index', optional: true }
    ],
    returnType: 'string',
    returnDescription: 'Layer name of the shape',
    example: 'local layer = ADekoLib.layerName(1)',
    category: 'Analysis & Testing',
    subcategory: 'Data Query',
    tags: ['layer', 'query', 'organization'],
    complexity: 'basic',
    usage: 'Use to get the layer name of a specific shape',
    seeAlso: ['setLayer', 'thickness']
  },
  {
    name: 'thickness',
    description: 'Returns the thickness or depth for a given shape.',
    parameters: [
      { name: 'dataIndex', type: 'number', description: 'Shape index' },
      { name: 'partIndex', type: 'number', description: 'Part index', optional: true }
    ],
    returnType: 'number',
    returnDescription: 'Thickness value of the shape',
    example: 'local thick = ADekoLib.thickness(1)',
    category: 'Analysis & Testing',
    subcategory: 'Data Query',
    tags: ['thickness', 'depth', 'query'],
    complexity: 'basic',
    usage: 'Use to get the thickness value of a specific shape',
    seeAlso: ['setThickness', 'layerName']
  },

  // MISSING REFERENCE FUNCTIONS
  {
    name: 'point',
    description: 'Creates points with bulges. Alternative name for node() function.',
    parameters: [
      { name: 'x', type: 'number', description: 'X-coordinate' },
      { name: 'y', type: 'number', description: 'Y-coordinate' },
      { name: 'z', type: 'number', description: 'Z-coordinate', optional: true, defaultValue: 0 },
      { name: 'bulge', type: 'number', description: 'Bulge value for arc', optional: true, defaultValue: 0 }
    ],
    returnType: 'void',
    returnDescription: 'Creates a point in current shape',
    example: 'ADekoLib.point(10, 20, 0, 0)',
    category: 'Shape Generation',
    subcategory: 'Point Creation',
    tags: ['point', 'vertex', 'bulge', 'coordinate'],
    complexity: 'basic',
    usage: 'Use to create individual points when building shapes manually',
    seeAlso: ['node', 'nextShape']
  },
  {
    name: 'nextShape',
    description: 'Ends the creation of current shape and starts a new one.',
    parameters: [],
    returnType: 'void',
    returnDescription: 'Advances to next shape',
    example: 'ADekoLib.nextShape() -- Start new shape',
    category: 'Shape Generation',
    subcategory: 'Shape Control',
    tags: ['shape', 'control', 'sequence'],
    complexity: 'intermediate',
    usage: 'Use when creating shapes point by point to start a new shape',
    seeAlso: ['point', 'node']
  },
  {
    name: 'enableListing',
    description: 'Enables/disables output of created shape points hierarchically at the end of interpretation.',
    parameters: [
      { name: 'enable', type: 'boolean', description: 'True to enable listing, false to disable' }
    ],
    returnType: 'void',
    returnDescription: 'Sets listing mode',
    example: 'ADekoLib.enableListing(true)',
    category: 'Utilities',
    subcategory: 'Debugging',
    tags: ['listing', 'debug', 'output', 'hierarchy'],
    complexity: 'basic',
    usage: 'Use to control whether shape points are listed after interpretation',
    seeAlso: ['list', 'showPoints']
  },
  {
    name: 'list',
    description: 'Prints out all entities currently created.',
    parameters: [
      { name: 'what', type: 'string', description: 'What to list', optional: true }
    ],
    returnType: 'void',
    returnDescription: 'Outputs entity list to console',
    example: 'ADekoLib.list()',
    category: 'Utilities',
    subcategory: 'Debugging',
    tags: ['list', 'debug', 'entities', 'output'],
    complexity: 'basic',
    usage: 'Use to see all created shapes and their properties',
    seeAlso: ['enableListing', 'dataSize']
  },
  {
    name: 'deleteLastShape',
    description: 'Deletes the last shape created. Used internally.',
    parameters: [],
    returnType: 'void',
    returnDescription: 'Removes last shape',
    example: 'ADekoLib.deleteLastShape() -- Internal use',
    category: 'Utilities',
    subcategory: 'System Functions',
    tags: ['delete', 'shape', 'internal', 'undo'],
    complexity: 'advanced',
    usage: 'Internal function - use with caution',
    seeAlso: ['deleteLastPoint', 'nextShape']
  },
  {
    name: 'deleteLastPoint',
    description: 'Deletes the last point created. Used internally.',
    parameters: [],
    returnType: 'void',
    returnDescription: 'Removes last point',
    example: 'ADekoLib.deleteLastPoint() -- Internal use',
    category: 'Utilities',
    subcategory: 'System Functions',
    tags: ['delete', 'point', 'internal', 'undo'],
    complexity: 'advanced',
    usage: 'Internal function - use with caution',
    seeAlso: ['deleteLastShape', 'point']
  },
  {
    name: 'nextPoint',
    description: 'Moves the point index forward. Used internally. Alternative name for nextNode().',
    parameters: [],
    returnType: 'void',
    returnDescription: 'Advances to next point',
    example: 'ADekoLib.nextPoint() -- Internal use',
    category: 'Utilities',
    subcategory: 'System Functions',
    tags: ['internal', 'point', 'index', 'advance'],
    complexity: 'advanced',
    usage: 'Internal function for point management',
    seeAlso: ['nextNode', 'point']
  },
  {
    name: 'start',
    description: 'Starts the creation of part. Used internally.',
    parameters: [],
    returnType: 'boolean',
    returnDescription: 'True if successful',
    example: 'ADekoLib.start() -- Internal use only',
    category: 'Utilities',
    subcategory: 'System Functions',
    tags: ['internal', 'system', 'initialization'],
    complexity: 'advanced',
    usage: 'Internal function - not typically used directly by users',
    seeAlso: ['finish', 'startProduct']
  },
  {
    name: 'finish',
    description: 'Finishes the creation of shapes of part. Used internally.',
    parameters: [],
    returnType: 'boolean',
    returnDescription: 'True if successful',
    example: 'ADekoLib.finish() -- Internal use only',
    category: 'Utilities',
    subcategory: 'System Functions',
    tags: ['internal', 'system', 'finalization'],
    complexity: 'advanced',
    usage: 'Internal function - not typically used directly by users',
    seeAlso: ['start', 'finishProduct']
  },
  {
    name: 'dataSize',
    description: 'Returns the number of individual shapes.',
    parameters: [
      { name: 'partIndex', type: 'number', description: 'Part index', optional: true }
    ],
    returnType: 'number',
    returnDescription: 'Number of shapes',
    example: 'local count = ADekoLib.dataSize()',
    category: 'Analysis & Testing',
    subcategory: 'Data Query',
    tags: ['data', 'count', 'shapes', 'query'],
    complexity: 'basic',
    usage: 'Use to get the number of shapes in current part or specified part',
    seeAlso: ['pointSize', 'list']
  },
  {
    name: 'pointSize',
    description: 'Returns the number of points for a given shape. Alternative name for nodeSize().',
    parameters: [
      { name: 'dataIndex', type: 'number', description: 'Shape index' }
    ],
    returnType: 'number',
    returnDescription: 'Number of points in the shape',
    example: 'local pointCount = ADekoLib.pointSize(1)',
    category: 'Analysis & Testing',
    subcategory: 'Data Query',
    tags: ['points', 'count', 'query', 'shape'],
    complexity: 'basic',
    usage: 'Use to get the number of points in a specific shape',
    seeAlso: ['dataSize', 'pointFeature']
  },
  {
    name: 'pointFeature',
    description: 'Returns x, y, z, and bulge of a point for a given shape. Alternative name for nodeFeature().',
    parameters: [
      { name: 'xyzbulge', type: 'number', description: 'Feature type: 0=X, 1=Y, 2=Z, 3=bulge' },
      { name: 'dataIndex', type: 'number', description: 'Shape index' },
      { name: 'pointIndex', type: 'number', description: 'Point index' }
    ],
    returnType: 'number',
    returnDescription: 'The requested coordinate or bulge value',
    example: 'local x = ADekoLib.pointFeature(0, 1, 1) -- Get X of first point',
    category: 'Analysis & Testing',
    subcategory: 'Data Query',
    tags: ['point', 'coordinate', 'bulge', 'query'],
    complexity: 'intermediate',
    usage: 'Use to extract specific coordinate values from points',
    seeAlso: ['pointSize', 'dataSize']
  }
]
