-- Test script to demonstrate bigger text in 2D visualization
-- This script creates various text elements to show the improved readability

function modelMain()
    -- Draw some basic shapes with text labels
    
    -- Draw a rectangle with a label
    ADekoLib.rectangle(50, 50, 200, 100)
    ADekoLib.text("Rectangle", 125, 100, 16)
    
    -- Draw a circle with a label
    ADekoLib.circle(300, 100, 50)
    ADekoLib.text("Circle", 300, 100, 16)
    
    -- Draw a line with labels at both ends
    ADekoLib.line(50, 200, 350, 250)
    ADekoLib.text("Start", 50, 200, 12)
    ADekoLib.text("End", 350, 250, 12)
    
    -- Add some face labels (these will appear much bigger now)
    ADekoLib.text("Left", 100, 300, 14)
    ADekoLib.text("Right", 200, 300, 14)
    ADekoLib.text("Top", 300, 300, 14)
    ADekoLib.text("Bottom", 400, 300, 14)
    ADekoLib.text("Front", 500, 300, 14)
    ADekoLib.text("Rear", 600, 300, 14)
    
    -- Add coordinate labels
    ADekoLib.text("(0,0)", 0, 0, 10)
    ADekoLib.text("(100,100)", 100, 100, 10)
    ADekoLib.text("(200,200)", 200, 200, 10)
    
    print("Text visualization test completed!")
    print("All text should now appear much larger and more readable")
end
