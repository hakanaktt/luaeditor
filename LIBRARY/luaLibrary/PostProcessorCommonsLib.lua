local PPCLib = {} -- Post Processor Commons Library

------------------------------------------------
--Initializes global parameters
function PPCLib.initialization()
	currentPosition= Vec3(0.0,0.0,50.0)
	nextPosition= Vec3(0.0,0.0,0.0)
	boringHeadSPOffset=Vec3(0,0,0)
	feed_value=0
	spindleMax = 22000
	spindleMin = -22000
	currentOperation = {}
	currentlyToolIds = {}
	previousSpindleSpeed = 0 
	isFirstMoveAfterToolChange = nil
	PlacePlateToOrigin = nil
	SetCurrentPlateWidthHeight = nil
	setCurrentPlateWidthHeight = nil
	placeOriginToPlate = nil
	isMultidrillFeedRateDiaBased = true
	isBoringHeadUsed = false
	LN,LF=0,"\n"
	F=string.format
	editLine = table.insert
	usedToolList = ""
	if extraZeroInGCodes then 
		G0 = "G00" 
		G1 = "G01"
		G2 = "G02"
		G3 = "G03"
		G4 = "G04"
	else 
		G0 = "G0" 
		G1 = "G1"
		G2 = "G2"
		G3 = "G3"
		G4 = "G4"
	end
	if extraZeroInMCodes then
		M3 = "M03"
		M4 = "M04"
		M5 = "M05"
		M6 = "M06"
	else 
		M3 = "M3"
		M4 = "M4"
		M5 = "M5"
		M6 = "M6"
	end
end
------------------------------------------------
--Sets the comment characters
function  PPCLib.setCommentPar(commentStart,commentEnd)
	if (type(commentStart) ~= "string") or (type(commentEnd) ~= "string")  then
		printError("Comment parameter type must be string!")
		return "Comment parameter type must be string!"
	end
	Comment, EndComment = commentStart, commentEnd
	return Comment, EndComment
end
------------------------------------------------
--Turns characters to UTF-8 appropiate characters
function PPCLib.nonTrAndUpperCase(filePath)
	local trt = { "ş" , "Ş" , "ö" ,"Ö" , "ç" , "Ç" ,"ü","Ü","ğ","Ğ","İ","ı"}
	local tot = { "s" , "S" , "o" ,"O" , "c" , "C" ,"u","U","g","G","I","i"}
	for i,v in ipairs(trt) do
	filePath = filePath:gsub(trt[i],tot[i])
	end
	--return filePath:upper()
	return filePath
end
------------------------------------------------
--Creates a new line starting with a line number
function PPCLib.lineNumber(lineNumberStepSize)
	LN=LN + lineNumberStepSize
	if LN > 99999 then LN=lineNumberStepSize end
	return string.format("\nN%d ",LN)
end
------------------------------------------------
function PPCLib.newLine(lineNumberStepSize)
	if lineNumberStepSize == 0 then
		return LF
	else
		return PPCLib.lineNumber(lineNumberStepSize)
	end
end
------------------------------------------------
--Cheks if two numbers are equal or not
function PPCLib.adeNotEq(num1,num2)
	return math.abs(num1 - num2) > 0.0001
end
------------------------------------------------
--Formats the number according to its fractional part, returns a string
function PPCLib.adeFormat(val)
	i,f=math.modf(val)
	return string.format(f==0 and "%d" or "%.3f", val)
end
------------------------------------------------
--Seperates a string by a chosen seperator
function PPCLib.adeSplit(inputstr, sep)
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
--Compares two tables
function PPCLib.adeCompare(t1,t2,ignore_mt)
	local ty1 = type(t1)
	local ty2 = type(t2)
	if ty1 ~= ty2 then return false end
	-- non-table types can be directly compared
	if ty1 ~= 'table' and ty2 ~= 'table' then return t1 == t2 end
	-- as well as tables which have the metamethod __eq
	local mt = getmetatable(t1)
	if not ignore_mt and mt and mt.__eq then return t1 == t2 end
	for k1,v1 in pairs(t1) do
		local v2 = t2[k1]
		if v2 == nil or not PPCLib.adeCompare(v1,v2) then return false end
	end
	for k2,v2 in pairs(t2) do
		local v1 = t1[k2]
		if v1 == nil or not PPCLib.adeCompare(v1,v2) then return false end
	end
	return true
end
------------------------------------------------
--Turns machining seconds to a clock format
function PPCLib.secondsToClock(seconds)
  local seconds = tonumber(seconds)
  if seconds <= 0 then
    return "00:00:00";
  else
    hours = string.format("%02.f", math.floor(seconds/3600));
    mins = string.format("%02.f", math.floor(seconds/60 - (hours*60)));
    secs = string.format("%02.f", math.floor(seconds - hours*3600 - mins *60));
    return hours..":"..mins..":"..secs
  end
end
------------------------------------------------
--Turns adekoCAM operation names to string
function PPCLib.styleTypeToString(typeVal)
	local out=""
	if	typeVal == StyleType.Drill then
		out = "Drill"
	elseif typeVal == StyleType.Groove then
		out = "Groove"
	elseif typeVal == StyleType.Contour then
		out = "Contour"
	elseif typeVal == StyleType.MultiDrill then
		out = "MultiDrill"
	elseif typeVal == StyleType.SmartCut then
		out = "SmartCut"
	else
		out = "UnknownStyleType"
	end
	return out
end
------------------------------------------------
--Returns the info of the plate/part tha is about to be cut
function PPCLib.programInfo ()
	local programInfo = ""
	programInfo = programInfo .. Comment .. "Program Name:" .. EndComment
	programInfo = programInfo .. LF .. Comment .. F("Date -  %s",os.date("%d %b %y - %X")) .. EndComment 
	programInfo = programInfo .. LF .. Comment .. F("Time:%s",PPCLib.secondsToClock(currentPlateMachiningSeconds)) .. EndComment
	if    isSecondaryFace == true then
		programInfo = programInfo .. LF .. Comment .. "Bottom Face Program" .. EndComment
	else
		programInfo = programInfo .. LF .. Comment .. "Top Face Program" .. EndComment
	end
	if currentPlateIndex ~= nil then
		if isPlate == true then
			programInfo = programInfo .. LF .. Comment .. F("Plate = %.0f/%.0f ",currentPlateIndex,totalPlateCount) .. EndComment
			programInfo = programInfo .. LF .. Comment .. F("Width:%.3f x Height:%.3f", currentPlateWidth, currentPlateHeight) .. EndComment
		else
			programInfo = programInfo .. LF .. Comment .. F("Part = %.0f/%.0f ",currentPartIndex,totalPartCount) .. EndComment
			programInfo = programInfo .. LF .. Comment .. F("Width:%.3f x Height:%.3f", currentPlateWidth, currentPlateHeight) .. EndComment
		end
	end
	if jobNumber ~= nil then 
		programInfo = programInfo .. LF .. Comment .. F("Job Number = %.0f ",tostring(jobNumber)) .. EndComment
	end
	if partName ~= nil then 
		if isSecondaryFace == true then
			programInfo = programInfo .. LF .. Comment .. F("Project/Part Name = %s --> Bottom Face Program",partName) .. EndComment
		else
			programInfo = programInfo .. LF .. Comment .. F("Project/Part Name = %s --> Top Face Program",partName) .. EndComment
		end
	end
	if materialName ~= nil then
		programInfo = programInfo .. LF .. Comment .. F("Material = %s",materialName) .. EndComment
	end
	programInfo = programInfo .. LF .. Comment .. " *** Tool List *** " ..EndComment
	programInfo = programInfo .. usedToolList
	programInfo = programInfo .. LF .. Comment .. " ***************** " ..EndComment
	return programInfo
end
------------------------------------------------
--Prints a group of tool IDs individually
function PPCLib.printToolsIds(ti)
	local out =""
	if 	ti == nil then
		return "nil"
	end
	for i,val in ipairs(ti) do
		out = out .. " CallName:" .. val.callName .. " Tool:" .. val.tool.name .. " "
	end
	return out
end
------------------------------------------------
--Adds an item to a table if it doesn't exist in it
function PPCLib.addIfDoesNotExist(tbl,item)
  if tbl[item] == nil then
    tbl[item] = 1
  else
    tbl[item] = tbl[item] + 1
  end
end
------------------------------------------------
--Gives the list of tools that are used at an operation
function PPCLib.getUsedToolList(toolpaths)
	local out = ""
	local toolSltLst = {}
	for n, toolpath in ipairs(toolpaths) do
		for no, operation in ipairs(toolpath.operations) do
			for na, action in ipairs(operation.actions) do
				if action.type == ActionType.ToolChange then
					PPCLib.addIfDoesNotExist(toolSltLst,PPCLib.printToolsIds(action:asToolChange().toolIds))
				end
			end
		end
	end
	for s,c in pairs(toolSltLst) do
		out = out .. LF .. Comment .. s .. EndComment
	end
	return out
end
------------------------------------------------
--Sets part/plate sizes according to machine setup
function PPCLib.SetCurrentPlateWidthHeight(plate,isBottomFace,machine)
	local orj = placeOriginToPlate(plate.nestedPlate,machine,isBottomFace,nil,nil)
	local bbPlate = ABox3d()
	local v1 = orj:inverse() * Vec3(0,0,0)
	local v2 = orj:inverse() * Vec3( plate.nestedPlate.width , plate.nestedPlate.height , 0)
	bbPlate:extend(v1)
	bbPlate:extend(v2)
	
	currentPlateWidth = bbPlate:sizes().x
	currentPlateHeight = bbPlate:sizes().y
	
	return currentPlateWidth, currentPlateHeight, orj
end
------------------------------------------------
-- Returns plunge feedrate for tools based on their diameter
function PPCLib.getMultidrillFeedRate(toolIds,normalFeedRate)
	-- Between Q2-Q5: 2000
	-- Between Q6-Q15: 1500
	-- Between Q16-Q35: 1000
	biggestDiameter = 0
	for i,v in ipairs(toolIds) do
		if v.tool.nominalDiameter > biggestDiameter then
			biggestDiameter = v.tool.nominalDiameter
		end
	end
	if biggestDiameter > 25 then
		return 1000
	end
	if biggestDiameter > 15 then
		return 2000
	end
	if biggestDiameter > 0 then
		return 3000
	end
	return normalFeedRate
end
------------------------------------------------
--Adds a second of delay before tool starts to move, so tool finds time to reach its rpm
function PPCLib.getDrillWait(toolIds)
	biggestDiameter = 0
	for i,v in ipairs(toolIds) do
		if v.tool.nominalDiameter > biggestDiameter then
			biggestDiameter = v.tool.nominalDiameter
		end
	end
	if biggestDiameter > 15 then
		return "G04 X1"
	end
	return ""
end
------------------------------------------------
--Places the part/plate to the machines selected origin from machine library
function PPCLib.PlacePlateToOrigin(plate,machine,isForBottomFace,offsetToolpath,job)
	local originXY = machine.XYOrigin
	local originZ = machine.ZOrigin
	local machineWidth = machine.size.x
	local machineLength = machine.size.y
	local bedPlateSize = machine.bedPlateSize
	local machineAR = machineWidth/machineLength
	local w = plate.width
	local h = plate.height
	local inx = 0.0
	local iny = 0.0
	if offsetToolpath and job then
		inx = job.nestingParameter.leftTrim
		iny = job.nestingParameter.bottomTrim
		w = w - job.nestingParameter.rightTrim
		h = h - job.nestingParameter.topTrim
	end
	
	local plateAR = w/h
	local t = currentPlateThickness
	local fitToShortside = false
	if isForBottomFace then Zk = -1 else Zk = 1 end
	
	if originZ == ZOriginType.topOfStockSurface then
		if isForBottomFace then t = (-1)*t else t = 0 end
	elseif originZ == ZOriginType.bottomOfStockSurface then
		if isForBottomFace then t = 0 else t = (-1)*t end
	elseif originZ == ZOriginType.bottomOfBedPlateSurface then
		if isForBottomFace then t = bedPlateSize.z else t = (-1)*(t+bedPlateSize.z) end
	else
	end
	returnValue = Transform()
	
	if(partCamFlag) then
		w = plate.width
		h = plate.height
		if originXY == XYOriginType.XminusYminus then
			h = 0
			w = 0
		elseif originXY == XYOriginType.XminusYplus then
			w = 0
		elseif originXY == XYOriginType.XplusYminus then
			h = 0
		elseif originXY == XYOriginType.XYmiddle then
			w, h = w/2, h/2
		end
		returnValue.translation = Vec3(w,h,t)
		return returnValue
	end
	
	local state = nil
	if ((machineAR <= 1) and (plateAR <=1)) or ((machineAR > 1) and (plateAR > 1)) then
		state = 1
		if fitToShortside then
			if (machineAR <= 1 ) then
				if machineWidth > h then
					state = 2
				end
			else
				if machineLength > w then
					state = 2
				end
			end
		end
	else
		state = 2
		if fitToShortside then
			if machineAR <= 1 then
				if machineWidth > w then
					state = 1
				end
			else
				if machineLength > h then
					state = 1
				end
			end
		end
	end
	
	local rorjx = w
	local rorjy = h
	if state == 1 then
		Yi, Yj = 0, 1
		if originXY == XYOriginType.XminusYminus then
			rorjx = inx
			rorjy = iny
			if isForBottomFace then
				if (machineAR > 1) then
					Yj = -1
					rorjy = h
				else
					rorjx = w
				end
			end
		elseif originXY == XYOriginType.XminusYplus then
			rorjx = inx
			rorjy = h
			if isForBottomFace then
				if (machineAR > 1) then
					Yj = -1
					rorjy = iny
				else
					rorjx = w
				end
			end
		elseif originXY == XYOriginType.XplusYplus then
			rorjx = w
			rorjy = h
			if isForBottomFace then 
				if (machineAR > 1) then
					Yj = -1
					rorjy = iny
				else
					rorjx = iny
				end
			end 
		elseif originXY == XYOriginType.XplusYminus then
			rorjx = w
			rorjy = iny
			if isForBottomFace then 
				if (machineAR > 1) then
					Yj = -1
					rorjy = h
				else
					rorjx = inx
					rorjy = iny
				end
			end 
		elseif originXY == XYOriginType.XYmiddle then
			rorjx, rorjy = plate.width/2, plate.height/2
			if isForBottomFace then 
				Yj = -1
			end
		end
	elseif state == 2 then
		Yi, Yj = 1, 0
		if originXY == XYOriginType.XminusYminus then
			rorjx = inx
			rorjy = h
			if isForBottomFace then 
				if (machineAR > 1) then
					Yi, Yj = -1, 0
					rorjx = w
				else
					rorjy = iny
					Yi, Yj = 1, 0
				end
			end
		elseif originXY == XYOriginType.XminusYplus then
			rorjx = w
			rorjy = h
			if isForBottomFace then 
				if (machineAR > 1) then
					Yi, Yj = -1, 0
					rorjx = inx
				else
					rorjy = iny
				end
			end
		elseif originXY == XYOriginType.XplusYplus then
			rorjx = w
			rorjy = iny
			if isForBottomFace then 
				if (machineAR > 1) then
					Yi, Yj = -1, 0
					rorjx = inx
				else
					rorjy = h
				end
			end
		elseif originXY == XYOriginType.XplusYminus then
			rorjx = inx
			rorjy = iny
			if isForBottomFace then 
				if (machineAR > 1) then
					Yi, Yj = -1, 0
					rorjx = w
				else
					rorjy = h
				end
			end
		elseif originXY == XYOriginType.XYmiddle then
			rorjx, rorjy = plate.width/2, plate.height/2
			if isForBottomFace then 
				Yi = -1
			end
		end
	end
	
	returnValue.translation = Vec3(rorjx,rorjy,t)
	returnValue.rotation = computeMatrixHoldDir(Vec3(Yi,Yj,0),Vec3(0,0,Zk))
	
		-- Eğer rijini dayama noktasından birazdaha fazla kaydırmak istiyorsan extraOffsetValX , extraOffsetValY değerlerini tanımlamılısın.
	--							^
	--							|
	--							|
	--							|
	--							|
	--							|
	--		*..extraOffsetValX..*- - - - - - - >
	--							.
	--						extraOffsetValY
	--		| Orj				.
	--	 ---*--- 				*
	--		|
	local extraOffsetValX = nil 
	local extraOffsetValY = nil
	if (PPCLib.isPart(plate) == true) and isForBottomFace then -- Sadece Parçaların arka yüzeylerinde ofset uygulansın isterirse 
		extraOffsetValX = nil -- X de offset miktarını + değer olacak şekilde girin
		extraOffsetValY = nil -- Y de offset miktarını + değer olacak şekilde girin
	end
	if extraOffsetValY then
		local ydir = Vec3(-Yi * extraOffsetValY , -Yj * extraOffsetValY, 0)
		if (originXY == XYOriginType.XminusYminus) or (originXY == XYOriginType.XplusYminus) then
			returnValue.translation =  returnValue.translation + ydir
		else
			returnValue.translation =  returnValue.translation - ydir
		end
	end
	if extraOffsetValX then
		local xdir = Vec3(-Yi * extraOffsetValX , -Yj * extraOffsetValX, 0)
		if Zk == 1 then
			xdir = rotateVecAroundZ(math.pi / -2.0, xdir)
		else
			xdir = rotateVecAroundZ(math.pi / 2.0, xdir)
		end
		
		if (originXY == XYOriginType.XminusYminus) or (originXY == XYOriginType.XminusYplus) then
			returnValue.translation =  returnValue.translation + xdir
		else
			returnValue.translation =  returnValue.translation - xdir
		end
	end
	
	return returnValue
