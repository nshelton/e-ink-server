
const Astronomy = require('./astronomy.js');
const Layout = require('./layout.js');

const Rotation_EQJ_ECL = Astronomy.Rotation_EQJ_ECL();

exports.jitter = function (line, amount) {
    return [
        [line[0][0] + Math.random() * amount, line[0][1] + Math.random() * amount],
        [line[1][0] + Math.random() * amount, line[1][1] + Math.random() * amount] ]
}

exports.trimLine = function (line, a) {
    p0 = [ line[0][0] * a + line[1][0] * (1 - a), 
            line[0][1] * a + line[1][1] * (1 - a)]
    p1 = [ line[1][0] * a + line[0][0] * (1 - a), 
            line[1][1] * a + line[0][1] * (1 - a)]
    return [p0,p1]
}

exports.length = function (p) {
    return Math.sqrt(p[0] * p[0] + p[1] * p[1])
}

exports.distance = function (p1,p2) {
    var dx =  p1[0] - p2[0]
    var dy =  p1[1] - p2[1]
    return this.length([dx,dy])
}

exports.setDistance = function (p, rad, c = Layout.center) {
    var _cx = (p[0] - c[0])
    var _cy = (p[1] - c[1])

    var angle = Math.atan2(_cy, _cx)
    
    var result = [0,0]
    result[0] = rad * Math.cos(angle) + c[0];
    result[1] = rad * Math.sin(angle) + c[1];
    return result;
}

exports.getDistance = function (p, c = Layout.center) {
    var _cx = (p[0] - c[0])
    var _cy = (p[1] - c[1])
   return this.length([_cx, _cy])
}

exports.getAngle = function (p, c = Layout.center) {
    var _cx = (p[0] - c[0])
    var _cy = (p[1] - c[1])
    var angle = Math.atan2(_cy, _cx)
    return angle;
}

exports.fromRadial = function (theta, rad, c = Layout.center) {
    var result = [0,0]
    result[0] = rad * Math.cos(theta) + c[0];
    result[1] = rad * Math.sin(theta) + c[1];
    return result;
}

/////////////////////transforms

exports.transform = function (hor) {
    return [
        1000 * (hor.azimuth) / 200,
        1000 * (hor.altitude + 90 )/180 ]
}

exports.transformDegreesCelestialToEarth = function (p) {
    p[0] *= 24/360 //convert degrees to hours
    // p[1] *= 0.5
    let hor = Astronomy.Horizon(_Time, _Observer, p[0], p[1], "normal")
    return transform(hor);
}

exports.transformHourCelestialToEarth = function (p) {
    let hor = Astronomy.Horizon(_Time, _Observer, p[0], p[1], "normal")
    return transform(hor);
}

// exports.fransformEQJtoELI = function (horiz) {
//     var horizVector =  Astronomy.VectorFromHorizon(horiz, _Time);
//     var EQJ  = Astronomy.RotateVector(Rotation_HOR_EQJ, horizVector);
//     var EQJ2000 = Astronomy.EquatorFromVector(EQJ, _Time, null)
//     return fromCelestialHour(EQJ2000.ra, EQJ2000.dec)
// }

exports.EllipticFromCelestialHour = function (ra, dec) {
    return this.EllipticFromCelestialLonLat(ra * 360/24, dec)
}

exports.EllipticFromCelestialLonLat = function (lon, lat) {
    //spherical takes lat lon
    const lonlat = new Astronomy.Spherical(lat, lon, 100.0);                 
    var sph =  Astronomy.VectorFromSphere(lonlat, _Time);
    var ECLvec  = Astronomy.RotateVector(Rotation_EQJ_ECL, sph);
    var ECL2000 = Astronomy.EquatorFromVector(ECLvec)
    return this.fromCelestialHour(ECL2000.ra, ECL2000.dec)

    // this is for equiangular
    // return  [ (ECL2000.ra/24) * Layout.width, ((ECL2000.dec+90) /180) * Layout.height]
}

let polar = true
exports.fromCelestialLonLat = function (lon, lat) {
    // wrap
    if ( lon> 180) 
        lon -= 360

    if(polar) {
        var lambda = lon * Math.PI / 180;
        var phi = lat * Math.PI / 180;
    
        var rho = Math.PI/2 - phi
        var theta = lambda;
    
        return [
            Layout.scale * rho * Math.cos (theta) + Layout.center[0] ,
            -Layout.scale * rho * Math.sin (theta) + Layout.center[1] ]
    } else {
        return [
            10 * Layout.scale * lon/360 + Layout.center[0],
            5 * Layout.scale * lat/180 + Layout.center[1]]

    }
}

exports.fromCelestialHour = function (ra, dec) {
    return this.fromCelestialLonLat(ra * 360/24 , dec )
}

exports.getColor = function (body) {
    let colors = {
        'Sun' : "#ff6", 
        'Moon' : "#555",
        'Mercury' : "#841",
        'Venus' : "#f90", 
        'Mars' : "#0f0", 
        'Jupiter' : "#482",
        'Saturn' : "#0ff", 
        'Uranus' : "#f0f",
        'Neptune' : "#00f",
        'Pluto': "#bbb",
    }
    return colors[body]
}
