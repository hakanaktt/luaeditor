-- Test file for colorful syntax highlighting
-- This comment should be gray and italic

function modelMain()  -- 'function' should be red/pink, 'modelMain' should be purple
    -- Local variables
    local x = 100        -- 'local' red, 'x' green, '100' cyan
    local y = 200.5      -- 'local' red, 'y' green, '200.5' cyan
    local name = "Test"  -- 'local' red, 'name' green, "Test" blue
    local active = true  -- 'local' red, 'active' green, 'true' red
    
    -- AdekoLib function calls
    ADekoLib.setLayer("LMM0")    -- 'ADekoLib' white, 'setLayer' yellow
    ADekoLib.setFace(1)          -- 'ADekoLib' white, 'setFace' yellow
    ADekoLib.setThickness(18)    -- 'ADekoLib' white, 'setThickness' yellow
    
    -- Drawing functions
    ADekoLib.point(x, y)         -- 'ADekoLib' white, 'point' yellow
    ADekoLib.line(x, y, x+50, y+50)  -- 'ADekoLib' white, 'line' yellow
    ADekoLib.circle(x, y, 25)    -- 'ADekoLib' white, 'circle' yellow
    
    -- Lua built-in functions
    print("Hello World")         -- 'print' purple, "Hello World" blue
    local len = string.len(name) -- 'string.len' purple
    local sqrt = math.sqrt(x)    -- 'math.sqrt' purple
    
    -- Control structures
    if active then               -- 'if' and 'then' red
        print("Active")          -- 'print' purple
    elseif x > 0 then           -- 'elseif' and 'then' red
        print("Positive")        -- 'print' purple
    else                        -- 'else' red
        print("Inactive")        -- 'print' purple
    end                         -- 'end' red
    
    -- Loop
    for i = 1, 10 do            -- 'for', 'do' red, '1', '10' cyan
        ADekoLib.point(i*10, i*10)  -- 'ADekoLib' white, 'point' yellow
    end                         -- 'end' red
    
    -- Operators
    local result = x + y * 2    -- '+', '*' should be red/pink
    local equal = (x == y)      -- '==', '(', ')' should be red/pink
    
    return true                 -- 'return' and 'true' red
end

-- Another function
function helper()               -- 'function' red, 'helper' purple
    return "done"               -- 'return' red, "done" blue
end
