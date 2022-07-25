const { createCanvas, registerFont } = require('canvas');
const { fstat } = require('fs');
const Astronomy = require('./chart/astronomy.js');
const Layout = require('./chart/layout.js');
const Common = require('./chart/common.js');
const Glyphs = require('./chart/glyphs.js');
const fs = require('fs');

const QUAD_COLOR = "#ff0"
const STAR_COLOR = "#0ff"
const ORBIT_COLOR = "#f0f"
const PLANET_COLOR = "#f00"
const TEXT_COLOR = "#f0f"


registerFont('HamburgSymbols.ttf', { family: 'symbol' })

let maxMag = 6



exports.drawZodiac = function (ctx) {

    const constellations = fs.readFileSync("./chart/constellations.lines.json")
    const json_constellations = JSON.parse(constellations)

    let zodiacAngles = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

    for (var i = 0; i < json_constellations.features.length; i++) {
        var name = json_constellations.features[i].id;
        var index = Layout.zodiac.indexOf(name)
        if (index > -1) {
            var lines = json_constellations.features[i].geometry.coordinates

            var centroid = [0, 0]
            var n = 0

            for (var k = 0; k < lines.length; k++) {
                var coord = json_constellations.features[i].geometry.coordinates[k]
                var linePoints = []
                for (var j = 0; j < coord.length; j++) {
                    var p = Common.EllipticFromCelestialLonLat(coord[j][0], coord[j][1])
                    centroid[0] += p[0]
                    centroid[1] += p[1]
                    linePoints.push(p)
                    n++
                }

                ctx = Layout.drawLineFromPoints(ctx, linePoints, STAR_COLOR)
            }
            zodiacAngles[index] = Common.getAngle([centroid[0] / n, centroid[1] / n])
        }
    }
    return zodiacAngles
}

exports.drawStars = function(ctx) {
    const stars_json = JSON.parse(fs.readFileSync("./chart/stars.6.json"))

    for (var i = 0; i < stars_json.features.length; i++) {
        var lonLat = stars_json.features[i].geometry.coordinates
        var mag = parseFloat(stars_json.features[i].properties.mag);

        if (mag > maxMag)
            continue;

        r = Math.pow(maxMag - mag, 0.5);
        coord = Common.EllipticFromCelestialLonLat(lonLat[0], lonLat[1])
        ctx.beginPath();
        ctx.arc(coord[0], coord[1], r, 0, 2 * Math.PI);
        ctx.fill()
    }
}

