const argv = require('minimist')(process.argv.slice(2))
const d3 = require('d3')
const extent = require('geojson-extent')
const get = require('lodash/get')
const lerp = require('lerp')

function help () {
  console.log('usage: node generate-points.js GEOJSON_FILE --props=PROPS --resolution=RESOLUTION [--max-dot-generation-attempts=ATTEMPTS] [--dry]')
  console.log('    - GEOJSON_FILE is geojson feature collection')
  console.log('    - RESOLUTION is an integer which is how many people are represented by each dot (defaults to 1)')
  console.log(`    - PROPS is a list of comma-separated properties to use for generating the dots (may use dot notation for nested properties, e.g. 'prop.subprop'`)
  console.log('outputs csv-formatted list of points with longitude, latitude, and property')
  process.exit()
}

if (argv.help || !argv._.length || !argv.props || !argv.resolution) {
  help()
}

const geojsonFilePath = argv._[0]
const props = argv.props.split(',')
const resolution = parseInt(argv.resolution, 10) || 1
const maxDotGenerationAttempts = parseInt(argv['max-dot-generation-attempts'], 10) || 20

const geojson = require(geojsonFilePath)

if (!argv.dry) process.stdout.write(`longitude,latitude,property\n`)
for (let feature of geojson.features) {
  generatePoint(feature).forEach(({ lat, lon, property }) => {
    if (!argv.dry) process.stdout.write(`${lon},${lat},${property}\n`)
  })
}

function generatePoint (feature) {
  const points = []
  if (!feature.geometry) return points
  // should prob fix this to evenly distribute dots in all polygons
  // fewer than 10 geojson are multipolygons, though, I believe
  const polygon = getLargestPolygon(feature.geometry)
  const [longA, latA, longB, latB] = extent(feature)
  for (let propPath of props) {
    let count = get(feature.properties, propPath)
    if (!Number.isFinite(count) && argv.dry) console.log(`Warning: property ${propPath} should be a number, but instead it is of type ${typeof count} (${count})`)
    count /= resolution
    // slice off the end and randomly add one more in proportion to the sliced off decimal
    const decimal = count % 1
    count = parseInt(count, 10)
    count += Math.random() < decimal ? 1 : 0

    let ptsInPolygon = 0
    let attempts = 0
    while (ptsInPolygon < count) {
      const randPoint = [
        lerp(longA, longB, Math.random()),
        lerp(latA, latB, Math.random())
      ]
      if (d3.polygonContains(polygon, randPoint)) {
        points.push({
          lon: randPoint[0],
          lat: randPoint[1],
          property: propPath
        })
        ptsInPolygon += 1
      }
      // protect against infinite loops
      if (count * maxDotGenerationAttempts < attempts) {
        if (argv.dry) console.log(`Warning: cannot generate point within polygon after ${attempts} attempts`, feature.properties)
        break
      }
      attempts += 1
    }
  }
  return points
}

function getLargestPolygon (geometry) {
  if (geometry.type === 'Polygon') return geometry.coordinates[0]
  if (argv.dry) console.log('Warning, using only largest polygon for feature')
  const largest = geometry.coordinates.reduce((max, poly) => {
    if (!max) return poly[0]
    var cur = d3.polygonArea(max)
    var next = d3.polygonArea(poly[0])
    return next > cur ? poly[0] : max
  }, null)
  return largest
}
