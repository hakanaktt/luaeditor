-- ADekoCAM, Custom part name categorizer for part label
-- System variables known within this script: "rowName"

function extractAdekoProjectNameMain()
  local variables = ADekoLib.split(tostring(rowName), "-")
  return variables[1]
end