exports.render = function (ctx) {

    ctx.fillStyle = "black"

    // _Observer = new Astronomy.Observer(33.884, -117.933, 0);
    _Observer = new Astronomy.Observer(33.884, -117.933, 0);
    _Time = new Date((Date.now() - 1656189614984) * 50000)
    _Time = new Date()

    const zodiacAngles = this.drawZodiac(ctx)
    
    ctx = Layout.printRings(ctx, zodiacAngles, 100, 100, 1)
    const glyphRadius = 120

    for (let i = 0; i < zodiacAngles.length; i++) {
        var p0 = Common.fromRadial(zodiacAngles[i], glyphRadius)
        Layout.drawGlyph(ctx, Layout.symbolFromZodiacMap[i], p0[0], p0[1], zodiacAngles[i])
    }

    this.drawStars(ctx)
   
    // ------------- PLANETS --------------------------
    var planetLocations = {}

    for (let body of Layout.planetNames) {
        let equ_2000 = Astronomy.Equator(body, _Time, _Observer, false, true);
        let equ_ofdate = Astronomy.Equator(body, _Time, _Observer, true, true);
        coord = Common.EllipticFromCelestialHour(equ_ofdate.ra, equ_ofdate.dec)
        ctx = Layout.drawPlanet(ctx, coord)
        planetLocations[body] = coord
    }
    const Rotation_HOR_EQJ = Astronomy.Rotation_HOR_EQJ(_Time, _Observer);

    // todo labels
    const planetRad = 200
    labels = Layout.layoutPlanetLabels(planetLocations, planetRad)

    for (var i = 0; i < Layout.planetNames.length; i++) {

        var name = Layout.planetNames[i]
        var location = labels[name]
        var planetLocation = planetLocations[name]

        var angle = Common.getAngle(location)
        // if ( name == "Moon") {
        // //  0 = new moon // 90 = first quarter // 180 = full moon // 270 = third quarter
        //     var phase = Astronomy.MoonPhase(_Time);

        //     createMoonPath(chart, phase).move(location[0],location[1]).rotate(angle * rad2deg ).scale(3).stroke({ color: PLANET_COLOR, width:0.3})
        //     // chart.circle(40).cx(location[0]).cy(location[1]).stroke(PLANET_COLOR).fill("none")
        //     var moonText = fromRadial(angle+ 0.04, 600)
        //     var pct = 100 * (1 - (Math.abs(phase - 180) / 180))
        //     var waxing = phase < 180 ? "+" : "-"
        //     // printTextAngle(chart, pct.toFixed(0) + "# " + waxing, moonText[0], moonText[1], 0.6)


        // } else {

        // toto: use this https://www.wfonts.com/font/hamburgsymbols#google_vignette
        
        Layout.drawGlyph(ctx, Layout.symbolFromPlanetMap[i], location[0], location[1], angle)

        // chart.text( getPlanetInfo([planetNames[i]])).cx().cy(pos3[1]).scale(1).rotate(angle * rad2deg ).fill(TEXT_COLOR)
        var textPos = Common.setDistance(location, Common.getDistance(location) + 30);

        // printTextAngle(chart, getPlanetInfo([planetNames[i]]), textPos[0], textPos[1])

    }

    function transfromHorizToScreen(horiz) {
        var horizVector = Astronomy.VectorFromHorizon(horiz, _Time);
        var EQJ = Astronomy.RotateVector(Rotation_HOR_EQJ, horizVector);
        var EQJ2000 = Astronomy.EquatorFromVector(EQJ, _Time, null)
        return Common.EllipticFromCelestialHour(EQJ2000.ra, EQJ2000.dec)
    }

    let eclipticRadius = 0.9 * 620 / 2

    // HORIZON

    /// find intersection
    var lastRad = 0
    var accPos = 0
    var decPos = 0
    for (var i = 0; i < 361; i++) {
        const horiz = new Astronomy.Spherical(0, i, 100.0);                   /* any positive distance value will work fine. */
        coord = transfromHorizToScreen(horiz)

        var rad = Common.getDistance(coord);

        if (rad > eclipticRadius && lastRad < eclipticRadius) {
            accPos = coord
        }

        if (rad < eclipticRadius && lastRad > eclipticRadius) {
            decPos = coord
        }

        lastRad = rad;
    }


    // graw horizon rings
    ringWidths= [0,1,5,10,20,30,50]
    for (var j = 0; j < 2; j++) {
        var horizonPoints = []

        for (var i = 0; i < 361; i++) {
            const horiz = new Astronomy.Spherical(ringWidths[j], i, 100.0);                   /* any positive distance value will work fine. */
            coord = transfromHorizToScreen(horiz)
            horizonPoints.push(coord)
        }
        dashstyle =  [1,1]
        dashstyle = []
        ctx = Layout.drawLineFromPoints(ctx, horizonPoints, "#222",dashstyle)
    }

    northpole = Common.EllipticFromCelestialLonLat(0, 90)

    // ctx = Layout.drawLine(ctx, accPos[0], accPos[1], northpole[0], northpole[1])
    // ctx = Layout.drawLine(ctx, decPos[0], decPos[1], northpole[0], northpole[1])


    ctx = Layout.drawCircle(ctx, northpole[0], northpole[1], 10)

    ctx = Layout.drawCircle(ctx, Layout.center[0], Layout.center[1], 45)


    return ctx
};