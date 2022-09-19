
const { r } = require('tar');
const Common = require('./common.js');
const Glyphs = require('./glyphs.js');
require('canvas-5-polyfill')

exports.width = 800
exports.height = 480
exports.scale = 110
exports.center = [450, 240]
exports.planetRadius = 13

exports.planetSymbols = ["☉", "☽", "☿", "♀", "♂", "♃", "♄", "⛢", "♆", "♇"]
exports.planetNames = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']
exports.zodiac = ["Ari", "Tau", "Gem", "Cnc", "Leo", "Vir", "Lib", "Sco", "Sgr", "Cap", "Aqr", "Psc"]
exports.symbols = ["♈︎", "♉︎", "♊︎", "♋︎", "♌︎", "♍︎", "♎︎", "♏︎", "♐︎", "♑︎", "♒︎", "♓︎"]
exports.symbolFromZodiacMap = ["a", "s", "d", "f", "g", "h", "j", "k", "l", "z", "x", "c"]
exports.symbolFromPlanetMap = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"]
// elements = ["🜃", " 🜂", "🜃", "🜄",  " 🜂", "🜁", "🜁", "🜄", "🜁", " 🜂", "🜄", "🜃"]

exports.layoutPlanetLabels = function (positions, distance, c) {

    let newPositions = {}

    // move to fixed radius
    let angles = {}
    for (var i = 0; i < this.planetNames.length; i++) {
        angles[this.planetNames[i]] = Common.getAngle(positions[this.planetNames[i]], c)

    }

    for (var k = 0; k < 10; k++) {
        for (var i = 0; i < this.planetNames.length; i++) {
            for (var j = 0; j < this.planetNames.length; j++) {
                var dist = Math.abs(angles[this.planetNames[i]] - angles[this.planetNames[j]])
                if (i != j && dist < 0.15) {

                    var ai = angles[this.planetNames[i]];
                    var aj = angles[this.planetNames[j]];

                    var delta = Math.sign(ai - aj) * 0.005;

                    angles[this.planetNames[i]] += delta;
                    angles[this.planetNames[j]] -= delta;
                }
            }
        }
    }

    for (var i = 0; i < this.planetNames.length; i++) {
        newPositions[this.planetNames[i]] = Common.fromRadial(angles[this.planetNames[i]], distance, c)
    }

    return newPositions
}

exports.bisectAngles = function (angles) {

    var centers = []
    for (var i = 0; i < angles.length; i++) {
        var a0 = angles[i];
        var a1 = angles[(i + 1) % 12];
        var mina = Math.min(a0, a1)
        var maxa = Math.max(a0, a1)
        if (maxa - mina > Math.PI) {
            mina += Math.PI * 2
        }
        centers.push((mina + maxa) / 2)
    }
    return centers
}


exports.printText = function (chart, str, x, y) {
    var width = 15
    var orig = [x, y]
    for (var i = 0; i < str.length; i++) {
        var p = fontGlyphs[str[i]]
        var yoff = getGlyphOffset(str[i])
        if (p != null) {
            chart.path(p).move(x, y + yoff).stroke("#fff").fill("none")
        }

        x += getGlyphWidth(str[i])
    }
}

exports.printTextAngle = function (chart, str, x, y, scale = 1) {
    var angle = getAngle([x, y])
    var rad = getDistance([x, y])

    for (var i = 0; i < str.length; i++) {
        var pathData = fontGlyphs[str[i]]

        if (pathData == null) {
            rad += 20
            continue;
        }

        var yoff = GetHeightOffset(str[i])
        var angleOffset = yoff * 0.000001 * rad;
        var pathstring = ""
        rad += getGlyphWidth(str[i]) / 2
        var pos = Common.fromRadial(angle + angleOffset, rad)

        for (var j = 0; j < pathData.length; j += 3) {
            pathstring += pathData[j] + " " + pathData[j + 1] + " " + (pathData[j + 2]).toFixed(0) + " "
        }
        chart.path(pathstring).cx(pos[0]).cy(pos[1]).stroke("#0f0").fill("none").rotate(angle * rad2deg).scale(scale)
        rad += getGlyphWidth(str[i]) / 2 * scale
    }
}

