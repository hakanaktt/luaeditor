-- AdekoLib IntelliSense Demo
-- This file demonstrates the IntelliSense features available in the Lua editor
-- Try typing "ADekoLib." to see the auto-completion in action

-- Start by creating a part
ADekoLib.makePart(600, 400)

-- Set the working face to top
ADekoLib.setFace("top")

-- Set layer for panel geometry
ADekoLib.setLayer("PANEL")

-- Basic shape creation
-- Try typing these functions to see parameter hints:

-- Create a simple rectangle
ADekoLib.rectangle({50, 50}, {550, 350})

-- Create a circle
ADekoLib.circle({300, 200}, 25)

-- Create a line with bulge (arc)
ADekoLib.line({100, 100}, {200, 100}, 0.5)

-- Machining operations
-- Set thickness for cutting operations
ADekoLib.setThickness(-5)

-- Create a groove
ADekoLib.groove({100, 150}, {500, 150}, -3)

-- Create holes for screws
ADekoLib.hole({150, 250}, 2.5, -10)
ADekoLib.hole({450, 250}, 2.5, -10)

-- Create a pocket
ADekoLib.pocket({200, 300}, {400, 350}, -8, 6)

-- Geometric transformations
-- Create some points to work with
local originalPoints = {
  {100, 100},
  {200, 100},
  {200, 200},
  {100, 200}
}

-- Rotate the points around center
local center = {150, 150}
local rotatedPoints = ADekoLib.rotate(originalPoints, center, 45)

-- Translate points
local translatedPoints = ADekoLib.translate(originalPoints, 90, 50)

-- Mirror points
local mirroredPoints = ADekoLib.mirror(originalPoints, "x", 300, 0)

-- Point and vector operations
local point1 = {0, 0}
local point2 = {100, 100}

-- Calculate distance
local dist = ADekoLib.distance(point1, point2)

-- Calculate angle
local angle = ADekoLib.angle(point1, point2)

-- Create point at polar coordinates
local polarPoint = ADekoLib.polar(point1, 45, 50)

-- Polyline operations
-- Create a complex polyline
ADekoLib.polyline(
  {50, 50},
  {150, 50},
  {200, 100},
  {150, 150},
  {50, 150}
)

-- Create offset polyline
local offsetPoints = ADekoLib.offSet(originalPoints, 10)

-- Analysis and testing
-- Test if a point is inside a polygon
local testPoint = {150, 150}
local isInside = ADekoLib.isPointInsidePolygon(testPoint, originalPoints)

-- Find line intersection
local line1Start = {0, 0}
local line1End = {100, 100}
local line2Start = {0, 100}
local line2End = {100, 0}
local intersection = ADekoLib.lineLineIntersection(line1Start, line1End, line2Start, line2End)

-- Advanced machining operations
-- Create an inclined pocket
ADekoLib.inclinedPocket({100, 200}, {200, 250}, -10, 5, 6, "v")

-- Create a sunken frame
ADekoLib.sunkenFrame({50, 300}, {250, 380}, -5, 60, 8)

-- Working with different faces
-- Switch to bottom face
ADekoLib.setFace("bottom")

-- Create geometry on bottom face
ADekoLib.rectangle({100, 100}, {500, 300})

-- Switch to front face
ADekoLib.setFace("front")

-- Create edge details
ADekoLib.groove({0, 0}, {600, 0}, -2)

-- Utility functions
-- Deep copy points
local copiedPoints = ADekoLib.deepcopy(originalPoints)

-- Add points
local sum = ADekoLib.ptAdd({10, 20}, {30, 40})

-- Subtract points
local diff = ADekoLib.ptSubtract({50, 60}, {10, 20})

-- Vector operations
local vector = {1, 1, 1}
local normalizedVector = ADekoLib.vecNormalize(vector)
local scaledVector = ADekoLib.vecScale(vector, 2)

-- Data management
-- Start a new shape
ADekoLib.nextShape()

-- Add nodes manually
ADekoLib.node({0, 0, 0})
ADekoLib.node({100, 0, 0})
ADekoLib.node({100, 100, 0})
ADekoLib.node({0, 100, 0})

-- Finish the current shape
ADekoLib.nextShape()

-- Tips for using IntelliSense:
-- 1. Type "ADekoLib." to see all available functions
-- 2. Use Ctrl+Space to trigger auto-completion manually
-- 3. Hover over function names to see documentation
-- 4. Use the Function Browser panel to explore available functions
-- 5. Functions are organized by category for easy discovery
-- 6. Each function shows parameter types and descriptions
-- 7. Examples are provided for each function
-- 8. Related functions are suggested for further exploration

print("IntelliSense demo completed!")
print("Distance calculated:", dist)
print("Angle calculated:", angle)
print("Point inside polygon:", isInside)
