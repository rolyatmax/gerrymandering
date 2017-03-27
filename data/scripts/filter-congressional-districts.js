const geojson = require('../us-congressional-districts-2015-very-simplified.json')

const NORTH_CAROLINA_STATEFP = '37'
const WISCONSIN_STATEFP = '55'
const ALABAMA_STATEFP = '01'
const ARIZONA_STATEFP = '04'
const FLORIDA_STATEFP = '12'
const TEXAS_STATEFP = '48'
const IOWA_STATEFP = '19'
const NEW_JERSEY_STATEFP = '34'
const NEW_YORK_STATEFP = '36'
const WASHINGTON_STATEFP = '53'

geojson.features = geojson.features
  .filter(feat => feat.properties['STATEFP'] === NEW_YORK_STATEFP)
  .map(feat => {
    // feat.properties['STATEFP'] = feat.properties['STATEFP10']
    // delete feat.properties['STATEFP10']
    // feat.properties['NAMELSAD'] = feat.properties['NAMELSAD10']
    // delete feat.properties['NAMELSAD10']
    return feat
  })

process.stdout.write(JSON.stringify(geojson))
