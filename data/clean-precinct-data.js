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
  var poly = getLargestPolygon(feat.geometry)
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

function getLargestPolygon (geometry) {
  if (geometry.type === 'Polygon') return geometry.coordinates[0]
  return geometry.coordinates.reduce((max, poly) => {
    if (!max) return poly[0]
    var cur = polygonArea(max)
    var next = polygonArea(poly[0])
    return next > cur ? poly[0] : max
  }, null)
}
