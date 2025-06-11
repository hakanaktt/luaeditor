-- Test script to verify layer information and bottom face positioning

-- Load ADekoLib
ADekoLib = require("ADekoLib")
require("turtle")

-- Start ADekoLib
ADekoLib.start()

-- Test 1: Top face operations (should appear in top face area with grid offset)
ADekoLib.setLayer("PANEL")
ADekoLib.setFace("top")
line(50, 50, 150, 150)
crcl(100, 100, 25)

-- Test 2: Bottom face operations with SF suffix (should appear in bottom face area)
ADekoLib.setLayer("H_Freze20mm_Ic_SF")
ADekoLib.setFace("bottom")
line(50, 50, 150, 150)
crcl(100, 100, 25)

-- Test 3: More bottom face operations
ADekoLib.setLayer("K_Freze20mm_SF")
rect(200, 200, 100, 100)

-- Test 4: Regular top face operation
ADekoLib.setLayer("K_AciliV45")
ADekoLib.setFace("top")
rect(200, 200, 100, 100)

print("Test completed - bottom face operations should appear in bottom face area")
