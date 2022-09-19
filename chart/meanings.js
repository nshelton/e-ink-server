exports.getHouseInfo = function(i) {
    var houses =  {
        1 : "self",
        2 : "posessions",
        3 : "sharing",
        4 : "family",
        5 : "pleasure",
        6 : "health",
        7 : "parthership",
        8 : "death",
        9 : "philosophy",
        10 : "status",
        11 : "friendship",
        12 : "unconscious",
    }
    return houses[i]
}

exports.getHouseInfo2 = function(i) {
    var houses =  {
        1 : "self",
        2 : "posessions",
        3 : "communication",
        4 : "home",
        5 : "pleasure",
        6 : "health",
        7 : "relationships",
        8 : "death",
        9 : "philosophy",
        10 : "ambition",
        11 : "friendship",
        12 : "unconscious",
    }
    return houses[i]
}

exports.getPlanetInfo = function(name) {
    var planetMeaning = {
        'Sun' : "self",
        'Moon' : "emotion",
        'Mercury' : "reason",
        'Venus' : "pleasure",
        'Mars' : "action",
        'Jupiter' : "success",
        'Saturn' : "structure",
        'Uranus' : "rebellion",
        'Neptune' : "imagination",
        'Pluto' : "rebirth"
    }
    return planetMeaning[name]
}

exports.getZodiacInfo = function(i) {
    var zodiac =  {
        1 : "bravery",
        2 : "drive",
        3 : "intelligence",
        4 : "healing",
        5 : "power",
        6 : "modesty",
        7 : "harmony",
        8 : "passion",
        9 : "ambition",
        10 : "discipline",
        11 : "creative",
        12 : "imagination"
    }
    return zodiac[i]
}

