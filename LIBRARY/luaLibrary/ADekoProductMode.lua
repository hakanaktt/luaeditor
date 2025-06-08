X = 500
Y = 700
Z = 500
modelParameters = ""
bodyMaterialThickness = 18
doorMaterialThickness = 18
bodyMaterial = "Mat Beyaz MDF"
doorMaterial = "Kestane Orma"
edge1layer="LMM0"
edge2layer="LMM1"
edge3layer="LMM2"
edge4layer="LMM3"
edge1thickness=0
edge2thickness=0
edge3thickness=0
edge4thickness=0
doesSizeIncludeEdgeThickness = "false"
ADekoLib = require("ADekoLib")
require("turtle")
offset = 20
pnsz(2)

-- left face
--pnsz(1) pncl(colr(219, 219, 48))
zero(20+offset, offset)
crcl(0, 0, 2) crcl(0, 0, 3) crcl(0, 0, 4)
move(Y) turn(90) move(bodyMaterialThickness) turn(90) move(Y) turn(90) move(bodyMaterialThickness) turn(90)
text("Left", 90, -20, bodyMaterialThickness)

-- rear face
--pnsz(1) pncl(colr(48, 106, 208))
zero(20+offset, 2*offset+bodyMaterialThickness)
crcl(0, 0, 2) crcl(0, 0, 3) crcl(0, 0, 4)
move(X) turn(90) move(bodyMaterialThickness) turn(90) move(X) turn(90) move(bodyMaterialThickness) turn(90)
text("Rear", 90, -20, bodyMaterialThickness)

-- front face
--pnsz(1) pncl(colr(208, 48, 174))
zero(20+3*offset+X+bodyMaterialThickness, 3*offset+2*bodyMaterialThickness)
crcl(0, 0, 2) crcl(0, 0, 3) crcl(0, 0, 4)
move(bodyMaterialThickness) turn(90) move(X) turn(90) move(bodyMaterialThickness) turn(90) move(X) turn(90)
text("Front", 0, 0, X+offset/2)

-- right face
--pnsz(1) pncl(colr(208, 106, 48))
zero(20+2*offset+X, 3*offset+2*bodyMaterialThickness)
crcl(0, 0, 2) crcl(0, 0, 3) crcl(0, 0, 4)
move(bodyMaterialThickness) turn(90) move(Y) turn(90) move(bodyMaterialThickness) turn(90) move(Y) turn(90)
text("Right", 0, offset/2, Y+offset/2)

-- top face
zero(20+offset, 3*offset+2*bodyMaterialThickness)
crcl(0, 0, 2) crcl(0, 0, 3) crcl(0, 0, 4)
move(X) turn(90) move(Y) turn(90) move(X) turn(90) move(Y) turn(90)
text("Top", 90, -20, Y+offset/2)

--bottom face
zero(20+4*offset+X+2*bodyMaterialThickness, 3*offset+2*bodyMaterialThickness)
crcl(0, 0, 2) crcl(0, 0, 3) crcl(0, 0, 4)
move(X) turn(90) move(Y) turn(90) move(X) turn(90) move(Y) turn(90)
text("Bottom", 0, 0, Y+offset/2)

pnsz(1)
pncl(colr(0, 0, 255))
ADekoLib.start()
ADekoLib.showPoints(false)
ADekoLib.enableListing(false)
ADekoLib.startProduct()
productMain()
ADekoLib.finish()
ADekoLib.finishProduct()
wait()