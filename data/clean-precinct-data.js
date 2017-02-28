var { polygonCentroid, polygonArea } = require('d3-polygon')
var geojson = require('./nc_final.json')

var features = geojson.features

var partyAffiliation = {
  democrat: 'REG10G_D',
  republican: 'REG10G_R',
  libertarian: 'REG10G_L',
  unaffiliated: 'REG10G_U'
}

var precincts = features.map(feat => {
  var poly = getLargestPolygon(feat.geometry.coordinates)
  var centroid = polygonCentroid(poly)
  var partyRegistration = {}
  Object.keys(partyAffiliation).forEach(party => {
    var prop = partyAffiliation[party]
    partyRegistration[party] = feat.properties[prop]
  })
  var name = feat.properties['NAME10']
  var properties = { partyRegistration, centroid, name }
  feat.properties = properties
  return feat
})

process.stdout.write(JSON.stringify(precincts))

function getLargestPolygon (coords) {
  return coords.reduce((max, poly) => {
    if (!max) return poly
    var cur = polygonArea(max[0])
    var next = polygonArea(poly[0])
    return next > cur ? poly : max
  }, null)
}
