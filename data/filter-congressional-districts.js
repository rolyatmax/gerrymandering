var geojson = require('./us-congressional-districts-2015-simplified.json')

var features = geojson.features

var NORTH_CAROLINA_STATEFP = '37'
var WISCONSIN_STATEFP = '55'
var ALABAMA_STATEFP = '01'
var FLORIDA_STATEFP = '12'

var districts = features.filter(feat => feat.properties['STATEFP'] === FLORIDA_STATEFP)

process.stdout.write(JSON.stringify(districts))
