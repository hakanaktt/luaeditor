
function edgebandInfoInterpreter(prefix,layername,thickness)
	local interpretedString = ""
	--edgeband label info type
	local eliType = 1 
	-- eliType == 1 ;    	thickness = 0.4 => "0.4", -- The thickness information is formatted as 1 digit after the point. 
	--						thickness = 0.8 => "0.8",
	--						thickness = 1.0 => "1.0",
	--						thickness = 2.0 => "2.0",
	-- eliType == 2 ;    	thickness = 0.4 => "4", --Thickness information is written as decimal.
	--						thickness = 0.8 => "8",
	--						thickness = 1.0 => "1",
	--						thickness = 2.0 => "2",
	-- eliType == 3 ;    	layername = LMM_PVC, thickness = 0.4  => "PVC,0.4", --The prefix is ​​extracted from the layer name and the thickness information is formatted as 1 digit after the point.   
	--						layername = LMM_PVC, thickness = 0.8  => "PVC,0.8",
	-- eliType == 4;		layername = LMM_PVC => "PVC" --The prefix is ​​extracted from the layer name and written
	
	if eliType == 1 then
		interpretedString = string.format("%.1f",thickness)
	end
	
	if eliType == 2 then
		local th = thickness
		if thickness < 1 then
			th = thickness * 10
		end
		local th,f=math.modf(th)
		interpretedString = string.format("%d",th)
	end
	
	if eliType == 3 then
		local temp = layername:gsub("LMM_","")
		temp = temp:gsub("LMM","")
		temp = temp:gsub(prefix,"")
		interpretedString = string.format("%s,%.1f",temp,thickness)
	end
	
	if eliType == 4 then
		local temp = layername:gsub("LMM_","")
		temp = temp:gsub("LMM","")
		temp = temp:gsub(prefix,"")
		interpretedString = string.format("%s",temp)
	end
	
	return interpretedString
end