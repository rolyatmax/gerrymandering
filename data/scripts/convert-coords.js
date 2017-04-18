const argv = require('minimist')(process.argv.slice(2))
const proj4 = require('proj4')

function help () {
  console.log('usage: node convert-coords.js GEOJSON_FILE')
  console.log('    - GEOJSON_FILE is geojson feature collection')
  console.log('outputs geojson with geometry converted to lat/long coords')
  process.exit()
}

if (argv.help || !argv._.length) {
  help()
}

const geojsonFilePath = argv._[0]

const geojson = require(geojsonFilePath)

geojson.features.forEach((feature) => {
  const projection = '+proj=lcc +x_0=1000000 +y_0=1000000 +lon_0=-100 +lat_1=34.91666666666666 +lat_2=27.41666666666667 +lat_0=31.16666666666667 +datum=NAD83'
  const p = proj4(projection)
  const coords = feature.geometry.coordinates.map(points => {
    // console.log(points)
    return points.map(pt => p.inverse(pt))
  })
  feature.geometry.coordinates = coords
})

process.stdout.write(JSON.stringify(geojson))
