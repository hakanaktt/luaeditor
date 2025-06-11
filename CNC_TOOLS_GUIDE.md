# CNC Tools for Door Surface Machining

This guide explains the comprehensive CNC tool system implemented in the Lua Editor for door surface machining operations.

## Tool Types

### 1. Cylindrical Tools
**Best for:** General machining, roughing, finishing, pocketing

**Characteristics:**
- Straight cutting edges
- Multiple flutes (typically 2-4)
- Excellent for material removal
- Good surface finish

**Parameters:**
- Diameter: 3mm - 20mm
- Length: 30mm - 100mm
- Flutes: 1-8
- Helix Angle: 15° - 45°

**Common Applications:**
- Roughing operations
- Slot cutting
- Pocket machining
- General contouring

### 2. Conical Tools (V-Bits)
**Best for:** V-grooves, chamfers, engraving, decorative work

**Characteristics:**
- Tapered cutting edge
- Sharp point for fine detail
- Various tip angles available
- Excellent for decorative work

**Parameters:**
- Tip Angle: 30° - 120°
- Diameter: 6mm - 25mm
- Tip Diameter: 0.1mm - 2mm
- Length: 25mm - 60mm

**Common Applications:**
- Decorative V-grooves
- Chamfering edges
- Sign making
- Inlay work

### 3. Ball Nose Tools
**Best for:** 3D contouring, smooth curves, finishing

**Characteristics:**
- Rounded tip for smooth curves
- Excellent surface finish
- No sharp corners
- Ideal for 3D work

**Parameters:**
- Ball Radius: 1.5mm - 10mm
- Diameter: 3mm - 20mm
- Length: 30mm - 80mm
- Flutes: 2-4

**Common Applications:**
- 3D surface machining
- Smooth curve generation
- Finishing operations
- Artistic work

### 4. Radial Tools (Corner Radius)
**Best for:** Edge rounding, corner finishing

**Characteristics:**
- Rounded corner for edge work
- Creates consistent radius
- Good for edge finishing
- Reduces sharp edges

**Parameters:**
- Corner Radius: 0.5mm - 5mm
- Diameter: 6mm - 16mm
- Length: 30mm - 60mm
- Flutes: 2-4

**Common Applications:**
- Edge rounding
- Corner finishing
- Safety edge creation
- Decorative edge work

### 5. Special Tools
**Best for:** Custom operations, specialized cuts

**Types:**
- Dovetail cutters
- Keyhole cutters
- T-slot cutters
- Custom profiles

**Parameters:**
- Varies by tool type
- Custom parameters for each tool
- Specialized geometries

**Common Applications:**
- Joinery work
- Hardware mounting
- Custom profiles
- Specialized cuts

## Door Surface Operations

### Top Surface Machining

#### 1. Roughing Operations
- **Tool:** 10mm Cylindrical End Mill
- **Purpose:** Remove bulk material quickly
- **Depth:** 2-5mm per pass
- **Feed Rate:** 1000-1500 mm/min
- **Spindle Speed:** 12000-15000 RPM

#### 2. Finishing Operations
- **Tool:** 6mm Cylindrical End Mill
- **Purpose:** Create smooth final surface
- **Depth:** 0.5-1mm per pass
- **Feed Rate:** 600-1000 mm/min
- **Spindle Speed:** 15000-18000 RPM

#### 3. Decorative Work
- **Tool:** 6mm Ball End Mill or V-Bits
- **Purpose:** Create decorative patterns
- **Depth:** 1-3mm
- **Feed Rate:** 400-800 mm/min
- **Spindle Speed:** 18000-24000 RPM

### Bottom Surface Machining

#### 1. Hardware Pockets
- **Tool:** 6mm-10mm Cylindrical End Mill
- **Purpose:** Create recesses for hinges, locks
- **Depth:** 3-15mm
- **Strategy:** Pocket clearing with ramping

#### 2. Joinery Features
- **Tool:** Dovetail Cutter or Special Tools
- **Purpose:** Create joints for assembly
- **Precision:** High accuracy required
- **Tolerances:** ±0.1mm

#### 3. Finishing
- **Tool:** Ball End Mill
- **Purpose:** Smooth surfaces around hardware
- **Light passes:** 0.2-0.5mm depth

## Tool Selection Guidelines

### Material Considerations

#### Softwood (Pine, Fir)
- **Tools:** HSS or Carbide
- **Speeds:** Lower speeds to prevent burning
- **Feeds:** Higher feed rates possible

#### Hardwood (Oak, Maple)
- **Tools:** Carbide preferred
- **Speeds:** Higher speeds for clean cuts
- **Feeds:** Moderate feed rates

#### Engineered Materials (MDF, Plywood)
- **Tools:** Carbide with sharp edges
- **Coatings:** TiN or TiAlN recommended
- **Dust extraction:** Critical

### Cutting Parameters

#### Feed Rate Guidelines
- **Roughing:** 800-1500 mm/min
- **Finishing:** 400-1000 mm/min
- **Detail Work:** 200-600 mm/min

#### Spindle Speed Guidelines
- **Large Tools (>10mm):** 8000-15000 RPM
- **Medium Tools (6-10mm):** 12000-20000 RPM
- **Small Tools (<6mm):** 18000-30000 RPM

#### Step Down Guidelines
- **Roughing:** 50-80% of tool diameter
- **Finishing:** 10-30% of tool diameter
- **Detail Work:** 5-15% of tool diameter

## Tool Maintenance

### Inspection Points
1. **Cutting Edge Sharpness**
2. **Chip Buildup**
3. **Tool Wear Patterns**
4. **Runout Check**

### Maintenance Schedule
- **Daily:** Visual inspection
- **Weekly:** Detailed inspection
- **Monthly:** Precision measurement
- **As Needed:** Resharpening or replacement

## Safety Considerations

### Personal Protective Equipment
- Safety glasses
- Hearing protection
- Dust mask or respirator
- Appropriate clothing

### Machine Safety
- Proper tool holding
- Correct speeds and feeds
- Adequate dust collection
- Emergency stop accessibility

### Tool Safety
- Proper tool installation
- Direction of rotation check
- Workpiece securing
- Clear workspace

## Integration with Lua Editor

### Tool Definition
Tools are defined in the CNC Tool Selector with:
- Physical parameters (diameter, length)
- Material properties
- Cutting parameters
- Application guidelines

### Operation Assignment
Tools can be assigned to specific operations:
- Surface selection (top/bottom)
- Operation type (roughing/finishing)
- Cutting parameters
- Tool path generation

### Visualization
The 3D visualization shows:
- Tool paths
- Material removal
- Surface finish preview
- Collision detection

## Example Workflow

1. **Design Analysis**
   - Identify required operations
   - Select appropriate tools
   - Plan machining sequence

2. **Tool Setup**
   - Load tools in CNC Tool Selector
   - Verify parameters
   - Assign to operations

3. **Programming**
   - Write Lua script with tool calls
   - Test in debug mode
   - Verify tool paths

4. **Machining**
   - Setup workpiece
   - Load tools in machine
   - Execute program
   - Monitor progress

This comprehensive tool system enables efficient and precise door surface machining with proper tool selection and parameter optimization.
