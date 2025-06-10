-- Sample Lua code to test colorful syntax highlighting
-- This file demonstrates various Lua constructs and AdekoLib functions

function modelMain()
    -- Set up the drawing environment
    ADekoLib.setLayer("LMM0")
    ADekoLib.setThickness(18)
    ADekoLib.setFace(1)
    
    -- Local variables with different types
    local x, y = 100, 100
    local radius = 25.5
    local message = "Hello, World!"
    local isActive = true
    local count = 0x10  -- Hexadecimal number
    
    -- Basic drawing functions
    ADekoLib.point(x, y)
    ADekoLib.line(x, y, x + 50, y + 50)
    ADekoLib.circle(x, y, radius)
    ADekoLib.rectangle(x - 10, y - 10, x + 10, y + 10)
    
    -- Control structures
    if isActive then
        print("Drawing is active")
        
        -- Loop with AdekoLib functions
        for i = 1, 5 do
            local newX = x + i * 20
            local newY = y + i * 15
            ADekoLib.point(newX, newY)
            
            -- String operations
            local label = "Point " .. tostring(i)
            print(label)
        end
    elseif count > 0 then
        print("Count is positive: " .. count)
    else
        print("Default case")
    end
    
    -- While loop
    local j = 1
    while j <= 3 do
        ADekoLib.arc(x + j * 30, y, 10, 0, math.pi)
        j = j + 1
    end
    
    -- Repeat-until loop
    local k = 1
    repeat
        ADekoLib.ellipse(x, y + k * 40, k * 5, k * 3)
        k = k + 1
    until k > 3
    
    -- Function calls with different patterns
    local distance = math.sqrt((x * x) + (y * y))
    local angle = math.atan2(y, x)
    local formatted = string.format("Distance: %.2f, Angle: %.2f", distance, angle)
    
    -- Table operations
    local points = {}
    for i = 1, 10 do
        table.insert(points, {x = i * 10, y = i * 5})
    end
    
    -- Draw points from table
    for _, point in ipairs(points) do
        ADekoLib.point(point.x, point.y)
    end
    
    -- Advanced AdekoLib functions
    ADekoLib.setColor("red")
    ADekoLib.setPenWidth(2)
    ADekoLib.setLineType("dashed")
    
    -- Nested function definition
    local function drawShape(centerX, centerY, size)
        local halfSize = size / 2
        ADekoLib.rectangle(centerX - halfSize, centerY - halfSize, 
                          centerX + halfSize, centerY + halfSize)
        return true
    end
    
    -- Call nested function
    drawShape(200, 200, 50)
    
    -- Error handling
    local success, result = pcall(function()
        return ADekoLib.getX() + ADekoLib.getY()
    end)
    
    if success then
        print("Operation successful: " .. result)
    else
        print("Operation failed: " .. result)
    end
    
    -- Multi-line string
    local multilineText = [[
        This is a multi-line string
        that spans several lines
        and can contain "quotes" and 'apostrophes'
    ]]
    
    -- Block comment
    --[[
        This is a block comment
        that can span multiple lines
        and is useful for documentation
    ]]
    
    -- Return statement
    return {
        success = true,
        pointsDrawn = #points,
        message = "Drawing completed successfully"
    }
end

-- Global function
function helper()
    print("This is a helper function")
end

-- Call the main function
if modelMain then
    local result = modelMain()
    print("Result:", result.message)
end