end
------------------------------------------------
--
function PPCLib.PrintSides(part)
	local sides = part.sides
	for i,v in ipairs(sides.back) do
		printError("sides.back: " .. v)
	end
	for i,v in ipairs(sides.front) do
		printError("sides.front: " .. v)
	end
	for i,v in ipairs(sides.left) do
		printError("sides.left: " .. v)
	end
	for i,v in ipairs(sides.right) do
		printError("sides.right: " .. v)
	end
end
------------------------------------------------
--
function PPCLib.DecideGrooveSide(part,machine)
	local sides = part.sides
	-- Kanal varsa karşısından tut yada kanaldan tut
	--PPCLib.PrintSides(part)
	local holdGrooveSide = false
	for i,v in ipairs(sides.back) do
		if v:find("GROOVE") then
			return (holdGrooveSide == false ) and "front" or "back"
		end
	end
	for i,v in ipairs(sides.front) do
		if v:find("GROOVE") then
			return (holdGrooveSide == false ) and "back" or "front"
		end
	end
	for i,v in ipairs(sides.left) do
		if v:find("GROOVE") then
			return (holdGrooveSide == false ) and "right" or "left"
		end
	end
	for i,v in ipairs(sides.right) do
		if v:find("GROOVE") then
			return (holdGrooveSide == false ) and "left" or "right"
		end
	end
	return nil
end
------------------------------------------------
--
function PPCLib.DecideEdgeBandSide(part,machine)
	local sides = part.sides
	for i,v in ipairs(sides.back) do
		if v:find("EDGEBAND") then
			return  "back" 
		end
	end
	for i,v in ipairs(sides.front) do
		if v:find("EDGEBAND") then
			return "front" 
		end
	end
	for i,v in ipairs(sides.left) do
		if v:find("EDGEBAND") then
			return "left" 
		end
	end
	for i,v in ipairs(sides.right) do
		if v:find("EDGEBAND") then
			return  "right" 
		end
	end
	return nil
end
------------------------------------------------
--
function PPCLib.DecideHingeSide(part,machine)
	local sides = part.sides
	--kapak mı kapaksa menteselerin karşılarından tut
	for i,v in ipairs(sides.back) do
		if v:find("HINGE") then
			return "front"
		end
	end
	for i,v in ipairs(sides.front) do
		if v:find("HINGE") then
			return "back"
		end
	end
	for i,v in ipairs(sides.left) do
		if v:find("HINGE") then
			return "right"
		end
	end
	for i,v in ipairs(sides.right) do
		if v:find("HINGE") then
			return "left"
		end
	end
	return nil
end
------------------------------------------------
--
function PPCLib.DecideNotchSide(part,machine)
	local sides = part.sides
	-- Notch varsa notchu karşıya oymayı tercih edelim
	local holeNotchSide = false
	for i,v in ipairs(sides.back) do -- arkada notch var mı varsa direk front tan tut
		if v:find("NOTCH") then
			return (holeNotchSide == false ) and "front" or "back"
		end
	end
	for i,v in ipairs(sides.front) do -- arkada notch var mı 
		if v:find("NOTCH") then
			return (holeNotchSide == false ) and "back" or "front"
		end
	end
	return nil
end
------------------------------------------------
--
function PPCLib.DecideGolaSide(part,machine)
	local sides = part.sides
	local w = part.w
	local h = part.h
	-- Gola varsa goladan tut yada karşısından tut
	local holdGolaSide = false
	for i,v in ipairs(sides.front) do
		if v:find("GOLA") then
			return (holdGolaSide == false ) and "back" or "front"
		end
	end
	for i,v in ipairs(sides.back) do
		if v:find("GOLA") then
			return (holdGolaSide == false ) and "front" or "back"
		end
	end
	for i,v in ipairs(sides.left) do
		if v:find("GOLA") then
			return (holdGolaSide == false ) and "right" or "left"
		end
	end
	for i,v in ipairs(sides.right) do
		if v:find("GOLA") then
			return (holdGolaSide == false ) and "left" or "right"
		end
	end
	return nil
end
------------------------------------------------
--
function PPCLib.IsThereHole(side)
	for _,v in pairs(side) do
		if v:find("HOLE") then return true end
	end
	return false
