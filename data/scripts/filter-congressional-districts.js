var geojson = require('../us-congressional-districts-2015-very-simplified.json')

var features = geojson.features

var NORTH_CAROLINA_STATEFP = '37'
var WISCONSIN_STATEFP = '55'
var ALABAMA_STATEFP = '01'
var ARIZONA_STATEFP = '04'
var FLORIDA_STATEFP = '12'
var TEXAS_STATEFP = '48'
var IOWA_STATEFP = '19'

var districts = features
  .filter(feat => feat.properties['STATEFP'] === FLORIDA_STATEFP)
  .map(feat => {
    // feat.properties['STATEFP'] = feat.properties['STATEFP10']
    // delete feat.properties['STATEFP10']
    // feat.properties['NAMELSAD'] = feat.properties['NAMELSAD10']
    // delete feat.properties['NAMELSAD10']
    return feat
  })

process.stdout.write(JSON.stringify(districts))
