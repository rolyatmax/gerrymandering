var { polygonCentroid, polygonArea } = require('d3-polygon')
var geojson = require('./nc_final.json')

var features = geojson.features

// NC - registered voters from 2010
var partyAffiliation = {
  democrat: 'REG10G_D',
  republican: 'REG10G_R',
  libertarian: 'REG10G_L',
  unaffiliated: 'REG10G_U'
}

// AL - 2008 presidential votes
// var partyAffiliation = {
//   democrat: 'USP_D_08',
//   republican: 'USP_R_08'
// }

// FL - 2008 presidential votes
// var partyAffiliation = {
//   democrat: 'PRES_DEM_0',
//   republican: 'PRES_REP_0'
// }

// WI - 2008 presidential votes
// var partyAffiliation = {
//   democrat: 'PRESDEM08',
//   republican: 'PRESREP08',
//   libertarian: 'PRESLBR08'
// }

var precincts = features.map(feat => {
  var poly = getLargestPolygon(feat.geometry)
  var centroid = polygonCentroid(poly)
  if (!Number.isFinite(centroid[0]) || !Number.isFinite(centroid[1])) throw new Error('Centroid calculation error')
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
    if (!Number.isFinite(cur) || !Number.isFinite(next)) throw new Error('Polygon Area error')
    return next > cur ? poly[0] : max
  }, null)
}
