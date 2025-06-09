-- Test script to verify module loading works
print("Testing module loading...")

-- Test requiring ADekoDebugMode
local success, result = pcall(require, "ADekoDebugMode")
if success then
    print("✓ ADekoDebugMode loaded successfully")
else
    print("✗ Failed to load ADekoDebugMode: " .. tostring(result))
end

-- Test basic functionality
print("Testing basic functionality...")
print("X =", X)
print("Y =", Y)
print("materialThickness =", materialThickness)

-- Test ADekoLib access
if ADekoLib then
    print("✓ ADekoLib is available")
    if ADekoLib.setFace then
        print("✓ ADekoLib.setFace function is available")
    else
        print("✗ ADekoLib.setFace function is not available")
    end
else
    print("✗ ADekoLib is not available")
end

print("Test completed.")