exports.printTextRadial = function (chart, str, rad, angle, scale = 0.6) {

    for (var i = 0; i < str.length; i++) {
        var pathData = fontGlyphs[str[i]]

        if (pathData == null) {
            angle += 0.01
            continue;
        }

        var rOff = scale * GetRadiusOffset(str[i])
        var pathstring = ""
        var angleScale = scale / rad
        angle += angleScale * getGlyphWidth(str[i]) / 2

        var pos = Common.fromRadial(angle, rad + rOff)

        for (var j = 0; j < pathData.length; j += 3) {
            pathstring += pathData[j] + " " + pathData[j + 1] + " " + (pathData[j + 2]) + " "
        }

        chart.path(pathstring).cx(pos[0]).cy(pos[1]).stroke("#0f0").fill("none").rotate(angle * rad2deg + 90).scale(scale)
        angle += angleScale * getGlyphWidth(str[i]) / 2
    }
}

exports.drawLine = function (ctx, x0, y0, x1, y1) {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    return ctx
}

exports.drawLineFromPoints = function (ctx, points, color, dash = []) {
    lastPoint = points[0]
    ctx.setLineDash(dash);

    for (var i = 1; i < points.length; i++) {
        var point = points[i]

        if ( Common.distance(lastPoint, point) > 600 ) {
            lastPoint = point
            continue
        }

        ctx.beginPath();
        ctx.strokeColor = color
        ctx.moveTo(lastPoint[0], lastPoint[1]);
        ctx.lineTo(point[0], point[1]);
        ctx.stroke();
        lastPoint = point
    }
    ctx.setLineDash([]);
    return ctx
}


exports.printRing = function (ctx, names, angles, radius, length, color, textsize) {
    ctx.circle(radius).cx(center[0]).cy(center[1]).stroke(color).fill("none")
    ctx.circle(radius + length * 2).cx(center[0]).cy(center[1]).stroke(color).fill("none")

    var centers = this.bisectAngles(angles);

    for (let i = 0; i < angles.length; i++) {
        const angle = angles[i];

        var p0 = Common.fromRadial(angle, radius / 2 + length / 2)
        ctx.text(names[i]).cx(p0[0]).cy(p0[1]).scale(textsize).rotate(angle * rad2deg + 90).fill("none").stroke({ color: color, width: 0.3 })
    }

    for (let i = 0; i < centers.length; i++) {
        const angle = centers[i];

        var p0 = Common.fromRadial(angle, radius / 2)
        var p1 = Common.fromRadial(angle, radius / 2 + length)

        ctx.line(p0[0], p0[1], p1[0], p1[1]).stroke(color)

    }
    return ctx
}

exports.setPixel = function (ctx, x, y) {
    ctx.beginPath();
    ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
    return ctx;
}

const deg2Rad = Math.PI / 180;

exports.drawCircle = function (ctx, x, y, radius, skip = 1) {
    if (skip == 0) {
        skip = 1
    }

    for (i = 0; i < 360; i += skip) {
        this.setPixel(ctx, x + Math.cos(i * deg2Rad) * radius, y + Math.sin(i * deg2Rad) * radius)
    }

    return ctx;
}

exports.drawPath = function(ctx, path, pos, scale, rotate ) {
    offset = [8, 8]
    var p = new Path2D(path)
    ctx.save()
    ctx.lineWidth = ctx.lineWidth
    ctx.scale(scale,scale)
    ctx.translate(pos[0] / scale, pos[1] / scale )
    ctx.rotate(rotate+Math.PI/2)
    // ctx.translate(-offset[0]/scale, -offset[1]/scale)
    ctx.translate(-offset[0]/scale, -offset[1]/scale)
    ctx.stroke(p);
    ctx.restore();
    return ctx
}

exports.drawGlyph = function (ctx, str, x, y, angle, size = 30) {
    ctx.save();
    ctx.font = size.toString() + 'px symbol';
    let text = ctx.measureText(str);
    ctx.translate(x, y)
    ctx.rotate(angle + 90 * deg2Rad)
    ctx.translate(-text.width/2, 0)
    ctx.fillText(str, 0,0)
    ctx.restore();
}

exports.printRings = function (ctx, angles, radius, length, skip=0) {

    this.drawCircle(ctx, this.center[0], this.center[1], radius, skip)
    this.drawCircle(ctx, this.center[0], this.center[1], radius+length, skip)

    // ctx.arc(this.center[0], this.center[1], radius + length * 2, 0, Math.PI * 2)

    var centers = this.bisectAngles(angles);

    for (let i = 0; i < centers.length; i++) {
        const angle = centers[i];

        var p0 = Common.fromRadial(angle, radius )
        var p1 = Common.fromRadial(angle, radius  + length)

        if (skip>0) {
            ctx.setLineDash([skip,skip])
        }
        this.drawLine(ctx, p0[0], p0[1], p1[0], p1[1], 1)
        ctx.setLineDash([])

    }
    return ctx
}
exports.drawPlanet = function (ctx, coord) {
    
    this.drawCircle(ctx, coord[0], coord[1], this.planetRadius, 1)
    this.drawCircle(ctx, coord[0], coord[1], this.planetRadius-5, 1)
    this.drawCircle(ctx, coord[0], coord[1], this.planetRadius-4, 1)
    this.drawCircle(ctx, coord[0], coord[1], 2, 1)
    this.drawCircle(ctx, coord[0], coord[1], 3, 1)
    return ctx
}