end
------------------------------------------------
--
function PPCLib.DecideSideToHold(part,machine)
	local sides = part.sides
	local w = part.w
	local h = part.h
	--smallPartWidth i makine postunda en başta tanımlyabilirsiniz. örneğin smallPartWidth = 350
	
	-- if machine == nil then
		-- if currentMachine ~= nil then
			-- machine = currentMachine
		-- end
	-- end

	local hingeSide = PPCLib.DecideHingeSide(part,machine)
	if hingeSide then return hingeSide end
	
	local golaSide = PPCLib.DecideGolaSide(part,machine)
	if golaSide then return golaSide end
	
	local notchSide = PPCLib.DecideNotchSide(part,machine)
	if notchSide then 
		if (notchSide == "front") and PPCLib.IsThereHole(sides.front) and (not PPCLib.IsThereHole(sides.back)) then return "back" end
		if (notchSide == "back") and PPCLib.IsThereHole(sides.back) and (not PPCLib.IsThereHole(sides.front)) then return "front" end
		if (notchSide == "left") and PPCLib.IsThereHole(sides.left) and (not PPCLib.IsThereHole(sides.right)) then return "right" end
		if (notchSide == "right") and PPCLib.IsThereHole(sides.right) and (not PPCLib.IsThereHole(sides.left)) then return "left" end
		return notchSide 
	end
	
	local grooveSide = PPCLib.DecideGrooveSide(part,machine)
	if grooveSide then 
		if (grooveSide == "front") and PPCLib.IsThereHole(sides.front) and (not PPCLib.IsThereHole(sides.back)) then return "back" end
		if (grooveSide == "back") and PPCLib.IsThereHole(sides.back) and (not PPCLib.IsThereHole(sides.front)) then return "front" end
		if (grooveSide == "left") and PPCLib.IsThereHole(sides.left) and (not PPCLib.IsThereHole(sides.right)) then return "right" end
		if (grooveSide == "right") and PPCLib.IsThereHole(sides.right) and (not PPCLib.IsThereHole(sides.left)) then return "left" end
		if smallPartWidth then
			if (w >= smallPartWidth) then --
				return grooveSide 
			end
		else
			return grooveSide 
		end
	end
	
	local edgeBandSide = PPCLib.DecideEdgeBandSide(part,machine)
	if edgeBandSide then 
		if (edgeBandSide == "front") and PPCLib.IsThereHole(sides.front) and (not PPCLib.IsThereHole(sides.back)) then return "back" end
		if (edgeBandSide == "back") and PPCLib.IsThereHole(sides.back) and (not PPCLib.IsThereHole(sides.front)) then return "front" end
		if (edgeBandSide == "left") and PPCLib.IsThereHole(sides.left) and (not PPCLib.IsThereHole(sides.right)) then return "right" end
		if (edgeBandSide == "right") and PPCLib.IsThereHole(sides.right) and (not PPCLib.IsThereHole(sides.left)) then return "left" end
		return edgeBandSide 
	end
	
	if (w >= h) then -- Parça X boyu Parça Y boyundan büyük ve eşitse
		if (#sides.front == 0) then 
			return "front"
		elseif (#sides.back == 0) then
			return "back"
		end
	end
	
	if not(w >= h) then -- Parça X boyu Parça Y boyundan büyük ve eşit değilse
		if (#sides.left == 0) then
			return "left"
		elseif (#sides.right == 0) then
			return "right"
		end
		
		if (400 > h) and (#sides.front == 0)then
			return "front"
		end
		if (400 > h) and (#sides.back == 0)then
			return "back"
		end
	end
	
	return "front"
end
------------------------------------------------
--
function PPCLib.AddOperationToSide(side,operation)
	local isExist = false
	for i,v in ipairs(side) do
		if v == operation then
			isExist = true
			break
		end
	end
	if isExist == false then
		table.insert(side,operation)
	end
end
------------------------------------------------
--
function PPCLib.AddHoleToSide(part, sides)
	local w = part.width
	local h = part.height
	local t = currentPlateThickness
	for i,v in ipairs(part.nestedParts[1].geometry) do
		if (string.find(v.data.layerName , "HOLE") ~= nil)  and  isApproximatelyEqual(v.data.transform:getRotZ() , Vec3(1,0,0))  then
			PPCLib.AddOperationToSide(sides.right,"HOLE")
		end
		if (string.find(v.data.layerName , "HOLE") ~= nil)  and  isApproximatelyEqual(v.data.transform:getRotZ() , Vec3(-1,0,0))  then
			PPCLib.AddOperationToSide(sides.left,"HOLE")
		end	
		if (string.find(v.data.layerName , "HOLE") ~= nil)  and  isApproximatelyEqual(v.data.transform:getRotZ() , Vec3(0,-1,0))  then
			PPCLib.AddOperationToSide(sides.front,"HOLE")
		end
		if (string.find(v.data.layerName , "HOLE") ~= nil)  and  isApproximatelyEqual(v.data.transform:getRotZ() , Vec3(0,1,0))  then
			PPCLib.AddOperationToSide(sides.back,"HOLE")
		end

		if (w < 400) and (h <400)  then -- tek klemp ile tutma durumunda yanlara yakın olan üst deliklerden tutmasın diye.
			local topHoleEdgeDistance = 25 -- if  
			if (string.find(v.data.layerName , "HOLE") ~= nil) and v.data:isCircle()  and  isApproximatelyEqual(v.data.transform:getRotZ() , Vec3(0,0,1))  then
				local  topHolePos = v.data:center()
				if (topHolePos.y < topHoleEdgeDistance) then
					PPCLib.AddOperationToSide(sides.front,"HOLE")
				end
				if ((h - topHolePos.y) < topHoleEdgeDistance) then
					PPCLib.AddOperationToSide(sides.back,"HOLE")
				end
				if (topHolePos.x < topHoleEdgeDistance) then
					PPCLib.AddOperationToSide(sides.left,"HOLE")
				end
				if ((w - topHolePos.x) < topHoleEdgeDistance) then
					PPCLib.AddOperationToSide(sides.right,"HOLE")
				end
				--PPCLib.AddOperationToSide(sides.back,"HOLE")
			end
		end
	end
	return sides
end
------------------------------------------------
--
function PPCLib.AddHingeToSide(part,sides, isForBottomFace)
	local w = part.width
	local h = part.height
	local t = currentPlateThickness
	local hinges = {}
	local hingeDia = 35
	
	for i,v in ipairs(part.nestedParts[1].geometry) do
		if (v.data:isCircle() and (isApproximatelyEqual(hingeDia , v.data:diameter())) ) and (isForBottomFace == false) and  isApproximatelyEqual(v.data.transform:getRotZ() , Vec3(0,0,1))  then
			table.insert(hinges, v)
		end
		if (v.data:isCircle() and (isApproximatelyEqual(hingeDia , v.data:diameter())) ) and (isForBottomFace == true) and  isApproximatelyEqual(v.data.transform:getRotZ() , Vec3(0,0,-1))  then
			table.insert(hinges, v)
		end		
	end
	
	if #hinges ~= 0 then
		local bbox = ABox3d()
		for i,hole in ipairs(hinges) do
			bbox:extend(hole.data:center())
		end
		
		--local bbox:center() = v.data.transform * v.data:center()
		local distance = 10000000
		local pickedEdge = ""
		if  math.abs(bbox:center().y) < distance then
			distance = math.abs(bbox:center().y)
			pickedEdge = "south"
		end
		if  math.abs(h - bbox:center().y) < distance then
			distance = math.abs(h - bbox:center().y)
			pickedEdge = "north"
		end 	
		if  math.abs(bbox:center().x) < distance then
			distance = math.abs(bbox:center().x)
			pickedEdge = "west"
		end 
		if  math.abs(bbox:center().x - w) < distance then
			distance = math.abs(bbox:center().x - w)
			pickedEdge = "east"
		end 
		if pickedEdge == "south" then
			PPCLib.AddOperationToSide(sides.front,"HINGE")
		elseif pickedEdge == "north" then
			PPCLib.AddOperationToSide(sides.back,"HINGE")
		elseif pickedEdge == "west" then
			PPCLib.AddOperationToSide(sides.left,"HINGE")
		elseif pickedEdge == "east" then
			PPCLib.AddOperationToSide(sides.right,"HINGE")
		end
	end
	return sides
end
------------------------------------------------
--
function PPCLib.AddGrooveToSide(part, sides, isForBottomFace)
	local w = part.width
	local h = part.height
	local t = currentPlateThickness
	local grooves = {}
	for i,v in ipairs(part.nestedParts[1].geometry) do
		if (string.find(v.data.layerName , "GROOVE") ~= nil) and (isForBottomFace == false) and  isApproximatelyEqual(v.data.transform:getRotZ() , Vec3(0,0,1))  then
			table.insert(grooves, v)
		end
		if (string.find(v.data.layerName , "GROOVE") ~= nil) and (isForBottomFace == true) and  isApproximatelyEqual(v.data.transform:getRotZ() , Vec3(0,0,-1))  then
			table.insert(grooves, v)
		end		
	end
	
	local pickedEdge = "" 
	for	i,v in ipairs(grooves) do
		local distance = 10000000
		local gBBox = v.data:bounds()
		local gAbsBBox = ABox3d()
		gAbsBBox:extend(v.data.transform * gBBox:min())
		gAbsBBox:extend(v.data.transform * gBBox:max())
		local grooveCenter = gAbsBBox:center()
		local bufferSizes = gAbsBBox:sizes()
		if (bufferSizes.x >= bufferSizes.y) then
			if math.abs(grooveCenter.y) < distance then
				distance = math.abs(grooveCenter.y)
				pickedEdge = "front"
			end
			if math.abs(h - grooveCenter.y) < distance then
				distance = math.abs(h - grooveCenter.y)
				pickedEdge = "back"
			end
		end
		
		if (bufferSizes.x < bufferSizes.y) then
			if math.abs(grooveCenter.x) < distance then
				distance = math.abs(grooveCenter.x)
				pickedEdge = "left"
			end
			if math.abs(grooveCenter.x - w) < distance then
				distance = math.abs(grooveCenter.x - w)
				pickedEdge = "right"
			end
		end
		if pickedEdge == "front" then
			PPCLib.AddOperationToSide(sides.front,"GROOVE")
		elseif pickedEdge == "back" then
			PPCLib.AddOperationToSide(sides.back,"GROOVE")
		elseif pickedEdge == "left" then
			PPCLib.AddOperationToSide(sides.left,"GROOVE")
		elseif pickedEdge == "right" then
			PPCLib.AddOperationToSide(sides.right,"GROOVE")
		end
 	end	
	return sides
end
------------------------------------------------
--
function PPCLib.AddNotchToSide(part, sides, isForBottomFace)
	local w = part.width
	local h = part.height
	local t = currentPlateThickness
	local notches = {}
	for i,v in ipairs(part.nestedParts[1].geometry) do
		if (string.find(v.data.layerName , "NOTCH" ) ~= nil) and (isForBottomFace == false) and  isApproximatelyEqual(v.data.transform:getRotZ() , Vec3(0,0,1))  then
			table.insert(notches, v)
		end	
	end

	for	i,v in ipairs(notches) do
		local gBBox = v.data:bounds()
		local gAbsBBox = ABox3d()
		gAbsBBox:extend(v.data.transform * gBBox:min())
		gAbsBBox:extend(v.data.transform * gBBox:max())
		local notchCenter = gAbsBBox:center()
		local bbMin = gAbsBBox:min()
		local bbMax = gAbsBBox:max()
		local bufferT = { front = bbMin.y , back = (h - bbMax.y), left = bbMin.x, right = (w - bbMax.x) }

		-- sort sides
		local keys = {}
		for key,val in pairs(bufferT) do
			table.insert(keys,key)
		end
		table.sort(keys,function(a,b) return bufferT[a]<bufferT[b] end)
		local sortedBufferT = {}
		for _,key in pairs(keys) do
			table.insert(sortedBufferT,{key,bufferT[key]})
		end		

		if sortedBufferT[1][1] == "front" then
			PPCLib.AddOperationToSide(sides.front,"NOTCH")
		elseif sortedBufferT[1][1] == "back" then
			PPCLib.AddOperationToSide(sides.back,"NOTCH")
		elseif sortedBufferT[1][1] == "left" then
			PPCLib.AddOperationToSide(sides.left,"NOTCH")
		elseif sortedBufferT[1][1] == "right" then
			PPCLib.AddOperationToSide(sides.right,"NOTCH")
		end
		
		if isApproximatelyEqual(bufferT[sortedBufferT[2][1]] , 0) then -- iki yana basan köşe notch ise ikinci 0 olan değeri ekleyelim
			if sortedBufferT[2][1] == "front" then
				PPCLib.AddOperationToSide(sides.front,"NOTCH")
			elseif sortedBufferT[2][1] == "back" then
				PPCLib.AddOperationToSide(sides.back,"NOTCH")
			elseif sortedBufferT[2][1] == "left" then
				PPCLib.AddOperationToSide(sides.left,"NOTCH")
			elseif sortedBufferT[2][1] == "right" then
				PPCLib.AddOperationToSide(sides.right,"NOTCH")
			end
		end
 	end	
	return sides
end
------------------------------------------------
--
function PPCLib.AddGolaToSide(part, sides, isForBottomFace)
	local w = part.width
	local h = part.height
	local t = currentPlateThickness
	local golas = {}
	for i,v in ipairs(part.nestedParts[1].geometry) do
		if (string.find(v.data.layerName , "GOLA") ~= nil) and (isForBottomFace == false) and  isApproximatelyEqual(v.data.transform:getRotZ() , Vec3(0,0,1))  then
			table.insert(golas, v)
		end	
	end
	
	local distance = 10000000
	local golasBound = ABox3d()
	for	i,v in ipairs(golas) do
		local gBBox = v.data:bounds()
		golasBound:extend(v.data.transform * gBBox:min())
		golasBound:extend(v.data.transform * gBBox:max())
	end
	if #golas ~= 0 then
		local pickedEdge = "" 
		local golaCenter = golasBound:center()
		local bufferSizes = golasBound:sizes()
		if (bufferSizes.x >= bufferSizes.y) then
			if math.abs(golaCenter.y) < distance then
				distance = math.abs(golaCenter.y)
				pickedEdge = "front"
			end
			if math.abs(h - golaCenter.y) < distance then
				distance = math.abs(h - golaCenter.y)
				pickedEdge = "back"
			end
		end
		if (bufferSizes.x < bufferSizes.y) then
			if math.abs(golaCenter.x) < distance then
				distance = math.abs(golaCenter.x)
				pickedEdge = "left"
			end
			if math.abs(golaCenter.x - w) < distance then
				distance = math.abs(golaCenter.x - w)
				pickedEdge = "right"
			end
		end
		if pickedEdge == "front" then
			PPCLib.AddOperationToSide(sides.front,"GOLA")
		elseif pickedEdge == "back" then
			PPCLib.AddOperationToSide(sides.back,"GOLA")
		elseif pickedEdge == "left" then
			PPCLib.AddOperationToSide(sides.left,"GOLA")
		elseif pickedEdge == "right" then
			PPCLib.AddOperationToSide(sides.right,"GOLA")
		end
	end
	return sides
end
------------------------------------------------
--
function PPCLib.AddEdgeBand(part, sides)
	local w = part.width
	local h = part.height
	local t = currentPlateThickness
	local edgeBands = {}
	for i,v in ipairs(part.nestedParts[1].edgeBandShapes)  do
		if (string.find(v.data.layerName , "LMM_EDGESTRIP") ~= nil) then
			table.insert(edgeBands, v)
		end
	end
	
	local allThicknessSame = true
	if #edgeBands > 1 then
		local different = edgeBands[1].data.thickness
		for i,v in ipairs(edgeBands) do
			if different ~= v.data.thickness then
				allThicknessSame = false
			end
		end
	elseif #edgeBands == 1 then
		allThicknessSame = false
	end
	
	if allThicknessSame == false then
		--küçükten büyüğe sırala
		table.sort( edgeBands , 
		function(a,b)
			return math.abs(a.data.thickness) < math.abs(b.data.thickness)
		end
		)
		--hepsini sil son kalsın
		local removeAllButLast = #edgeBands - 1
		for i = removeAllButLast,1,-1  do -- roveme all but hold highest thickness
			table.remove(edgeBands,1)
		end
		
		
		local pickedEdge = "" 
		
		for	i,v in ipairs(edgeBands) do
			local distance = 10000000
			local gBBox = v.data:bounds()
			local edgeBandCenter = gBBox:center()
			local bufferSizes = gBBox:sizes()
			--printError("i:" .. tostring(i))
			if (bufferSizes.x >= bufferSizes.y) then
				if math.abs(edgeBandCenter.y) < distance then
					distance = math.abs(edgeBandCenter.y)
					pickedEdge = "south"
				end
				if math.abs(h - edgeBandCenter.y) < distance then
					distance = math.abs(h - edgeBandCenter.y)
					pickedEdge = "north"
				end
			end
			
			if (bufferSizes.x < bufferSizes.y) then
				if math.abs(edgeBandCenter.x) < distance then
					distance = math.abs(edgeBandCenter.x)
					pickedEdge = "west" 
				end
				if math.abs(edgeBandCenter.x - w) < distance then
					distance = math.abs(edgeBandCenter.x - w)
					pickedEdge = "east"
				end
			end
		end
		
		if pickedEdge == "south" then
			PPCLib.AddOperationToSide(sides.front,"EDGEBAND")
		elseif pickedEdge == "north" then
			PPCLib.AddOperationToSide(sides.back,"EDGEBAND")
		elseif pickedEdge == "west" then
			PPCLib.AddOperationToSide(sides.left,"EDGEBAND")
		elseif pickedEdge == "east" then
			PPCLib.AddOperationToSide(sides.right,"EDGEBAND")
		end
	end
	return sides
end
------------------------------------------------
--
function PPCLib.PlacePartToOrigin(part, machine, isForBottomFace, offsetToolpath, job)
	local orj = Transform()
	local w = part.width
	local h = part.height
	
	local t = currentPlateThickness
	local originZ = machine.ZOrigin
	local sides = { left = {} , right = {} , front = {} , back = {} }
	if originZ == ZOriginType.topOfStockSurface then
		if isForBottomFace then t = (-1)*t else t = 0 end
	elseif originZ == ZOriginType.bottomOfStockSurface then
		if isForBottomFace then t = 0 else t = (-1)*t end
	elseif originZ == ZOriginType.bottomOfBedPlateSurface then
		if isForBottomFace then t = (-1)*bedPlateSize.z else t = (-1)*(t+bedPlateSize.z) end
	else
	end
	
	if(partCamFlag) then
		orj.translation = Vec3(0,0,t)
		return orj
	end
	
	sides = PPCLib.AddHoleToSide(part, sides)
	sides = PPCLib.AddHingeToSide(part, sides, isForBottomFace)
	sides = PPCLib.AddGrooveToSide(part, sides, isForBottomFace)
	sides = PPCLib.AddNotchToSide(part, sides, isForBottomFace)
	sides = PPCLib.AddGolaToSide(part, sides, isForBottomFace)
	sides = PPCLib.AddEdgeBand(part,sides)
	
	local prt = { w=w,h=h,sides=sides }
	local resultSide = PPCLib.DecideSideToHold(prt,machine)
	-- if resultSide is "front" and it's for top face, place WestSouth
	local translationVector = Vec3(0.0,0.0,t)
	local rotationVector = computeMatrixHoldDir(Vec3(0,1,0),Vec3(0,0,1))
	
	if  (resultSide == "back") and (isForBottomFace == false) then -- place EastNorth
		translationVector = Vec3(w,h,t)
		rotationVector = computeMatrixHoldDir(Vec3(0,-1,0),Vec3(0,0,1))
	elseif (resultSide == "left") and (isForBottomFace == false) then --place WestNorth
		translationVector = Vec3(0.0,h,t)
		rotationVector = computeMatrixHoldDir(Vec3(1,0,0),Vec3(0,0,1))
	elseif (resultSide == "right") and (isForBottomFace == false) then --place EastSouth
		translationVector = Vec3(w,0.0,t)
		rotationVector = computeMatrixHoldDir(Vec3(-1,0,0),Vec3(0,0,1))
	elseif  (resultSide == "front") and (isForBottomFace == true) then --place EastSouthBottom
		translationVector = Vec3(w,0.0,t)
		rotationVector = computeMatrixHoldDir(Vec3(0,1,0),Vec3(0,0,-1))
	elseif  (resultSide == "back") and (isForBottomFace == true) then --place WestNorthBottom
		translationVector = Vec3(0.0,h,t)
		rotationVector = computeMatrixHoldDir(Vec3(0,-1,0),Vec3(0,0,-1))
	elseif (resultSide == "left") and (isForBottomFace == true) then --place WestSouthBottom
		translationVector = Vec3(0.0,0.0,t)
		rotationVector = computeMatrixHoldDir(Vec3(1,0,0),Vec3(0,0,-1))
	elseif (resultSide == "right") and (isForBottomFace == true) then --place EastNorthBottom
		translationVector = Vec3(w,h,t)
		rotationVector = computeMatrixHoldDir(Vec3(-1,0,0),Vec3(0,0,-1))
	end
	orj.translation = translationVector
	orj.rotation = rotationVector
	return orj
end
------------------------------------------------
--
-- Backward compatibility
function PPCLib.placePlateToOrigin(part, machine, isForBottomFace, offsetToolpath, job)
	return PPCLib.PlacePlateToOrigin(part, machine, isForBottomFace, offsetToolpath, job)
end
------------------------------------------------
-- Checks if the tool exceeds set x-y-z limits
function PPCLib.checkPosition(pos,machine,plateThickness)
	local originXY = machine.XYOrigin
	local originZ = machine.ZOrigin
	local machineWidth = machine.size.x
	local machineLength = machine.size.y
	local bedPlateSize = machine.bedPlateSize
	local warningOffsetH = machine.safetyDistance + 1
	local warningOffsetV = 0.5
	local warningX = F("Warning! Toolpath exceeds X axis limits. Layer: %s -> Operation: %s", currentOperation.toolpath.layerName, 
																						PPCLib.styleTypeToString(currentOperation.toolpath.style.type))
	local warningY = F("Warning! Toolpath exceeds Y axis limits. Layer: %s -> Operation: %s", currentOperation.toolpath.layerName, 
																						PPCLib.styleTypeToString(currentOperation.toolpath.style.type))
	local warningZ = F("ERROR! TOOLPATH ENTERS BEDPLATE. Layer: %s -> Operation: %s", currentOperation.toolpath.layerName, 
																						PPCLib.styleTypeToString(currentOperation.toolpath.style.type))
	if originXY == XYOriginType.XminusYminus then
		if (pos.y < -warningOffsetH) or  (pos.y > machineLength+warningOffsetH)  then
			printErrorUrgent(warningY)
		end
		if (pos.x < -warningOffsetH) or  (pos.x > machineWidth+warningOffsetH)  then
			printErrorUrgent(warningX)
		end
	elseif originXY == XYOriginType.XminusYplus then
		if (pos.y < -machineLength-warningOffsetH) or  (pos.y > warningOffsetH)  then
			printErrorUrgent(warningY)
		end
		if (pos.x < -warningOffsetH) or  (pos.x > machineWidth+warningOffsetH)  then
			printErrorUrgent(warningX)
		end
	elseif originXY == XYOriginType.XplusYplus then
		if (pos.y < -machineLength-warningOffsetH) or  (pos.y > warningOffsetH)  then
			printErrorUrgent(warningY)
		end
		if (pos.x < -machineWidth-warningOffsetH) or  (pos.x > warningOffsetH)  then
			printErrorUrgent(warningX)
		end
	elseif originXY == XYOriginType.XplusYminus then
		if (pos.y < -warningOffsetH) or  (pos.y > machineLength+warningOffsetH)  then
			printErrorUrgent(warningY)
		end
		if (pos.x < -machineWidth-warningOffsetH) or  (pos.x > warningOffsetH)  then
			printErrorUrgent(warningX)
		end
	else
		if (pos.y < -machineLength-warningOffsetH) or  (pos.y > machineLength+warningOffsetH) then
			printErrorUrgent(warningY)
		end
		if (pos.x < -machineWidth-warningOffsetH) or  (pos.x > machineWidth+warningOffsetH)  then
			printErrorUrgent(warningX)
		end
	end
	if originZ == ZOriginType.topOfStockSurface then
		if (pos.z < -currentPlateThickness-warningOffsetV) then
			printErrorUrgent(warningZ)
		end
	elseif originZ == ZOriginType.bottomOfStockSurface then
		if (pos.z < -warningOffsetV) then
			printErrorUrgent(warningZ)
		end
	else
		if (pos.z < bedPlateSize.z-warningOffsetV) then
			printErrorUrgent(warningZ)
		end
	end
end
------------------------------------------------
-- Checks if if a string exists in a lists 
function PPCLib.isStringExistInList(strlist, str)
	local isExist = false
	for i,v in ipairs(strlist) do
		if v == str then 
			isExist = true
			break
		end
	end
	return isExist
end
------------------------------------------------
--Checks which projects exist in a job ald return a table of projects
function PPCLib.getProjectNamesFromJob()
	local projects = {}
	for i, part in ipairs(currentJob.parts) do
		local prjName = part.nestedPlate.nestedParts[1].projectName
		if PPCLib.isStringExistInList(projects, prjName) == false then
			table.insert(projects,prjName)
		end
	end
	return projects
end
------------------------------------------------
--Creates the header of the NC Code
function PPCLib.header(machineData,mergeNcCodes,exclusiveLineNumbers,newLines)
	local out = ""
	if exclusiveLineNumbers == nil then exclusiveLineNumbers = lineNumberStepSize end
	if toggleOperationLabels then  out = out .. Comment .. "--------- HEADER ----------" .. EndComment .. PPCLib.newLine(0) end
	if addProgramInfo then
		out = out .. PPCLib.programInfo()
	end
	local headerLines = {}
	if mergeNcCodes == true and currentPlateIndex == 1 then
	end
	if newLines ~= {} then
		headerLines = PPCLib.addOrChangeLine(newLines,headerLines)
	end
	for i,line in ipairs(headerLines) do
		if addProgramInfo then
			out = out .. PPCLib.newLine(exclusiveLineNumbers) .. line
		else
			out = out .. line
			if i ~= #headerLines then
				out = out  .. PPCLib.newLine(exclusiveLineNumbers)
			end
		end
	end
	return out
end
------------------------------------------------
--Controls machine's tool changing operations
function PPCLib.toolChange(actionToolChange,machine,machineData,toolSelectSpecifier,exclusiveLineNumbers,newLines)
	local out = ""
	local toolChangeLines = {}
	local magazineLines = {}
	local boringHeadLines = {}
	if exclusiveLineNumbers == nil then exclusiveLineNumbers = lineNumberStepSize end
	if toolSelectSpecifier ==nil then toolSelectSpecifier = "T" end
	local toolIDs = actionToolChange.toolIds
	isFirstMoveAfterToolChange = true
	if actionToolChange.useBoringHead == true then
		if machine.hasBoringHead == false then
			printError("Machine has no boringhead!")
			return "Machine has no boringhead!"
		end
		isBoringHeadUsed= true
		boringHeadSPOffset = currentMachine.boringHead.transform.translation - toolIDs[1].transform.translation
		if newLines ~= {} then
			for i,line in ipairs(newLines) do
				if line.toolCollection == "boringHead" then
					table.insert(boringHeadLines,line)
				else
					return "Tool Collection is not valid"
				end
			end
			toolChangeLines = PPCLib.addOrChangeLine(boringHeadLines,toolChangeLines)
		end
	else
		isBoringHeadUsed= false
		boringHeadSPOffset = Vec3(0,0,0)
		if toggleOperationLabels then out = out .. PPCLib.newLine(0) .. Comment .. "--------- Tool Change ----------" .. EndComment end
		if toolNoBeforeMCode then
			table.insert(toolChangeLines,F("%s%s %s",toolSelectSpecifier,toolIDs[1].callName,M6))
		else
			table.insert(toolChangeLines,F("%s %s%s",M6,toolSelectSpecifier,toolIDs[1].callName))
		end
		if newLines ~= {} then
			for i,line in ipairs(newLines) do
				if line.toolCollection == "magazine" then
					table.insert(magazineLines,line)
				else
					return "Tool Collection is not valid"
				end
			end
			toolChangeLines = PPCLib.addOrChangeLine(magazineLines,toolChangeLines)
		end
	end
	for i,line in ipairs(toolChangeLines) do
		out = out .. PPCLib.newLine(exclusiveLineNumbers) .. line
	end
	feed_value = 0
	previousSpindleSpeed = 0
	return out
end
------------------------------------------------
--Controls machine's start/stop operations of tool motor
function PPCLib.spindle(actionSpindle,dwell,dwellUnit,dwellSpecifier,spindleSpecifier,exclusiveLineNumbers,newLines)
	local out = ""
	local spindleLines = {}
	if exclusiveLineNumbers == nil then exclusiveLineNumbers = lineNumberStepSize end
	if spindleSpecifier == nil then spindleSpecifier = "S" end
	if actionSpindle.status.currentToolSlots[1].isOnBoringHead then
		return out
	end
	local nextspeed = actionSpindle.speed
	if previousSpindleSpeed == nextspeed then
		return ""
	end
	previousSpindleSpeed = nextspeed
	if nextspeed > spindleMax then
		out = Comment .. "Warning! spindle value is to much than predefined spindle maximum value." .. EndComment
		nextspeed=spindleMax
	end
	if nextspeed < spindleMin then
		out = Comment .. "Warning! spindle value is lower than predefined spindle minimum value." .. EndComment
		nextspeed=spindleMin
	end
	if toggleOperationLabels then out = out .. PPCLib.newLine(0) .. Comment .. "--------- Spindle Start ----------" .. EndComment end
	if actionSpindle.speed == 0 then
		table.insert(spindleLines,M5) -- stop the spindle
		return out
	end
	if actionSpindle.isCW == true then
		if spindleRPMBeforeMCode then
			table.insert(spindleLines,F("%s%s %s",spindleSpecifier,PPCLib.adeFormat(math.abs(nextspeed)),M3))
		else
			table.insert(spindleLines,F("%s %s%s",M3,spindleSpecifier,PPCLib.adeFormat(math.abs(nextspeed))))
		end
	else
		if spindleRPMBeforeMCode then
			table.insert(spindleLines,F("%s%s %s",spindleSpecifier,PPCLib.adeFormat(math.abs(nextspeed)),M4))
		else
			table.insert(spindleLines,F("%s %s%s",M4,spindleSpecifier,PPCLib.adeFormat(math.abs(nextspeed))))
		end
	end
	if dwell == nil then dwell = 0 end
	if dwell ~= 0 then
		table.insert(spindleLines,F("%s %s%.3f",G4,dwellSpecifier,dwell))
	end
	if newLines ~= {} then
		spindleLines = PPCLib.addOrChangeLine(newLines,spindleLines)
	end
	for i,line in ipairs(spindleLines) do
		out = out .. PPCLib.newLine(exclusiveLineNumbers) .. line
	end
	return out
end
------------------------------------------------
--Controls a magazine tool's linear rapid and cutting moves
function PPCLib.goTo(actionGoTo,machine,toolSpeedUnit,exclusiveLineNumbers,newLines)
	local out = ""
	local positions = ""
	local goToLines = {}
	if exclusiveLineNumbers == nil then exclusiveLineNumbers = lineNumberStepSize end
	nextPosition = (currentOperation.transform * actionGoTo.endPosition) + boringHeadSPOffset
	PPCLib.checkPosition(nextPosition,machine,currentPlateThickness)
	if isFirstMoveAfterToolChange == true then
		positions=positions .. F(" X%.3f", nextPosition.x) 
		currentPosition.x = nextPosition.x 
		positions=positions .. F(" Y%.3f", nextPosition.y) 
		currentPosition.y = nextPosition.y 
		positions=positions .. F(" Z%.3f", nextPosition.z) 
		currentPosition.z = nextPosition.z 
		isFirstMoveAfterToolChange = false
	else
		if PPCLib.adeNotEq(currentPosition.x,nextPosition.x) then 
			positions=positions .. F(" X%.3f", nextPosition.x) 
			currentPosition.x = nextPosition.x 
		end
		if PPCLib.adeNotEq(currentPosition.y,nextPosition.y) then 
			positions=positions .. F(" Y%.3f", nextPosition.y) 
			currentPosition.y = nextPosition.y 
		end
		if PPCLib.adeNotEq(currentPosition.z,nextPosition.z) then 
			positions=positions .. F(" Z%.3f", nextPosition.z) 
			currentPosition.z = nextPosition.z 
		end
	end
	if positions == "" then
		return ""
	end
	if actionGoTo.rapid == 1 then
		table.insert(goToLines,G0 .. positions) 
	else
		-- todo: units can be checked
		if feed_value ~=  actionGoTo.feedRate then
			feed_value =  actionGoTo.feedRate
			if toolSpeedUnit == "mMin" and feed_value >= 100 then feed_value = (feed_value/1000) end
			table.insert(goToLines,G1 .. positions .. F(" F%s", PPCLib.adeFormat(feed_value)))
		else
			table.insert(goToLines,G1 .. positions )
		end
	end
	if newLines ~= {} then
		goToLines = PPCLib.addOrChangeLine(newLines,goToLines)
	end
	for i,line in ipairs(goToLines) do
		out = out .. PPCLib.newLine(exclusiveLineNumbers) .. line
	end
	return out
end
------------------------------------------------
--Controls a magazine tool's arched cutting moves
function PPCLib.arc(actionArc,arcMode,toolSpeedUnit,exclusiveLineNumbers)
	local out = ""
	if exclusiveLineNumbers == nil then exclusiveLineNumbers = lineNumberStepSize end
	if isBoringHeadUsed == true then
		printError("MultiDrill unit can not do lateral movements")
		out = out .. "MultiDrill unit can not do lateral movements"
	else
		nextPosition = currentOperation.transform * actionArc.startPosition
	end
	nextPosition = currentOperation.transform * actionArc.endPosition
	if PPCLib.adeNotEq(currentPosition.x,nextPosition.x) then 
		out=out .. F(" X%.3f", nextPosition.x) 
		currentPosition.x = nextPosition.x 
	end
	if PPCLib.adeNotEq(currentPosition.y,nextPosition.y) then 
		out=out .. F(" Y%.3f", nextPosition.y) 
		currentPosition.y = nextPosition.y 
	end
	
	if PPCLib.adeNotEq(currentPosition.z,nextPosition.z) then 
		out=out .. F(" Z%.3f", nextPosition.z) 
		currentPosition.z = nextPosition.z 
	end
	
	if actionArc.isCW == true then
		out = G2 .. out
	else
		out = G3 .. out
	end
	
	if arcMode == "relative" then
		if feed_value ~=  actionArc.feedRate then
			feed_value =  actionArc.feedRate
			if toolSpeedUnit == "mMin" and feed_value >= 100 then feed_value = (feed_value/1000) end
			out = out .. F(" I%.3f J%.3f F%s", actionArc.tangentDir.x,actionArc.tangentDir.y,PPCLib.adeFormat(feed_value)) 
		else 
			out = out .. F(" I%.3f J%.3f", actionArc.tangentDir.x,actionArc.tangentDir.y) 
		end
	elseif arcMode == "radial" then
		--todo:verify arc is smaller than 180 degree
		if feed_value ~=  actionArc.feedRate then
			feed_value =  actionArc.feedRate
			if toolSpeedUnit == "mMin" and feed_value >= 100 then feed_value = (feed_value/1000) end
			out = out .. F(" R%.3f F%s",actionArc.radius,PPCLib.adeFormat(feed_value))
		else
			out = out .. F(" R%.3f",actionArc.radius)
		end
	else
		return "Invalid Arc Mode"
	end
	out = PPCLib.newLine(exclusiveLineNumbers) .. out 
	return out
end
------------------------------------------------
--Controls a magazine tool's arched cutting moves divided in segments
function PPCLib.arcSegmented(actionArc,arcSegmentSize,toolSpeedUnit,exclusiveLineNumbers)
	local out = ""
	if exclusiveLineNumbers == nil then exclusiveLineNumbers = lineNumberStepSize end
	if isApproximatelyEqual(Vec3(0,0,1) , currentOperation.transform:getRotZ()) == false then
		return "Non G17 arc move"
	end
	if arcSegmentSize == nil then arcSegmentSize = 0.1 end
	local startAngle = actionArc.startAngle
	local endAngle = actionArc.endAngle
	local arcRadius = actionArc.radius
	local deltaAngle = 0.0
	local segmentDeltaAngle
	if actionArc.isCW == true then
		--"G2"
		if startAngle < endAngle then
			startAngle = startAngle + 2 * math.pi
		end
	else
		--"G3"
		if startAngle > endAngle then
			endAngle =  endAngle + 2 * math.pi
		end
	end
	deltaAngle = endAngle - startAngle
		-- calculate arc length
	local arcLength = arcRadius  * math.abs(deltaAngle)
	local segmentCount = math.ceil(arcLength / arcSegmentSize )
	if segmentCount ~= 0 then
		segmentDeltaAngle = deltaAngle / segmentCount
	end
	if isBoringHeadUsed == true then
		printError("MultiDrill unit can not do lateral movements")
		out = out .. "MultiDrill unit can not do lateral movements"
	else
		nextPosition = currentOperation.transform * actionArc.startPosition
	end
	actionArcStartPos = currentOperation.transform * actionArc.startPosition
	actionArcEndPos = currentOperation.transform * actionArc.endPosition
	actionArcCenterPos = currentOperation.transform * actionArc.centerPosition
	out=out .. F(" X%.3f", nextPosition.x) 
	out=out .. F(" Y%.3f", nextPosition.y) 
	out=out .. F(" Z%.3f", nextPosition.z) 
	currentPosition = nextPosition
	if feed_value ~=  actionArc.feedRate then
		feed_value =  actionArc.feedRate
		if toolSpeedUnit == "mMin" and feed_value >= 100 then feed_value = (feed_value/1000) end
		out = PPCLib.newLine(exclusiveLineNumbers)  .. G1 .. out .. F(" F%s", adeFormat(feed_value))
	else
		if out ~= "" then
			out = PPCLib.newLine(exclusiveLineNumbers)  .. G1 .. out
		end
	end
	if isApproximatelyEqual(actionArc.startPosition.z , actionArc.endPosition.z) then
		for i = 1, (segmentCount-1) do
			local angle = i * segmentDeltaAngle + startAngle
			local xComponent = math.cos(angle) * arcRadius + actionArcCenterPos.x
			local yComponent = math.sin(angle) * arcRadius + actionArcCenterPos.y
			out=out .. PPCLib.newLine(exclusiveLineNumbers) .. G1 .. F(" X%.3f Y%.3f", xComponent , yComponent) 
		end	
		out=out .. PPCLib.newLine(exclusiveLineNumbers) .. G1 .. F(" X%.3f Y%.3f", actionArcEndPos.x , actionArcEndPos.y)  
		currentPosition.x = actionArcEndPos.x
		currentPosition.y = actionArcEndPos.y
	else
		local deltaZ = (actionArcEndPos.z - actionArcStartPos.z) / segmentCount
		for i = 1, (segmentCount-1) do
			local angle = i * segmentDeltaAngle + startAngle
			local xComponent = math.cos(angle) * arcRadius + actionArcCenterPos.x
			local yComponent = math.sin(angle) * arcRadius + actionArcCenterPos.y
			local zComponent = actionArcStartPos.z + i * deltaZ
			out=out .. PPCLib.newLine(exclusiveLineNumbers) .. G1 .. F(" X%.3f Y%.3f Z%.3f", xComponent , yComponent , zComponent) 
		end	
		out=out .. PPCLib.newLine(exclusiveLineNumbers) .. G1 .. F(" X%.3f Y%.3f Z%.3f", actionArcEndPos.x , actionArcEndPos.y , actionArcEndPos.z)  
		currentPosition = actionArcEndPos
	end
	return out
end
------------------------------------------------
--Controls the machine's boringhead moves
function PPCLib.cannedCycleDrillMultiDrill(actionMultiDrill,machine,toolSpeedUnit,exclusiveLineNumbers)
	local out = "" 
	if exclusiveLineNumbers == nil then exclusiveLineNumbers = lineNumberStepSize end
	if machine.hasBoringHead == false then return 
		"This machine does not support \"Multi Drilling\" !!!" 
	end
	local holeCenter = (currentOperation.transform * actionMultiDrill.centerPosition) + boringHeadSPOffset
	diaBasedFeedRate = PPCLib.getMultidrillFeedRate(actionMultiDrill.toolIds,actionMultiDrill.plungeFeedRate)
	if toolSpeedUnit == "mMin" and diaBasedFeedRate >= 100 then diaBasedFeedRate = (diaBasedFeedRate/1000) end
	if toggleOperationLabels then out = out .. PPCLib.newLine(0) .. Comment .. "--------- Multi Drill ----------" .. EndComment end
	out = out .. PPCLib.newLine(exclusiveLineNumbers) .. G0 .. F(" X%.3f Y%.3f",
								holeCenter.x,
								holeCenter.y
								)
	out = out .. PPCLib.newLine(exclusiveLineNumbers) .. G1 .. F(" Z%.3f F%.0f",holeCenter.z-actionMultiDrill.depth,diaBasedFeedRate) 
	local swait = PPCLib.getDrillWait(actionMultiDrill.toolIds)
	if  swait ~= "" then
		out = out .. PPCLib.newLine(exclusiveLineNumbers) .. swait
	end
	out = out .. PPCLib.newLine(exclusiveLineNumbers) .. G0 .. F(" Z%.3f",machine.safetyDistance + holeCenter.z) 
	currentPosition.x = holeCenter.x
	currentPosition.y = holeCenter.y
	currentPosition.z = machine.safetyDistance + holeCenter.z
	--need to set current velocity to rapid
	feed_value = actionMultiDrill.feedRate
	return out
end
------------------------------------------------
--Controls the drilling moves using a tool from magazine
function PPCLib.cannedCycleDrill(actionDrill,machine,toolSpeedUnit,exclusiveLineNumbers,newLines)
	local out = ""
	local drillLines = {}
	if exclusiveLineNumbers == nil then exclusiveLineNumbers = lineNumberStepSize end
	local holeCenter = (currentOperation.transform * actionDrill.centerPosition) + boringHeadSPOffset
	local plungeSpeed = actionDrill.plungeFeedRate
	if toolSpeedUnit == "mMin" and plungeSpeed >= 100 then plungeSpeed = (plungeSpeed/1000) end
	if toggleOperationLabels then out = out .. PPCLib.newLine(0) .. Comment .. "--------- Drill ----------" .. EndComment end
	table.insert(drillLines,F("%s X%.3f Y%.3f",G0,holeCenter.x,holeCenter.y))
	table.insert(drillLines,F("%s Z%0.3f",G0,machine.safetyDistance + holeCenter.z))
	table.insert(drillLines,F("%s Z%.3f",G0,holeCenter.z))
	table.insert(drillLines,F("%s Z%.3f F%.0f",G1,holeCenter.z-actionDrill.depth,plungeSpeed))
	table.insert(drillLines,F("%s Z%.3f",G0,machine.safetyDistance + holeCenter.z))
	currentPosition.x = holeCenter.x
	currentPosition.y = holeCenter.y
	currentPosition.z = machine.safetyDistance + holeCenter.z
	feed_value = actionDrill.plungeFeedRate
	if newLines ~= {} then
		drillLines = PPCLib.addOrChangeLine(newLines,drillLines)
	end
	for i,line in ipairs(drillLines) do
		out = out .. PPCLib.newLine(exclusiveLineNumbers) .. line
	end
	return out
end
------------------------------------------------
--Checks if the canned cyle option box is checked for drilling operations
function PPCLib.checkCannedCycle(toolpath)
	if (toolpath.style.type == StyleType.MultiDrill) and (toolpath.style.isCannedCycleMode == false) then
		printError(F("ERROR! Canned cycle option of the operation must be checked. Layer: %s -> Operation: %s", toolpath.layerName, 
																							PPCLib.styleTypeToString(toolpath.style.type)))
		return F("ERROR! Canned cycle option of the operation must be checked. Layer: %s -> Operation: %s", toolpath.layerName, 
																							PPCLib.styleTypeToString(toolpath.style.type))
	end
	if (toolpath.style.type == StyleType.Drill) and (toolpath.style.isCannedCycleMode == false) then
		printError(F("ERROR! Canned cycle option of the operation must be checked. Layer: %s -> Operation: %s", toolpath.layerName, 
																							PPCLib.styleTypeToString(toolpath.style.type)))
		return F("ERROR! Canned cycle option of the operation must be checked. Layer: %s -> Operation: %s", toolpath.layerName, 
																							PPCLib.styleTypeToString(toolpath.style.type))
	end
end
------------------------------------------------
--Creates the footer of the NC Code
function PPCLib.footer(machineData,mergeNcCodes,exclusiveLineNumbers,newLines)
	local out = ""
	if exclusiveLineNumbers == nil then exclusiveLineNumbers = lineNumberStepSize end
	if toggleOperationLabels then  out = out .. PPCLib.newLine(0) .. Comment .. "--------- FOOTER ----------" .. EndComment end
	local footerLines = {}
	if newLines ~= {} then
		footerLines = PPCLib.addOrChangeLine(newLines,footerLines)
	end
	for i,line in ipairs(footerLines) do
		if line ~= "" then
			out = out .. PPCLib.newLine(exclusiveLineNumbers) .. line
		else
			out = out .. PPCLib.newLine(0) .. line
		end
	end
	return out
end
------------------------------------------------
--Processes top/bottom face setups of parts/plates
function PPCLib.NCTwoFacesOf(plate,machine,job,plateOrPart,materialName,folder,currentIndex,numberOfPlates,hasAutoLabeling,toBeSaved,mergeNcCodes,ncFileContent)
	local pair = {{plate.topFaceSetups,false,"TopFace"},{plate.bottomFaceSetups,true,"BottomFace"}}
	for i,face in ipairs(pair) do
		isSecondaryFace = face[2]
		for j,setup in ipairs(face[1]) do
			if setup.procedure.machine.name == machine.name then
				PPCLib.SetCurrentPlateWidthHeight(plate,face[2],machine)
				currentPlateMachiningSeconds = setup.machiningTime
				--doNCCode
				if toBeSaved == false then
					setup.ncResult.ncCode = postprocess(setup.toolpaths)
					setup.ncResult.fileName = PPCLib.nameNCFile(plate,plateOrPart,job,materialName,currentIndex,setup.ncResult.ncCode,mergeNcCodes)
				else
				--saveNCCode
					if (setup.ncResult.ncCode ~= "") then
						PPCLib.saveNCFile(folder,setup.procedure.name,plateOrPart,currentIndex,numberOfPlates,face[3],setup.ncResult.fileName,machine,setup.ncResult.ncCode,mergeNcCodes,ncFileContent)
					end
					if (hasAutoLabeling == true) and (plateOrPart == "Plate") and (face[3] == "TopFace") then
						local arrangedPoints = PPCLib.arrangeLabelPoints(plate,machine)
						PPCLib.KRCLabelingGCode(arrangedPoints,folder,currentIndex)
					end
				end
			end
		end
	end
end
------------------------------------------------
--Creates NC Codes for each part/plate, makes the "Create NC Code" button work
function PPCLib.doNCCode(machine,job,materialName,toBeSaved,mergeNcCodes)
	openedTheJobFolder = false
	jobNumber = currentJob.number
	totalPlateCount = #job.plates
	totalPartCount = #job.parts
	isPlate = true
	for i, plate in ipairs(job.plates) do
		currentPlateIndex = i
		partName = nil
		PPCLib.NCTwoFacesOf(plate ,machine, job, "Plate", materialName, nil, currentPlateIndex, #job.plates, nil, toBeSaved, mergeNcCodes, nil)
	end
	isPlate = false
	for j, part in ipairs(job.parts) do
		printZSafeZone = false
		currentPartIndex = j
		partName = part.name
		PPCLib.NCTwoFacesOf(part, machine, job, "Part", materialName, nil, currentPartIndex, #job.parts, nil, toBeSaved, false, nil)
	end
	
	return machine.name .. "-> NC codes are created."
end
------------------------------------------------
--Calculates the points where a part's label should be placed
function PPCLib.arrangeLabelPoints(plate,machine)
	-- {basePoint , plate{"transform","max","min","fullName","name","index","description","rotatable","material","thickness","projectName","moduleCode","modulePoseNo","isNestedRotated"}}
	local points = optimizeNestedParts(plate.nestedPlate.nestedParts)
	local arrangedPoints = {} 
	--If plate is turned, label should be turned too.
	local orj = placeOriginToPlate(plate.nestedPlate ,machine,false,nil,nil)
	orj = orj:inverse()
	for k,pt in ipairs(points) do
		local newPT = {} 
		newPT.basePoint = orj * pt.basePoint
		newPT.part = pt.part
		table.insert(arrangedPoints,newPT)
	end
	return arrangedPoints
end
------------------------------------------------
--Saves the NC Codes of each part/plate, makes the "Save Nc Code" button work
function PPCLib.saveNCCode(targetFolderPath,machine,job,materialName,hasAutoLabeling,toBeSaved,mergeNcCodes)
	local jobFolder = PPCLib.nonTrAndUpperCase(F([[%s/J%03d_%s/]],targetFolderPath,job.number,materialName))
	local machineFolder = PPCLib.nonTrAndUpperCase(F([[%s/J%03d_%s/%s/]],targetFolderPath,job.number,materialName,machine.name))
	os.execute("mkdir " .. [["]] .. machineFolder ..[["]] )
	printError("mkdir " .. [["]] .. machineFolder ..[["]])
	local ncFileContent = {""}
	for i, plate in ipairs(job.plates) do
		currentPlateIndex = i
		PPCLib.NCTwoFacesOf(plate, machine, job, "Plate", materialName,machineFolder,currentPlateIndex,#job.plates,hasAutoLabeling,toBeSaved,mergeNcCodes,ncFileContent)
	end
	
	for j, part in ipairs(job.parts) do
		currentPartIndex = j
		PPCLib.NCTwoFacesOf(part, machine, job, "Part", materialName,machineFolder,currentPartIndex,#job.parts,hasAutoLabeling,toBeSaved,false,nil)
	end

	if (openedTheJobFolder == false) or (openedTheJobFolder == nil) then
		--local out = cuttingPlanPDF(jobFolder)
		--printError(out)
		os.execute("explorer.exe " .. string.gsub(jobFolder, "/","\\"))
		openedTheJobFolder = true
	end
	return machine.name .. "-> NC codes are created."
end
------------------------------------------------
--Creates and saves the labeling code for KRC Fantom machine
function PPCLib.KRCLabelingGCode(pts,folder,index)
	local rowNumber = 100
	function printOnRowNumber()
		rowNumber = rowNumber + 10
		return F("\nN%04.0f",rowNumber)
	end

	local fileContent = ""
	local currentPlateIndexOverRide = index -1 
	fileContent = "%" .. F("S_%02.0f",currentPlateIndexOverRide)
	fileContent = fileContent .. "\n"
	fileContent = fileContent .. "\nG83"
	fileContent = fileContent .. "\n(V.E.XLABEL[0]													( X POZISYONU"
	fileContent = fileContent .. "\n(V.E.YLABEL[0]													( YPOZISYONU"
	fileContent = fileContent .. "\n(V.E.SLABEL[0]													( DOSYA YERI -  \"\\FOLDERNAME\\FILENAME\""
	fileContent = fileContent .. "\n(V.E.PLABEL[0]													( ETIKET YAPISTIRMADA ROTASYON - ((0-1:LABEL ROTATE)"
	fileContent = fileContent .. "\n"
	fileContent = fileContent .. F("\nV.E.STKLENGTH=%0.0f											( PLAKA UZUNLUGU",currentPlateWidth)
	fileContent = fileContent .. F("\nV.E.STKWIDTH=%0.0f												( PLAKA GENISLIGI",currentPlateHeight)
	fileContent = fileContent .. "\nV.E.LABEL_LENGTH=50											( ETIKET BOYU"
	fileContent = fileContent .. "\nV.E.LABEL_WIDTH=100											( ETIKET GENISLIGI"
	fileContent = fileContent .. "\n"
	
	for i,el in ipairs(pts) do
		local newPnt = el.basePoint
		--findPart in plate
		local rotateLabel = 1
		for k,prt in ipairs(currentJob.plates[currentPlateIndex].nestedPlate.nestedParts) do
			if prt.fullName == el.part.fullName  then
				local plakaYerlesim = placeOriginToPlate(currentJob.plates[currentPlateIndex].nestedPlate ,currentMachine,isBottomFace,nil,nil)
				local prtmax = plakaYerlesim * prt.max 
				local prtmin = plakaYerlesim * prt.min
				local pbbox = ABox3d()
				pbbox:extend(prtmax)
				pbbox:extend(prtmin)
				if pbbox:sizes().x < 120 then 
					rotateLabel = 0 
				end
				break
			end
		end
		fileContent = fileContent .. F("%s V.E.XLABEL[%d]=%04.0f V.E.YLABEL[%d]=%04.0f V.E.PLABEL[%d]=%d V.E.SLABEL[%d]=\"\\SHEET_%02.0f\\LABEL_%02.0f.png\"",
										printOnRowNumber(),i-1,newPnt.x,i-1,newPnt.y,i-1,rotateLabel,i-1,currentPlateIndexOverRide,i-1)
		
		--create LABEL
		local pngFile = F([[%s/LABEL_%02d.png]],folder,i-1)
		printLabelToFile(pngFile,el.part)
	end
	fileContent = fileContent .. "\n"
	fileContent = fileContent .. F("%s M17",printOnRowNumber())
	labelGCode = io.open(PPCLib.nonTrAndUpperCase(F("%s/S_%02.0f.nc",folder,currentPlateIndexOverRide)),'w')
	labelGCode:write(fileContent)
	labelGCode:close()
	
end
------------------------------------------------
--Creates and saves the NC data file for KRC Fantom machine
function PPCLib.KRCNCDataFile(plates,folder)
	local rowNumber = 100
	function printOnRowNumber()
		rowNumber = rowNumber + 10
		return F("\nN%04.0f",rowNumber)
	end

	local ncDataFileContent = ""
	ncDataFileContent = "%NcData\n"
	ncDataFileContent = ncDataFileContent .. F("%s G80														( CLEAR NC DATA\n",printOnRowNumber())
	ncDataFileContent = ncDataFileContent .. F("( PRODUCTION ======================================================================================\n",printOnRowNumber())
	ncDataFileContent = ncDataFileContent .. F("%s V.E.TOTALPRODUCT=%d 									( TOTAL NUMBER OF PRODUCTS",printOnRowNumber(),#currentJob.plates)
	ncDataFileContent = ncDataFileContent .. F("%s V.E.STICKER_ABSENCE=0								( 1: STICKER SYSTEM ABSENT",printOnRowNumber())
	ncDataFileContent = ncDataFileContent .. F("%s V.E.STICKER_CANCEL=0									( 1: CANCEL STICKER SYSTEM",printOnRowNumber())
	ncDataFileContent = ncDataFileContent .. F("%s V.E.PRINTER_CANCEL=0									( 1: CANCEL PRINTING\n",printOnRowNumber())
	ncDataFileContent = ncDataFileContent .. F("%s ( CNC PRODUCTS",printOnRowNumber())
	for i in pairs(plates) do
		ncDataFileContent = ncDataFileContent .. F("%s V.E.SPRODUCT[%d] = \"\\SHEET_%02.0f\\SHEET_%02.0f.nc\"",printOnRowNumber(),i-1,i-1,i-1)
	end
	ncDataFileContent = ncDataFileContent .. "\n"
	ncDataFileContent = ncDataFileContent .. F("%s ( STICKER PRODUCTS",printOnRowNumber())
	for i in pairs(plates) do
		ncDataFileContent = ncDataFileContent .. F("%s V.E.SSTICKER[%d] = \"\\SHEET_%02.0f\\S_%02.0f.nc\"",printOnRowNumber(),i-1,i-1,i-1)
	end
	ncDataFileContent = ncDataFileContent .. "\n"
	ncDataFileContent = ncDataFileContent .. "\n( PRODUCTION ======================================================================================"
	ncDataFileContent = ncDataFileContent .. "\n"
	ncDataFileContent = ncDataFileContent .. F("%s G81",printOnRowNumber())
	ncDataFileContent = ncDataFileContent .. F("%s M30",printOnRowNumber())
	
	ncDataFile = io.open(PPCLib.nonTrAndUpperCase(F("%s/NcData.nc",folder),'w'))
	ncDataFile:write(ncDataFileContent)
	ncDataFile:close()
end
------------------------------------------------
--Creates all label files for all parts that a project consists of
function PPCLib.CreateAllLabels(targetFolderPath,job)
	local labelFolder = F([[%s/J%03d_%s_Labels/]],targetFolderPath,job.number,materialName)
	os.execute("mkdir " .. [["]] .. labelFolder ..[["]] )
	for i, plate in ipairs(job.plates) do
		currentPlateIndex = i
		for j,part in ipairs(plate.nestedPlate.nestedParts) do
			local labelFileName  = PPCLib.nonTrAndUpperCase(F([[%s/%03d_%04d.png]],labelFolder,i,j))
			printError(labelFileName)
			printLabelToFile(labelFileName,part)
		end
	end
end
------------------------------------------------
--Makes the "export all button" in the tracking column work
function PPCLib.CreateAllReporting(targetFolderPath,job)
	PPCLib.CreateAllLabels(targetFolderPath,job)
	PPCLib.CuttingPlanPDF(targetFolderPath,job)
	return "Reporting success..."
end
------------------------------------------------
--Gives a name to the NC code file of a part/plate 
function PPCLib.nameNCFile(plate,plateOrPart,job,materialName,plateNo,setupNcCode,mergeNcCodes)
	local refName = ""
	if plateOrPart == "Plate" then
		if mergeNcCodes == false then
			refName = F("J%03d_%s_%03d_%03d",job.number,materialName,plateNo,#job.plates)
		else
			refName = F("J%03d_%s_%03d",job.number,materialName,#job.plates)
		end
	else
		refName = plate.nestedPlate.nestedParts[1].dxfFile
	end
	if setupNcCode ~= "" then 
		if (refName == "") or (refName == nil) then
		 refName = F("J%03dP%03d",job.number,plateNo)
		end
	end
	return refName
end
------------------------------------------------
--Creates a directory and saves the NC code file
function PPCLib.saveNCFile(folder,procedureName,plateOrPart,currentIndex,numberOfPlates,topOrBottom,ncFileName,machine,setupNcCode,mergeNcCodes,ncFileContent)
	local fileFolder = PPCLib.nonTrAndUpperCase(F([[%s%s_%s%s/]],folder,procedureName, plateOrPart, topOrBottom))
	os.execute("mkdir " .. [["]] .. fileFolder ..[["]] )
	if mergeNcCodes == true and ncFileContent ~= nil then
		ncFileContent[1] = ncFileContent[1] .. setupNcCode
		if currentIndex == numberOfPlates then
			local fileName = PPCLib.nonTrAndUpperCase(F([[%s%s.%s]],fileFolder,ncFileName,machine.ncCodeFileExtension))
			local ncCodeFile = io.open(fileName,"w")
			ncCodeFile:write(ncFileContent[1])
			ncCodeFile:close()
		end
	else
		local fileName = PPCLib.nonTrAndUpperCase(F([[%s%s.%s]],fileFolder,ncFileName,machine.ncCodeFileExtension))
		local ncCodeFile = io.open(fileName,"w")
		ncCodeFile:write(setupNcCode)
		ncCodeFile:close()
	end
end
------------------------------------------------
--
function getOffsetedPosition( center , selectedToolSlot )
	local lOffset = currentMachine.boringHead.transform.translation - selectedToolSlot.transform.translation
	local gOffset = center + lOffset
	return gOffset
end
------------------------------------------------
--Adds lines to the end or between the lines of a section, or changes the line with the number that entered
function PPCLib.addOrChangeLine(newLines,lineTableToChange)
	local newLinesTable = lineTableToChange
	for i,lineData in ipairs(newLines) do
		if lineData.operation == "add" then
			if lineData.lineNumber == nil then
				table.insert(newLinesTable,lineData.line)
			else
				table.insert(newLinesTable,lineData.lineNumber,lineData.line)
			end
		elseif lineData.operation == "replace" then
			table.remove(newLinesTable,lineData.lineNumber)
			table.insert(newLinesTable,lineData.lineNumber,lineData.line)
		elseif lineData.operation == "remove" then
			table.remove(newLinesTable,lineData.lineNumber)
		elseif lineData.operation == "append" then
			newLinesTable[lineData.lineNumber] = newLinesTable[lineData.lineNumber] .. lineData.line
		else
			return "LINE EDITING OPERATION IS NOT VALID"
		end
	end
	return newLinesTable
end
------------------------------------------------
--
function PPCLib.isPart(workpiece)
	if #workpiece.nestedParts > 1 then 
		return false 
	else 
		local w = workpiece.width
		local h = workpiece.height
		local iw = workpiece.nestedParts[1].widthNominal -- edgeband included 
		local ih = workpiece.nestedParts[1].heightNominal --edgeband included
		if not(isApproximatelyEqual(iw,w) and isApproximatelyEqual(ih,h)) then
			return false 
		end
	end
	
	return true
end
------------------------------------------------
--Here is where the postprocessor does its processes
PPCLib.initialization()

function placeOriginToPlate(plate,machine,isForBottomFace,offsetToolpath,job)
	if machine.machineType == MachineType.hole then
		returnValue =  PPCLib.PlacePartToOrigin(plate, machine, isForBottomFace, nil, nil)
	elseif machine.machineType == MachineType.router then
		returnValue =  PPCLib.PlacePlateToOrigin(plate,machine,isForBottomFace,offsetToolpath,job)
		--if PPCLib.isPart(plate) == true then
		--	returnValue =  PPCLib.PlacePartToOrigin(plate,machine,isForBottomFace,nil,nil)
		--else
		--	returnValue =  PPCLib.PlacePlateToOrigin(plate,machine,isForBottomFace,offsetToolpath,job)
		--end
	elseif machine.machineType == MachineType.sizing then
		returnValue = Transform() -- return identity matrix no need to placement
	else
		printErrorUrgent("Unknown machine type! PPCLib->placeOriginToPlate")
		returnValue = Transform() -- return identity matrix no need to placement
	end
	return returnValue
end

function setCurrentPlateWidthHeight(plate, isForBottomFace)
	local locIsForBottomFace = (isForBottomFace == nil) and false or isForBottomFace
	return PPCLib.SetCurrentPlateWidthHeight(plate,locIsForBottomFace, currentMachine)
end

--------------------------------------------------------------------------------
function postprocess(toolpaths)
	if #toolpaths == 0 then return "" end
	currentOperation = {}
	if mergeNcCodes == false then LN = 0 end
	usedToolList = PPCLib.getUsedToolList(toolpaths)
	printZSafeZone = false
    local code = ""
	code = code .. makeHeader(machineData,mergeNcCodes,exclusiveLineNumbers)
    for n, toolpath in ipairs(toolpaths) do
		PPCLib.checkCannedCycle(toolpath)
		currentOperation.toolpath = toolpath
        for no, operation in ipairs(toolpath.operations) do
			currentOperation.transform = operation.transform
            for na, action in ipairs(operation.actions) do
                local type = action.type
                if type == ActionType.Goto then
                    code = code .. makeGoTo(action:asGoto(),currentMachine,toolSpeedUnit,exclusiveLineNumbers)
                elseif type == ActionType.Arc then
                    code = code .. makeArc(action:asArc(),arcMode,arcSegmentSize,toolSpeedUnit,exclusiveLineNumbers)
                elseif type == ActionType.Spindle then
                    code = code .. makeSpindle(action:asSpindle(),dwell,dwellUnit,dwellSpecifier,spindleSpecifier,exclusiveLineNumbers)
                elseif type == ActionType.ToolChange then
                    code = code .. makeToolChange(action:asToolChange(),currentMachine,machineData,toolSelectSpecifier,exclusiveLineNumbers)
                elseif (type == ActionType.CannedCycleDrill) and (toolpath.style.type == StyleType.MultiDrill) then
					code = code .. makeCannedCycleDrillMultiDrill(action:asCannedCycleDrill(),currentMachine,toolSpeedUnit,exclusiveLineNumbers)
                elseif (type == ActionType.CannedCycleDrill) and (toolpath.style.type == StyleType.Drill) then
                    code = code .. makeCannedCycleDrill(action:asCannedCycleDrill(),currentMachine,toolSpeedUnit,exclusiveLineNumbers)  
                else
                    printError("unknown action type: " .. type)
                end
            end
        end
    end
	code = code .. makeFooter(machineData,mergeNcCodes,exclusiveLineNumbers)
    return code
end

function makeHeader(machineData,mergeNcCodes,exclusiveLineNumbers)
	local newLines = {}
	return PPCLib.header(machineData,mergeNcCodes,exclusiveLineNumbers,newLines)
end

function makeToolChange(actionToolChange,machine,machineData,toolSelectSpecifier,exclusiveLineNumbers)
	local newLines = {}
	return PPCLib.toolChange(actionToolChange,machine,machineData,toolSelectSpecifier,exclusiveLineNumbers,newLines)
end

function makeSpindle(actionSpindle,dwell,dwellUnit,dwellSpecifier,spindleSpecifier,exclusiveLineNumbers)
	local newLines = {}
	return PPCLib.spindle(actionSpindle,dwell,dwellUnit,dwellSpecifier,spindleSpecifier,exclusiveLineNumbers,newLines)
end

function makeGoTo(actionGoTo,machine,toolSpeedUnit,exclusiveLineNumbers)
	local newLines = {}
	return PPCLib.goTo(actionGoTo,machine,toolSpeedUnit,exclusiveLineNumbers,newLines)
end

function makeArc(actionArc,arcMode,arcSegmentSize,toolSpeedUnit,exclusiveLineNumbers)
	local newLines = {}
	if arcSegmentSize == 0 then
		return PPCLib.arc(actionArc,arcMode,toolSpeedUnit,exclusiveLineNumbers,newLines)
	else
		return PPCLib.arcSegmented(actionArc,arcSegmentSize,toolSpeedUnit,exclusiveLineNumbers,newLines)
	end
end

function makeCannedCycleDrill(actionDrill,machine,toolSpeedUnit,exclusiveLineNumbers)
	local newLines = {}
	return PPCLib.cannedCycleDrill(actionDrill,machine,toolSpeedUnit,exclusiveLineNumbers,newLines)
end

function makeCannedCycleDrillMultiDrill(actionMultiDrill,machine,toolSpeedUnit,exclusiveLineNumbers)
	local newLines = {}
	return PPCLib.cannedCycleDrillMultiDrill(actionMultiDrill,machine,toolSpeedUnit,exclusiveLineNumbers,newLines)
end

function makeFooter(machineData,mergeNcCodes,exclusiveLineNumbers)
	local newLines = {}
	return PPCLib.footer(machineData,mergeNcCodes,exclusiveLineNumbers,newLines)
end

function doNCCode()
	return PPCLib.doNCCode(currentMachine,currentJob,materialName,false,mergeNcCodes)
end

function saveNCCodes(targetFolderPath)
	return PPCLib.saveNCCode(targetFolderPath,currentMachine,currentJob,materialName,hasAutoLabeling,true,mergeNcCodes)
end

function createAllReporting(targetFolderPath)
	return PPCLib.CreateAllReporting(targetFolderPath,currentJob.plates)
end
------------------------------------------------
--
function PPCLib.SimulationCodeCreator(toolpaths,side,machine)
	local sideCode = ""
		for n, toolpath in ipairs(toolpaths) do
			if (toolpath.style.type == StyleType.MultiDrill) and (toolpath.style.isCannedCycleMode == false) then
				printError("Hata! MultiDrill operasyonu Canned Cycle olmali.")
				return "Hata! MultiDrill operasyonu Canned Cycle olmali."
			end
			currentOperation.toolpath = toolpath
			for no, operation in ipairs(toolpath.operations) do
				currentOperation.transform = operation.transform
				if isApproximatelyEqual(side , operation.transform:getRotZ()) then
					for na, action in ipairs(operation.actions) do
						local type = action.type
						if type == ActionType.Goto then
							sideCode = sideCode .. PPCLib.MakeGotoSim(action:asGoto(),side, machine)
						elseif type == ActionType.Arc then
							sideCode = sideCode .. PPCLib.makeArcSim(action:asArc(),side, machine)
						elseif type == ActionType.Comment then
							sideCode = sideCode .. PPCLib.makeCommentSim(action:asComment())
						elseif type == ActionType.Spindle then
							sideCode = sideCode .. PPCLib.MakeSpindleSim(action:asSpindle())
						elseif type == ActionType.ToolChange then
							sideCode = sideCode .. PPCLib.MakeToolChangeSim(action:asToolChange(), machine)
						elseif (type == ActionType.CannedCycleDrill) then
							sideCode = sideCode .. PPCLib.MakeCannedCycleDrillMultiDrillSim(action:asCannedCycleDrill(),side, machine)  
						else
							printError("unknown action type: " .. type)
						end
					end
				end
			end
		end
		return sideCode
end
------------------------------------------------
--
function PPCLib.SimulationCodeSaver(setup,machine)
	local header = ""
	header = header .. "M6T1"
	header = header .. "\nG0 Z99.000"
	header = header .. "\nG0 X0.000 Y0.000 Z99.000"
	local simulationCodes = {top="",bottom="",left="",right ="",front ="",rear="" }
	simulationCodes.top = header ..  PPCLib.SimulationCodeCreator(setup.toolpaths,Vec3(0,0,1),machine)
	simulationCodes.bottom = header .. PPCLib.SimulationCodeCreator(setup.toolpaths,Vec3(0,0,-1),machine)
	simulationCodes.left = header .. PPCLib.SimulationCodeCreator(setup.toolpaths,Vec3(-1,0,0),machine)
	simulationCodes.right = header .. PPCLib.SimulationCodeCreator(setup.toolpaths,Vec3(1,0,0),machine)
	simulationCodes.front = header .. PPCLib.SimulationCodeCreator(setup.toolpaths,Vec3(0,-1,0),machine)
	simulationCodes.rear = header .. PPCLib.SimulationCodeCreator(setup.toolpaths,Vec3(0,1,0),machine)
	
	setup.ncResult.ncCodeSimTop = simulationCodes.top
	setup.ncResult.ncCodeSimBottom = simulationCodes.bottom
	setup.ncResult.ncCodeSimLeft = simulationCodes.left
	setup.ncResult.ncCodeSimRight = simulationCodes.right
	setup.ncResult.ncCodeSimFront = simulationCodes.front
	setup.ncResult.ncCodeSimRear = simulationCodes.rear

	os.execute("mkdir " .. [["]] .. "c:/ProgramData/ADeko/adekoCAM/.workspace-tmp/partCAM" ..[["]] )

	local topFile = io.open("c:/ProgramData/ADeko/adekoCAM/.workspace-tmp/partCAM/cutSimTop.nc","w")
	topFile:write(simulationCodes.top)
	topFile:close()
	local bottomFile = io.open("c:/ProgramData/ADeko/adekoCAM/.workspace-tmp/partCAM/cutSimBottom.nc","w")
	bottomFile:write(simulationCodes.bottom)
	bottomFile:close()
	local leftFile = io.open("c:/ProgramData/ADeko/adekoCAM/.workspace-tmp/partCAM/cutSimLeft.nc","w")
	leftFile:write(simulationCodes.left)
	leftFile:close()
	local rightFile = io.open("c:/ProgramData/ADeko/adekoCAM/.workspace-tmp/partCAM/cutSimRight.nc","w")
	rightFile:write(simulationCodes.right)
	rightFile:close()
	local frontFile = io.open("c:/ProgramData/ADeko/adekoCAM/.workspace-tmp/partCAM/cutSimFront.nc","w")
	frontFile:write(simulationCodes.front)
	frontFile:close()
	local rearFile = io.open("c:/ProgramData/ADeko/adekoCAM/.workspace-tmp/partCAM/cutSimRear.nc","w")
	rearFile:write(simulationCodes.rear)
	rearFile:close()
	
end
------------------------------------------------
--
function PPCLib.SimUCSSelector(side, machine)
	local orj = Transform()
	local originZ = machine.ZOrigin
	local bedPlateSize = machine.bedPlateSize
	local w = currentPlateWidth
	local h = currentPlateHeight
	local t = currentPlateThickness
	local machineOrigin = machine.XYOrigin
	
	if originZ == ZOriginType.topOfStockSurface then
		t = 0
	elseif originZ == ZOriginType.bottomOfBedPlateSurface then
		t = currentPlateThickness + bedPlateSize.z
	end
	
	if machine.machineType == MachineType.hole then 
		machineOrigin = XYOriginType.XminusYminus 
	end
	if machineOrigin == XYOriginType.XminusYminus then
		if isApproximatelyEqual(Vec3(0,0,1),side) then -- top
			orj.translation = Vec3(0,0,t)
		elseif isApproximatelyEqual(Vec3(0,0,-1),side) then --bottom
			orj.translation = Vec3(w,0,-currentPlateThickness + t)
			orj.rotation = computeMatrixHoldDir(Vec3(0,1,0),Vec3(0,0,-1))
		elseif isApproximatelyEqual(Vec3(-1,0,0),side) then --left
			orj.translation = Vec3(0,h,-currentPlateThickness + t)
			orj.rotation = computeMatrixHoldDir(Vec3(0,0,1),Vec3(-1,0,0))
		elseif isApproximatelyEqual(Vec3(1,0,0),side) then -- right
			orj.translation = Vec3(w,0,-currentPlateThickness+t)
			orj.rotation = computeMatrixHoldDir(Vec3(0,0,1),Vec3(1,0,0))
		elseif isApproximatelyEqual(Vec3(0,-1,0),side) then --front
			orj.translation = Vec3(0,0,-currentPlateThickness + t)
			orj.rotation = computeMatrixHoldDir(Vec3(0,0,1),Vec3(0,-1,0))
		elseif isApproximatelyEqual(Vec3(0,1,0),side) then --rear
			orj.translation = Vec3(w,h,-currentPlateThickness + t)
			orj.rotation = computeMatrixHoldDir(Vec3(0,0,1),Vec3(0,1,0))
		end	
	elseif machineOrigin == XYOriginType.XminusYplus then
		if isApproximatelyEqual(Vec3(0,0,1),side) then -- top
			orj.translation = Vec3(0,0,t)
		elseif isApproximatelyEqual(Vec3(0,0,-1),side) then --bottom
			orj.translation = Vec3(w,0,-currentPlateThickness + t)
			orj.rotation = computeMatrixHoldDir(Vec3(0,1,0),Vec3(0,0,-1))
		elseif isApproximatelyEqual(Vec3(-1,0,0),side) then --left
			orj.translation = Vec3(0,0,-currentPlateThickness + t)
			orj.rotation = computeMatrixHoldDir(Vec3(0,0,1),Vec3(-1,0,0))
		elseif isApproximatelyEqual(Vec3(1,0,0),side) then -- right
			orj.translation = Vec3(w,-h,-currentPlateThickness+t)
			orj.rotation = computeMatrixHoldDir(Vec3(0,0,1),Vec3(1,0,0))
		elseif isApproximatelyEqual(Vec3(0,-1,0),side) then --front
			orj.translation = Vec3(0,-h,-currentPlateThickness + t)
			orj.rotation = computeMatrixHoldDir(Vec3(0,0,1),Vec3(0,-1,0))
		elseif isApproximatelyEqual(Vec3(0,1,0),side) then --rear
			orj.translation = Vec3(w,0,-currentPlateThickness + t)
			orj.rotation = computeMatrixHoldDir(Vec3(0,0,1),Vec3(0,1,0))
		end	
	elseif machineOrigin == XYOriginType.XplusYplus then
		if isApproximatelyEqual(Vec3(0,0,1),side) then -- top
			orj.translation = Vec3(0,0,t)
		elseif isApproximatelyEqual(Vec3(0,0,-1),side) then --bottom
			orj.translation = Vec3(-w,0,-currentPlateThickness + t)
			orj.rotation = computeMatrixHoldDir(Vec3(0,1,0),Vec3(0,0,-1))
		elseif isApproximatelyEqual(Vec3(-1,0,0),side) then --left
			orj.translation = Vec3(-w,0,-currentPlateThickness + t)
			orj.rotation = computeMatrixHoldDir(Vec3(0,0,1),Vec3(-1,0,0))
		elseif isApproximatelyEqual(Vec3(1,0,0),side) then -- right
			orj.translation = Vec3(0,-h,-currentPlateThickness+t)
			orj.rotation = computeMatrixHoldDir(Vec3(0,0,1),Vec3(1,0,0))
		elseif isApproximatelyEqual(Vec3(0,-1,0),side) then --front
			orj.translation = Vec3(-w,-h,-currentPlateThickness + t)
			orj.rotation = computeMatrixHoldDir(Vec3(0,0,1),Vec3(0,-1,0))
		elseif isApproximatelyEqual(Vec3(0,1,0),side) then --rear
			orj.translation = Vec3(0,0,-currentPlateThickness + t)
			orj.rotation = computeMatrixHoldDir(Vec3(0,0,1),Vec3(0,1,0))
		end	
	elseif machineOrigin == XYOriginType.XplusYminus then
		if isApproximatelyEqual(Vec3(0,0,1),side) then -- top
			orj.translation = Vec3(0,0,t)
		elseif isApproximatelyEqual(Vec3(0,0,-1),side) then --bottom
			orj.translation = Vec3(-w,0,-currentPlateThickness + t)
			orj.rotation = computeMatrixHoldDir(Vec3(0,1,0),Vec3(0,0,-1))
		elseif isApproximatelyEqual(Vec3(-1,0,0),side) then --left
			orj.translation = Vec3(-w,h,-currentPlateThickness + t)
			orj.rotation = computeMatrixHoldDir(Vec3(0,0,1),Vec3(-1,0,0))
		elseif isApproximatelyEqual(Vec3(1,0,0),side) then -- right
			orj.translation = Vec3(0,0,-currentPlateThickness + t)
			orj.rotation = computeMatrixHoldDir(Vec3(0,0,1),Vec3(1,0,0))
		elseif isApproximatelyEqual(Vec3(0,-1,0),side) then --front
			orj.translation = Vec3(-w,0,-currentPlateThickness + t)
			orj.rotation = computeMatrixHoldDir(Vec3(0,0,1),Vec3(0,-1,0))
		elseif isApproximatelyEqual(Vec3(0,1,0),side) then --rear
			orj.translation = Vec3(0,h,-currentPlateThickness + t)
			orj.rotation = computeMatrixHoldDir(Vec3(0,0,1),Vec3(0,1,0))
		end	
	end
	
	return orj
end
------------------------------------------------
--
function PPCLib.MakeGotoSim(actionGoto,side,machine)
	local out = ""
	nextPosition = currentOperation.transform * actionGoto.endPosition
	--PPCLib.checkPosition(nextPosition,machine,currentPlateThickness)
	local dummyNextPos = nil
	
	local ucs = PPCLib.SimUCSSelector(side, machine)
	dummyNextPos = ucs:inverse() * nextPosition
	out = out .. F(" X%.3f Y%.3f Z%.3f", dummyNextPos.x, dummyNextPos.y, dummyNextPos.z)
	currentPosition.x = nextPosition.x
	currentPosition.y = nextPosition.y
	currentPosition.z = nextPosition.z

	if out == "" then
		return ""
	end

	if actionGoto.rapid == 1 then
		out = LF .. "G0" .. out
	else
		-- todo can be check units
		if feed_value ~= actionGoto.feedRate then
			feed_value = actionGoto.feedRate
			out = LF .. "G1" .. out .. F(" F%s", adeFormat(feed_value))
		else
			out = LF .. "G1" .. out
		end
	end
	if isApproximatelyEqual(Vec3(0,0,-1) , side) and dummyNextPos and  (dummyNextPos.z < -1) and (actionGoto.rapid == 1) then return "" end
	isNeedToPrintAllAxies = false
	return out
end
------------------------------------------------
--
function PPCLib.makeArcSim(actionArc,side,machine)
	nextPosition = currentOperation.transform * actionArc.endPosition
	
	if F("%.0f,%.0f",currentPosition.x,currentPosition.y) == F("%.0f,%.0f",nextPosition.x,nextPosition.y) then
	   return PPCLib.MakeGotoSim(actionArc,side,machine)
	end
	
	local out = ""
	local isBottomFace = false
	local ucs = PPCLib.SimUCSSelector(side, machine)
	
	if isApproximatelyEqual(Vec3(0,0,-1) , side) then -- bottom
		isBottomFace = true
	end
	
	if PPCLib.adeNotEq(currentPosition.x, nextPosition.x) or PPCLib.adeNotEq(currentPosition.y, nextPosition.y) or PPCLib.adeNotEq(currentPosition.z, nextPosition.z) then
		local dummyNextPos = ucs:inverse() * nextPosition
		out = out .. F(" X%.3f Y%.3f Z%.3f", dummyNextPos.x, dummyNextPos.y, dummyNextPos.z)
		currentPosition.x = nextPosition.x
		currentPosition.y = nextPosition.y
		currentPosition.z = nextPosition.z
	end

	if ((actionArc.isCW == true) and (isBottomFace == false)) or ((actionArc.isCW == true) and (isBottomFace == true)) then
		out = "G2" .. out
	elseif ((actionArc.isCW == false) and (isBottomFace == false)) or ((actionArc.isCW == false) and (isBottomFace == true)) then
		out = "G3" .. out
	end

	if feed_value ~= actionArc.feedRate then
		feed_value = actionArc.feedRate
		out = out .. F(" R%.3f F%s", actionArc.radius, adeFormat(feed_value))
	else
		out = out .. F(" R%.3f", actionArc.radius)
	end
		
	isNeedToPrintAllAxies = false
	out = LF .. out
	return out
end
------------------------------------------------
--
function PPCLib.MakeCannedCycleDrillMultiDrillSim(action,side,machine)
	local out = ""
	local toolSlots = action.toolIds
	local currentToolHoleCenter = nil
	--rapid hareketin parca uzerinde olup olmadigini kontrol et
	local originToolHoleCenter = currentOperation.transform * action.centerPosition

	local ucs = PPCLib.SimUCSSelector(side, machine)
	local approachPoint = nil
	local depthPoint = nil
	local surfacePoint = nil
	
	for i,val in ipairs(toolSlots) do
		local currentToolOffsetFromMasterTool =  toolSlots[i].transform.translation - toolSlots[1].transform.translation
		if isApproximatelyEqual(Vec3(0,0,1) , currentOperation.transform:getRotZ()) then -- TOP FACE
			approachPoint = ucs:inverse() * (originToolHoleCenter + currentToolOffsetFromMasterTool + Vec3(0,0,currentMachine.safetyDistance))
			surfacePoint = ucs:inverse() * (originToolHoleCenter + currentToolOffsetFromMasterTool)
			depthPoint = ucs:inverse() * (originToolHoleCenter + currentToolOffsetFromMasterTool + Vec3(0,0,-action.depth))
		elseif isApproximatelyEqual(Vec3(0,0,-1) , currentOperation.transform:getRotZ()) then -- BOTTOM FACE
			approachPoint = ucs:inverse() * (originToolHoleCenter + currentToolOffsetFromMasterTool + Vec3(0,0,-currentMachine.safetyDistance))
			surfacePoint = ucs:inverse() * (originToolHoleCenter + currentToolOffsetFromMasterTool)
			depthPoint = ucs:inverse() * (originToolHoleCenter + currentToolOffsetFromMasterTool + Vec3(0,0,action.depth))
		elseif isApproximatelyEqual(Vec3(0,-1,0) , currentOperation.transform:getRotZ()) then --FRONT FACE
			approachPoint = ucs:inverse() * (originToolHoleCenter + currentToolOffsetFromMasterTool + Vec3(0,-currentMachine.safetyDistance,0))
			surfacePoint = ucs:inverse() * (originToolHoleCenter + currentToolOffsetFromMasterTool)
			depthPoint = ucs:inverse() * (originToolHoleCenter + currentToolOffsetFromMasterTool + Vec3(0,action.depth,0))
		elseif isApproximatelyEqual(Vec3(1,0,0) , currentOperation.transform:getRotZ()) then --RIGHT FACE 
			approachPoint = ucs:inverse() * (originToolHoleCenter + currentToolOffsetFromMasterTool + Vec3(currentMachine.safetyDistance,0,0))
			surfacePoint = ucs:inverse() * (originToolHoleCenter + currentToolOffsetFromMasterTool)
			depthPoint = ucs:inverse() * (originToolHoleCenter + currentToolOffsetFromMasterTool + Vec3(-action.depth,0,0))
		elseif isApproximatelyEqual(Vec3(0,1,0) , currentOperation.transform:getRotZ()) then --REAR FACE
			approachPoint = ucs:inverse() * (originToolHoleCenter + currentToolOffsetFromMasterTool + Vec3(0,currentMachine.safetyDistance,0))
			surfacePoint = ucs:inverse() * (originToolHoleCenter + currentToolOffsetFromMasterTool)
			depthPoint = ucs:inverse() * (originToolHoleCenter + currentToolOffsetFromMasterTool + Vec3(0,-action.depth,0))
		elseif isApproximatelyEqual(Vec3(-1,0,0) , currentOperation.transform:getRotZ()) then	--LEFT FACE
			approachPoint = ucs:inverse() * (originToolHoleCenter + currentToolOffsetFromMasterTool + Vec3(-currentMachine.safetyDistance,0,0))
			surfacePoint = ucs:inverse() * (originToolHoleCenter + currentToolOffsetFromMasterTool)
			depthPoint = ucs:inverse() * (originToolHoleCenter + currentToolOffsetFromMasterTool + Vec3(action.depth,0,0))
		end
		
		if i == 1 then
			out = out .. LF .. F("G0 X%.3f Y%.3f Z%.3f", approachPoint.x, approachPoint.y, approachPoint.z)
		else
			out = out .. LF .. F("G0 X%.3f Y%.3f Z%.3f", surfacePoint.x, surfacePoint.y, surfacePoint.z)
		end
		
		out = out .. LF .. F("G1 X%.3f Y%.3f Z%.3f F%.3f", depthPoint.x, depthPoint.y, depthPoint.z, action.plungeFeedRate)
		
		if i == #toolSlots then
			if i ~= 1 then
				out = out .. LF .. F("G0 X%.3f Y%.3f Z%.3f", surfacePoint.x, surfacePoint.y, surfacePoint.z)
			end
			out = out .. LF .. F("G0 X%.3f Y%.3f Z%.3f", approachPoint.x, approachPoint.y, approachPoint.z)
		else
			out = out .. LF .. F("G0 X%.3f Y%.3f Z%.3f", surfacePoint.x, surfacePoint.y, surfacePoint.z)
		end
	end

	currentPosition.x = approachPoint.x
	currentPosition.y = approachPoint.y
	currentPosition.z = approachPoint.z

	--need to set current velocity to rapid
	feed_value = action.feedRate
	return out
end
------------------------------------------------
--
function PPCLib.MakeSpindleSim(actionSpindle)
	if isBoringHeadUsed == true then
		return ""
	end
	local out = ""
	local nextspeed = actionSpindle.speed
	if previousSpindleSpeed == nextspeed then
		return ""
	end
	previousSpindleSpeed = nextspeed
	if nextspeed > spindleMax then
		out = Comment .. "Warning! spindle value is to much than predefined spindle maximum value." .. EndComment
		nextspeed = spindleMax
	end
	if nextspeed < spindleMin then
		out = Comment .. "Warning! spindle value is lower than predefined spindle minimum value." .. EndComment
		nextspeed = spindleMin
	end
	if actionSpindle.speed == 0 then
		out = out .. LF .. " M05" -- stop the spindle
		return out
	end
	if actionSpindle.isCW == true then
		out = out .. LF .. F("S%s M3", adeFormat(math.abs(nextspeed)))
	else
		out = out .. LF .. F("S%s M4", adeFormat(math.abs(nextspeed)))
	end
	return out
end
------------------------------------------------
--
function PPCLib.MakeToolChangeSim(actionToolChange, machine)
	local toolIDs = actionToolChange.toolIds
	isNeedToPrintAllAxies = true
	currentOperation.UsedTools = toolIDs
	local slotIndex = tonumber(toolIDs[1].slotIndex)
	local out = ""
	if actionToolChange.useBoringHead == true then
		isBoringHeadUsed = true
		out = out .. LF .. "M6T" .. tostring(slotIndex+20000)
		out = out .. LF .. "G0" .. F(" Z%.3f", currentPosition.z + currentPlateThickness)
	else
		isBoringHeadUsed = false
		out = out .. LF .. "M6T" .. tostring(slotIndex+10000)
		feed_value = 0
	end
	previousSpindleSpeed = 0 -- takimin spindle degeri gelsin diye
	return out
end
------------------------------------------------
--
function PPCLib.DrawPlateTosvgDoc(plate,saveFolder,plateIndex,machine,svgLib)
	local marjin = 50
		local panelMakYer = PPCLib.PlacePlateToOrigin(plate.nestedPlate,machine,false,nil,nil)
		panelMakYer = panelMakYer:inverse()
		local enBoy = Vec3(plate.nestedPlate.width,plate.nestedPlate.height,0)
		enBoy = panelMakYer * enBoy
		local sheetBBox = ABox3d()
		sheetBBox:extend( panelMakYer * Vec3(0,0,0) )
		sheetBBox:extend( panelMakYer * Vec3(plate.nestedPlate.width,0,0) )
		sheetBBox:extend( panelMakYer * Vec3(plate.nestedPlate.width,plate.nestedPlate.height,0) )
		sheetBBox:extend( panelMakYer * Vec3(0,plate.nestedPlate.height,0) )
		
		local pageCoordSystem = Transform()
		pageCoordSystem.translation = Vec3(-marjin * 0.5 , enBoy.y+marjin * 0.5 ,0)
		pageCoordSystem.rotation = computeMatrixHoldDir(Vec3(0,-1,0),Vec3(0,0,-1))
		local orj = pageCoordSystem:inverse() * panelMakYer
		
		
		doc = EzSVG.Document(sheetBBox:sizes().x + marjin, sheetBBox:sizes().y + marjin, "white")
		
		--panel bilgileri
		local pnlsvg = EzSVG.Group()
		--panelMakYer.translation = panelMakYer.translation + Vec3(marjin*0.5 ,marjin*0.5 ,0)
		local p1 =  Vec3(marjin* 0.5,marjin* 0.5,0) + Vec3(0,0,0)
		local p2 =  Vec3(marjin* 0.5,marjin* 0.5,0) + Vec3(sheetBBox:sizes().x ,0,0)
		local p3 =  Vec3(marjin* 0.5,marjin* 0.5,0) + Vec3(sheetBBox:sizes().x ,sheetBBox:sizes().y ,0)
		local p4 =  Vec3(marjin* 0.5,marjin* 0.5,0) + Vec3(0,sheetBBox:sizes().y ,0)
		
		local pnlBound = EzSVG.Polyline({p1.x,p1.y, p2.x,p2.y ,p3.x,p3.y , p4.x,p4.y , p1.x , p1.y}, {
			        fill="none",
			        stroke="red",
			        stroke_width=6
			    })
		local pageBound = EzSVG.Polyline({0,0,sheetBBox:sizes().x + marjin , 0,  sheetBBox:sizes().x + marjin , sheetBBox:sizes().y + marjin , 0 , sheetBBox:sizes().y + marjin, 0 , 0}, {
			        fill="none",
			        stroke="black",
			        stroke_width=1
			    })

				
		pnlsvg:add(pnlBound)
		pnlsvg:add(pageBound)
		pnlsvg:add( EzSVG.Text(F("%.1f",sheetBBox:sizes().x ) , (sheetBBox:sizes().x + marjin) * 0.5 , marjin * 0.5 , {font_size="50px"}) )
		pnlsvg:add( EzSVG.Text(F("%.1f",sheetBBox:sizes().y ) , (sheetBBox:sizes().y + marjin) * 0.5 , marjin * -0.5 , {font_size="50px"}):rotate(90) )
		--pnlsvg:add(EzSVG.text(F("%.3f",enBoy.x ), 0,0))
		
		
		for j,part in ipairs(plate.nestedPlate.nestedParts) do
			--parça bilgileri
			local partsvg = EzSVG.Group()
			PPCLib.DrawPartTosvgGroup(part,orj,j,partsvg)
			doc:add(partsvg)
		end
		
		doc:add(pnlsvg)
		doc:writeTo(F("%splaka_%d.svg" ,saveFolder,plateIndex))
end
------------------------------------------------
--
function PPCLib.DrawPartTosvgGroup(part, orj , partIndexByPlate , group)
	--draw part shape
	local pathPoints = {} 
	for i , edg in ipairs(part.partShape.data.edges) do
		local edgeStartPos = part.partShape.data.points[edg.starti].position
		local pWbA = orj * (part.transform * edgeStartPos)
		table.insert(pathPoints, pWbA.x)
		table.insert(pathPoints, pWbA.y)	
		
		local edgeEndPos = part.partShape.data.points[edg.endi].position
		local pWbA = orj * (part.transform * edgeEndPos)
		table.insert(pathPoints, pWbA.x)
		table.insert(pathPoints, pWbA.y)
	end	
	
	local partBound = EzSVG.Polyline(pathPoints, {
		        fill="none",
		        stroke="black",
		        stroke_width=4
		    })
	group:add(partBound)
	
	local min ,max = orj * part.min , orj * part.max
	local mid =  (min + max) * Vec3(0.5,0.5,0.5)
	
	group:add(EzSVG.Text(F("%d",partIndexByPlate ) , mid.x - 30 , mid.y + 30 , {font_size="75px"}))
	
	for i , c in ipairs(part.geometry) do
		local T = part.transform * c.data.transform
		if (c.data:isCircle() == true) and isApproximatelyEqual( Vec3(0,0,1), T:getRotZ() ) then
			local center = orj * (part.transform * (c.data.transform * c.data:center()))
			local D = c.data:diameter()
			group:add(EzSVG.Circle(center.x,center.y,D*0.5))
		elseif (c.data:isCircle() == true) and (isApproximatelyEqual(Vec3(0,0,-1),T:getRotZ())) then
			local center = orj * (part.transform * (c.data.transform * c.data:center()))
			local D = c.data:diameter()
			group:add(EzSVG.Circle(center.x,center.y,D*0.5, {fill = "black",    
															stroke = "black",
    														stroke_width = 1,		
														    fill_opacity = "0"}))
		elseif (c.data:isCircle() == true) then
			local center = orj * (part.transform * (c.data.transform * c.data:center()))
			local depthCenter = orj * (part.transform * (c.data.transform * c.data:depthCenter()))
			local D  = c.data:diameter()
			group:add(EzSVG.Line(center.x,center.y,depthCenter.x,depthCenter.y, {fill= "black",stroke= "black",stroke_width = D}))
		end
	end
end
------------------------------------------------
--
function PPCLib.TextPrinttoPage(texttbl,page,pt,rotDeg,textHeight)
	for k, name in ipairs(texttbl) do
		stringLength = string.len(name)*(textHeight/2+(k-1)*0.7)
		subStrPt = Vec3(stringLength * -0.5, (textHeight * #texttbl * 0.5) - k * textHeight ,0   )
		subStrPt = rotateVecAroundZ( math.rad(rotDeg) ,subStrPt ) + pt
		page:restore()
		page:begin_text()
		page:set_font(times, textHeight)
		page:save()
		page:translate(subStrPt.x, subStrPt.y)
		page:rotate(math.rad(rotDeg))
		page:set_text_pos(0, 0)
		page:show(name)
		page:end_text()
		page:restore()
	end
end
------------------------------------------------
--
function PPCLib.CuttingPlanPDF(targetFolderPath,job)
	p = PDF.new()
	helv = p:new_font{ name = "Helvetica" }
	times = p:new_font{ name = "Times-Roman" }
	local plateCounter = 0
	for i, plates in ipairs(job.plates) do
		page = p:new_page()
		W = 612 - 20
		H = 792 -20 
		plateW = plates.nestedPlate.width
		plateH = plates.nestedPlate.height
		pageAspect = 612 / 792 -- < 1
		plateAspect = plateW / plateH
		local orj = Transform()
		if (plateAspect > 1) then

			page:begin_text()
			page:set_font(times, 10)
			page:set_text_pos(11, 783)
			page:show("Job No: " .. job.number .. " Material: " .. materialName .. " Plate: ".. plates.name .. " Dimensions: " .. plateW .. " x ".. plateH)
			page:end_text()
			
			local s1 = plates.nestedPlate.width / H
			local s2 = plates.nestedPlate.height / W
			local scaleOrj = 0
			if s2 < s1 then
				scaleOrj = 1 / s1
			else 
				scaleOrj = 1 / s2
			end
			
			orj.scale = Vec3(scaleOrj,scaleOrj,scaleOrj)
			orj.translation = Vec3(11,792 - 12 ,0)
			orj.rotation = computeMatrixHoldDir(Vec3(1,0,0),Vec3(0,0,1))
		else
			
			page:begin_text()
			page:set_font(times, 10)
			page:set_text_pos(11, 2)
			page:show("Job No: " .. job.number .. " Material: " .. materialName .. " Plate: ".. plates.name .. " Dimensions: " .. plateW .. " x ".. plateH)
			page:end_text()
			
			local s1 = plates.nestedPlate.width / W
			local s2 = plates.nestedPlate.height / H
			local scaleOrj = 0
			if s2 < s1 then
				scaleOrj = 1 / s1
			else 
				scaleOrj = 1 / s2
			end
			
			orj.scale = Vec3(scaleOrj,scaleOrj,scaleOrj)
			orj.translation = Vec3(11,12,0)
		end
		
		
		plateCounter = plateCounter+1
		local p1 = orj * Vec3(0,0,0)
		local p2 = orj * Vec3(plateW,plateH,0)
		page:moveto(p1.x, p1.y)
		page:lineto(p1.x, p2.y)
		page:lineto(p2.x, p2.y)
		page:lineto(p2.x, p1.y)
		page:lineto(p1.x, p1.y)
		page:setlinewidth(2)
		page:stroke()
		
		for j, part in ipairs(plates.nestedPlate.nestedParts) do
			local partp1 = orj * part.max
			local partp2 = orj * part.min
			local bufferOrj = Transform()
			bufferOrj.rotation = orj.rotation
			local partp1Buffer = bufferOrj * part.max
			local partp2Buffer = bufferOrj * part.min
			local partW =math.abs(partp1Buffer.x -partp2Buffer.x)
			local partH =math.abs(partp1Buffer.y -partp2Buffer.y)
			local midPointOfPart = (partp1 + partp2) * Vec3(0.5,0.5,0.5)
			local heightTextPos = midPointOfPart - Vec3( (partW * orj.scale.x * 0.5),0,0)
			local widthTextPos =midPointOfPart - Vec3( 0, (partH * orj.scale.y * 0.5),0) 
			local projectName = part.projectName
			local partName = part.name
			local modulePoseNo = part.modulePoseNo
			local dataPart = {projectName,partName,modulePoseNo}
			if partW < partH then
				PPCLib.TextPrinttoPage(dataPart,page,midPointOfPart,-90,4)
			else
				PPCLib.TextPrinttoPage(dataPart,page,midPointOfPart,0,4)
			end
			PPCLib.TextPrinttoPage({tostring(partW)},page,widthTextPos+Vec3(0,4,0),0,4)
			PPCLib.TextPrinttoPage({tostring(partH)},page,heightTextPos+Vec3(4,0,0),-90,4)
			page:moveto(partp1.x, partp1.y)
			page:lineto(partp1.x, partp2.y)
			page:lineto(partp2.x, partp2.y)
			page:lineto(partp2.x, partp1.y)
			page:lineto(partp1.x, partp1.y)
			page:setlinewidth(1)
			page:stroke()
		end
		page:add()
	end
	
	p:write(F([[%s/J%03d_%s_P%03d.pdf]],targetFolderPath,job.number,materialName,plateCounter))

	--local jobFolder = F([[%s/J%03d_%s/]],targetFolderPath,currentJob.number,materialName)
	--os.execute("mkdir " .. [["]] .. jobFolder ..[["]] )
	--for i, part in ipairs(currentJob.plates) do
	--	local optimizeEdilmisler = optimizeNestedParts(part.nestedPlate.nestedParts)
	--	for n, pt in ipairs(optimizeEdilmisler) do
	--		printLabelToFile( F([[%s%03d_%03d_%03.0f_%03.0f.png]],jobFolder,i,n,pt.basePoint.x,pt.basePoint.y), pt.part)
	--		print("x:" .. tostring(pt.basePoint.x) .. " y:" .. tostring(pt.basePoint.y) .. " z:" .. tostring(pt.basePoint.z) .. "\n" )
	--	end
	--end
	
	return "reporting success"
end
--------------------------------------------------------------------------------
--------------------------------EBATLAMALAR İÇİN PARÇADAN BİLGİ ÇEKME-----------
---part parametresi currentJob.parts listesinden birtanesidir
function PPCLib.getBandGrooves(part)
	local kbgN,kbgS,kbgE,kbgW = "","","",""
	local w = part.nestedPlate.width
	local h = part.nestedPlate.height
	local grooves = {}
	for i,v in ipairs(part.nestedPlate.nestedParts[1].geometry) do
		if (string.find(v.data.layerName , "_EBGROOVE") ~= nil)  then -- _EBGROOVE bantalama kanalı kural tanımından gelmektedir.
			table.insert(grooves, v)
		end
	end
	local pickedEdge = "" 
	local edgeDisN, edgeDisS, edgeDisW, edgeDisE = -1.0, -1.0, -1.0, -1.0
	local kanalGen = -1.0
	for	i,v in ipairs(grooves) do
		local gBBox = v.data:bounds()
		local gAbsBBox = ABox3d()
		gAbsBBox:extend(v.data.transform * gBBox:min())
		gAbsBBox:extend(v.data.transform * gBBox:max())
		local grooveCenter = gAbsBBox:center()
		local bufferSizes = gAbsBBox:sizes()
		distance = 10000000
		if (bufferSizes.x >= bufferSizes.y) then
			kanalGen = bufferSizes.y
			if math.abs(grooveCenter.y) < distance then
				distance = math.abs(grooveCenter.y)
				pickedEdge = "south"
				
			end
			if math.abs(h - grooveCenter.y) < distance then
				distance = math.abs(h - grooveCenter.y)
				pickedEdge = "north"
			end
		end
		
		if (bufferSizes.x < bufferSizes.y) then
			kanalGen = bufferSizes.x
			if math.abs(grooveCenter.x) < distance then
				distance = math.abs(grooveCenter.x)
				pickedEdge = "west"
			end
			if math.abs(grooveCenter.x - w) < distance then
				distance = math.abs(grooveCenter.x - w)
				pickedEdge = "east"
			end
		end
		if pickedEdge == "south" then
			kbgS = "KB KANALI="
			edgeDisS = gAbsBBox:max().y
		end
		if pickedEdge == "north" then
			kbgN = "KB KANALI="
			edgeDisN = h - gAbsBBox:min().y
		end
		if pickedEdge == "west" then
			kbgW = "KB KANALI="
			edgeDisW = gAbsBBox:max().x
		end
		if pickedEdge == "east" then
			kbgE = "KB KANALI="
			edgeDisE = w - gAbsBBox:min().x
		end
	end
	
	local edgeDisStringN, edgeDisStringE, edgeDisStringW, edgeDisStringS = "", "", "", ""
	if edgeDisS ~= -1 then
		edgeDisStringS = string.format("\n%.01f,%.01f",edgeDisS,kanalGen)
	end
	if edgeDisN ~= -1 then
		edgeDisStringN = string.format("\n%.01f,%.01f",edgeDisN,kanalGen)
	end
	if edgeDisW ~= -1 then
		edgeDisStringW = string.format("\n%.01f,%.01f",edgeDisW,kanalGen)
	end
	if edgeDisE ~= -1 then
		edgeDisStringE = string.format("\n%.01f,%.01f",edgeDisE,kanalGen)
	end
	
	part.nestedPlate.nestedParts[1]:addArbitraryStringField("CustomKeyEBGrooveN",kbgN .. edgeDisStringN)
	part.nestedPlate.nestedParts[1]:addArbitraryStringField("CustomKeyEBGrooveS",kbgS .. edgeDisStringS)
	part.nestedPlate.nestedParts[1]:addArbitraryStringField("CustomKeyEBGrooveW",kbgW .. edgeDisStringW)
	part.nestedPlate.nestedParts[1]:addArbitraryStringField("CustomKeyEBGrooveE",kbgE .. edgeDisStringE)
	return kbgN,kbgS,kbgW,kbgE
end
--------------------------------------------------------------------------------
-------------PARÇALARI EBATLARINA GÖRE SAYISINI YAZIP KLASÖRE KAYIT EDEN KOD ---
-- parça ölçülerine göre ve PanelTag ına göre gurplama yapar
function PPCLib.groupingByPartSizes()
	local partsByPartSizes = {}
	local PanelTags = 
	{
	  "TAC_",
	  "BAZA_",
		"CEKMECE",
		"KOSE_DOLAP_UST_PANEL",
		"KOSE_DOLAP_ALT_PANEL",
		"KOSE_DOLAP_HAREKETLI_RAF",
		"KOSE_DOLAP_SAG_KOSE_KAYIT",
		"KOSE_DOLAP_SOL_KOSE_KAYIT",
		"ALT_PANEL",
		"UST_PANEL",
		"HAREKETLI_RAF",
		"SABIT_RAF",
		"SAG_PANEL",
		"SOL_PANEL",
		"ARKALIK",
		"ON_YATAY_KAYIT",
		"ON_DIK_KAYIT",
		"UST_DIK_KAYIT",
		"UST_YATAY_KAYIT",
		"ALT_DIK_KAYIT",
		"KAPAK",
		"PANEL",
		"UZUN_SAG_YAN",
		"UZUN_SOL_YAN"
	}
	
	function findPartTag(pname,tags)
		local srt = ""
		for i,tag in ipairs(tags) do
			if pname:find(tag) then
				srt = tag
				break
			end
		end
		if srt == "" then srt = pname end
		return srt
	end

	function isExistPartListCheckBySize(partID,listOfParts)
		for	i,v in ipairs(listOfParts) do
			if isApproximatelyEqual(v[1][1] , partID[1]) and isApproximatelyEqual(v[1][2] , partID[2]) and (v[1][3] == partID[3]) then	
				return i
			end
		end
		return nil
	end

	for j, part in ipairs(currentJob.parts) do
		local ptag = findPartTag(part.nestedPlate.nestedParts[1].name,PanelTags)
		local pSizesAndTag =  {  part.nestedPlate.width , part.nestedPlate.height , ptag } -- part.nestedPlate.nestedParts[1].projectName .. part.nestedPlate.nestedParts[1].dxfFile
		local existingIndex = isExistPartListCheckBySize(pSizesAndTag, partsByPartSizes)
		if  existingIndex == nil then
			table.insert(partsByPartSizes, { pSizesAndTag , { {part,j} } })
		else
			table.insert(partsByPartSizes[existingIndex][2], {part,j} )
		end
	end

	return partsByPartSizes
end

-- ölçülerine göre gurplanmış parçaların csv sini çıkartır
function PPCLib.createGroupsCSV(jobFolder)
	local gparts = PPCLib.groupingByPartSizes()
	
	table.sort(gparts, 
		function(l,r) 
			local lid = string.format("%s%.02f%.02f",l[1][3],l[1][1],l[1][2])
			local rid = string.format("%s%.02f%.02f",r[1][3],r[1][1],r[1][2])
			return lid < rid 
		end)
	
	local csvContent = ""
	for i,gpart in ipairs(gparts) do
		csvContent = csvContent .. string.format("%s;%0.2f;%.02f;%d\n", gpart[1][3], gpart[1][1],gpart[1][2], #gpart[2])
	end
	
	local file = io.open(jobFolder .. "/EbatAdetleri.csv","w")
	file:write(csvContent)
	file:close()
	
end
--------------------------------------------------------------------------------
return PPCLib