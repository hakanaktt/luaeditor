# AdekoLib IntelliSense Features

This Lua editor now includes comprehensive IntelliSense support for AdekoLib functions, making it much easier to discover, understand, and use the available functions.

## Features Overview

### 1. Function Browser Panel
- **Categorized Function Library**: Functions are organized into logical categories like "Geometric Transformations", "Machining Operations", "Shape Generation", etc.
- **Search and Filter**: Find functions by name, description, tags, or complexity level
- **Detailed Function Information**: Each function shows parameters, return types, examples, and usage notes
- **One-Click Insertion**: Click to insert function calls directly into your code

### 2. Monaco Editor IntelliSense
- **Auto-completion**: Type `ADekoLib.` to see available functions
- **Parameter Hints**: Shows parameter information as you type function calls
- **Hover Documentation**: Hover over function names to see quick help
- **Syntax Highlighting**: Full Lua syntax highlighting with AdekoLib awareness

### 3. Function Categories

#### Geometric Transformations
- `rotate()` - Rotate polygons around a point
- `translate()` - Move shapes in a direction
- `mirror()` - Mirror shapes across axes
- `moveWithDeltaVec()` - Move by vector

#### Point & Vector Operations
- `distance()` / `distance3D()` - Calculate distances
- `angle()` - Find angles between points
- `polar()` - Position points at polar coordinates
- `ptAdd()` / `ptSubtract()` - Point arithmetic

#### Shape Generation
- `circle()` - Create circles
- `rectangle()` - Create rectangles
- `line()` - Create line segments
- `ellipse()` - Create ellipses

#### Machining Operations
- `groove()` - Create linear cuts
- `hole()` - Create circular holes
- `pocket()` - Create rectangular pockets
- `inclinedPocket()` - Create sloped pockets
- `sunkenFrame()` - Create sunken frames

#### Polyline Operations
- `polyline()` - Create multi-point paths
- `offSet()` - Create parallel paths
- `joinPolylines()` - Combine paths

#### Analysis & Testing
- `isPointInsidePolygon()` - Point-in-polygon testing
- `lineLineIntersection()` - Find line intersections
- `areParallell()` - Test if points are collinear

#### Data Management
- `makePart()` - Create parts
- `setFace()` - Set working face
- `setLayer()` - Set current layer
- `setThickness()` - Set cutting depth

## How to Use

### Using the Function Browser
1. Click the "Functions" tab in the left panel
2. Browse categories or use the search box
3. Click on a function to see detailed information
4. Click "Insert Function" to add it to your code

### Using IntelliSense in the Editor
1. Type `ADekoLib.` in the editor
2. A dropdown will appear with available functions
3. Use arrow keys to navigate and Enter to select
4. Parameter hints will guide you through function calls

### Search and Discovery
- **By Category**: Browse organized function groups
- **By Complexity**: Filter by Basic/Intermediate/Advanced
- **By Search**: Type keywords to find relevant functions
- **By Tags**: Functions are tagged with relevant keywords

## Function Information Structure

Each function includes:
- **Name and Signature**: Function name with parameter types
- **Description**: What the function does
- **Parameters**: Detailed parameter information with types and descriptions
- **Return Value**: What the function returns
- **Example**: Working code example
- **Usage Notes**: When and how to use the function
- **Related Functions**: Links to similar or complementary functions
- **Complexity Level**: Basic, Intermediate, or Advanced
- **Tags**: Keywords for easy searching

## Example Usage

```lua
-- Create a rectangular part
ADekoLib.makePart(600, 400)

-- Set working face to top
ADekoLib.setFace("top")

-- Create a groove
ADekoLib.groove({50, 50}, {550, 50}, -3)

-- Create a circular hole
ADekoLib.hole({300, 200}, 5, -10)

-- Create an offset path
local originalPoints = {{0,0}, {100,0}, {100,100}, {0,100}}
local offsetPath = ADekoLib.offSet(originalPoints, 10)
```

## Benefits

1. **Faster Development**: No need to remember function names or parameters
2. **Better Code Quality**: Parameter hints prevent errors
3. **Learning Aid**: Discover new functions and understand their usage
4. **Documentation**: Built-in help reduces need for external references
5. **Productivity**: Quick insertion and auto-completion speed up coding

## Technical Implementation

- **TypeScript-based**: Strongly typed function definitions
- **Monaco Editor Integration**: Full IDE-like experience
- **Vue 3 Components**: Modern reactive UI
- **Categorized Organization**: Logical grouping for easy navigation
- **Search Engine**: Fast filtering and discovery
- **Extensible**: Easy to add new functions and categories

This IntelliSense system transforms the Lua editor from a simple text editor into a powerful development environment specifically tailored for AdekoLib macro development.