exports.containsPair = function (arr, a, b) {
    for (let i = 0; i < arr.length; i++) {
        const element = arr[i];
        if ((element[0] == a && element[1] == b) ||
            (element[1] == a && element[0] == b))
            return true;
    }
    return false;
}


exports.findAspects = function (positions, thresh, target) {
    conj = []

    // move to fixed radius
    let angles = {}
    for (var i = 0; i < planetNames.length; i++) {
        angles[planetNames[i]] = getAngle(positions[planetNames[i]])
        if (angles[planetNames[i]] < 0)
            angles[planetNames[i]] += Math.PI * 2
    }

    for (var i = 0; i < planetNames.length; i++) {
        for (var j = 0; j < planetNames.length; j++) {
            var a0 = angles[planetNames[i]];
            var a1 = angles[planetNames[j]]
            var mina = Math.min(a0, a1)
            var maxa = Math.max(a0, a1)
            if (i != j && abs((maxa - mina) - target) < thresh) {
                if (!containsPair(conj, planetNames[i], planetNames[j]))
                    conj.push([planetNames[i], planetNames[j]])
            }
        }
    }

    return conj;
}

exports.createPorphyryHouses = function (asc_Point, mc_Point, dsc_Point, ic_Point, center) {
    var a0 = getAngle(asc_Point, center)
    var a1 = getAngle(mc_Point, center)
    var a2 = getAngle(dsc_Point, center)
    var a3 = getAngle(ic_Point, center)
    markers = [a0, a1, a2, a3]
    console.log(markers)
    markers.sort(function (a, b) {
        return (+a) - (+b);
    });

    var houses = [
        markers[0],
        markers[0] * 0.666 + markers[1] * 0.333,
        markers[0] * 0.333 + markers[1] * 0.666,
        markers[1],
        markers[1] * 0.666 + markers[2] * 0.333,
        markers[1] * 0.333 + markers[2] * 0.666,
        markers[2],
        markers[2] * 0.666 + markers[3] * 0.333,
        markers[2] * 0.333 + markers[3] * 0.666,
        markers[3],
        markers[3] * 0.666 + (markers[0] + Math.PI * 2) * 0.333,
        markers[3] * 0.333 + (markers[0] + Math.PI * 2) * 0.666
    ]

    var ACIndex = houses.indexOf(a0)
    // rotate so Asc is 0 
    houses = houses.slice(ACIndex, houses.length).concat(houses.slice(0, ACIndex));

    for (let i = 0; i < houses.length; i++) {
        while (houses[i] < 0) {
            houses[i] += Math.PI * 2
        }
    }
    return houses
}

exports.drawAspectSymbol = function (chart, type, x, y) {
    let scale = 20
    if (type == "opp") {
        chart.line(x, y + scale, x + scale, y).stroke("#0ff");
        chart.circle(scale / 3).cx(x).cy(y + scale).stroke("#0ff");
        chart.circle(scale / 3).cx(x + scale).cy(y).stroke("#0ff");
    } else if (type == "con") {
        chart.line(x, y, x + scale, y + scale).stroke("#0ff");
        chart.circle(scale / 3).cx(x).cy(y).stroke("#0ff");
    } else if (type == "squ") {
        chart.rect(scale, scale).cx(x).cy(y).stroke("#0ff");
    } else if (type == "tri") {
        chart.path("M 8.66 0 L 17.3 15 L 0 15 L 8.66 0").cx(x).cy(y).stroke("#0ff").fill("none");
    } else if (type == "sex") {
        chart.path("M 8.66 0 L 8.66 20 M 17.3 5 L 0 15 M 17.3 15 L 0 5 Z").cx(x).cy(y).stroke("#0ff").fill("none");
    }
}

exports.drawAspectLines = function (chart, aspects, planetLocations) {
    if (aspects == null)
        return
    var offs = 0;
    for (var i = 0; i < aspects.length; i++) {
        line = [planetLocations[aspects[i][0]], planetLocations[aspects[i][1]]]
        console.log(line)
        var l = trimLine(line, 0.9)
        chart.line(l[0][0] + offs, l[0][1] + offs, l[1][0] + offs, l[1][1] + offs).stroke({ color: '#ff0' })
    }
}


