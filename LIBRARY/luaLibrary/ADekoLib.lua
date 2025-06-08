local ADekoLib = {}

------------------------------------------------
-- Returns the rotated polygon.
function ADekoLib.rotate(polygon, reference, theta)
  if (theta==0) then
    return polygon
  end
  local retVal = {}
  for i, p in ipairs({ADekoLib.unpack(polygon)}) 
  do
    local d = ADekoLib.distance(p, reference)
    local startAngle = ADekoLib.angle(p, reference)
    local b = (startAngle+theta)*math.pi/180.0
    local thePoint = {d*math.cos(b)+reference[1], d*math.sin(b)+reference[2]}
    if (#p>2) then
      for j=3, #p, 1
      do
        thePoint[j] = p[j]
      end
    end
    table.insert(retVal, thePoint)
  end
  return retVal
end

------------------------------------------------
--Translates a polygon with an angle to a distance
function ADekoLib.translate(pointTable, theta, distance)
  local retVal = {}
  for i,point in ipairs(pointTable) do
    local newPoint = ADekoLib.polar(point,theta,distance)
    table.insert(retVal, newPoint)
  end
  return retVal
end

function ADekoLib.moveWithDeltaVec(pointTable, vec)
  vec[3] = vec[3] or 0
  --point table items consist x y z and bulge
  local ret = {}
  for k, v in pairs(pointTable) do
    table.insert(ret,{ v[1] + vec[1] , v[2] + vec[2] , v[3] + vec[3] , v[4]})
  end
  return ret
end

------------------------------------------------
--Mirrors a polygon over desired axes
function ADekoLib.mirror(pointTable, axis, X, Y)
  local retVal = {}
  for i,point in ipairs(pointTable) do
    local mirPoint = {}
    if (axis == "x") then
      mirPoint[1] = X-point[1]
      mirPoint[2] = point[2]
      for i=3,#point,1 do
        mirPoint[i] = point[i]
      end
      if #mirPoint > 3 then
        mirPoint[4] = -1*mirPoint[4]
      end
    elseif (axis == "y") then
      mirPoint[1] = point[1]
      mirPoint[2] = Y-point[2]
      for i=3,#point,1 do
        mirPoint[i] = point[i]
      end
      if #mirPoint > 3 then
        mirPoint[4] = -1*mirPoint[4]
      end
    elseif (axis == "xy") then
      mirPoint[1] = X-point[1]
      mirPoint[2] = Y-point[2]
      for i=3,#point,1 do
        mirPoint[i] = point[i]
      end
    else
      print("Axis is not valid!")
      return false
    end
    table.insert(retVal, mirPoint)
  end
  --ADekoLib.sortCCW(retVal)
  return retVal
end

------------------------------------------------
-- Depicts and writes the name of the parameter.
function ADekoLib.showPar(p1, p2, parName, thickness)
 
  if (pncl==nil) then
    return
  end
  
  local penSize = thickness or 1
 
  local small = false
  local gap = ADekoLib.distance(p1, p2)
  local smallnessThreshold = 20
 
  if (gap < smallnessThreshold) then
    small = true
  end
 
  pncl(colr(0, 200, 0))
  pnsz(penSize)
  local angle = ADekoLib.angle(p1, p2)
  local size, theta = 10, 15
  local middlePoint = {p1[1]/2+p2[1]/2, p1[2]/2+p2[2]/2}
  local distance = 10
   
  if (small == false) then
    line(p1[1], p1[2], p2[1], p2[2])
    local q1 = ADekoLib.polar(p1, angle-theta, size)
    local q2 = ADekoLib.polar(p2, angle-theta+180, size)
    line(p1[1], p1[2], q1[1], q1[2])
    line(p2[1], p2[2], q2[1], q2[2])
    local labelLocation = ADekoLib.polar(middlePoint, angle+90, distance)
    ADekoLib.labelPoint(labelLocation, parName)
  end
 
  if (small == true) then
    local excess = 20
    local q1 = ADekoLib.polar(p1, angle+180, excess)
    local q2 = ADekoLib.polar(p2, angle, excess)
    line(q1[1], q1[2], p1[1], p1[2])
    line(q2[1], q2[2], p2[1], p2[2])
    q1 = ADekoLib.polar(p1, angle-theta+180, size)
    q2 = ADekoLib.polar(p2, angle-theta, size)
    line(p1[1], p1[2], q1[1], q1[2])
    line(p2[1], p2[2], q2[1], q2[2])
    local labelLocation = ADekoLib.polar(q2, angle+90, distance)
    ADekoLib.labelPoint(labelLocation, parName)
  end
 
  pncl(colr(0, 0, 0))
  pnsz(1)
end

------------------------------------------------
function ADekoLib.inclinedPocket2Prim(firstPoint, secondPoint, firstDepth, secondDepth, step, toolDiameter)
  
  -- check tool diameter
  local width  = secondPoint[1] - firstPoint[1]  
  local height = secondPoint[2] - firstPoint[2]
  if (toolDiameter > width or toolDiameter > height) then
    ADekoLib.error("Tool diameter too large!")
    return false
  end
  
  -- turtle graphics is enabled
  if (pncl~=nil) then 
    pncl(colr(255, 255, 0))
    pnsz(5)
    rect(firstPoint[1]+3, firstPoint[2]+3, width-6, height-6, 10)
    pncl(colr(0, 0, 0))
    pnsz(1)
  end
  
  -- define start and end points
  local p1 = ADekoLib.ptAdd(firstPoint, {toolDiameter/2, toolDiameter/2})
  local p2 = ADekoLib.ptSubtract(secondPoint, {toolDiameter/2, toolDiameter/2})
  local dX = p2[1] - p1[1]
  local dY = p2[2] - p1[2]
  
  -- how many cycles needed to form the pocket
  local howMany = math.floor(math.abs(firstPoint[2] - secondPoint[2]) / step)
  
  -- calculate modified step size
  local mStep = dY/howMany

  -- calculate depth step
  local mDepth = math.abs(secondDepth - firstDepth) / howMany

  -- Create the corresponding points for repeating "U"s
  for i=0, howMany-1, 2
  do
    local n1, n2, n3, n4 = {}, {}, {}, {}
    n1 = ADekoLib.deepcopy(p1)                    n1[3] = firstDepth - (i)   * mDepth
    n2 = ADekoLib.ptAdd(n1, {dX  , 0      })      n2[3] = firstDepth - (i)   * mDepth
    n3 = ADekoLib.ptAdd(n2, {0   , mStep  })      n3[3] = firstDepth - (i+1) * mDepth
    n4 = ADekoLib.ptAdd(n3, {-dX , 0      })      n4[3] = firstDepth - (i+1) * mDepth
    p1 = ADekoLib.ptAdd(p1, {0   , 2*mStep})      
    ADekoLib.node(n1)
    ADekoLib.node(n2)
    ADekoLib.node(n3)
    ADekoLib.node(n4)
  end
  
  -- the last line, "I", if any
  if (howMany%2 == 0) then
    n1 = ADekoLib.deepcopy(p1)           n1[3] = firstDepth - howMany * mDepth
    n2 = ADekoLib.ptAdd(n1, {dX, 0})     n2[3] = firstDepth - howMany * mDepth
    ADekoLib.node(n1)
    ADekoLib.node(n2)
  end
  
  ADekoLib.nextShape()
end

------------------------------------------------
-- Creates an inclined pocket inbetween two diagonal points for the given toolDiameter as well as given
-- step as the resolution. The points are inclined with varying z-values. See also inclinedPocket().
function ADekoLib.inclinedPocket2(firstPoint, secondPoint, depth, step, toolDiameter, dontCreateReturnAsPolygon)
  
  dontCreateReturnAsPolygon = dontCreateReturnAsPolygon or false
  
  -- check tool diameter
  local width  = math.abs(secondPoint[1] - firstPoint[1])  
  local height = math.abs(secondPoint[2] - firstPoint[2])
  if (toolDiameter > width or toolDiameter > height) then
    ADekoLib.error("Tool diameter too large! (w:" .. width .. ", h:" .. height)
    return false
  end
  
  -- turtle graphics is enabled
  if (not dontCreateReturnAsPolygon) then
    if (pncl~=nil) then 
      pncl(colr(255, 255, 0))
      pnsz(5)
      rect(firstPoint[1]+3, firstPoint[2]+3, width-6, height-6, 10)
      pncl(colr(0, 0, 0))
      pnsz(1)
    end
  end
  
  -- define start and end points
  local p1 = ADekoLib.ptAdd(firstPoint, {toolDiameter/2, toolDiameter/2})
  local p2 = ADekoLib.ptSubtract(secondPoint, {toolDiameter/2, toolDiameter/2})
  local dX = p2[1] - p1[1]
  local dY = p2[2] - p1[2]
  
  -- how many cycles needed to form the pocket
  local howMany = math.floor(math.abs(firstPoint[2] - secondPoint[2]) / step)
  
  -- calculate modified step size
  local mStep = dY/howMany

  -- calculate depth step
  local mDepth = math.abs(depth) / howMany

  -- Create the corresponding points for repeating "U"s
  local retVal = {}
  for i=0, howMany-1, 2
  do
    local n1, n2, n3, n4 = {}, {}, {}, {}
    n1 = ADekoLib.deepcopy(p1)                    n1[3] = -(i)   * mDepth
    n2 = ADekoLib.ptAdd(n1, {dX  , 0      })      n2[3] = -(i)   * mDepth
    n3 = ADekoLib.ptAdd(n2, {0   , mStep  })      n3[3] = -(i+1) * mDepth
    n4 = ADekoLib.ptAdd(n3, {-dX , 0      })      n4[3] = -(i+1) * mDepth
    p1 = ADekoLib.ptAdd(p1, {0   , 2*mStep})    
    if (not dontCreateReturnAsPolygon) then
      ADekoLib.node(n1)
      ADekoLib.node(n2)
      ADekoLib.node(n3)
      ADekoLib.node(n4)
    else
      table.insert(retVal, n1)
      table.insert(retVal, n2)
      table.insert(retVal, n3)
      table.insert(retVal, n4)
    end
  end
  
  -- the last line, "I", if any
  if (howMany%2 == 0) then
    n1 = ADekoLib.deepcopy(p1)           n1[3] = -howMany * mDepth
    n2 = ADekoLib.ptAdd(n1, {dX, 0})     n2[3] = -howMany * mDepth
    if (not dontCreateReturnAsPolygon) then
      ADekoLib.node(n1)
      ADekoLib.node(n2)
    else
      table.insert(retVal, n1)
      table.insert(retVal, n2)
    end
  end
  
  if (not dontCreateReturnAsPolygon) then
    ADekoLib.nextShape()
  else
    return retVal
  end
end

------------------------------------------------
-- Returns true if the point is inside the polygon, false otherwise.
function ADekoLib.isPointInsidePolygon(point, polygon)
  local counter = 0
  local xinters
  local p1, p2 = polygon[1], {}
  for i=1, (#polygon), 1 
  do
    p2 = polygon[i % (#polygon) + 1];
    if (point[2] > math.min(p1[2], p2[2])) then
      if (point[2] <= math.max(p1[2], p2[2])) then
        if (point[1] <= math.max(p1[1], p2[1])) then
          if (p1[2] ~= p2[2]) then
            xinters = (point[2] - p1[2]) * (p2[1] - p1[1]) / (p2[2] - p1[2]) + p1[1]
            if (p1[1] == p2[1] or point[1] <= xinters) then
              counter = counter + 1
            end
          end
        end
      end
    end
    p1 = p2;
  end
  if (counter % 2 == 0) then
    return false
  end
  return true
end

------------------------------------------------
-- Removes background from a polyline. The background is defined by a z-threshold
-- above or below which the points are just excluded from the returning polyline. 
-- This function is usefull especially when the polyline represents an image scan 
-- with a sparse structure and potentially decreases the processing significantly.
function ADekoLib.removeBackgroundAtTop(polyline, threshold)
  local retVal = {}
  local i = 1
  local within = false
  while (i<#polyline) do
    if (polyline[i][3]<threshold) then
      if (within==false) then 
        within = true
        table.insert(retVal, polyline[i-1])
      end
      table.insert(retVal, polyline[i])
    else
      if (within==true) then
        within = false
        table.insert(retVal, polyline[i])
      end
    end
    i = i + 1
  end
  return retVal
end

------------------------------------------------
-- Merges same-direction segments such that the resulting 
-- returned polyline is smaller without detail-loss.
function ADekoLib.reducePolyline(polyline)
  local retVal, startPoint, endPoint, previousEndPoint, i = {}, {}, {}, {-999, -999}, 1
  while (i+2 <= #polyline) do
    startPoint = polyline[i]
    endPoint = polyline[i+1]
    while ((i+2 <= #polyline) and ADekoLib.areParallell(polyline[i], polyline[i+1], polyline[i+2])) do
      endPoint = polyline[i+2]
      i = i + 1
    end
    if (not ADekoLib.areRoughlyEqual(previousEndPoint[1], startPoint[1]) or not ADekoLib.areRoughlyEqual(previousEndPoint[2], startPoint[2])) then
      table.insert(retVal, startPoint)
    end
    table.insert(retVal, endPoint)
    previousEndPoint = ADekoLib.deepcopy(endPoint)
    i = i + 1
  end
  return retVal
end

------------------------------------------------
-- Returns true if the points are on the same line (like "the three kings" asterism in astronomy)
function ADekoLib.areParallell(p1, p2, p3)
  local d12 = ADekoLib.distance3D(p1, p2)
  local d13 = ADekoLib.distance3D(p1, p3)
  local d23 = ADekoLib.distance3D(p2, p3)
  return ADekoLib.areRoughlyEqual(d13, d12+d23)
end

------------------------------------------------
-- Returns distance between two points in 3D
function ADekoLib.distance3D(p1, p2)
	assert(type(p1)=="table", "p1 is not a table")
	assert(type(p2)=="table", "p2 is not a table")
  p1[3] = p1[3] or 0
  p2[3] = p2[3] or 0
	return (math.sqrt(((p2[1]-p1[1])*(p2[1]-p1[1]))+((p2[2]-p1[2])*(p2[2]-p1[2]))+((p2[3]-p1[3])*(p2[3]-p1[3]))))
end

------------------------------------------------
-- Fits points inbetween given boundaries on Z.
function ADekoLib.scaleDepth(points, zMin, zMax)
  local retVal = {}
  local copy = ADekoLib.deepcopy(points)
  local minZ, maxZ = 999, -999
  for i, v in ipairs(copy)
  do
    if (minZ>v[3]) then 
      minZ = v[3] 
    end
    if (maxZ<v[3]) then 
      maxZ = v[3] 
    end
  end
  local originalRange = maxZ-minZ
  local desiredRange  = zMax-zMin
  local rangeRatio = desiredRange/originalRange
  for i, v in ipairs(copy) 
  do
    table.insert(retVal, {v[1], v[2], (v[3]-minZ)*rangeRatio+zMin, v[4]})
  end
  return retVal
end

------------------------------------------------
-- Alternative to table.unpack for larger tables
function ADekoLib.unpack (t, i)
  i = i or 1
  if t[i] ~= nil then
    return t[i], ADekoLib.unpack(t, i + 1)
  end
end

------------------------------------------------
-- Fits points inbetween given boundaries on Y.
function ADekoLib.scaleVertical(points, yMin, yMax)
  local retVal = {}
  local copy = ADekoLib.deepcopy(points)
  ADekoLib.sortHorizontal(copy)
  local minY, maxY = 999, -999
  for i, v in ipairs(copy)
  do
    if (minY>v[2]) then 
      minY = v[2] 
    end
    if (maxY<v[2]) then 
      maxY = v[2] 
    end
  end
  local originalRange = maxY-minY
  local desiredRange  = yMax-yMin
  local rangeRatio = desiredRange/originalRange
  for i, v in ipairs(copy) 
  do
    table.insert(retVal, {v[1], (v[2]-minY)*rangeRatio+yMin, v[3], v[4]})
  end
  return retVal
end

------------------------------------------------
-- Fits points inbetween given boundaries on X.
function ADekoLib.scaleHorizontal(points, xMin, xMax)
  local retVal = {}
  local copy = ADekoLib.deepcopy(points)
  ADekoLib.sortHorizontal(copy)
  local minX = copy[1][1]
  local maxX = copy[#copy][1]
  local originalRange = maxX-minX
  local desiredRange  = xMax-xMin
  local rangeRatio = desiredRange/originalRange
  for i, v in ipairs(copy) 
  do
    table.insert(retVal, {(v[1]-minX)*rangeRatio+xMin, v[2], v[3], v[4]})
  end
  return retVal
end

------------------------------------------------
-- Joins input polylines and returns them sorted CCW.
function ADekoLib.joinPolylines(poly1, poly2)
  local retVal = ADekoLib.deepcopy(poly1)
  local n = #poly1
  for i, v in ipairs(poly2) 
  do
    retVal[n+i] = v
  end
  return retVal
end

------------------------------------------------
-- Returns a polygone approximating an circular-arc with given parameters
function ADekoLib.circularArc(centerPoint, diameter, noOfSegments, startAngle, endAngle)
  local points = {}
  local _width = diameter/2.0
  local _height = diameter/2.0
  local vertex = {}
  for angle=startAngle*math.pi/180.0, endAngle*math.pi/180.0, (math.abs(startAngle-endAngle)*math.pi/180.0)/(noOfSegments) 
  do
    vertex = {_width*math.cos(angle), _height*math.sin(angle)}
    table.insert(points, ADekoLib.ptAdd(vertex, centerPoint))
  end
  return points
end

------------------------------------------------
-- Sorts horizontally the points it is passed.
function ADekoLib.sortHorizontal(points)
  table.sort(points, function(first, second) 
      if (first[1]<second[1]) then 
        return true 
      end 
  end)
end

------------------------------------------------
-- Sorts vertically the points it is passed.
function ADekoLib.sortVertical(points)
  table.sort(points, function(first, second) 
      if (first[2]<second[2]) then 
        return true 
      end 
  end)
end

------------------------------------------------
-- Sorts depth-wise the points it is passed.
function ADekoLib.sortDepth(points)
  table.sort(points, function(first, second) 
      if (first[3]<second[3]) then 
        return true 
      end 
  end)
end

------------------------------------------------
-- Returns a polygone approximating an ellipse-arc with given parameters
function ADekoLib.ellipticArc(centerPoint, width, height, noOfSegments, startAngle, endAngle)
  local points = {}
  local _width = width/2.0
  local _height = height/2.0
  local vertex = {}
  for angle=startAngle*math.pi/180.0, endAngle*math.pi/180.0, (math.abs(startAngle-endAngle)*math.pi/180.0)/(noOfSegments) 
  do
    vertex = {_width*math.cos(angle), _height*math.sin(angle)}
    table.insert(points, ADekoLib.ptAdd(vertex, centerPoint))
  end
  return points
end

------------------------------------------------
-- Calculates intersection points of a line and an ellipse if any
function ADekoLib.ellipticArcLineIntersection(center, width, height, N, startAngle, endAngle, p1, p2)
  local ePoints = ADekoLib.ellipticArc(center, width, height, N, startAngle, endAngle)
  local intersectionPoints = {}
  local nextIndex = NULL
  for i=1, #ePoints-1, 1
  do
    local intersection = NULL
    intersection = ADekoLib.lineLineIntersection(p1, p2, ePoints[i], ePoints[i+1], true)
    if (intersection~=NULL) then
      table.insert(intersectionPoints, intersection)
    end
  end
  if (#intersectionPoints==0) then
    return false, NULL, NULL
  elseif (#intersectionPoints==1) then
    return "intersection", intersectionPoints[1], NULL
  else
    return "intersections", intersectionPoints[1], intersectionPoints[2]
  end
end

------------------------------------------------
-- Calculates intersection points of a line and an ellipse if any
function ADekoLib.ellipseLineIntersection(center, width, height, N, p1, p2)
  local ePoints = ADekoLib.ellipse(center, width, height, N)
  local intersectionPoints = {}
  local nextIndex = NULL
  for i=1, #ePoints, 1
  do
    local intersection = NULL
    if (i==#ePoints) then
      nextIndex = 1
    else
      nextIndex = i+1
    end
    intersection = ADekoLib.lineLineIntersection(p1, p2, ePoints[i], ePoints[nextIndex], true)
    if (intersection~=NULL) then
      table.insert(intersectionPoints, intersection)
    end
  end
  if (#intersectionPoints==0) then
    return false, NULL, NULL
  elseif (#intersectionPoints==1) then
    return "intersection", intersectionPoints[1], NULL
  else
    return "intersections", intersectionPoints[1], intersectionPoints[2]
  end
end

------------------------------------------------
-- Returns a polygone approximating an ellipse with given parameters
function ADekoLib.ellipse(centerPoint, width, height, noOfSegments)
  local points = {}
  local _width = width/2.0
  local _height = height/2.0
  local vertex = {}
  for angle=0.0, 2*math.pi, 2*math.pi/(noOfSegments) 
  do
    vertex = {_width*math.cos(angle), _height*math.sin(angle)}
    table.insert(points, ADekoLib.ptAdd(vertex, centerPoint))
  end
  return points
end

------------------------------------------------
-- Moves the origin of coordinate system to current face's
function ADekoLib.moveToFace()
  local mt = materialThickness or bodyMaterialThickness or doorMaterialThickness
  if (ADekoLib.areRotationsEqual(currentRotation, __topFace)) then
    zero(20+offset, 3*offset+2*mt)
  elseif (ADekoLib.areRotationsEqual(currentRotation, __bottomFace)) then
    zero(20+4*offset+X+2*mt, 3*offset+2*mt)
  elseif (ADekoLib.areRotationsEqual(currentRotation, __rearFace)) then
    zero(20+offset, 2*offset+mt)
  elseif (ADekoLib.areRotationsEqual(currentRotation, __frontFace)) then
    zero(20+3*offset+X+mt, 3*offset+2*mt)
  elseif (ADekoLib.areRotationsEqual(currentRotation, __leftFace)) then
    zero(20+offset, offset)
  elseif (ADekoLib.areRotationsEqual(currentRotation, __rightFace)) then
    zero(20+2*offset+X, 3*offset+2*mt)
  else
    ADekoLib.error("No such face available.")
  end
end

------------------------------------------------
-- Returns the rotation matrix elements for a given shape.
function ADekoLib.rotation(line, column, dataIndex, partIndex)
  local retVal = -999
  local _line = line + 1
  local _column = column + 1
  if (partIndex==nil) then
    retVal = data[dataIndex]["rotation"][_line][_column]
  else
    retVal = parts[partIndex][dataIndex]["rotation"][_line][_column]
  end
	return retVal
end

------------------------------------------------
-- Returns the translation matrix elements for a given shape.
function ADekoLib.translation(line, dataIndex, partIndex)
  local scaledTranslation = {}
  if (partIndex==nil) then
    scaledTranslation = ADekoLib.translationOffset(data[dataIndex]["translation"])
  else
    scaledTranslation = ADekoLib.translationOffset(parts[partIndex][dataIndex]["translation"])
  end
  return scaledTranslation[line+1]
end

------------------------------------------------
-- Compares two rotation matrices.
function ADekoLib.areRotationsEqual(a, b)
  assert(type(a)=="table", "a is not a table")
	assert(type(b)=="table", "b is not a table")
  for i=1, 3, 1 
  do
    for j=1, 3, 1 
    do
      if (a[i][j]~=b[i][j]) then
        return false
      end
    end
  end
  return true
end

------------------------------------------------
-- Sets face for the next shapes: 
-- top, bottom, left, right, front, rear
function ADekoLib.setFace(faceName)
  if (faceName=="top") then
    currentRotation = ADekoLib.deepcopy(__topFace)
    currentTranslation = ADekoLib.deepcopy(__topTrans)
  elseif (faceName=="bottom") then
    currentRotation = ADekoLib.deepcopy(__bottomFace)
    currentTranslation = ADekoLib.deepcopy(__bottomTrans)
  elseif (faceName=="left") then
    currentRotation = ADekoLib.deepcopy(__leftFace)
    currentTranslation = ADekoLib.deepcopy(__leftTrans)
  elseif (faceName=="right") then
    currentRotation = ADekoLib.deepcopy(__rightFace)
    currentTranslation = ADekoLib.deepcopy(__rightTrans)
  elseif (faceName=="rear") then
    currentRotation = ADekoLib.deepcopy(__rearFace)
    currentTranslation = ADekoLib.deepcopy(__rearTrans)
  elseif (faceName=="front") then
    currentRotation    = ADekoLib.deepcopy(__frontFace)
    currentTranslation = ADekoLib.deepcopy(__frontTrans)
  else
    ADekoLib.error("No such face available.")
  end
  data[currentDataIndex]["rotation"]    = ADekoLib.deepcopy(currentRotation)
  data[currentDataIndex]["translation"] = ADekoLib.deepcopy(currentTranslation)
  if (pncl~=nil) then
    ADekoLib.moveToFace()
  end
end

------------------------------------------------
-- Scales the unit translation matrix
function ADekoLib.translationOffset(unitTranslation)
  assert(type(unitTranslation)=="table", "unitTranslation is not a table")
  local scaledTranslation = {}
  scaledTranslation[1] = unitTranslation[1] * Y
  scaledTranslation[2] = unitTranslation[2] * X
  scaledTranslation[3] = unitTranslation[3] * materialThickness
  return scaledTranslation
end

------------------------------------------------
-- Starts the creation of part. Used internally.
function ADekoLib.start()
  --edge1layer="LMM0"
  --edge2layer="LMM1"
  --edge3layer="LMM2"
  --edge4layer="LMM3"
  --edge1thickness=0
  --edge2thickness=0
  --edge3thickness=0
  --edge4thickness=0
	listAfterBuild = false   -- keep it false for product development
  showPoints = false
  doesSizeIncludeEdgeThickness = "true"
	currentLayerName = "LUA"
	currentThickness = 0
	currentDataIndex = 0
	currentNodeIndex = 1
  
  -- rotation unit matrices
  __topFace = {
    {1, 0, 0}, 
    {0, 1, 0}, 
    {0, 0, 1}
  }
  __bottomFace = {
    {1,  0, 0}, 
    {0, -1, 0}, 
    {0,  0,-1}
  }
  __leftFace = {
    {0, 0,-1}, 
    {1, 0, 0}, 
    {0,-1, 0}
  }
  __rightFace = {
    {0, 0, 1}, 
    {0, 1, 0}, 
    {-1,0, 0}
  }
  __rearFace = {
    {1, 0, 0}, 
    {0, 0, 1}, 
    {0,-1, 0}
  }
  __frontFace = {
    {0, 1, 0}, 
    {0, 0,-1}, 
    {-1,0, 0}
  }
  __rotate90 = {
    {0, 1, 0}, 
    {-1, 0,0}, 
    {0, 0, 1}
  }
  __rotate180 = {
    {-1, 0, 0}, 
    {0, -1, 0}, 
    {0,  0, 1}
  }
  __rotate270 = {
    {0, -1, 0}, 
    {1, 0,0}, 
    {0, 0, 1}
  }
  
  -- translation unit matrices
  __topTrans    = {0.0, 0.0, 0.0}
  __bottomTrans = {0.0, 1.0,-1.0}
  __leftTrans   = {0.0, 0.0, 0.0}
  __rightTrans  = {1.0, 0.0, 0.0}
  __rearTrans   = {0.0, 1.0, 0.0}
  __frontTrans  = {0.0, 0.0, 0.0}
  __trans90     = {0.0, 0.0,-1.0}
  
  currentRotation    = __topFace  -- visible outer surface of the part
  currentTranslation = __topTrans
  triggeredFromAdeko = false
	position = nil
	position = {}
	position["X"] = 0
	position["Y"] = 0
	position["Z"] = 0
	nodes = nil
	nodes = {}
	nodes[currentNodeIndex] = position
	nodes[currentNodeIndex]["bulge"] = 0
	data = nil
	data = {}
	data[currentDataIndex] = nodes
	data[currentDataIndex]["thickness"] = currentThickness
	data[currentDataIndex]["layerName"] = currentLayerName
  data[currentDataIndex]["rotation"] = currentRotation
  data[currentDataIndex]["translation"] = currentTranslation
  numberOfEdgeBands = 0
	-- fix this: one should not need the below code
	for i = 1, 2, 1 
	do
		ADekoLib.node{i, i+10, 0, 0}
	end
	ADekoLib.nextShape()
	ADekoLib.createEdgeBands()
  ADekoLib.setFace("top")
	return true
end

------------------------------------------------
-- Rotates the final door model based on the model angle 'mdir'.
function ADekoLib.applyModelDirection()
  for i=1, #data, 1
  do
    if (triggeredFromAdeko) then
      if (mdir==90) then
        if (ADekoLib.areRotationsEqual(data[i]["rotation"], __topFace)) then
          data[i]["rotation"] = ADekoLib.multiplyRotationMatrixes(data[i]["rotation"], __rotate90)
          data[i]["translation"] = {0, Y/X, 0}
        elseif (ADekoLib.areRotationsEqual(data[i]["rotation"], __bottomFace)) then
          data[i]["rotation"] = ADekoLib.multiplyRotationMatrixes(data[i]["rotation"], __rotate90)
          data[i]["translation"] = {0, 0, 0}
        end
      elseif (mdir==180) then
        if (ADekoLib.areRotationsEqual(data[i]["rotation"], __topFace)) then
          data[i]["rotation"] = ADekoLib.multiplyRotationMatrixes(data[i]["rotation"], __rotate180)
          data[i]["translation"] = {1, 1, 0}
        elseif (ADekoLib.areRotationsEqual(data[i]["rotation"], __bottomFace)) then
          data[i]["rotation"] = ADekoLib.multiplyRotationMatrixes(data[i]["rotation"], __rotate180)
          data[i]["translation"] = {1, 0, 0}
        end
      elseif (mdir==270) then
        if (ADekoLib.areRotationsEqual(data[i]["rotation"], __topFace)) then
          data[i]["rotation"] = ADekoLib.multiplyRotationMatrixes(data[i]["rotation"], __rotate270)
          data[i]["translation"] = {X/Y, 0, -1}
        elseif (ADekoLib.areRotationsEqual(data[i]["rotation"], __bottomFace)) then
          data[i]["rotation"] = ADekoLib.multiplyRotationMatrixes(data[i]["rotation"], __rotate270)
          data[i]["translation"] = {X/Y, Y/X, -1}
        end
      end
    end
  end
end

------------------------------------------------
-- Returns the product of two 3x3 matrixes
function ADekoLib.multiplyRotationMatrixes(m1, m2)
  assert(type(m1=="table", "input is not a table"))
  assert(type(m2=="table", "input is not a table"))
  assert(type(m1[1]=="table", "input is not a table"))
  assert(type(m1[2]=="table", "input is not a table"))
  assert(type(m1[3]=="table", "input is not a table"))
  assert(type(m2[1]=="table", "input is not a table"))
  assert(type(m2[2]=="table", "input is not a table"))
  assert(type(m2[3]=="table", "input is not a table"))
  local retVal = {{0,0,0},{0,0,0},{0,0,0}}
  for i=1, 3, 1
  do
    for j=1, 3,1
    do
      for k=1, 3, 1
      do
        retVal[i][j] = retVal[i][j] + (m1[i][k] * m2[k][j]);
      end
    end
  end
  return retVal;
end

------------------------------------------------
-- See sunkenFrame. This function accepts any polygone with bulges, on the contrary.
-- Sharp corner lines or curves are divided into line segments (G1) by cornerArcDivider.
function ADekoLib.sunkenFrameAny(inputPoints, cornerArcDivider, depth, vToolAngle, vToolDiameter, reverseDirection)
  
  reverseDirection = reverseDirection or false
  
  local points = {}
  points = ADekoLib.deepcopy(inputPoints)
  
  local m = depth * math.tan((math.pi*vToolAngle/180)/2.0)
  if (m > vToolDiameter/2) then
    ADekoLib.error("Tool diameter too small")
    return false
  end
  
  -- get the points forming the sharp edge lines or curves by consecutive offsetting
  local offSets = {}
  if (cornerArcDivider<2) then
    cornerArcDivider = 2
  end
  local step = m/cornerArcDivider
  for i=1, cornerArcDivider+1, 1
  do
    offSets[i] = {}
    offSets[i] = ADekoLib.deepcopy(ADekoLib.offSet(points, -(i-1)*step))
  end
  
  -- get corners as separate polylines
  local n = #points
  corners = {}
  foldeds = {}
  for i=1, n, 1
  do
    corners[i] = {}
    foldeds[i] = {}
    for j=1, cornerArcDivider+1, 1
    do
      corners[i][j] = ADekoLib.deepcopy(offSets[j][i])
      corners[i][j][3] = -(j-1)*depth/cornerArcDivider
      corners[i][j][4] = 0
      foldeds[i][cornerArcDivider+2-j] = ADekoLib.deepcopy(corners[i][j])
      foldeds[i][cornerArcDivider+1+j] = ADekoLib.deepcopy(corners[i][j])
      if (j==cornerArcDivider+1) then
        foldeds[i][cornerArcDivider+1+j][4] = offSets[j][i][4]
      end
    end
  end
  
  -- form the resulting polyline/toolpath
  local result = {}
  local counter = 1
  for i=1, n, 1
  do
    for j=1, #foldeds[i], 1
    do
      table.insert(result, counter, foldeds[i][j])
      counter = counter + 1
    end
  end
  result[#result][4] = 0
  
  -- toggle tapering direction
  if (reverseDirection) then
    ADekoLib.polylineimp(ADekoLib.scaleDepth(result, -depth, 0))
  else
    ADekoLib.polylineimp(result)
  end
  
  return offSets[cornerArcDivider+1]
end

------------------------------------------------
-- Writes index numbers of points where they are
function ADekoLib.labelPoints(points)
  if (text~=nill) then
    for i, item in pairs(points) do
      text(tostring(i), 0, item[1], item[2])
    end
  end
end

------------------------------------------------
-- Writes index numbers of points where they are
function ADekoLib.labelPoint(point, message)
  if (text~=nill) then
    text(tostring(message), 0, point[1], point[2])
  end
end

------------------------------------------------
-- Returns the center of points.
function ADekoLib.center(points)
  local sumX = 0
  local sumY = 0
  for i=1, #points, 1
  do
    sumX = sumX + points[i][1]
    sumY = sumY + points[i][2]
  end
  return {sumX/numberOfPoints, sumY/numberOfPoints}  
end

------------------------------------------------
-- Returns the resulting polyline, which is offset by value, out of inputPoints.
function ADekoLib.offSet(inputPoints, value)

  local points = {}
  points = ADekoLib.deepcopy(inputPoints)
  local numberOfPoints = #points
  
  -- remove the last points if it is a closed shape
  if (points[1][1]==points[numberOfPoints][1] and points[1][2]==points[numberOfPoints][2]) then
    points[numberOfPoints] = {}
    numberOfPoints = numberOfPoints - 1
  end
  
  -- explicitly set missing ordinates of input array
  for i=1, numberOfPoints, 1
  do
    points[i][3] = points[i][3] or 0
    points[i][4] = points[i][4] or 0
  end
  
  -- calculate angle of each edge
  local angles = {}  
  for i=numberOfPoints, 1, -1
  do
    if (i==numberOfPoints) then 
      angles[1]  = ADekoLib.angle(points[1], points[numberOfPoints]) + 90 
    end
    if (i<numberOfPoints) then 
      angles[i+1] = ADekoLib.angle(points[i+1], points[i]) + 90 
    end
  end
  
  -- translate each edge towards its normal by offset value, whether it is a line or arc
  local lines = {}  
  local olines = {}  
  for i=numberOfPoints, 1, -1
  do
    if (i==numberOfPoints) then 
      olines[1] = {points[1], points[i]}
      olines[1][2][4] = points[i][4]
      lines[1] = {ADekoLib.polar(points[1], angles[1], value), ADekoLib.polar(points[i], angles[1], value)}
      lines[1][2][4] = points[i][4]
    end
    if (i<numberOfPoints) then 
      olines[i+1] = {points[i+1], points[i]}
      olines[i+1][2][4] = points[i][4]
      lines[i+1] = {ADekoLib.polar(points[i+1], angles[i+1], value), ADekoLib.polar(points[i], angles[i+1], value)}
      lines[i+1][2][4] = points[i][4]
    end
  end
  
  -- calculate inner polyline
  local intersections = {}  
  for i=1, numberOfPoints, 1
  do
    local j = i+1
    if (i+1>numberOfPoints) then 
      j=1 
    end
    local bulgeThis = lines[i][2][4] or 0
    local bulgeNext = lines[j][2][4] or 0
    local ci, cj, cf, cci, ccj, ccf = {}, {}, {}, {}, {}, {}
    local dummyi, dummyj, dummyf = {}, {}, {}
    local comment = {}
    
    if (bulgeThis==0 and bulgeNext==0) then  -- LINE+LINE
      
      intersections[i] = ADekoLib.lineLineIntersection(lines[i][1], lines[i][2], lines[j][1], lines[j][2], false)
      
    elseif (bulgeThis~=0 and bulgeNext~=0) then  -- ARC+ARC
      
      local ri = ADekoLib.radius(lines[i][2], lines[i][1], bulgeThis)
      local rj = ADekoLib.radius(lines[j][2], lines[j][1], bulgeNext)
      comment, ci, dummyi = ADekoLib.circleCircleIntersection(olines[i][1], ri, olines[i][2], ri)
      comment, cj, dummyj = ADekoLib.circleCircleIntersection(olines[j][1], rj, olines[j][2], rj)
      cci = ADekoLib.deepcopy(ci)
      ccj = ADekoLib.deepcopy(cj)
      local mValueThis, mValueNext = value, value
      if (bulgeThis<0) then 
        cci = ADekoLib.deepcopy(dummyi)
        mValueThis = -value
      end
      if (bulgeNext<0) then 
        ccj = ADekoLib.deepcopy(dummyj)
        mValueNext = -value
      end
      comment, cf, dummyf = ADekoLib.circleCircleIntersection(cci, ri+mValueThis, ccj, rj+mValueNext)
      ccf = ADekoLib.deepcopy(cf)
      if (ADekoLib.distance(lines[i][1], dummyf) < ADekoLib.distance(lines[i][1], ccf)) then 
        ccf = ADekoLib.deepcopy(dummyf) 
      end
      intersections[i] = ADekoLib.deepcopy(ccf)
      
    elseif (bulgeThis~=0 and bulgeNext==0) then  -- ARC+LINE
      
      local ri = ADekoLib.radius(lines[i][2], lines[i][1], bulgeThis)
      comment, ci, dummyi = ADekoLib.circleCircleIntersection(olines[i][1], ri, olines[i][2], ri)
      cci = ADekoLib.deepcopy(ci)
      local mValue = value
      if (bulgeThis<0) then 
        cci = ADekoLib.deepcopy(dummyi) 
        mValue = -value
      end
      comment, cf, dummyf = ADekoLib.circleLineIntersection(cci, ri+mValue, lines[j][1], lines[j][2])
      ccf = ADekoLib.deepcopy(cf)
      if (ADekoLib.distance(lines[i][1], dummyf) < ADekoLib.distance(lines[i][1], ccf)) then 
        ccf = ADekoLib.deepcopy(dummyf) 
      end
      intersections[i] = ADekoLib.deepcopy(ccf)
      
    elseif (bulgeThis==0 and bulgeNext~=0) then  -- LINE+ARC
      
      local rj = ADekoLib.radius(lines[j][2], lines[j][1], bulgeNext)
      comment, cj, dummyj = ADekoLib.circleCircleIntersection(olines[j][1], rj, olines[j][2], rj)
      ccj = ADekoLib.deepcopy(cj)
      local mValue = value
      if (bulgeNext<0) then 
        ccj = ADekoLib.deepcopy(dummyj) 
        mValue = -value
      end
      comment, cf, dummyf = ADekoLib.circleLineIntersection(ccj, rj+mValue, lines[i][1], lines[i][2])
      ccf = ADekoLib.deepcopy(cf)
      if (ADekoLib.distance(lines[j][1], dummyf) < ADekoLib.distance(lines[j][1], ccf)) then 
        ccf = ADekoLib.deepcopy(dummyf) 
      end
      intersections[i] = ADekoLib.deepcopy(ccf)
      
    else
      
      ADekoLib.error("What kind of a polygon is this?")
      return false
      
    end
  end
  
  -- correct the bulges for inner edges
  local inputBulges = {}  
  local outputBulges = {}
  for i=1, numberOfPoints, 1
  do
    inputBulges[i] = points[i][4]
    outputBulges[i] = inputBulges[i]
    if (inputBulges[i]~=0) then
      local nextIndex = i+1
      if (i == numberOfPoints) then 
        nextIndex = 1 
      end
      local r = ADekoLib.radius(points[i], points[nextIndex], inputBulges[i])
      local comment1, dummy1, c = ADekoLib.circleCircleIntersection(points[i], r, points[nextIndex], r)
      local cc = ADekoLib.deepcopy(c)
      local mValue = value
      if (inputBulges[i]<0) then
        cc = ADekoLib.deepcopy(dummy1)
        mValue = -value
      end
      local middlePoint = {(points[i][1]+points[nextIndex][1])/2, (points[i][2]+points[nextIndex][2])/2}
      local comment2, s1, s2 = ADekoLib.circleLineIntersection(cc, r+mValue, c, middlePoint)
      local correctPoint = ADekoLib.deepcopy(s1)
      if (ADekoLib.distance(middlePoint, s2) < ADekoLib.distance(middlePoint, s1)) then 
        correctPoint = ADekoLib.deepcopy(s2) 
      end
      outputBulges[i] = ADekoLib.bulge(intersections[i], correctPoint, intersections[nextIndex])
      intersections[i][4] = outputBulges[i]
    end
  end
  intersections[#intersections+1] = ADekoLib.deepcopy(intersections[1])
  return intersections
end

------------------------------------------------
-- Returns an array of points representing the arc.
function ADekoLib.arc2segments_noDepthProfile(p1, p2, numberOfSegments)
  
  if (p1[4]==nil or p1[4]==0) then
    ADekoLib.error("Not an arc!")
    return
  end
  
  -- get arc parameters
  local r = ADekoLib.radius(p1, p2, p1[4])
  local comment, c1, c2 = ADekoLib.circleCircleIntersection(p1, r, p2, r)
  local middle = {(p1[1]+p2[1])/2, (p1[2]+p2[2])/2}
  p2[3] = p2[3] or 0
  p1[3] = p1[3] or 0
  local deltaZstep = (p2[3]-p1[3])/numberOfSegments
  
  local angle = ADekoLib.angle(p1, p2)
  local step = ADekoLib.distance(p1, p2) / numberOfSegments
  local onSegments, offSegments = {}, {}
  local segments = {}
  
  for i=0, numberOfSegments, 1
  do
    onSegments[i] = ADekoLib.polar(p1, angle, i*step)
    offSegments[i] = ADekoLib.polar(onSegments[i], angle+90, 100)
    --text(tostring(i), 0, onSegments[i][1], onSegments[i][2])
    --text(tostring(i), 0, offSegments[i][1], offSegments[i][2])
    local arcCenter = ADekoLib.deepcopy(c1)
    if (p1[4]>0) then
      arcCenter = ADekoLib.deepcopy(c2)
    end
    local comment, s1, s2 = ADekoLib.circleLineIntersection(arcCenter, r, onSegments[i], offSegments[i])
    local correctPoint = ADekoLib.deepcopy(s1)
    if (ADekoLib.distance(middle, s1)>ADekoLib.distance(middle, s2)) then
      correctPoint = ADekoLib.deepcopy(s2)
    end
    correctPoint[3] = i*deltaZstep+p1[3]
    correctPoint[4] = 0
    segments[i+1] = correctPoint
  end
  
  return segments
end

------------------------------------------------
-- Sorts counter clock-wise (CCW) the points it is passed. 
-- This might be needed for algoritms like sunkenFrameAny if, as
-- an example, random numbers are used to create polygon nodes.
function ADekoLib.sortCCW(points)
  local sumX, sumY = 0, 0
  for i=1, #points, 1
  do
    sumX = sumX + points[i][1]
    sumY = sumY + points[i][2]
  end
  local center = {sumX/(#points), sumY/(#points)}  -- calculate the center point
  for i=1, #points, 1
  do
    points[i][5] = ADekoLib.angle(center, points[i])
  end
  table.sort(points, function(first, second) 
      if (first[5]<second[5]) then 
        return true 
      end 
  end)
end

------------------------------------------------
-- Sorts clock-wise (CW) the points it is passed. 
-- This might be needed for changing the normal of a polygon.
function ADekoLib.sortCW(points)
  local sumX, sumY = 0, 0
  for i=1, #points, 1
  do
    sumX = sumX + points[i][1]
    sumY = sumY + points[i][2]
  end
  local center = {sumX/(#points), sumY/(#points)}  -- calculate the center point
  for i=1, #points, 1
  do
    points[i][5] = ADekoLib.angle(center, points[i])
  end
  table.sort(points, function(first, second) 
      if (first[5]>second[5]) then 
        return true 
      end 
  end)
end

------------------------------------------------
-- Creates arbitrary-size polylines
function ADekoLib.polylineimp(inputPoints)
  assert(type(inputPoints)=="table", "input is not a table")
  assert(type(inputPoints[1]=="table", "input is not a point table"))
  local localPoints = ADekoLib.deepcopy(inputPoints)
  
  if (triggeredFromAdeko) then
    if ((mdir==90 or mdir==270) and ADekoLib.areRotationsEqual(currentRotation, __bottomFace)) then
      localPoints = ADekoLib.mirror(localPoints, "y", X, Y)
    end
  end
  
  local previous = {}
  previous = nil
  if (pncl~=nil) then 
    pnsz(1) 
    pncl(colr(80, 0, 80))
  end
  for i, p in ipairs({ADekoLib.unpack(localPoints)}) 
  do
	  assert(type(p[1])=="number", "input is not a number")
	  assert(type(p[2])=="number", "input is not a number")
	  assert((#p)>=2, "point must have at least X & Y, bulge might be ommitted.")
	  local z = p[3] or 0
	  if (pncl~=nil) then
	  	if (previous~=nil) then 
          local bulge = previous[4] or 0
	  		if (bulge==0) then -- line
	  		  line(previous[1], previous[2], p[1], p[2])
	  		else
	  		  pnsz(1)
	  		  pncl(colr(80, 0, 80))
	  		  local r = ADekoLib.radius(previous, p, previous[4])
	  		  local comment, pc1, pc2 = ADekoLib.circleCircleIntersection(previous, r, p, r)
	  		  if (comment=='tangent' or comment=='intersection') then
	  		  	if (bulge<0) then 
              pncl(colr(0, 255, 0))
              centerPoint = pc1 
	  		  	end
	  		  	if (bulge>0) then 
              pncl(colr(0, 0, 255))
              centerPoint = pc2 
	  		  	end
	  		  end
	  		  local angle1 = ADekoLib.angle(centerPoint, previous)
	  		  local angle2 = ADekoLib.angle(centerPoint, p)
	  		  angle1, angle2 = 360-angle1, 360-angle2
	  		  if (bulge>0) then 
	  		  	angle1, angle2 = ADekoLib.swap(angle1, angle2)
	  		  end
	  		  crcl(centerPoint[1], centerPoint[2], r, nil, angle1, angle2)
	  		end
	  	end
	  end
	  ADekoLib.node(p)
	  previous = nil
	  previous = ADekoLib.deepcopy(p)
	end
	ADekoLib.nextShape()
end

------------------------------------------------
-- Parses model parameters set by the user with the following format:
-- "edgeMargin=50, dir=-x, somethingElse=56"
-- Spaces are meaningless in the string and are removed before parsing.
function ADekoLib.parseModelParameters(string)
  if (string == nil) then
    return
  end
  string = string:gsub("%s+", "")  -- remove all spaces first
  local variables = {}
  variables = ADekoLib.split(string, ",")  -- variable separator
  for i=1, #variables, 1
  do
    local couple = {}
    couple = ADekoLib.split(variables[i], "=")  -- equal serapator
    if (#couple ~= 2) then
      ADekoLib.error("Wrong model parameter format: \"" .. string .. "\"")
      return false
    end
    if (couple[2]=="true" or couple[2]=="false" or couple[2]=="-x" or couple[2]=="+x" or couple[2]=="-y" or couple[2]=="+y") then
        _G[couple[1]] = tostring(couple[2])
    else
      local n = tonumber(couple[2])
      _G[couple[1]] = n
      if (couple[1]=="mdir" and (n==0 or n==90 or n==180 or n==270)) then
        triggeredFromAdeko = true
      end
    end
  end
  if (triggeredFromAdeko and (mdir==90 or mdir==270)) then -- SWAP width and height
    local tmp = X
    X = Y
    Y = tmp
  end
  return true
end

------------------------------------------------
-- Single char string splitter
function ADekoLib.split(inputstr, sep)
  if sep == nil then
          sep = "%s"
  end
  local t={} ; i=1
  for str in string.gmatch(inputstr, "([^"..sep.."]+)") do
          t[i] = str
          i = i + 1
  end
  return t
end

------------------------------------------------
-- Creates an inclined pocket inbetween two diagonal points for the given toolDiameter as well as given
-- step as the resolution. The parameter "direction" is either "v" for vertical or "h" for horizontal.
function ADekoLib.inclinedPocketPrim(firstPoint, secondPoint, firstDepth, secondDepth, step, toolDiameter, direction)
  
  -- check tool diameter
  local width  = secondPoint[1] - firstPoint[1]  
  local height = secondPoint[2] - firstPoint[2]
  if (toolDiameter>width or toolDiameter>height) then
    ADekoLib.error("Tool diameter too large!")
    return false
  end
  
  -- turtle graphics is enabled
  if (pncl~=nil) then 
    pncl(colr(255, 255, 0))
    pnsz(5)
    rect(firstPoint[1]+3, firstPoint[2]+3, width-6, height-6, 10)
    pncl(colr(0, 0, 0))
    pnsz(1)
  end
  
  -- define start and end points
  local p1 = ADekoLib.ptAdd(firstPoint, {toolDiameter/2, toolDiameter/2})
  local p2 = ADekoLib.ptSubtract(secondPoint, {toolDiameter/2, toolDiameter/2})
  local dX = p2[1]-p1[1]
  local dY = p2[2]-p1[2]
  
  -- how many cycles needed to form the pocket in given direction
  local howMany = 0
  local vertical = false
  if (direction == "v") then
    howMany = math.floor(math.abs(firstPoint[2]-secondPoint[2])/step)
    vertical = true
  elseif (direction == "h") then
    howMany = math.floor(math.abs(firstPoint[1]-secondPoint[1])/step)
  else
    ADekoLib.error("Direction is either 'v' for vertical or 'h' for horizontal.")
    return false
  end
  
  -- calculate modified step size
  local mStep = 0
  if (vertical) then
    mStep = dY/howMany
  else
    mStep = dX/howMany
  end
  
  -- Create the corresponding points
  for i=0, howMany/2-1, 1
  do
    local n1, n2, n3, n4 = {}, {}, {}, {}
    if (vertical) then
      n1 = ADekoLib.ptAdd(p1, {0, i*mStep})
      n2 = ADekoLib.ptAdd(n1, {dX, 0})
      n3 = ADekoLib.ptAdd(n2, {0, mStep})
      n4 = ADekoLib.ptAdd( n3, {-dX, 0})
      p1 = ADekoLib.ptAdd(p1, {0, mStep})
    else
      n1 = ADekoLib.ptAdd(p1, {i*mStep, 0})
      n2 = ADekoLib.ptAdd(n1, {0, dY})
      n3 = ADekoLib.ptAdd(n2, {mStep, 0})
      n4 = ADekoLib.ptAdd( n3, {0, -dY})
      p1 = ADekoLib.ptAdd(p1, {mStep, 0})
    end
    n1[3], n4[3] = firstDepth, firstDepth
    n2[3], n3[3] = secondDepth, secondDepth
    ADekoLib.node(n1)
    ADekoLib.node(n2)
    ADekoLib.node(n3)
    ADekoLib.node(n4)
  end
  
  ADekoLib.nextShape()
end

------------------------------------------------
-- Creates an inclined pocket inbetween two diagonal points for the given toolDiameter as well as given
-- step as the resolution. The parameter "direction" is either "v" for vertical or "h" for horizontal.
function ADekoLib.inclinedPocket(firstPoint, secondPoint, depth, step, toolDiameter, direction, dontCreateReturnAsPolygon)
  
  dontCreateReturnAsPolygon = dontCreateReturnAsPolygon or false
  local retVal = {}
  
  -- check tool diameter
  local width  = secondPoint[1] - firstPoint[1]  
  local height = secondPoint[2] - firstPoint[2]
  if (toolDiameter>width or toolDiameter>height) then
    ADekoLib.error("Tool diameter too large!")
    return false
  end
  
  -- turtle graphics is enabled
  if (not dontCreateReturnAsPolygon) then
    if (pncl~=nil) then 
      pncl(colr(255, 255, 0))
      pnsz(5)
      rect(firstPoint[1]+3, firstPoint[2]+3, width-6, height-6, 10)
      pncl(colr(0, 0, 0))
      pnsz(1)
    end
  end
  
  -- define start and end points
  local p1 = ADekoLib.ptAdd(firstPoint, {toolDiameter/2, toolDiameter/2})
  local p2 = ADekoLib.ptSubtract(secondPoint, {toolDiameter/2, toolDiameter/2})
  local dX = p2[1]-p1[1]
  local dY = p2[2]-p1[2]
  
  -- how many cycles needed to form the pocket in given direction
  local howMany = 0
  local vertical = false
  if (direction == "v") then
    howMany = math.floor(math.abs(firstPoint[2]-secondPoint[2])/step)
    vertical = true
  elseif (direction == "h") then
    howMany = math.floor(math.abs(firstPoint[1]-secondPoint[1])/step)
  else
    ADekoLib.error("Direction is either 'v' for vertical or 'h' for horizontal.")
    return false
  end
  
  -- even or odd
  local limit = howMany/2
  if (howMany%2 == 0) then
    even = true;
    limit = howMany/2 - 1
  end
  
  -- calculate modified step size
  local mStep = 0
  if (vertical) then
    mStep = dY/howMany
  else
    mStep = dX/howMany
  end
  
  -- Create the corresponding points for "U"s
  for i=0, limit, 1
  do
    local n1, n2, n3, n4 = {}, {}, {}, {}
    if (vertical) then
      n1 = ADekoLib.ptAdd(p1, {0, i*mStep})
      n2 = ADekoLib.ptAdd(n1, {dX, 0})
      n3 = ADekoLib.ptAdd(n2, {0, mStep})
      n4 = ADekoLib.ptAdd( n3, {-dX, 0})
      p1 = ADekoLib.ptAdd(p1, {0, mStep})
    else
      n1 = ADekoLib.ptAdd(p1, {i*mStep, 0})
      n2 = ADekoLib.ptAdd(n1, {0, dY})
      n3 = ADekoLib.ptAdd(n2, {mStep, 0})
      n4 = ADekoLib.ptAdd( n3, {0, -dY})
      p1 = ADekoLib.ptAdd(p1, {mStep, 0})
    end
    n1[3], n4[3] = 0, 0
    n2[3], n3[3] = -depth, -depth
    if (dontCreateReturnAsPolygon) then
      table.insert(retVal, n1)
      table.insert(retVal, n2)
      table.insert(retVal, n3)
      table.insert(retVal, n4)
    else
      ADekoLib.node(n1)
      ADekoLib.node(n2)
      ADekoLib.node(n3)
      ADekoLib.node(n4)
    end
  end
  
  -- Create the last "I" if any
  if (even) then
    if (vertical) then
      n1 = ADekoLib.ptAdd(p1, {0, mStep*howMany/2})     n1[3] = 0
      n2 = ADekoLib.ptAdd(n1, {dX, 0})                  n2[3] = -depth
    else
      n1 = ADekoLib.ptAdd(p1, {mStep*howMany/2, 0})     n1[3] = 0
      n2 = ADekoLib.ptAdd(n1, {0, dY})                  n2[3] = -depth
    end
    if (dontCreateReturnAsPolygon) then
      table.insert(retVal, n1)
      table.insert(retVal, n2)
    else
      ADekoLib.node(n1)
      ADekoLib.node(n2)
    end
  end
  
  if (dontCreateReturnAsPolygon) then
    return retVal
  else
    ADekoLib.nextShape()
  end
end

------------------------------------------------
-- Returns whether or not a part is set not to care about material grain during nesting.
function ADekoLib.isThisPartADoor(partIndex)
  if (partIndex==nil) then
    ADekoLib.error("No part index available; whether or not being a door is related to part.")
  else
    return (parts[partIndex]["thisPartIsADoor"])
  end
end

------------------------------------------------
-- Returns whether or not a part is set not to care about material grain during nesting.
function ADekoLib.ignoreMaterialGrain(partIndex)
  if (partIndex==nil) then
    ADekoLib.error("No part index available; material grain is related to part.")
  else
    return (#parts[partIndex]["ignoreMaterialGrain"])
  end
end

------------------------------------------------
-- Creates a groove. User convenience function.
function ADekoLib.groove(startPoint, endPoint, depth)
  assert(type(startPoint)=="table", "startPoint is not a table")
  assert(type(endPoint)=="table", "endPoint is not a table")
  if (ADekoLib.distance(startPoint, endPoint)==0) then
    ADekoLib.error("Groove length is equal to zero.")
  end
  ADekoLib.setThickness(depth)
  ADekoLib.line(startPoint, endPoint)
end

------------------------------------------------
-- Creates a hole. User convenience function.
function ADekoLib.hole(centerPoint, radius, depth)
  assert(type(centerPoint)=="table", "centerPoint is not a table")
  if (radius<=0) then
    ADekoLib.error("Hole radius smaller or equal to zero.")
  end
  ADekoLib.setThickness(depth)
  ADekoLib.circle(centerPoint, radius)
end

------------------------------------------------
-- Returns the number of created parts.
function ADekoLib.partsSize()
	return (#parts)
end

------------------------------------------------
-- Prints out all product parts currently created.
function ADekoLib.listProduct(what)
  local out = ""
	out = out .. "-PRODUCT-------------------------" .. "\n"
  out = out .. "Number of parts: " .. (#parts) .. "\n"
  for p=1, (#parts), 1
  do
    out = out .. "\nPART:" .. p .. "(" .. parts[p]["partName"] .. ")<" .. parts[p]["partMaterial"] .. ">"
    out = out .. "----------\n"
    for i1, v1 in ipairs(parts[p]) 
    do
      out = out .. i1
      out = out .. "  Layer: " .. v1["layerName"]
      out = out .. "  Thickness: " .. v1["thickness"] .. "\n"
      if (what=="nodes") then
        for i2, v2 in ipairs(v1) do  -- nodes
          out = out .. "    " .. i2
          for i3, v3 in pairs(v2) do  -- xyz & B
            out = out .. "       " .. i3 .. ": " .. v3
          end
        end
      end
    end
  end
  out = out .. "-------------------------PRODUCT-"
  io.write(out)
end

------------------------------------------------
-- Finishes the creation of shapes of part. Used internally.
function ADekoLib.finishProduct()
	parts[currentPartIndex] = nil
  ADekoLib.listProduct()
	return true
end

------------------------------------------------
-- Packs all available geometries created thus far into a part 
-- with given binding box dimensions and part name as an identifier.
function ADekoLib.packIntoPart(thisPartIsADoor, ignoreMaterialGrain, description, width, height, name, material, edgeBandLayerName0, edgeBandThickness0, edgeBandLayerName1, edgeBandThickness1, edgeBandLayerName2, edgeBandThickness2, edgeBandLayerName3, edgeBandThickness3)
  --ADekoLib.setThickness(0)
  if (edgeBandLayerName0~=nil and edgeBandThickness0~=nil and edgeBandThickness0~=0) then  -- Create edge bands before packing
    ADekoLib.setLayer(edgeBandLayerName0)
    ADekoLib.setThickness(edgeBandThickness0)
		ADekoLib.line({0, 0}, {0, height}, 0)
  end
  if (edgeBandLayerName1~=nil and edgeBandThickness1~=nil and edgeBandThickness1~=0) then
    ADekoLib.setLayer(edgeBandLayerName1) 
    ADekoLib.setThickness(edgeBandThickness1)
		ADekoLib.line({width, 0}, {width, height}, 0)
  end
  if (edgeBandLayerName2~=nil and edgeBandThickness2~=nil and edgeBandThickness2~=0) then
    ADekoLib.setLayer(edgeBandLayerName2)
    ADekoLib.setThickness(edgeBandThickness2)
		ADekoLib.line({0, height}, {width, height}, 0)
  end
  if (edgeBandLayerName3~=nil and edgeBandThickness3~=nil and edgeBandThickness3~=0) then
    ADekoLib.setLayer(edgeBandLayerName3)
    ADekoLib.setThickness(edgeBandThickness3)
		ADekoLib.line({0, 0}, {width, 0}, 0)
  end
  ADekoLib.finish()
  parts[currentPartIndex] = ADekoLib.deepcopy(data)
  parts[currentPartIndex]["partName"] = name or part .. currentPartIndex
  parts[currentPartIndex]["partDescription"] = description or "product part"
  parts[currentPartIndex]["partMaterial"] = material or "unset material"
  parts[currentPartIndex]["thisPartIsADoor"] = thisPartIsADoor or false
  parts[currentPartIndex]["ignoreMaterialGrain"] = ignoreMaterialGrain
  parts[currentPartIndex]["edgeBandLayerName0"] = edgeBandLayerName0 or "LMM0"
  parts[currentPartIndex]["edgeBandThickness0"] = edgeBandThickness0 or 0
  parts[currentPartIndex]["edgeBandLayerName1"] = edgeBandLayerName1 or "LMM1"
  parts[currentPartIndex]["edgeBandThickness1"] = edgeBandThickness1 or 0
  parts[currentPartIndex]["edgeBandLayerName2"] = edgeBandLayerName2 or "LMM2"
  parts[currentPartIndex]["edgeBandThickness2"] = edgeBandThickness2 or 0
  parts[currentPartIndex]["edgeBandLayerName3"] = edgeBandLayerName3 or "LMM3"
  parts[currentPartIndex]["edgeBandThickness3"] = edgeBandThickness3 or 0
  if (parts[currentPartIndex][1]["layerName"] ~= "PANEL") then
    ADekoLib.productError(description .. " / " .. name)
    return false
  end
  if (parts[currentPartIndex]["edgeBandThickness0"]~=0 or  -- Does part size include edge band thickness?
      parts[currentPartIndex]["edgeBandThickness1"]~=0 or
      parts[currentPartIndex]["edgeBandThickness2"]~=0 or
      parts[currentPartIndex]["edgeBandThickness3"]~=0) then
    width  = width  + parts[currentPartIndex]["edgeBandThickness0"] + parts[currentPartIndex]["edgeBandThickness2"]
    height = height + parts[currentPartIndex]["edgeBandThickness1"] + parts[currentPartIndex]["edgeBandThickness3"]
  end
  parts[currentPartIndex][1][2]["X"] = width  -- Overriding the part dimensions
  parts[currentPartIndex][1][3]["X"] = width
  parts[currentPartIndex][1][3]["Y"] = height
  parts[currentPartIndex][1][4]["Y"] = height
  if (pncl~=nil) then  -- Is turtle graphics available?
    pncl(colr(0, 0, 255))
    move(width) turn(90)
    move(height) turn(90)
    move(width) turn(90)
    move(height) turn(90)
    pncl(colr(0, 255, 0))
  end
  ADekoLib.start()  -- Start a new part
  currentPartIndex = currentPartIndex + 1
  parts[currentPartIndex] = {}
  parts[currentPartIndex]["partName"] = ""
  parts[currentPartIndex]["partMaterial"] = ""
  parts[currentPartIndex]["partDescription"] = ""
  parts[currentPartIndex]["edgeBandLayerName0"] = "LMM0"
  parts[currentPartIndex]["edgeBandThickness0"] = 0
  parts[currentPartIndex]["edgeBandLayerName1"] = "LMM1"
  parts[currentPartIndex]["edgeBandThickness1"] = 0
  parts[currentPartIndex]["edgeBandLayerName2"] = "LMM2"
  parts[currentPartIndex]["edgeBandThickness2"] = 0
  parts[currentPartIndex]["edgeBandLayerName3"] = "LMM3"
  parts[currentPartIndex]["edgeBandThickness3"] = 0
  return true
end

------------------------------------------------
-- Returns part description
function ADekoLib.partDescription(partIndex)
  return parts[partIndex]["partDescription"]
end

------------------------------------------------
-- Returns edge band data of the part with partIndex
function ADekoLib.partEdgeBandThickness0(partIndex)
  return parts[partIndex]["edgeBandThickness0"]
end

------------------------------------------------
-- Returns edge band data of the part with partIndex
function ADekoLib.partEdgeBandThickness1(partIndex)
  return parts[partIndex]["edgeBandThickness1"]
end

------------------------------------------------
-- Returns edge band data of the part with partIndex
function ADekoLib.partEdgeBandThickness2(partIndex)
  return parts[partIndex]["edgeBandThickness2"]
end

------------------------------------------------
-- Returns edge band data of the part with partIndex
function ADekoLib.partEdgeBandThickness3(partIndex)
  return parts[partIndex]["edgeBandThickness3"]
end

------------------------------------------------
-- Returns edge band data of the part with partIndex
function ADekoLib.partEdgeBandLayerName0(partIndex)
  return parts[partIndex]["edgeBandLayerName0"]
end

------------------------------------------------
-- Returns edge band data of the part with partIndex
function ADekoLib.partEdgeBandLayerName1(partIndex)
  return parts[partIndex]["edgeBandLayerName1"]
end

------------------------------------------------
-- Returns edge band data of the part with partIndex
function ADekoLib.partEdgeBandLayerName2(partIndex)
  return parts[partIndex]["edgeBandLayerName2"]
end

------------------------------------------------
-- Returns edge band data of the part with partIndex
function ADekoLib.partEdgeBandLayerName3(partIndex)
  return parts[partIndex]["edgeBandLayerName3"]
end

------------------------------------------------
-- Returns the height of the part
function ADekoLib.partHeight(partIndex)
  return parts[partIndex][1][4]["Y"]
end

------------------------------------------------
-- Returns the width of the part
function ADekoLib.partWidth(partIndex)
  return parts[partIndex][1][2]["X"]
end

------------------------------------------------
-- Returns the name of the part
function ADekoLib.partName(partIndex)
  return parts[partIndex]["partName"]
end

------------------------------------------------
-- Returns the material of the part
function ADekoLib.partMaterial(partIndex)
  return parts[partIndex]["partMaterial"]
end

------------------------------------------------
-- Starts the creation of product. Used internally.
function ADekoLib.startProduct()
  parts = nil
  parts = {}
  currentPartIndex = 1
  parts[currentPartIndex] = {}
  return true
end

------------------------------------------------
-- Saves shape data created from images
function ADekoLib.saveImageData(tbl, filename)
      local charS,charE = "   ","\n"
      local file,err = io.open( filename, "wb" )
      if err then return err end

      -- initiate variables for save procedure
      local tables,lookup = { tbl },{ [tbl] = 1 }
      file:write( "return {"..charE )

      for idx,t in ipairs( tables ) do
         --file:write( "-- Table: {"..idx.."}"..charE )
         file:write( "{"..charE )
         local thandled = {}
         for i,v in ipairs( t ) do
            thandled[i] = true
            local stype = type( v )
            -- only handle value
            if stype == "table" then
               if not lookup[v] then
                  table.insert( tables, v )
                  lookup[v] = #tables
               end
               file:write( charS.."{"..lookup[v].."},"..charE )
            elseif stype == "string" then
               file:write(  charS..ADekoLib.exportstring( v )..","..charE )
            elseif stype == "number" then
               file:write(  charS..tostring( v )..","..charE )
            end
         end
         for i,v in pairs( t ) do
            -- escape handled values
            if (not thandled[i]) then
            
               local str = ""
               local stype = type( i )
               -- handle index
               if stype == "table" then
                  if not lookup[i] then
                     table.insert( tables,i )
                     lookup[i] = #tables
                  end
                  str = charS.."[{"..lookup[i].."}]="
               elseif stype == "string" then
                  str = charS.."["..ADekoLib.exportstring( i ).."]="
               elseif stype == "number" then
                  str = charS.."["..tostring( i ).."]="
               end
               if str ~= "" then
                  stype = type( v )
                  -- handle value
                  if stype == "table" then
                     if not lookup[v] then
                        table.insert( tables,v )
                        lookup[v] = #tables
                     end
                     file:write( str.."{"..lookup[v].."},"..charE )
                  elseif stype == "string" then
                     file:write( str..ADekoLib.exportstring( v )..","..charE )
                  elseif stype == "number" then
                     file:write( str..tostring( v )..","..charE )
                  end
               end
            end
         end
         file:write( "},"..charE )
      end
      file:write( "}" )
      file:close()
  end
  
------------------------------------------------
-- Helper for saveImageData, used internally
function ADekoLib.exportstring( s )
      return string.format("%q", s)
end

------------------------------------------------
-- Loads shape data created from images
function ADekoLib.loadImageData(sfile)
  local ftables,err = loadfile( sfile )
  if err then return _,err end
  local tables = ftables()
  for idx = 1,#tables do
     local tolinki = {}
     for i,v in pairs( tables[idx] ) do
        if type( v ) == "table" then
           tables[idx][i] = tables[v[1]]
        end
        if type( i ) == "table" and tables[i[1]] then
           table.insert( tolinki,{ i,tables[i[1]] } )
        end
     end
     -- link indices
     for _,v in ipairs( tolinki ) do
        tables[idx][v[2]],tables[idx][v[1]] =  tables[idx][v[1]],nil
     end
  end
  return tables[1]
end

------------------------------------------------
-- Moves the shape with given ID or dataIndex
function ADekoLib.moveShape(dataindex, XorYorBoth, howMuch)
  for i=1, (#data[dataindex]), 1
  do
    if (XorYorBoth=='x' or XorYorBoth=='both') then 
      data[dataindex][i]["X"] = data[dataindex][i]["X"] + howMuch 
    end
    if (XorYorBoth=='y' or XorYorBoth=='both') then 
      data[dataindex][i]["Y"] = data[dataindex][i]["Y"] + howMuch 
    end
  end
end

------------------------------------------------
-- Cleans up corners of structures like sunken frames
function ADekoLib.cleanCorners(firstPoint, secondPoint, depth, cToolDiameter)
  local halfTheDiameter = cToolDiameter/2
  local rectSize = 2*cToolDiameter
  local width  = secondPoint[1] - firstPoint[1]
  local height = secondPoint[2] - firstPoint[2]
  ADekoLib.setThickness(-depth)
  local p1={}  p1[3]=firstPoint[3]
  local p2={}  p2[3]=firstPoint[3]
  local p3={}  p3[3]=firstPoint[3]
  local p4={}  p4[3]=firstPoint[3]
  p1 = ADekoLib.ptAdd(firstPoint, {halfTheDiameter, halfTheDiameter})
  pp1=ADekoLib.ptAdd(p1, {rectSize, rectSize}) pp1[3] = p1[3]
  ADekoLib.rectangle(p1, pp1)
  p2 = ADekoLib.ptAdd(firstPoint, {width-halfTheDiameter-rectSize, halfTheDiameter})
  pp2=ADekoLib.ptAdd(p2, {rectSize, rectSize}) pp2[3] = p2[3]
  ADekoLib.rectangle(p2, pp2)
  p3 = ADekoLib.ptSubtract(secondPoint, {halfTheDiameter+rectSize, halfTheDiameter+rectSize})
  pp3=ADekoLib.ptAdd(p3, {rectSize, rectSize}) pp3[3] = p3[3]
  ADekoLib.rectangle(p3, pp3)
  p4 = ADekoLib.ptSubtract(secondPoint, {width-halfTheDiameter, halfTheDiameter+rectSize})
  pp4=ADekoLib.ptAdd(p4, {rectSize, rectSize})  pp4[3] = p4[3]
  ADekoLib.rectangle(p4, pp4)
end

--   
-- pDia previous tool dia (rougth), tDia cleaner tool dia
function  ADekoLib.cleanCorners2(leftBottomPt, rightTopPt, pDia, tDia)
  local leftBottom = {}
  table.insert(leftBottom, {0.0 , 0.0 , 0.0, 0.0})
  table.insert(leftBottom, {0.0 , pDia / 2.0 + tDia /2.0 + 1.0, 0.0, 0.0 })
  table.insert(leftBottom, {tDia + 1.0 , pDia / 2.0 + tDia / 2.0 + 1.0 ,0.0 , 0.4142136})
  table.insert(leftBottom, {pDia / 2.0 + tDia / 2.0 + 1.0 , tDia + 1.0 , 0.0 ,0.0 })
  table.insert(leftBottom, {pDia / 2.0 + tDia / 2.0 + 1.0 , 0.0 , 0.0, 0.0 })
  table.insert(leftBottom, {0.0 , 0.0 , 0.0 , 0.0})

  local leftTop = ADekoLib.mirror(leftBottom, "y", 0,0)
  local rigthTop = ADekoLib.mirror(leftBottom, "xy", 0,0)
  local rightBottom = ADekoLib.mirror(leftBottom, "x", 0,0)
  leftBottom = ADekoLib.moveWithDeltaVec(leftBottom, leftBottomPt)
  ADekoLib.polylineimp(leftBottom)
  leftTop = ADekoLib.moveWithDeltaVec(leftTop, {leftBottomPt[1], rightTopPt[2]})
  ADekoLib.polylineimp(leftTop)
  rigthTop = ADekoLib.moveWithDeltaVec(rigthTop, rightTopPt)
  ADekoLib.polylineimp(rigthTop)
  rightBottom = ADekoLib.moveWithDeltaVec(rightBottom,  {rightTopPt[1], leftBottomPt[2]})
  ADekoLib.polylineimp(rightBottom)

end

------------------------------------------------
-- Creates a pocket inbetween two diagonal points for the given cToolDiameter
function ADekoLib.pocket(firstPoint, secondPoint, depth, cToolDiameter)
  local width  = secondPoint[1] - firstPoint[1]  -- check tool diameter
  local height = secondPoint[2] - firstPoint[2]
  if (cToolDiameter*1.5>width or cToolDiameter*1.5>height) then
    ADekoLib.error("Tool diameter too large!")
    return false
  end
  if (pncl~=nil) then
    pncl(colr(255, 255, 0))
    pnsz(4)
    local fp = ADekoLib.ptAdd(firstPoint, {3, 3})
    local sp = ADekoLib.ptSubtract(secondPoint, {3, 3})
    line(fp[1], fp[2], sp[1], fp[2])
    line(sp[1], fp[2], sp[1], sp[2])
    line(sp[1], sp[2], fp[1], sp[2])
    line(fp[1], sp[2], fp[1], fp[2])
    pncl(colr(0, 0, 0))
    pnsz(1)
  end
  local i = 1.5  -- first cycle
  local p0 = ADekoLib.ptAdd(firstPoint, {cToolDiameter/2, height-1.5*cToolDiameter})
  p0[3] = -depth
  ADekoLib.node(p0)
  local p1 = ADekoLib.ptAdd(firstPoint, {cToolDiameter/2, height-cToolDiameter/2}) 
  p1[3] = -depth
  ADekoLib.node(p1)  -- calculate points
  local p2 = ADekoLib.polar(p1, 0,   width-cToolDiameter)  
  p2[3] = -depth
  ADekoLib.node(p2)
  local p3 = ADekoLib.polar(p2, 270, height-cToolDiameter)    
  p3[3] = -depth            
  ADekoLib.node(p3)
  local p4 = ADekoLib.polar(p3, 180, width-cToolDiameter)    
  p4[3] = -depth            
  ADekoLib.node(p4)
  local p5 = ADekoLib.polar(p4, 90,  height-i*cToolDiameter)    
  p5[3] = -depth            
  ADekoLib.node(p5)
  local terminate = false
  while(not terminate)  -- loop over other cycles until termination criteria is met
  do
    local p6 = ADekoLib.polar(p5, 0,   width -i*cToolDiameter) 
    i=i+0.5
    if (ADekoLib.distance(p5, p6) < cToolDiameter/2) then 
      terminate = true 
      goto continue 
    end   
    p6[3] = -depth
    ADekoLib.node(p6)
    local p7 = ADekoLib.polar(p6, 270, height-i*cToolDiameter)
    if (ADekoLib.distance(p6, p7) < cToolDiameter/2) then 
      terminate = true 
      goto continue 
    end  
    p7[3] = -depth 
    ADekoLib.node(p7)
    local p8 = ADekoLib.polar(p7, 180, width-i*cToolDiameter) 
    i=i+0.5
    if (ADekoLib.distance(p7, p8) < cToolDiameter/2) then 
      terminate = true 
      goto continue 
    end   
    p8[3] = -depth
    ADekoLib.node(p8)
    local p9 = ADekoLib.polar(p8, 90,  height-i*cToolDiameter)
    if (ADekoLib.distance(p8, p9) < cToolDiameter/2) then 
      terminate = true 
      goto continue 
    end 
    p9[3] = -depth
    ADekoLib.node(p9)
    p5 = p9
    ::continue::
  end
  ADekoLib.nextShape()
end

------------------------------------------------
-- Creates a sunken frame in between two diagonal points, given the frame depth.
-- With the given tool angle, checks if tool diameter is enough for the frame thickness.
function ADekoLib.sunkenFrame(fp, sp, depth, vToolAngle, vToolDiameter)
  local fpX = fp[1]
  local fpY = fp[2]
  local spX = sp[1]
  local spY = sp[2]
  local firstPoint = {}
  local secondPoint = {}
  firstPoint[1] = math.min(fpX,spX) 
  firstPoint[2] = math.min(fpY,spY)  
  secondPoint[1] = math.max(fpX,spX)  
  secondPoint[2] = math.max(fpY,spY)  
  
  local offset = depth * math.tan((math.pi*vToolAngle/180)/2.0)  -- checks and some math
  if (offset > vToolDiameter/2) then
    ADekoLib.error("Tool diameter too small")
    return false
  end
  local width  = secondPoint[1] - firstPoint[1]
  local height = secondPoint[2] - firstPoint[2]
  if (pncl~=nil) then
    pncl(colr(255, 0, 255))
    pnsz(4)
    line(firstPoint[1], firstPoint[2], secondPoint[1], firstPoint[2])
    line(secondPoint[1], firstPoint[2], secondPoint[1], secondPoint[2])
    line(secondPoint[1], secondPoint[2], firstPoint[1], secondPoint[2])
    line(firstPoint[1], secondPoint[2], firstPoint[1], firstPoint[2])
    pncl(colr(0, 0, 0))
    pnsz(1)
  end
  local p2 = ADekoLib.ptAdd(firstPoint, {offset,       height-offset, -depth})
  local p3 = ADekoLib.ptAdd(firstPoint, {0,            height,        0})
  local p4 = ADekoLib.ptAdd(firstPoint, {offset,       height-offset, -depth})
  local p5 = ADekoLib.ptAdd(firstPoint, {width-offset, height-offset, -depth})
  local p6 = ADekoLib.ptAdd(firstPoint, {width,        height,        0})
  local p7 = ADekoLib.ptAdd(firstPoint, {width-offset, height-offset, -depth})
  local p8 = ADekoLib.ptAdd(firstPoint, {width-offset, offset,        -depth})
  local p9 = ADekoLib.ptAdd(firstPoint, {width,        0,             0})
  local pa = ADekoLib.ptAdd(firstPoint, {width-offset, offset,        -depth})
  local pb = ADekoLib.ptAdd(firstPoint, {offset,       offset,        -depth})
  local pc = ADekoLib.ptAdd(firstPoint, {0,            0,             0})
  local pd = ADekoLib.ptAdd(firstPoint, {offset,       offset,        -depth})
  ADekoLib.polyline(p2, p5, p6, p7, p8, p9, pa, pb, pc, pd, p2, p3)     -- actual object
  return pb, p7  -- return inner rectangle (convenient for radial nesting, pocket and cleanup functions)
end

------------------------------------------------
-- Space filling pattern menderes river A
function ADekoLib.menderesA(marginX, marginY, structureSizeX, structureSizeY, localX, localY)
  
  local X, Y = localX or X, localY or Y

  -- do some math
  local howManyX = math.floor((X-2*marginX)/structureSizeX)
  local howManyY = math.floor((Y-2*marginY)/structureSizeY)
  uX = (X-2*marginX)/(3*howManyX)
  uY = (Y-2*marginY)/(3*howManyY)
  local startPoint = {marginX+4*uX, marginY+2*uY}
  local lastPoint = ADekoLib.polar(startPoint, 0,   1*uX)
  
  -- loop over tiles & turns
  local  refPoint = startPoint
  for angleOffset=0, 270, 90  -- 4 edges and corresponding turns 
  do
    if (angleOffset==0 or angleOffset==180) then
      for i=1, howManyX-2, 1 -- Tile N times the repeating unit
      do 
        refPoint = ADekoLib.menderesAtile(refPoint, angleOffset, uX, uY) 
      end
      refPoint = ADekoLib.menderesAcorner(refPoint, angleOffset, uX, uY)
    else
      for i=1, howManyY-2, 1 -- Tile N times the repeating unit
      do 
        refPoint = ADekoLib.menderesAtile(refPoint, angleOffset, uX, uY) 
      end
      refPoint = ADekoLib.menderesAcorner(refPoint, angleOffset, uX, uY)
    end
  end
  ADekoLib.nextShape()
  ADekoLib.line(startPoint, lastPoint)
  return {marginX+structureSizeX, marginY+structureSizeY}, {X-marginX-structureSizeX, Y-marginY-structureSizeY}
end

------------------------------------------------
function ADekoLib.menderesAtile(startPoint, angleOffset, uX, uY)
  if (angleOffset==90 or angleOffset==270) then
    uX, uY = ADekoLib.swap(uX, uY)
  end
  local p1 = startPoint                           --ADekoLib.node(p1)
  local p2 = ADekoLib.polar(p1, angleOffset + 0,   1*uX) ADekoLib.node(p2)
  local p3 = ADekoLib.polar(p2, angleOffset + 270, 1*uY) ADekoLib.node(p3)
  local p4 = ADekoLib.polar(p3, angleOffset + 180, 1*uX) ADekoLib.node(p4)        
  local p5 = ADekoLib.polar(p4, angleOffset + 270, 1*uY) ADekoLib.node(p5)
  local p6 = ADekoLib.polar(p5, angleOffset + 0,   2*uX) ADekoLib.node(p6)
  local p7 = ADekoLib.polar(p6, angleOffset + 90,  2*uY) ADekoLib.node(p7)
  local p8 = ADekoLib.polar(p7, angleOffset + 0,   1*uX) ADekoLib.node(p8)
  --ADekoLib.polyline(p1, p2, p3, p4, p5, p6, p7, p8)
  if (angleOffset==90 or angleOffset==270) then
    uX, uY = ADekoLib.swap(uX, uY)
  end
  return p8
end

------------------------------------------------
function ADekoLib.menderesAcorner(startPoint, angleOffset, uX, uY)
  if (angleOffset==90 or angleOffset==270) then
    uX, uY = ADekoLib.swap(uX, uY)
  end
  local p1 = startPoint                                  ADekoLib.node(p1)
  local p2 = ADekoLib.polar(p1, angleOffset + 0,   1*uX) ADekoLib.node(p2)
  local p3 = ADekoLib.polar(p2, angleOffset + 270, 1*uY) ADekoLib.node(p3)
  local p4 = ADekoLib.polar(p3, angleOffset + 180, 1*uX) ADekoLib.node(p4)
  local p5 = ADekoLib.polar(p4, angleOffset + 270, 1*uY) ADekoLib.node(p5)
  local p6 = ADekoLib.polar(p5, angleOffset + 0,   2*uX) ADekoLib.node(p6)
  local p7 = ADekoLib.polar(p6, angleOffset + 90,  3*uY) ADekoLib.node(p7)
  local p8 = ADekoLib.polar(p7, angleOffset + 180, 2*uX) ADekoLib.node(p8)
  local p9 = ADekoLib.polar(p8, angleOffset + 90,  1*uY) ADekoLib.node(p9)
  --ADekoLib.polyline(p1, p2, p3, p4, p5, p6, p7, p8, p9)
  if (angleOffset==90 or angleOffset==270) then
    uX, uY = ADekoLib.swap(uX, uY)
  end
  return p9
end

------------------------------------------------
-- Space filling pattern menderes river B
function ADekoLib.menderesB(marginX, marginY, structureSizeX, structureSizeY, localX, localY)
  
  local X, Y = localX or X, localY or Y
  
  -- do some math
  local howManyX = math.floor((X-2*marginX)/structureSizeX)
  local howManyY = math.floor((Y-2*marginY)/structureSizeY)
  uX = (X-2*marginX)/(4*howManyX-2)
  uY = (Y-2*marginY)/(4*howManyY-2)
  local startPoint = {marginX+3*uX, marginY}
  local lastPoint = ADekoLib.polar(startPoint, 90,  3*uY)
  
  -- loop over tiles & turns
  local refPoint = startPoint
  for angleOffset=0, 270, 90  -- 4 edges and corresponding turns 
  do
    if (angleOffset==0 or angleOffset==180) then
      for i=1, howManyX-2, 1 -- Tile N times the repeating unit
      do 
        refPoint = ADekoLib.menderesBtile(refPoint, angleOffset, uX, uY) 
      end
      refPoint = ADekoLib.menderesBcorner(refPoint, angleOffset, uX, uY)
    else
      for i=1, howManyY-2, 1 -- Tile N times the repeating unit
      do 
        refPoint = ADekoLib.menderesBtile(refPoint, angleOffset, uX, uY) 
      end
      refPoint = ADekoLib.menderesBcorner(refPoint, angleOffset, uX, uY)
    end
  end
  ADekoLib.nextShape()
  ADekoLib.line(startPoint, lastPoint)
  return {marginX+structureSizeX, marginY+structureSizeY}, {X-marginX-structureSizeX, Y-marginY-structureSizeY}
end

------------------------------------------------
function ADekoLib.menderesBtile(startPoint, angleOffset, uX, uY)    
  if (angleOffset==90 or angleOffset==270) then
    uX, uY = ADekoLib.swap(uX, uY)
  end
  local p1  = startPoint
  local p2  = ADekoLib.polar(p1, angleOffset + 90,  3*uY)  ADekoLib.node(p2)
  local p3  = ADekoLib.polar(p2, angleOffset + 0,   3*uX)  ADekoLib.node(p3)
  local p4  = ADekoLib.polar(p3, angleOffset + 270, 2*uY)  ADekoLib.node(p4)
  local p5  = ADekoLib.polar(p4, angleOffset + 180, 1*uX)  ADekoLib.node(p5)
  local p6  = ADekoLib.polar(p5, angleOffset + 90,  1*uY)  ADekoLib.node(p6)
  local p7  = ADekoLib.polar(p6, angleOffset + 180, 1*uX)  ADekoLib.node(p7)
  local p8  = ADekoLib.polar(p7, angleOffset + 270, 2*uY)  ADekoLib.node(p8)
  local p9  = ADekoLib.polar(p8, angleOffset + 0,   3*uX)  ADekoLib.node(p9)
  --ADekoLib.polyline(p1, p2, p3, p4, p5, p6, p7, p8, p9)
  if (angleOffset==90 or angleOffset==270) then
    uX, uY = ADekoLib.swap(uX, uY)
  end
  return p9
end

------------------------------------------------
function ADekoLib.menderesBcorner(startPoint, angleOffset, uX, uY)
  if (angleOffset==90 or angleOffset==270) then
    uX, uY = ADekoLib.swap(uX, uY)
  end
  local p1  = startPoint                                  ADekoLib.node(p1)
  local p2  = ADekoLib.polar(p1, angleOffset + 90,  2*uY) ADekoLib.node(p2)
  local p3  = ADekoLib.polar(p2, angleOffset + 0,   2*uX) ADekoLib.node(p3)
  local p4  = ADekoLib.polar(p3, angleOffset + 270, 1*uY) ADekoLib.node(p4)
  local p5  = ADekoLib.polar(p4, angleOffset + 180, 1*uX) ADekoLib.node(p5)
  local p6  = ADekoLib.polar(p5, angleOffset + 270, 1*uY) ADekoLib.node(p6)
  local p7  = ADekoLib.polar(p6, angleOffset + 0,   2*uX) ADekoLib.node(p7)
  local p8  = ADekoLib.polar(p7, angleOffset + 90,  3*uY) ADekoLib.node(p8)
  --ADekoLib.polyline(p1, p2, p3, p4, p5, p6, p7, p8)
  if (angleOffset==90 or angleOffset==270) then
    uX, uY = ADekoLib.swap(uX, uY)
  end
  return p8
end

------------------------------------------------
-- Space filling pattern menderes river C
function ADekoLib.menderesC(marginX, marginY, structureSizeX, structureSizeY, localX, localY)
  
  local X, Y = localX or X, localY or Y
  
  -- do some math
  local howManyX = math.floor((X-2*marginX)/structureSizeX)
  local howManyY = math.floor((Y-2*marginY)/structureSizeY)
  uX = (X-2*marginX)/(5*howManyX-2)
  uY = (Y-2*marginY)/(5*howManyY-2)
  local startPoint = {marginX+4*uX, marginY+3*uY}
  local lastPoint = ADekoLib.polar(startPoint, 270,  3*uY)
  
  -- loop over tiles & turns
  local refPoint = startPoint
  for angleOffset=0, 270, 90  -- 4 edges and corresponding turns 
  do
    if (angleOffset==0 or angleOffset==180) then
      for i=1, howManyX-2, 1 -- Tile N times the repeating unit
      do 
        refPoint = ADekoLib.menderesCtile(refPoint, angleOffset, uX, uY) 
      end
      refPoint = ADekoLib.menderesCcorner(refPoint, angleOffset, uX, uY)
    else
      for i=1, howManyY-2, 1 -- Tile N times the repeating unit
      do 
        refPoint = ADekoLib.menderesCtile(refPoint, angleOffset, uX, uY) 
      end
      refPoint = ADekoLib.menderesCcorner(refPoint, angleOffset, uX, uY)
    end
  end
  ADekoLib.nextShape()
  ADekoLib.line(startPoint, lastPoint)
  return {marginX+structureSizeX, marginY+structureSizeY}, {X-marginX-structureSizeX, Y-marginY-structureSizeY}
end

------------------------------------------------
function ADekoLib.menderesCtile(startPoint, angleOffset, uX, uY)  
  if (angleOffset==90 or angleOffset==270) then
    uX, uY = ADekoLib.swap(uX, uY)
  end
  local p1  = startPoint
  local p2  = ADekoLib.polar(p1, angleOffset   + 270,  3*uY)  ADekoLib.node(p2)
  local p3  = ADekoLib.polar(p2, angleOffset   + 0,    4*uX)  ADekoLib.node(p3)
  local p4  = ADekoLib.polar(p3, angleOffset   + 90,   3*uY)  ADekoLib.node(p4)
  local p5  = ADekoLib.polar(p4, angleOffset   + 180,  2*uX)  ADekoLib.node(p5)
  local p6  = ADekoLib.polar(p5, angleOffset   + 270,  1*uY)  ADekoLib.node(p6)
  local p7  = ADekoLib.polar(p6, angleOffset   + 0,    1*uX)  ADekoLib.node(p7)
  local p8  = ADekoLib.polar(p7, angleOffset   + 270,  1*uY)  ADekoLib.node(p8)
  local p9  = ADekoLib.polar(p8, angleOffset   + 180,  2*uX)  ADekoLib.node(p9)
  local p10  = ADekoLib.polar(p9, angleOffset  + 90,   3*uY)  ADekoLib.node(p10)
  local p11  = ADekoLib.polar(p10, angleOffset + 0,    4*uX)  ADekoLib.node(p11)
  local p12  = ADekoLib.polar(p11, angleOffset + 270,  1*uY)  ADekoLib.node(p12)
  --ADekoLib.polyline(p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12)
  if (angleOffset==90 or angleOffset==270) then
    uX, uY = ADekoLib.swap(uX, uY)
  end
  return p12
end

------------------------------------------------
function ADekoLib.menderesCcorner(startPoint, angleOffset, uX, uY)
  if (angleOffset==90 or angleOffset==270) then
    uX, uY = ADekoLib.swap(uX, uY)
  end
  local p1  = startPoint                            ADekoLib.node(p1)
  local p2  = ADekoLib.polar(p1, angleOffset + 270, 3*uY)  ADekoLib.node(p2)
  local p3  = ADekoLib.polar(p2, angleOffset + 0,   4*uX)  ADekoLib.node(p3)
  local p4  = ADekoLib.polar(p3, angleOffset + 90,  3*uY)  ADekoLib.node(p4)
  local p5  = ADekoLib.polar(p4, angleOffset + 180, 2*uX)  ADekoLib.node(p5)
  local p6  = ADekoLib.polar(p5, angleOffset + 270, 1*uY)  ADekoLib.node(p6)
  local p7  = ADekoLib.polar(p6, angleOffset + 0,   1*uX)  ADekoLib.node(p7)
  local p8  = ADekoLib.polar(p7, angleOffset + 270, 1*uY)  ADekoLib.node(p8)
  local p9  = ADekoLib.polar(p8, angleOffset + 180, 2*uX)  ADekoLib.node(p9)
  local p10 = ADekoLib.polar(p9, angleOffset + 90,  3*uY)  ADekoLib.node(p10)
  --ADekoLib.polyline(p1, p2, p3, p4, p5, p6, p7, p8, p9, p10)
  if (angleOffset==90 or angleOffset==270) then
    uX, uY = ADekoLib.swap(uX, uY)
  end
  return p10
end

------------------------------------------------
-- Space filling pattern menderes river D
function ADekoLib.menderesD(marginX, marginY, structureSizeX, structureSizeY, localX, localY)
  
  local X, Y = localX or X, localY or Y
  
  -- do some math
  local howManyX = math.floor((X-2*marginX)/structureSizeX)
  local howManyY = math.floor((Y-2*marginY)/structureSizeY)
  uX = (X-2*marginX)/(6*howManyX-2)
  uY = (Y-2*marginY)/(6*howManyY-2)
  local startPoint = {marginX+5*uX, marginY+4*uY}
  local lastPoint = ADekoLib.polar(startPoint, 270, 4*uY)
  
  -- loop over tiles & turns
  local refPoint = startPoint
  for angleOffset=0, 270, 90  -- 4 edges and corresponding turns 
  do
    if (angleOffset==0 or angleOffset==180) then
      for i=1, howManyX-2, 1 -- Tile N times the repeating unit
      do 
        refPoint = ADekoLib.menderesDtile(refPoint, angleOffset, uX, uY) 
      end
      refPoint = ADekoLib.menderesDcorner(refPoint, angleOffset, uX, uY)
    else
      for i=1, howManyY-2, 1 -- Tile N times the repeating unit
      do 
        refPoint = ADekoLib.menderesDtile(refPoint, angleOffset, uX, uY) 
      end
      refPoint = ADekoLib.menderesDcorner(refPoint, angleOffset, uX, uY)
    end
  end
  ADekoLib.nextShape()
  ADekoLib.line(startPoint, lastPoint)
  return {marginX+structureSizeX, marginY+structureSizeY}, {X-marginX-structureSizeX, Y-marginY-structureSizeY}
end

------------------------------------------------
function ADekoLib.menderesDtile(startPoint, angleOffset, uX, uY)  
  if (angleOffset==90 or angleOffset==270) then
    uX, uY = ADekoLib.swap(uX, uY)
  end
  local p1  = startPoint
  local p2  = ADekoLib.polar(p1,  angleOffset + 270, 4*uY)  ADekoLib.node(p2)
  local p3  = ADekoLib.polar(p2,  angleOffset + 0,   5*uX)  ADekoLib.node(p3)
  local p4  = ADekoLib.polar(p3,  angleOffset + 90,  4*uY)  ADekoLib.node(p4)
  local p5  = ADekoLib.polar(p4,  angleOffset + 180, 3*uX)  ADekoLib.node(p5)
  local p6  = ADekoLib.polar(p5,  angleOffset + 270, 2*uY)  ADekoLib.node(p6)
  local p7  = ADekoLib.polar(p6,  angleOffset + 0,   1*uX)  ADekoLib.node(p7)
  local p8  = ADekoLib.polar(p7,  angleOffset + 90,  1*uY)  ADekoLib.node(p8)
  local p9  = ADekoLib.polar(p8,  angleOffset + 0,   1*uX)  ADekoLib.node(p9)
  local p10 = ADekoLib.polar(p9,  angleOffset + 270, 2*uY)  ADekoLib.node(p10)
  local p11 = ADekoLib.polar(p10, angleOffset + 180, 3*uX)  ADekoLib.node(p11)
  local p12 = ADekoLib.polar(p11, angleOffset + 90,  4*uY)  ADekoLib.node(p12)
  local p13 = ADekoLib.polar(p12, angleOffset + 0,   5*uX)  ADekoLib.node(p13)
  local p14 = ADekoLib.polar(p13, angleOffset + 270, 1*uY)  ADekoLib.node(p14)
  --ADekoLib.polyline(p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14)
  if (angleOffset==90 or angleOffset==270) then
    uX, uY = ADekoLib.swap(uX, uY)
  end
  return p14
end

------------------------------------------------
function ADekoLib.menderesDcorner(startPoint, angleOffset, uX, uY)
  if (angleOffset==90 or angleOffset==270) then
    uX, uY = ADekoLib.swap(uX, uY)
  end
  local p1  = startPoint                                    ADekoLib.node(p1)
  local p2  = ADekoLib.polar(p1,  angleOffset + 270, 4*uY)  ADekoLib.node(p2)
  local p3  = ADekoLib.polar(p2,  angleOffset + 0,   5*uX)  ADekoLib.node(p3)
  local p4  = ADekoLib.polar(p3,  angleOffset + 90,  4*uY)  ADekoLib.node(p4)
  local p5  = ADekoLib.polar(p4,  angleOffset + 180, 3*uX)  ADekoLib.node(p5)
  local p6  = ADekoLib.polar(p5,  angleOffset + 270, 2*uY)  ADekoLib.node(p6)
  local p7  = ADekoLib.polar(p6,  angleOffset + 0,   1*uX)  ADekoLib.node(p7)
  local p8  = ADekoLib.polar(p7,  angleOffset + 90,  1*uY)  ADekoLib.node(p8)
  local p9  = ADekoLib.polar(p8,  angleOffset + 0,   1*uX)  ADekoLib.node(p9)
  local p10 = ADekoLib.polar(p9,  angleOffset + 270, 2*uY)  ADekoLib.node(p10)
  local p11 = ADekoLib.polar(p10, angleOffset + 180, 3*uX)  ADekoLib.node(p11)
  local p12 = ADekoLib.polar(p11, angleOffset + 90,  4*uY)  ADekoLib.node(p12)
  --ADekoLib.polyline(p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12)
  if (angleOffset==90 or angleOffset==270) then
    uX, uY = ADekoLib.swap(uX, uY)
  end
  return p12
end

------------------------------------------------
-- Creates a circle out of 4 lines with bulge
function ADekoLib.circle(p, r)
	local B = math.tan(math.pi/8)
	local p1 = {p[1]+r, p[2]  , 0, B}
	local p2 = {p[1]  , p[2]+r, 0, B}
	local p3 = {p[1]-r, p[2]  , 0, B}
	local p4 = {p[1]  , p[2]-r, 0, B}
	ADekoLib.polyline(p1, p2, p3, p4, p1)
  
  local retVal = {}
  retVal[1] = p1
  retVal[2] = p2
  retVal[3] = p3
  retVal[4] = p4
  return retVal
end

------------------------------------------------
-- Checks if one circle intersects another circle.
-- Returns type and coordinates of the intersection point(s).
function ADekoLib.circleCircleIntersection(p1, radius1, p2, radius2)
	local circle1x, circle1y = p1[1], p1[2]
	local circle2x, circle2y = p2[1], p2[2]
	local length = ADekoLib.distance(p1, p2)
	if length>radius1+radius2 then 
		return false 
	end -- If the distance is greater than the two radii, they can't intersect.
	if ADekoLib.checkFuzzy(length, 0) and 
	   ADekoLib.checkFuzzy(radius1, radius2) then 
		return 'equal' 
	end
	if ADekoLib.checkFuzzy(circle1x, circle2x) and 
	   ADekoLib.checkFuzzy(circle1y, circle2y) then 
		return 'concentric' 
	end
	local a = (radius1*radius1-radius2*radius2+length*length)/(2*length)
	local h = math.sqrt(radius1*radius1-a*a)
	local p2x = circle1x+a*(circle2x-circle1x)/length
	local p2y = circle1y+a*(circle2y-circle1y)/length
	local p3x = p2x+h*(circle2y-circle1y)/length
	local p3y = p2y-h*(circle2x-circle1x)/length
	local p4x = p2x-h*(circle2y-circle1y)/length
	local p4y = p2y+h*(circle2x-circle1x)/length
	if not ADekoLib.validateNumber(p3x) or 
	   not ADekoLib.validateNumber(p3y) or 
	   not ADekoLib.validateNumber(p4x) or 
	   not ADekoLib.validateNumber(p4y) then
		return 'inside'
	end
	if ADekoLib.checkFuzzy(length, radius1+radius2) or 
	   ADekoLib.checkFuzzy(length, math.abs(radius1-radius2)) then 
		return 'tangent', {p3x, p3y} 
	end
	return 'intersection', {p3x, p3y}, {p4x, p4y}
end

------------------------------------------------
-- Deals with floats / verify false false values. This can happen because of significant figures.
function ADekoLib.checkFuzzy(number1, number2)
	return (number1-.00001<=number2 and number2<=number1+.00001)
end

------------------------------------------------
-- Returns quadratic roots of an equation.
function ADekoLib.quadraticRoots(a, b, c)
	local discriminant = b^2-(4*a*c)
	if discriminant<0 then 
		return false 
	end
	discriminant = math.sqrt(discriminant)
	local denominator = (2*a)
	return (-b-discriminant)/denominator, (-b+discriminant)/denominator
end

------------------------------------------------
-- Returns radius of an arc inbetween two points for a given bulge
function ADekoLib.radius(p1, p2, bulge)
	local d = ADekoLib.distance(p1, p2)/2
	return d*(1+bulge^2)/(2*math.abs(bulge))
end

------------------------------------------------
-- Check if input is actually a practically finite number
function ADekoLib.validateNumber(n)
	if type(n)~='number' then 
		return false
	elseif n~=n then 
		return false -- nan
	elseif math.abs(n)==math.huge then 
		return false
	else 
		return true 
	end
end

------------------------------------------------
-- Returns the y-intercept of a line.
-- x1, y1, x2, y2
-- x1, y1, slope
function ADekoLib.yIntercept(x, y, ... )
	local input = ADekoLib.checkInput(...)
	local slope
	if #input == 1 then
		slope = input[1]
	else
		slope = ADekoLib.slope(x, y, unpack(input))
	end
	if not slope then 
		return x, true 
	end -- This way we have some information on the line.
	return y-slope*x, false
end

------------------------------------------------
-- Handle variable-argument functions and whether they are passed as func{table} or func(unpack(table))
function ADekoLib.checkInput(...)
	local input = {}
	if type(...)~='table' then 
		input = {...} 
	else 
		input = ... 
	end
	return input
end

------------------------------------------------
-- Returns the type and intersection points between a line and a circle.
-- pc is the center point of circle of which radius is its radius, 
-- and p1 & p2 are the points on the line, defining it
function ADekoLib.circleLineIntersection(pc, radius, p1, p2)
	local circleX, circleY = pc[1], pc[2]
	local x1, y1, x2, y2 = p1[1], p1[2], p2[1], p2[2]
	local slope = ADekoLib.slope(x1, y1, x2, y2)
	local intercept = ADekoLib.yIntercept(x1, y1, slope)
	if slope then -- There is a slope
		local a = (1+slope^2)
		local b = (-2*(circleX)+(2*slope*intercept)-(2*circleY*slope))
		local c = (circleX^2+intercept^2-2*(circleY)*(intercept)+circleY^2-radius^2)
		x1, x2 = ADekoLib.quadraticRoots(a, b, c)
		if not x1 then 
			return false 
		end
		y1 = slope*x1+intercept
		y2 = slope*x2+intercept
		if ADekoLib.checkFuzzy(x1, x2) and ADekoLib.checkFuzzy(y1, y2) then
			return 'tangent', {x1, y1}
		else
			return 'secant', {x1, y1}, {x2, y2}
		end
	else -- Vertical Lines
		local lengthToPoint1 = circleX-x1
		local intercept = math.sqrt(-(lengthToPoint1^2-radius^2))
		if -(lengthToPoint1^2-radius^2)<0 then 
			return false 
		end
		local bottomX, bottomY = x1, circleY-intercept
		local topX, topY = x1, circleY+intercept
		if topY ~= bottomY then
			return 'secant', {topX, topY}, {bottomX, bottomY}
		else
			return 'tangent', {topX, topY}
		end
	end
end

------------------------------------------------
-- Returns the slope of a line.
function ADekoLib.slope(x1, y1, x2, y2)
	if ADekoLib.areRoughlyEqual(x1, x2) then 
		return false 
	end
	return (y1-y2)/(x1-x2)
end

------------------------------------------------
-- Returns the bulge of a line passing through 3 points
-- p2 is middle point
function ADekoLib.bulge(p1, p2, p3)
	assert(type(p1)=="table", "point is not a table")
	assert(type(p2)=="table", "point is not a table")
	assert(type(p3)=="table", "point is not a table")
	assert(type(p1[1])=="number", "input is not a number")
	assert(type(p1[2])=="number", "input is not a number")
	assert(type(p2[1])=="number", "input is not a number")
	assert(type(p2[2])=="number", "input is not a number")
	assert(type(p3[1])=="number", "input is not a number")
	assert(type(p3[2])=="number", "input is not a number")
	if ADekoLib.distance(p1, p2)==0 or 
	   ADekoLib.distance(p1, p3)==0 or 
	   ADekoLib.distance(p2, p3)==0 then
		ADekoLib.error()
		return -1
	end
	return math.tan((math.pi/180) * (0.5 * ((180 - ADekoLib.angle(p2, p1)) + ADekoLib.angle(p2, p3))))
end

------------------------------------------------
-- Returns the angle between line defined by the points and horizontal 
function ADekoLib.angle(p1, p2)
	assert(type(p1)=="table", "point is not a table")
	assert(type(p2)=="table", "point is not a table")
	assert(type(p1[1])=="number", "input is not a number")
	assert(type(p1[2])=="number", "input is not a number")
	assert(type(p2[1])=="number", "input is not a number")
	assert(type(p2[2])=="number", "input is not a number")
	local np2 = {}
	if (p2[2] > p1[2]) then  --> 2nd point is higher, narrower angle
		np2[1] = p2[1] - p1[1]
		np2[2] = p2[2] - p1[2]
		if (math.atan2 ~= nil) then 
      return math.atan2(np2[2], np2[1]) * 180 / math.pi
    end
    return math.atan(np2[2], np2[1]) * 180 / math.pi
	elseif (p2[2] == p1[2]) then  --> same height, 0 or 180 degree
		if (p2[1] > p1[1]) then
			return 0
		elseif (p2[1] < p1[1]) then
			return 180
		else
			ADekoLib.error("Angle error.")
			return -1
		end
	else --> 2nd point lower, wider angle
		np2[1] = p2[1] - p1[1]
		np2[2] = p2[2] - p1[2]
		np2[2] = -1 * np2[2]
    if (math.atan2 ~= nil) then 
      local thetaPrime = math.atan2(np2[2], np2[1]) * 180 / math.pi
      return 360 - thetaPrime
    end
    local thetaPrime = math.atan(np2[2], np2[1]) * 180 / math.pi
    return 360 - thetaPrime
	end
end

------------------------------------------------
-- Returns the next point, p2, with theta and distance from p1
function ADekoLib.polar(p1, theta, distance)
	assert(type(p1)=="table", "p1 is not a table")
	assert(type(theta)=="number", "theta is not a number")
	assert(type(distance)=="number", "distance is not number")
	assert(type(p1[1])=="number", "input is not a number")
	assert(type(p1[2])=="number", "input is not a number")
	local nextPoint = {}
	nextPoint[1] = p1[1] + distance * math.cos(theta * math.pi / 180)
	nextPoint[2] = p1[2] + distance * math.sin(theta * math.pi / 180)
  for i=3,#p1,1 do
        nextPoint[i] = p1[i]
  end
	return nextPoint
end

------------------------------------------------
-- Returns the intersection point of two lines:
-- i) if onSegment is true, return intersection point only if it is on both of the lines
-- ii) if false or omitted, assume that the lines are infinitely long
function ADekoLib.lineLineIntersection(p1, p2, p3, p4, onSegment)
	assert(type(p1)=="table", "p1 is not a table")
	assert(type(p2)=="table", "p2 is not a table")
	assert(type(p3)=="table", "p1 is not a table")
	assert(type(p4)=="table", "p2 is not a table")
	assert(type(p1[1])=="number", "input is not a number")
	assert(type(p1[2])=="number", "input is not a number")
	assert(type(p2[1])=="number", "input is not a number")
	assert(type(p2[2])=="number", "input is not a number")
	assert(type(p3[1])=="number", "input is not a number")
	assert(type(p3[2])=="number", "input is not a number")
	assert(type(p4[1])=="number", "input is not a number")
	assert(type(p4[2])=="number", "input is not a number")
	local onSeg = onSegment or false
	local d = (p1[1]-p2[1])*(p3[2]-p4[2])-(p1[2]-p2[2])*(p3[1]-p4[1])
	local a = p1[1]*p2[2]-p1[2]*p2[1]
	local b = p3[1]*p4[2]-p3[2]*p4[1]
	local intersectionPoint = {}
	if (d==0) then
		ADekoLib.error("Identical points, not defining a line")
		return nil
	end
	intersectionPoint[1] = (a*(p3[1]-p4[1])-(p1[1]-p2[1])*b)/d
	intersectionPoint[2] = (a*(p3[2]-p4[2])-(p1[2]-p2[2])*b)/d
	if not onSeg then 
		return intersectionPoint
	else
		-- is intersection point on first line?
		local part1  = ADekoLib.distance(intersectionPoint, p1)
		local part2  = ADekoLib.distance(intersectionPoint, p2)
		local part12 = ADekoLib.distance(p1, p2)
		-- is it on second?
		local part3  = ADekoLib.distance(intersectionPoint, p3)
		local part4  = ADekoLib.distance(intersectionPoint, p4)
		local part34 = ADekoLib.distance(p3, p4)
		if (ADekoLib.areRoughlyEqual(part1 + part2, part12) and 
		    ADekoLib.areRoughlyEqual(part3 + part4, part34)) then
			return intersectionPoint
		else
			return nil
		end
	end
end

------------------------------------------------
-- Checks if the two numbers are approximately equal
function ADekoLib.areRoughlyEqual(a, b, Tolerance)
	local tolerance = Tolerance or 0.0000001
	local diff = math.abs(a-b)
	-- for large numbers
	if (diff <= tolerance) then  
		return true
	end
	-- for small numbers
	if (diff < math.max(math.abs(a), math.abs(b)) * tolerance) then
		return true
	end
	return false
end

------------------------------------------------
-- Outputs an error message for a part
function ADekoLib.error(errorMessage)
  errorMessage = errorMessage or "N.A"
	io.write("ERROR: Parametrization error for part: ", X, "/", Y)
  io.write("ERROR: ", errorMessage)
end

------------------------------------------------
-- Outputs an error message for a product (module)
function ADekoLib.productError(errorMessage)
  local errorMessage = errorMessage or "N.A"
	io.write("ERROR: Parametrization error for product: ", X, "/", Y, "/", Z)
  io.write("ERROR: ", errorMessage)
end

------------------------------------------------
-- Returns distance between two points
function ADekoLib.distance(p1, p2)
	assert(type(p1)=="table", "p1 is not a table")
	assert(type(p2)=="table", "p2 is not a table")
	return (math.sqrt(((p2[1]-p1[1])*(p2[1]-p1[1])) + ((p2[2]-p1[2])*(p2[2]-p1[2]))))
end
function ADekoLib.distance3D(p1, p2)
	assert(type(p1)=="table", "p1 is not a table")
	assert(type(p2)=="table", "p2 is not a table")
	p1[3] = p1[3] or 0
	p2[3] = p2[3] or 0
	return (math.sqrt(((p2[1]-p1[1])*(p2[1]-p1[1])) + ((p2[2]-p1[2])*(p2[2]-p1[2])) + ((p2[3]-p1[3])*(p2[3]-p1[3])) ))
end

------------------------------------------------
-- Creates arbitrary-size polylines
function ADekoLib.polyline(...)
  assert(type({...})=="table", "input is not a table")
  local previous = {}
  previous = nil
  if (pncl~=nil) then 
    pnsz(1) 
    pncl(colr(80, 0, 80))
  end
  for i, p in ipairs({...}) 
  do
	  assert(type(p[1])=="number", "input is not a number")
	  assert(type(p[2])=="number", "input is not a number")
	  assert((#p)>=2, "point must have at least X & Y, bulge might be ommitted.")
	  local z = p[3] or 0
	  if (pncl~=nil) then
	  	if (previous~=nil) then 
          local bulge = previous[4] or 0
	  		if (bulge==0) then -- line
	  		  line(previous[1], previous[2], p[1], p[2])
	  		else
	  		  pnsz(1)
	  		  pncl(colr(80, 0, 80))
	  		  local r = ADekoLib.radius(previous, p, previous[4])
	  		  local comment, pc1, pc2 = ADekoLib.circleCircleIntersection(previous, r, p, r)
	  		  if (comment=='tangent' or comment=='intersection') then
	  		  	if (bulge<0) then 
              pncl(colr(0, 255, 0))
              centerPoint = pc1 
	  		  	end
	  		  	if (bulge>0) then 
              pncl(colr(0, 0, 255))
              centerPoint = pc2 
	  		  	end
	  		  end
	  		  local angle1 = ADekoLib.angle(centerPoint, previous)
	  		  local angle2 = ADekoLib.angle(centerPoint, p)
	  		  angle1, angle2 = 360-angle1, 360-angle2
	  		  if (bulge>0) then 
	  		  	angle1, angle2 = ADekoLib.swap(angle1, angle2)
	  		  end
	  		  crcl(centerPoint[1], centerPoint[2], r, nil, angle1, angle2)
	  		end
	  	end
	  end
	  ADekoLib.node(p)
	  previous = nil
	  previous = ADekoLib.deepcopy(p)
	end
	ADekoLib.nextShape()
end

------------------------------------------------
-- Creates points with bulge to form a line inbetween two points
function ADekoLib.line(p1, p2, bulge)
  --ADekoLib.polyline(p1, p2)
	bulge = bulge or 0
	assert(type(p1)=="table", "p1 is not a table")
	assert(type(p2)=="table", "p2 is not a table")
	assert((#p1)>=2, "point must have at least X & Y, bulge might be ommitted.")
	assert((#p2)>=2, "point must have at least X & Y, bulge might be ommitted.")
	assert(ADekoLib.distance(p1, p2)>0, "Zero line length.")
	if (p1[3] == nil) then 
		ADekoLib.node{p1[1], p1[2], 0, bulge}
	else  
		ADekoLib.node{p1[1], p1[2], p1[3], bulge}
	end
	if (p2[3] == nil) then 
		ADekoLib.node{p2[1], p2[2], 0, 0}
	else  
		ADekoLib.node{p2[1], p2[2], p2[3], 0}
	end
	ADekoLib.nextShape()
  if (pncl~=nil) then
    if (bulge == 0) then
      pnsz(1) pncl(colr(255, 0, 0))
      line(p1[1], p1[2], p2[1], p2[2])
    elseif (bulge~=0) then
      pnsz(1)
      pncl(colr(0, 0, 255))
      local r = ADekoLib.radius(p1, p2, bulge)
      local comment, pc1, pc2 = ADekoLib.circleCircleIntersection(p1, r, p2, r)
      if (comment=='tangent' or comment=='intersection') then
        if (bulge<0) then 
          pncl(colr(0, 255, 0))
          centerPoint = pc1 
        end
        if (bulge>0) then 
          pncl(colr(0, 0, 255))
          centerPoint = pc2 
        end
      end
      local angle1 = ADekoLib.angle(centerPoint, p1)
      local angle2 = ADekoLib.angle(centerPoint, p2)
      angle1, angle2 = 360-angle1, 360-angle2
      if (bulge>0) then 
        angle1, angle2 = ADekoLib.swap(angle1, angle2)
      end
      crcl(centerPoint[1], centerPoint[2], r, nil, angle1, angle2)
    end
  end
end

------------------------------------------------
-- Checks if b is in the middle of a and c
function ADekoLib.isMiddle(a, b, c)
  if (b>a and c>b) or (a>b and b>c) then
    return true
  end
  return false
end

------------------------------------------------
-- Swaps inputs
function ADekoLib.swap(p1, p2)
  local tmp = p1
  p1 = ADekoLib.deepcopy(p2)
  p2 = ADekoLib.deepcopy(tmp)
  return p1, p2
end

------------------------------------------------
-- Creates lines with bulge to form a rectangle inbetween two diagonal points
function ADekoLib.rectangle(p1, p2, bulge)
	assert(type(p1)=="table", "p1 is not a table")
	assert(type(p2)=="table", "p2 is not a table")
	assert((#p1)>=2, "point must have at least X & Y, bulge might be ommitted.")
	assert((#p2)>=2, "point must have at least X & Y, bulge might be ommitted.")
	assert(ADekoLib.distance(p1, p2)>0, "Zero area rectangle.")
  p1[3] = p1[3] or 0
  p2[3] = p2[3] or 0
  if (p1[3]~=p2[3]) then
    ADekoLib.error("Point depths are different")
  end
  ADekoLib.node{p1[1], p1[2], p1[3] or 0, bulge or 0}
  ADekoLib.node{p2[1], p1[2], p1[3] or 0, bulge or 0}
  ADekoLib.node{p2[1], p2[2], p1[3] or 0, bulge or 0}
  ADekoLib.node{p1[1], p2[2], p1[3] or 0, bulge or 0} 
  ADekoLib.node{p1[1], p1[2], p1[3] or 0, bulge or 0}
  ADekoLib.nextShape()
  if (pncl~=nil) then
    line(p2[1], p2[2], p1[1], p2[2])
    line(p1[1], p1[2], p2[1], p1[2])
    line(p2[1], p1[2], p2[1], p2[2])
    line(p1[1], p2[2], p1[1], p1[2])
  end
end

------------------------------------------------
-- Deletes the last shape created. Used internally.
function ADekoLib.deleteLastShape()
	data[currentDataIndex] = nil
end

------------------------------------------------
-- Deletes the last point created. Used internally.
function ADekoLib.deleteLastPoint()
	data[currentDataIndex][currentNodeIndex] = nil
end

------------------------------------------------
-- Ends the creation of current shape and starts a new one. 
-- Should be used if a shape is created by point command directly by the user
-- in order to notify the interpreter that the current shape does not have further points.
function ADekoLib.nextShape()
	ADekoLib.deleteLastPoint()
	currentNodeIndex = 1
	data[currentDataIndex+1] = nil
	data[currentDataIndex+1] = {}
	data[currentDataIndex+1][currentNodeIndex] = {}
	data[currentDataIndex+1][currentNodeIndex]["X"] = 0
	data[currentDataIndex+1][currentNodeIndex]["Y"] = 0
	data[currentDataIndex+1][currentNodeIndex]["Z"] = 0
	data[currentDataIndex+1][currentNodeIndex]["bulge"] = 0
	data[currentDataIndex+1]["thickness"] = currentThickness
	data[currentDataIndex+1]["layerName"] = data[currentDataIndex]["layerName"]
	data[currentDataIndex+1]["rotation"] = ADekoLib.deepcopy(data[currentDataIndex]["rotation"])
	data[currentDataIndex+1]["translation"] = ADekoLib.deepcopy(data[currentDataIndex]["translation"])
	currentDataIndex = currentDataIndex + 1
end

------------------------------------------------
-- Creates node/vertex/point with bulge.
function ADekoLib.node(pt)
  -- Below code destroys product import feature as X and X are global, FIX THIS
	--if (pt[1]>X) then
	--	pt[1] = X
	--end
	--if (pt[2]>Y) then
	--	pt[2] = Y
	--end
	--if (pt[1]<0) then
	--	pt[1] = 0
	--end
	--if (pt[2]<0) then
	--	pt[2] = 0
	--end
  if (pncl~=nil and showPoints) then
    pncl(colr(255, 0, 0))
    crcl(pt[1], pt[2], 2)
    pncl(colr(0, 0, 0))
  end
	data[currentDataIndex][currentNodeIndex] = nil
	data[currentDataIndex][currentNodeIndex] = {}
	data[currentDataIndex][currentNodeIndex]["X"] = pt[1]
	data[currentDataIndex][currentNodeIndex]["Y"] = pt[2]
	data[currentDataIndex][currentNodeIndex]["Z"] = pt[3] or 0
	data[currentDataIndex][currentNodeIndex]["bulge"] = pt[4] or 0
  if (data[currentDataIndex][currentNodeIndex-1]==nil) then  -- if this is the first point
    ADekoLib.nextNode()
    return
  end
  if (data[currentDataIndex][currentNodeIndex]["X"]~=data[currentDataIndex][currentNodeIndex-1]["X"] or
      data[currentDataIndex][currentNodeIndex]["Y"]~=data[currentDataIndex][currentNodeIndex-1]["Y"] or
      data[currentDataIndex][currentNodeIndex]["Z"]~=data[currentDataIndex][currentNodeIndex-1]["Z"]) then  -- if current node is different then previous
    ADekoLib.nextNode()  
  else
    io.write("WARNING: Clashing model nodes, one of clashing nodes ommitted.")
  end
end

------------------------------------------------
-- Moves the point index forward. Used internally.
function ADekoLib.nextNode()
	nodes[currentNodeIndex+1] = nil
	nodes[currentNodeIndex+1] = {}
	nodes[currentNodeIndex+1]["X"] = 0
	nodes[currentNodeIndex+1]["Y"] = 0
	nodes[currentNodeIndex+1]["Z"] = 0
	nodes[currentNodeIndex+1]["bulge"] = 0
	currentNodeIndex = currentNodeIndex + 1
end

------------------------------------------------
-- Creates either a rectangle binding box or an arbitrary polygone as the part shape
function ADekoLib.makePartShape(...)
  ADekoLib.setLayer("PANEL")
  if (... == nil) then  -- the default part shape is a rectangle
    local bindingX = X
    local bindingY = Y
    if (doesSizeIncludeEdgeThickness == "false") then
      bindingX = X + edge1thickness + edge3thickness
      bindingY = Y + edge2thickness + edge4thickness
    end
    local p1 = {0, 0}
    local p2 = {bindingX, bindingY}
    ADekoLib.rectangle(p1, p2, 0)
  else 
    ADekoLib.polyline(...)  -- if user wants an arbitrary polygone to be the part shape
  end
end

------------------------------------------------
-- Creates either a rectangle binding box or an arbitrary polygone as the part shape
function ADekoLib.makePart(width, height, ...)
  ADekoLib.setLayer("PANEL")
  if (... == nil) then  -- the default part shape is a rectangle
    local bindingX = width
    local bindingY = height
    if (doesSizeIncludeEdgeThickness == "false") then
      bindingX = width + edge1thickness + edge3thickness
      bindingY = height + edge2thickness + edge4thickness
    end
    local p1 = {0, 0}
    local p2 = {bindingX, bindingY}
    ADekoLib.rectangle(p1, p2, 0)
  else 
    ADekoLib.polyline(...)  -- if user wants an arbitrary polygone to be the part shape
  end
end

------------------------------------------------
---- Sets how to calculate part dimensions
--function ADekoLib.sizeIncludesEdgeThickness(yesorno)
--	assert(type(yesorno)=="string", "not a string (yes or no)")
--	doesSizeIncludeEdgeThickness = yesorno
--end

------------------------------------------------
-- Uses edge band information from c++ and creates them
function ADekoLib.createEdgeBands()
	if (edge1thickness ~= 0 and edge1thickness ~= nil and edge1layer ~= nil) then
		ADekoLib.setLayer(edge1layer)  -- 1st edge, top
    ADekoLib.setThickness(edge1thickness)
    ADekoLib.line({0, 0}, {X, 0}, 0)
    numberOfEdgeBands = numberOfEdgeBands + 1
	end
	if (edge2thickness ~= 0 and edge2thickness ~= nil and edge2layer ~= nil) then
		ADekoLib.setLayer(edge2layer)  -- 2nd edge, bottom
    ADekoLib.setThickness(edge2thickness)
    ADekoLib.line({0, Y}, {X, Y}, 0)
    numberOfEdgeBands = numberOfEdgeBands + 1
	end
	if (edge3thickness ~= 0 and edge3thickness ~= nil and edge3layer ~= nil) then
		ADekoLib.setLayer(edge3layer)  -- 3rd edge, left
    ADekoLib.setThickness(edge3thickness)
    ADekoLib.line({0, 0}, {0, Y}, 0)
    numberOfEdgeBands = numberOfEdgeBands + 1
	end
	if (edge4thickness ~= 0 and edge4thickness ~= nil and edge4layer ~= nil) then
		ADekoLib.setLayer(edge4layer)  -- 4th edge, right
    ADekoLib.setThickness(edge4thickness)
    ADekoLib.line({X, 0}, {X, Y}, 0)
    numberOfEdgeBands = numberOfEdgeBands + 1
	end
end

------------------------------------------------
-- Coppies a table recursively.
function ADekoLib.deepcopy(orig)
    local orig_type = type(orig)
    local copy
    if orig_type == 'table' then
        copy = {}
        for orig_key, orig_value in next, orig, nil do
            copy[ADekoLib.deepcopy(orig_key)] = ADekoLib.deepcopy(orig_value)
        end
        setmetatable(copy, ADekoLib.deepcopy(getmetatable(orig)))
    else -- number, string, boolean, etc
        copy = orig
    end
    return copy
end

------------------------------------------------
-- Enables/disables output of created shape points hierarchically at the end of interpretation.
function ADekoLib.enableListing(enable)
	if (enable) then
		listAfterBuild = true
	else
		listAfterBuild = false
	end
end

------------------------------------------------
-- Finishes the creation of shapes of part. Used internally.
function ADekoLib.finish()
	data[0] = nil
	ADekoLib.deleteLastShape()

	if (listAfterBuild) then 
		if (parts==nil) then
			ADekoLib.list("noNodes")  -- list the part content only
			--ADekoLib.list("nodes")  -- list the part content only
		else
			ADekoLib.list("product")  -- List the parts forming the module
		end
	end
  if (triggeredFromAdeko) then
    ADekoLib.applyModelDirection()
  end
  
	return true
end

------------------------------------------------
-- Returns the number of individual shapes.
function ADekoLib.dataSize(partIndex)
  if (partIndex==nil) then
    return (#data)
  else
    return (#parts[partIndex])
  end
end

------------------------------------------------
-- Returns the number of points for a given shape.
function ADekoLib.nodeSize(dataIndex, partIndex)
  if (partIndex==nil) then
    return (#data[dataIndex])
  else
    return (#parts[partIndex][dataIndex])
  end
end

------------------------------------------------
-- Returns the layername for a given shape.
function ADekoLib.layerName(dataIndex, partIndex)
	local retVal = ""
  if (partIndex==nil) then
    retVal = data[dataIndex]["layerName"]
  else
    retVal = parts[partIndex][dataIndex]["layerName"]
  end
	return retVal
end

------------------------------------------------
-- Returns x, y, z, and bulge of a point for a given shape.
function ADekoLib.nodeFeature(xyzbulge, dataIndex, pointIndex, partIndex)
  if (partIndex==nil) then
    if (xyzbulge == 1) then
      return (data[dataIndex][pointIndex]["Y"])
    end
    if (xyzbulge == 2) then
      return (data[dataIndex][pointIndex]["X"])
    end
    if (xyzbulge == 3) then
      return (data[dataIndex][pointIndex]["Z"])
    end
    if (xyzbulge == 4) then
      return (-data[dataIndex][pointIndex]["bulge"])
    end
  else
    if (xyzbulge == 1) then
      return (parts[partIndex][dataIndex][pointIndex]["Y"])
    end
    if (xyzbulge == 2) then
      return (parts[partIndex][dataIndex][pointIndex]["X"])
    end
    if (xyzbulge == 3) then
      return (parts[partIndex][dataIndex][pointIndex]["Z"])
    end
    if (xyzbulge == 4) then
      return (-parts[partIndex][dataIndex][pointIndex]["bulge"])
    end
  end
end

------------------------------------------------
-- Prints out all parts currently created.
function ADekoLib.list(what)
	io.write("-PART----------------------\n")
  io.write("Data size: ", (#data), "\n")
	for i1, v1 in ipairs(data) 
	do
		io.write(i1)
		io.write("  LayerName: ", v1["layerName"], "\n")
		io.write("  Thickness: ", v1["thickness"], "\n")
    if (what=="nodes") then
      for i2, v2 in ipairs(v1) do  -- nodes
        io.write("    ", i2, "\n")
        for i3, v3 in pairs(v2) do  -- xyz & B
          io.write("       ", i3, ": ", v3, "\n")
        end
      end
    end
	end
	io.write("---------------------------\n")
end

------------------------------------------------
-- Sets thickness for the next shape.
function ADekoLib.setThickness(thickness)
	assert(type(thickness)=="number", "not a number")
	currentThickness = thickness
  data[currentDataIndex]["thickness"] = currentThickness
end

------------------------------------------------
-- Returns the thickness or depth for a given shape.
function ADekoLib.thickness(dataIndex, partIndex)
  if (partIndex==nil) then
    return data[dataIndex]["thickness"]
  else
    return parts[partIndex][dataIndex]["thickness"]
  end
end

------------------------------------------------
-- Sets layername for the next shape.
function ADekoLib.setLayer(layerName)
	assert(type(layerName)=="string", "not a string")
	currentLayerName = layerName
	data[currentDataIndex]["layerName"] = currentLayerName
end

------------------------------------------------
-- Sets showPoint variable
function ADekoLib.showPoints(trueorfalse)
	assert(type(trueorfalse)=="boolean", "not a boolean")
	showPoints = trueorfalse
end

------------------------------------------------
-- Returns p1 + p2
function ADekoLib.ptAdd(p1, p2)
  p1[3] = p1[3] or 0
  p2[3] = p2[3] or 0
  return {p1[1]+p2[1], p1[2]+p2[2], p1[3]+p2[3]}
end

------------------------------------------------
-- Returns p1 - p2
function ADekoLib.ptSubtract(p1, p2)
  p1[3] = p1[3] or 0
  p2[3] = p2[3] or 0
  return {p1[1]-p2[1], p1[2]-p2[2], p1[3]-p2[3]}
end

function ADekoLib.vecNormalize(v1)
  v1[3] = v1[3] or 0
  local length = ADekoLib.distance3D({0,0,0}, v1)
  return {v1[1] / length , v1[2] / length , v1[3] / length}
end

function ADekoLib.vecScale(v1,scale)
  v1[3] = v1[3] or 0
  return {v1[1] * scale , v1[2] * scale, v1[3] * scale }
end

function ADekoLib.vecNegate(v1)
  return ADekoLib.vecScale(v1,-1)
end

function ADekoLib.dashLine(pt1, pt2, segCou)
	local length = ADekoLib.distance3D(pt1,pt2)
	local segCou = segCou or 10
	local segLength = length / segCou
	local vec = ADekoLib.vecScale(ADekoLib.vecNormalize(ADekoLib.ptSubtract(pt2, pt1)), segLength)
	local halfVec = ADekoLib.vecScale(vec , 0.5)
	local negHalfVec = ADekoLib.vecNegate(halfVec)
	local segCount = math.floor( length / segLength )
	
	for i = 0,segCount-1,1 do
		local startOfSeg = ADekoLib.ptAdd( pt1 , ADekoLib.vecScale(vec , i) )
		local endOfSeg = ADekoLib.ptAdd(startOfSeg , halfVec)
		ADekoLib.line(startOfSeg, endOfSeg)
	end
	ADekoLib.line(pt2, ADekoLib.ptAdd(pt2,negHalfVec))
end

return ADekoLib