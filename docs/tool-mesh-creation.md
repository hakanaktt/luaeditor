# Tool Mesh Creation for CSG Operations

This document describes the enhanced tool mesh creation system implemented for CNC operations in the Lua Editor application.

## Overview

The tool mesh creation system provides methods to generate 3D meshes representing CNC tools for use in Constructive Solid Geometry (CSG) operations. These meshes can be used to visualize tool paths and simulate material removal operations.

## Key Features

### 1. Enhanced Tool Mesh Generation
- **CSG-Ready Meshes**: Tool meshes optimized for CSG operations with proper geometry
- **Operation-Specific Meshes**: Different mesh generation based on operation type
- **Adaptive Geometry**: Segment count adapts to tool diameter for optimal performance
- **Multiple Tool Shapes**: Support for cylindrical, conical, ballnose, radial, and special tools

### 2. Tool Path Mesh Creation
- **Sweep Meshes**: Create meshes that follow tool paths for realistic material removal
- **Line Operations**: Tool meshes positioned and oriented along line paths
- **Circle Operations**: Specialized meshes for drilling and circular profiling
- **Rectangle Operations**: Pocketing meshes for rectangular areas
- **Arc Operations**: Swept meshes following arc paths

### 3. Performance Optimization
- **Mesh Caching**: Cache frequently used tool meshes for better performance
- **Level of Detail (LOD)**: Adaptive geometry complexity based on viewing distance
- **Batch Creation**: Efficient creation of multiple tool meshes
- **Validation**: Mesh validation to ensure CSG compatibility

## API Reference

### Core Methods

#### `createCSGToolMesh(tool, operation, depth, stepDown?)`
Creates a CSG-optimized tool mesh for a specific operation.

**Parameters:**
- `tool`: CNCTool - The tool definition
- `operation`: string - Operation type ('roughing', 'finishing', 'profiling', 'drilling', 'pocketing')
- `depth`: number - Tool depth/height
- `stepDown`: number - Step down value (optional)

**Returns:** THREE.Mesh

#### `createOperationToolMeshes(commands, tool, operation, depth)`
Creates multiple tool meshes for a set of draw commands.

**Parameters:**
- `commands`: DrawCommand[] - Array of draw commands
- `tool`: CNCTool - The tool definition
- `operation`: string - Operation type
- `depth`: number - Tool depth

**Returns:** THREE.Mesh[]

#### `createToolSweepMesh(tool, path, operation)`
Creates a swept tool mesh along a 3D path.

**Parameters:**
- `tool`: CNCTool - The tool definition
- `path`: THREE.Vector3[] - Array of 3D points defining the path
- `operation`: string - Operation type

**Returns:** THREE.Mesh

### Utility Methods

#### `getCachedToolMesh(tool, operation, depth)`
Retrieves a cached tool mesh if available.

#### `cacheToolMesh(tool, operation, depth, mesh)`
Caches a tool mesh for future use.

#### `validateToolMesh(mesh)`
Validates a tool mesh for CSG compatibility.

#### `getToolMeshStats(mesh)`
Returns statistics about a tool mesh (vertices, faces, volume, etc.).

## Tool Shape Support

### Cylindrical Tools
- Standard end mills
- Uniform diameter along the cutting length
- Used for roughing, finishing, and pocketing operations

### Conical Tools
- V-bits and chamfer tools
- Tapered geometry with configurable tip angle
- Used for profiling and decorative operations

### Ballnose Tools
- Ball end mills
- Hemispherical cutting end
- Used for 3D contouring and smooth finishing

### Radial Tools
- Corner radius end mills
- Rounded cutting edges
- Used for profiling with corner radius

### Special Tools
- Custom tool profiles
- Configurable geometry
- Support for custom SVG profiles (future enhancement)

## Operation Types

### Roughing
- High material removal rate
- Larger tool meshes
- Optimized for speed

### Finishing
- Fine surface finish
- Smaller, more precise tool meshes
- Higher geometry detail

### Profiling
- Edge following operations
- Swept meshes along paths
- Precise tool orientation

### Drilling
- Point operations
- Cylindrical tool meshes
- Depth-based positioning

### Pocketing
- Area removal operations
- Box or cylindrical pocket meshes
- Covers entire removal area

## Usage Examples

### Basic Tool Mesh Creation
```typescript
const tool = cncToolService.getToolById('cyl-6mm')
const mesh = cncToolService.createCSGToolMesh(tool, 'roughing', 10)
scene.add(mesh)
```

### Operation-Specific Meshes
```typescript
const commands = [
  { command_type: 'line', x1: 0, y1: 0, x2: 100, y2: 0, ... },
  { command_type: 'circle', x1: 50, y1: 50, radius: 25, ... }
]
const meshes = cncToolService.createOperationToolMeshes(commands, tool, 'profiling', 5)
meshes.forEach(mesh => scene.add(mesh))
```

### Tool Path Sweep
```typescript
const path = [
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(50, 0, 25),
  new THREE.Vector3(100, 0, 0)
]
const sweepMesh = cncToolService.createToolSweepMesh(tool, path, 'finishing')
scene.add(sweepMesh)
```

## Integration with CSG Pipeline

The tool meshes created by this system are designed to work seamlessly with the CSG pipeline:

1. **Material Subtraction**: Tool meshes can be subtracted from workpiece geometry
2. **Boolean Operations**: Support for union, subtract, and intersect operations
3. **Three.js Compatibility**: All meshes are compatible with three-csg-ts library
4. **Proper Normals**: Meshes have correct normals for CSG operations

## Performance Considerations

- Use mesh caching for frequently used tools
- Consider LOD levels for distant or small tools
- Validate meshes before CSG operations
- Clear cache periodically to manage memory usage

## Future Enhancements

- Custom tool profile support via SVG paths
- Advanced mesh simplification algorithms
- Real-time tool path optimization
- Integration with CAM software standards
- Support for multi-axis tool orientations
