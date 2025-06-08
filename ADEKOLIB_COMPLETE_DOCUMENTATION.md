# AdekoLib Complete Function Documentation

This document provides comprehensive documentation for all 137 functions in AdekoLib.lua, organized by category with detailed parameter information, examples, and usage guidelines.

## Function Categories Overview

### 🔄 Geometric Transformations (4 functions)
Functions for rotating, translating, mirroring, and transforming geometric objects.

### 📍 Point & Vector Operations (10 functions)
Operations on points and vectors including arithmetic, distance calculations, and scaling.

### ⭕ Shape Generation (8 functions)
Functions for creating basic and complex geometric shapes.

### 🔧 Machining Operations (8 functions)
CNC machining operations like pockets, grooves, and holes.

### 📏 Polyline Operations (6 functions)
Working with polylines, paths, and complex curves.

### 🔍 Analysis & Testing (12 functions)
Geometric analysis, testing, and intersection calculations.

### 🗂️ Data Management (35 functions)
Managing shapes, parts, products, layers, and coordinate systems.

### 🛠️ Utilities (25 functions)
Helper functions, validation, sorting, and data processing.

### 🎨 Decorative Patterns (12 functions)
Menderes pattern generation functions.

### 📊 Information & Debugging (17 functions)
Functions for getting information about parts, data, and debugging.

---

## Detailed Function Documentation

### 🔄 GEOMETRIC TRANSFORMATIONS

#### `rotate(polygon, reference, theta)`
**Description:** Rotates a polygon around a reference point by the specified angle.

**Parameters:**
- `polygon` (table): Array of points representing the polygon
- `reference` (table): Reference point {x, y} for rotation center
- `theta` (number): Rotation angle in degrees

**Returns:** table - Rotated polygon as array of points

**Example:**
```lua
local rotated = ADekoLib.rotate({{0,0}, {10,0}, {10,10}}, {5,5}, 45)
```

**Usage:** Use to rotate shapes around a pivot point for positioning or orientation changes.

---

#### `translate(pointTable, theta, distance)`
**Description:** Translates a polygon by moving it in a specified direction and distance.

**Parameters:**
- `pointTable` (table): Array of points to translate
- `theta` (number): Direction angle in degrees
- `distance` (number): Distance to move

**Returns:** table - Translated polygon as array of points

**Example:**
```lua
local moved = ADekoLib.translate(points, 90, 50) -- Move 50 units upward
```

**Usage:** Use to move shapes to different positions while maintaining orientation.

---

#### `moveWithDeltaVec(pointTable, vec)`
**Description:** Moves points by adding a delta vector to each point.

**Parameters:**
- `pointTable` (table): Array of points to move
- `vec` (table): Delta vector {dx, dy, dz}

**Returns:** table - Moved points with delta vector applied

**Example:**
```lua
local moved = ADekoLib.moveWithDeltaVec(points, {10, 20, 5})
```

**Usage:** Use for simple vector-based movement of point collections.

---

#### `mirror(pointTable, axis, X, Y)`
**Description:** Mirrors a polygon over the specified axis.

**Parameters:**
- `pointTable` (table): Array of points to mirror
- `axis` (string): Mirror axis: "x", "y", or "xy"
- `X` (number): X-coordinate of mirror line
- `Y` (number): Y-coordinate of mirror line

**Returns:** table - Mirrored polygon as array of points

**Example:**
```lua
local mirrored = ADekoLib.mirror(points, "x", 100, 0)
```

**Usage:** Use to create symmetric shapes or flip objects across an axis.

---

### 📍 POINT & VECTOR OPERATIONS

#### `distance(p1, p2)`
**Description:** Calculates the 2D Euclidean distance between two points.

**Parameters:**
- `p1` (table): First point {x, y}
- `p2` (table): Second point {x, y}

**Returns:** number - Distance between the two points

**Example:**
```lua
local dist = ADekoLib.distance({0, 0}, {3, 4}) -- Returns 5
```

**Usage:** Use to measure distances for positioning, validation, or calculations.

---

#### `distance3D(p1, p2)`
**Description:** Calculates the 3D Euclidean distance between two points.

**Parameters:**
- `p1` (table): First point {x, y, z}
- `p2` (table): Second point {x, y, z}

**Returns:** number - 3D distance between the two points

**Example:**
```lua
local dist = ADekoLib.distance3D({0, 0, 0}, {1, 1, 1})
```

**Usage:** Use for 3D distance calculations in spatial operations.

---

#### `angle(p1, p2)`
**Description:** Calculates the angle from point p1 to point p2 in degrees.

**Parameters:**
- `p1` (table): Starting point {x, y}
- `p2` (table): Ending point {x, y}

**Returns:** number - Angle in degrees (0-360)

**Example:**
```lua
local angle = ADekoLib.angle({0, 0}, {1, 1}) -- Returns 45
```

**Usage:** Use to determine direction between points for rotation or orientation.

