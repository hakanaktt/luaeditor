-- Test script to verify AdekoLib alias detection
G = ADekoLib

-- Test basic functions with alias
G.start()
G.makePartShape("TestPart")

-- Test point creation
G.point(10, 20, 0)
G.point(30, 40, 0)
G.point(50, 60, 0)

-- Test shape operations
G.nextShape()
G.rectangle(0, 0, 100, 50)

-- Test analysis functions
local shapeCount = G.dataSize()
local pointCount = G.pointSize(1)

-- Test utility functions
G.showPoints(true)
G.enableListing(true)

-- Test with different alias
local Lib = ADekoLib
Lib.circle(25, 25, 15)

-- Test Menderes patterns
local pattern = G.menderes1({0, 0}, {100, 0}, 10, 5)

G.finish()
