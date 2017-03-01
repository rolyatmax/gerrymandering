try {
  var geojson = require('./us-congressional-districts-2016.json')
} catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.warn('You might need to unzip "us-congressional-districts-2016.json.zip" first.')
    process.exit()
  }
  throw new Error(e)
}

var features = geojson.features

var NORTH_CAROLINA_STATEFP = '37'

var districts = features.filter(feat => feat.properties['STATEFP'] === NORTH_CAROLINA_STATEFP)

process.stdout.write(JSON.stringify(districts))