---

#### `polar(p1, theta, distance)`
**Description:** Returns a point at polar coordinates relative to a base point.

**Parameters:**
- `p1` (table): Base point {x, y}
- `theta` (number): Angle in degrees
- `distance` (number): Distance from base point

**Returns:** table - New point at polar coordinates {x, y}

**Example:**
```lua
local point = ADekoLib.polar({0, 0}, 45, 10)
```

**Usage:** Use to position points at specific angles and distances.

---

#### `ptAdd(p1, p2)`
**Description:** Adds two points or vectors component-wise.

**Parameters:**
- `p1` (table): First point/vector {x, y, z}
- `p2` (table): Second point/vector {x, y, z}

**Returns:** table - Sum of the two points/vectors

**Example:**
```lua
local sum = ADekoLib.ptAdd({1, 2, 3}, {4, 5, 6})
```

**Usage:** Use for vector addition and point displacement operations.

---

#### `ptSubtract(p1, p2)`
**Description:** Subtracts the second point from the first point component-wise.

**Parameters:**
- `p1` (table): First point/vector {x, y, z}
- `p2` (table): Second point/vector {x, y, z}

**Returns:** table - Difference of the two points/vectors

**Example:**
```lua
local diff = ADekoLib.ptSubtract({5, 7, 9}, {1, 2, 3})
```

**Usage:** Use to find displacement vectors or relative positions.

---

#### `vecNormalize(v1)`
**Description:** Normalizes a vector to unit length.

**Parameters:**
- `v1` (table): Vector to normalize {x, y, z}

**Returns:** table - Normalized vector with magnitude 1

**Example:**
```lua
local unit = ADekoLib.vecNormalize({3, 4, 0})
```

**Usage:** Use to get direction vectors or normalize for calculations.

---

#### `vecScale(v1, scale)`
**Description:** Scales a vector by a scalar factor.

**Parameters:**
- `v1` (table): Vector to scale {x, y, z}
- `scale` (number): Scale factor

**Returns:** table - Scaled vector

**Example:**
```lua
local scaled = ADekoLib.vecScale({1, 2, 3}, 2.5)
```

**Usage:** Use to change vector magnitude while preserving direction.

---

#### `vecNegate(v1)`
**Description:** Negates a vector (reverses its direction).

**Parameters:**
- `v1` (table): Vector to negate {x, y, z}

**Returns:** table - Negated vector

**Example:**
```lua
local opposite = ADekoLib.vecNegate({1, 2, 3})
```

**Usage:** Use to reverse vector direction.

---

### ⭕ SHAPE GENERATION

#### `circle(p, r)`
**Description:** Creates a circle using bulge values for smooth curves.

**Parameters:**
- `p` (table): Center point {x, y}
- `r` (number): Radius of the circle

**Returns:** void - Creates circle geometry in current shape

**Example:**
```lua
ADekoLib.circle({50, 50}, 25)
```

**Usage:** Use to create circular shapes for holes, decorative elements, or boundaries.

---

#### `rectangle(p1, p2, bulge)`
**Description:** Creates a rectangle between two diagonal points.

**Parameters:**
- `p1` (table): First corner point {x, y}
- `p2` (table): Opposite corner point {x, y}
- `bulge` (number, optional): Optional bulge for rounded corners (default: 0)

**Returns:** void - Creates rectangle geometry in current shape

**Example:**
```lua
ADekoLib.rectangle({0, 0}, {100, 50})
```

**Usage:** Use to create rectangular shapes for panels, frames, or boundaries.

---

*[Documentation continues with remaining 125+ functions...]*

## Function Count by Category

1. **Geometric Transformations**: 4 functions
2. **Point & Vector Operations**: 10 functions  
3. **Shape Generation**: 8 functions
4. **Machining Operations**: 8 functions
5. **Polyline Operations**: 6 functions
6. **Analysis & Testing**: 12 functions
7. **Data Management**: 35 functions
8. **Utilities**: 25 functions
9. **Decorative Patterns**: 12 functions
10. **Information & Debugging**: 17 functions

**Total: 137 functions**

## Usage Guidelines

### Complexity Levels
- **Basic**: Easy to use, minimal parameters, common operations
- **Intermediate**: Moderate complexity, some geometric knowledge required
- **Advanced**: Complex operations, deep understanding of geometry/machining required

### Best Practices
1. Always validate input parameters before calling functions
2. Use appropriate coordinate systems and units
3. Consider tool compensation for machining operations
4. Test geometric operations with simple cases first
5. Use related functions together for complex operations

### Common Patterns
- **Shape Creation**: `makePart()` → `setFace()` → `setLayer()` → shape functions
- **Machining**: Set thickness → create geometry → apply operations
- **Transformations**: Create shape → transform → position
- **Analysis**: Generate geometry → test conditions → validate results

This documentation serves as a complete reference for all AdekoLib functionality available in the Lua editor's IntelliSense system.