exports.getHouse = function (planetAngle, houseAngles) {
    // enforcing that all angles are 0 - 2pi
    if (planetAngle < 0) {
        planetAngle += Math.PI * 2
    }


    for (let i = 0; i < houseAngles.length; i++) {
        var housenum = 12 - i

        var a0 = houseAngles[i];
        var a1 = houseAngles[(i + 1) % 12];

        // we got a wrap here
        if (a1 < a0) {
            a1 += Math.PI * 2
        }

        if (planetAngle > a0 && planetAngle < a1) {
            console.log("house", housenum)
            let deg = 30 * ((planetAngle - a0) / (a1 - a0))
            return [housenum, deg];
        }
    }

    return [-1, -1]
}

var lineHeight = 45

exports.drawAspectTable = function (chart, aspects, type, y, x) {
    /// Draw text infos

    if (aspects == null)
        return y

    var currentx = x
    if (aspects.length > 0)
        y += lineHeight

    for (var i = 0; i < aspects.length; i++) {
        var currentx = x

        y += lineHeight
        drawAspectSymbol(chart, type, currentx, y);
        currentx += 40
        chart.path(planetGlyph[planetNames.indexOf(aspects[i][0])]).move(currentx, y).fill("none").stroke({ color: PLANET_COLOR, width: 0.3 }).scale(3);
        currentx += 30
        chart.path(planetGlyph[planetNames.indexOf(aspects[i][1])]).move(currentx, y).fill("none").stroke({ color: PLANET_COLOR, width: 0.3 }).scale(3);
    }

    return y
}

exports.doAllAspects = function (chart, planetLocations) {

    var y = 400
    var x = 100

    printText(chart, "aspects", x, y)

    var conjunctions = findAspects(planetLocations, deg2rad * 10, 0)
    drawAspectLines(chart, conjunctions, planetLocations)
    y = drawAspectTable(chart, conjunctions, "con", y, x)

    var oppositions = findAspects(planetLocations, deg2rad * 10, deg2rad * 180)
    drawAspectLines(chart, oppositions, planetLocations)
    y = drawAspectTable(chart, oppositions, "opp", y, x)

    var trines = findAspects(planetLocations, deg2rad * 7.5, deg2rad * 120)
    drawAspectLines(chart, trines, planetLocations)
    y = drawAspectTable(chart, trines, "tri", y, x)

    var squares = findAspects(planetLocations, deg2rad * 7.5, deg2rad * 90)
    drawAspectLines(chart, squares, planetLocations)
    y = drawAspectTable(chart, squares, "squ", y, x)

    var sextile = findAspects(planetLocations, deg2rad * 7.5, deg2rad * 30)
    drawAspectLines(chart, sextile, planetLocations)
    y = drawAspectTable(chart, sextile, "sex", y, x)

}

exports.basicMoonPath = function (r, reverse, flipx) {

    var direction = reverse ? "0" : "1"
    var arc = flipx ? "0" : "1"
    var moonPath = "M 5 0 A 5,5 0 0," + arc + " 5,10 "
    moonPath += "M 5 -1 A 5.5,5.5 0 0,0 5,11 "
    moonPath += "M 5,11 A 5.5,5.5 0 0,0 5,-1 "

    if (flipx) {
        moonPath += "M 5,0 A " + r.toFixed(0) + "," + r.toFixed(0) + " 0 0," + direction + " 5,10 "

    } else {
        moonPath += "M 5,0 A " + r.toFixed(0) + "," + r.toFixed(0) + " 0 0," + direction + " 5,10 "

    }

    return moonPath;

}

exports.createMoonPath = function (i) {
    var phase = i / 90

    var pInt = Math.floor(phase)
    var pFrac = phase - pInt;

    if (pInt == 0) {
        var r = Math.max(Math.min(5 / ((1 - pFrac) + 0.001), 500), -500)
        return this.basicMoonPath(r, true, true)
    }
    if (pInt == 1) {
        var r = Math.max(Math.min(5 / (pFrac + 0.001), 500), -500)
        return this.basicMoonPath(r, false, true)
    }
    if (pInt == 2) {
        var r = Math.max(Math.min(5 / ((1 - pFrac) + 0.001), 500), -500)
        return this.basicMoonPath(r, true, false)
    }
    if (pInt == 3) {
        var r = Math.max(Math.min(5 / (pFrac + 0.001), 500), -500)
        return this.basicMoonPath(r, false, false)
    }
}
