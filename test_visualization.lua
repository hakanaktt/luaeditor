-- Test script to verify visualization fixes
-- This script creates various draw commands to test both 2D and 3D visualization

-- Initialize drawing
print("Testing visualization fixes...")

-- Helper function to set layer and draw a line
function drawLineOnLayer(x1, y1, x2, y2, layer, thickness)
    currentLayerName = layer
    currentThickness = thickness or 5
    line(x1, y1, x2, y2)
end

-- Helper function to set layer and draw a circle
function drawCircleOnLayer(x, y, radius, layer, thickness)
    currentLayerName = layer
    currentThickness = thickness or 3
    crcl(x, y, radius)
end

-- Helper function to set layer and draw text
function drawTextOnLayer(x, y, textContent, layer)
    currentLayerName = layer
    text(x, y, textContent)
end

-- Create test draw commands for different tool types

-- Test cylindrical tool operations (rectangular path)
print("Creating cylindrical tool test...")
drawLineOnLayer(100, 100, 200, 100, "K_Freze10mm", 5)
drawLineOnLayer(200, 100, 200, 200, "K_Freze10mm", 5)
drawLineOnLayer(200, 200, 100, 200, "K_Freze10mm", 5)
drawLineOnLayer(100, 200, 100, 100, "K_Freze10mm", 5)

-- Test ballnose operations (circle)
print("Creating ballnose tool test...")
drawCircleOnLayer(150, 150, 25, "H_Ballnose6mm", 3)

-- Test conical tool operations (L-shape)
print("Creating conical tool test...")
drawLineOnLayer(250, 100, 350, 100, "V_Aciliv90", 4)
drawLineOnLayer(350, 100, 350, 200, "V_Aciliv90", 4)

-- Test bottom surface operations (SF suffix)
print("Creating bottom surface test...")
drawLineOnLayer(400, 100, 500, 100, "K_Freze8mm_SF", 6)
drawLineOnLayer(500, 100, 500, 200, "K_Freze8mm_SF", 6)

-- Test different tool types for comprehensive testing
print("Creating additional tool tests...")

-- Test special tool (desen pattern)
drawLineOnLayer(100, 250, 150, 300, "H_Desen_IC", 2)
drawLineOnLayer(150, 300, 200, 250, "H_Desen_IC", 2)

-- Test roughing operation
drawLineOnLayer(250, 250, 350, 250, "Kaba_Freze12mm", 8)
drawCircleOnLayer(300, 275, 15, "Kaba_Freze12mm", 8)

-- Test finishing operation
drawLineOnLayer(400, 250, 500, 250, "Son_Ballnose3mm", 1)
drawCircleOnLayer(450, 275, 10, "Son_Ballnose3mm", 1)

-- Add some text labels
drawTextOnLayer(150, 50, "Cylindrical Tool Test", "LUA")
drawTextOnLayer(300, 50, "Conical Tool Test", "LUA")
drawTextOnLayer(450, 50, "Bottom Surface Test", "LUA")
drawTextOnLayer(150, 320, "Special Tool Test", "LUA")
drawTextOnLayer(300, 320, "Roughing Test", "LUA")
drawTextOnLayer(450, 320, "Finishing Test", "LUA")

-- Create a more complex shape for testing
print("Creating complex test shape...")
currentLayerName = "Complex_Freze6mm"
currentThickness = 4

-- Draw a star pattern
local centerX, centerY = 300, 400
local outerRadius, innerRadius = 40, 20
local points = 5

for i = 0, points * 2 - 1 do
    local angle1 = (i * math.pi) / points
    local angle2 = ((i + 1) * math.pi) / points

    local radius1 = (i % 2 == 0) and outerRadius or innerRadius
    local radius2 = ((i + 1) % 2 == 0) and outerRadius or innerRadius

    local x1 = centerX + radius1 * math.cos(angle1)
    local y1 = centerY + radius1 * math.sin(angle1)
    local x2 = centerX + radius2 * math.cos(angle2)
    local y2 = centerY + radius2 * math.sin(angle2)

    line(x1, y1, x2, y2)
end

print("Test visualization script completed!")
print("Total layers created:")
print("- K_Freze10mm (cylindrical tool)")
print("- H_Ballnose6mm (ballnose tool)")
print("- V_Aciliv90 (conical tool)")
print("- K_Freze8mm_SF (bottom surface)")
print("- H_Desen_IC (special tool)")
print("- Kaba_Freze12mm (roughing)")
print("- Son_Ballnose3mm (finishing)")
print("- Complex_Freze6mm (complex shape)")
print("")
print("Switch to 3D view to test CSG operations")
print("Use the CSG buttons in the 3D toolbar to test tool operations")
