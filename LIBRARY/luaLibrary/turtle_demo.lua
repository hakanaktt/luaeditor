-- Turtle Graphics Demo Script
-- This script demonstrates the turtle graphics capabilities
-- Run this script in debug mode to see the visual output

-- Clear the screen and set up
wipe()
pndn()  -- Put pen down
pncl("blue")  -- Set pen color to blue
pnsz(2)  -- Set pen size to 2

-- Draw a square
for i = 1, 4 do
    move(100)  -- Move forward 100 pixels
    turn(90)   -- Turn 90 degrees
end

-- Move to a new position
pnup()  -- Lift pen
posn(-50, -50)  -- Move to position (-50, -50)
pndn()  -- Put pen down

-- Draw a circle using small line segments
pncl("red")  -- Change color to red
for i = 1, 36 do
    move(5)    -- Small forward movement
    turn(10)   -- Turn 10 degrees (36 * 10 = 360 degrees)
end

-- Draw some text
pnup()
posn(-100, 100)
text("Hello from Lua Debug Mode!", 0)

-- Draw a spiral
pndn()
pncl("green")
posn(0, 0)
for i = 1, 50 do
    move(i * 2)  -- Increase distance each time
    turn(91)     -- Turn slightly more than 90 degrees
end

-- Add some random dots
pnup()
for i = 1, 20 do
    posn(rand(200) - 100, rand(200) - 100)  -- Random position
    pncl(ranc())  -- Random color
    pixl(0, 0)    -- Draw a pixel
end

print("Turtle graphics demo completed!")
print("You should see a blue square, red circle, green spiral, and random colored dots.")
