X = 500  -- en
Y = 700  -- boy/yükseklik
modelParameters = ""
materialThickness = 18
offset = 20
edge1layer="LMM0"
edge2layer="LMM1"
edge3layer="LMM2"
edge4layer="LMM3"
edge1thickness=0.1
edge2thickness=0.2
edge3thickness=0.3
edge4thickness=0.4
doesSizeIncludeEdgeThickness = "false"
ADekoLib = require("ADekoLib")
require("turtle")
pnsz(2)

-- left face
zero(20+offset, offset)
crcl(0, 0, 2) crcl(0, 0, 3) crcl(0, 0, 4)
move(Y) turn(90) move(materialThickness) turn(90) move(Y) turn(90) move(materialThickness) turn(90)
text("Left", 90, -20, materialThickness)

-- rear face
zero(20+offset, 2*offset+materialThickness)
crcl(0, 0, 2) crcl(0, 0, 3) crcl(0, 0, 4)
move(X) turn(90) move(materialThickness) turn(90) move(X) turn(90) move(materialThickness) turn(90)
text("Rear", 90, -20, materialThickness)

-- front face
zero(20+3*offset+X+materialThickness, 3*offset+2*materialThickness)
crcl(0, 0, 2) crcl(0, 0, 3) crcl(0, 0, 4)
move(materialThickness) turn(90) move(X) turn(90) move(materialThickness) turn(90) move(X) turn(90)
text("Front", 0, 0, X+offset/2)

-- right face
zero(20+2*offset+X, 3*offset+2*materialThickness)
crcl(0, 0, 2) crcl(0, 0, 3) crcl(0, 0, 4)
move(materialThickness) turn(90) move(Y) turn(90) move(materialThickness) turn(90) move(Y) turn(90)
text("Right", 0, offset/2, Y+offset/2)

-- top face
zero(20+offset, 3*offset+2*materialThickness)
crcl(0, 0, 2) crcl(0, 0, 3) crcl(0, 0, 4)
move(X) turn(90) move(Y) turn(90) move(X) turn(90) move(Y) turn(90)
text("Top", 90, -20, Y+offset/2)

--bottom face
zero(20+4*offset+X+2*materialThickness, 3*offset+2*materialThickness)
crcl(0, 0, 2) crcl(0, 0, 3) crcl(0, 0, 4)
move(X) turn(90) move(Y) turn(90) move(X) turn(90) move(Y) turn(90)
text("Bottom", 0, 0, Y+offset/2)

pnsz(1) pncl(colr(0, 0, 255))
ADekoLib.start()
ADekoLib.showPoints(true)
ADekoLib.enableListing(true)
modelMain()
ADekoLib.finish()
wait()