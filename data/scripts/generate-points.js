const d3 = require('d3')
const extent = require('geojson-extent')
const lerp = require('lerp')

const validPropGroups = [
  'voterPartyAffiliation', 'genPopEthnicity', 'genPopPrimaryRace', 'voterGender',
  'voterAge', 'electionPresident2008', 'electionUSSenate2008', 'electionUSSenate2010',
  'electionGovernor2008', 'electionGovernor2010', 'normalVotes', 'electionUSHouse2008'
]

if (process.argv[2] === '--help') help()

function help () {
  console.log('usage: node generate-points.js [PRECINCTS FILE] [PROP GROUP] [RESOLUTION]')
  console.log('    - PRECINCTS FILE is geojson feature collection of precincts, duh')
  console.log('    - RESOLUTION is an integer which is how many people are represented by each dot (defaults to 1)')
  console.log(`    - PROP GROUP may be one of the following:\n        ${validPropGroups.join(',\n        ')}`)
  console.log('outputs csv-formatted list of points with longitude, latitude, and attribute from the selected PROP GROUP')
  process.exit()
}

const precinctsFilePath = process.argv[2]
const propGroup = process.argv[3]
if (!validPropGroups.includes(propGroup)) help()
const countPerDot = parseInt(process.argv[4], 10) || 1

const precincts = require(precinctsFilePath)

process.stdout.write(`longitude,latitude,${propGroup}\n`)
for (let precinct of precincts.features) {
  generatePoint(precinct).forEach(({ lat, lon, value }) => {
    process.stdout.write(`${lon},${lat},"${value}"\n`)
  })
}

function generatePoint (precinct) {
  const points = []
  if (!precinct.geometry) return points
  // should prob fix this to evenly distribute dots in all polygons
  // fewer than 10 precincts are multipolygons, though, I believe
  const polygon = getLargestPolygon(precinct.geometry)
  const [longA, latA, longB, latB] = extent(precinct)
  const props = precinct.properties[propGroup]
  for (let value in props) {
    let count = props[value] / countPerDot
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
          value: value
        })
        ptsInPolygon += 1
      }
      // protect against infinite loops
      if (count * 20 < attempts) {
        // console.log('uh oh - we might have an infinite loop', precinct.properties.precinctName)
        break
      }
      attempts += 1
    }
  }
  return points
}

function getLargestPolygon (geometry) {
  if (geometry.type === 'Polygon') return geometry.coordinates[0]
  const largest = geometry.coordinates.reduce((max, poly) => {
    if (!max) return poly[0]
    var cur = d3.polygonArea(max)
    var next = d3.polygonArea(poly[0])
    return next > cur ? poly[0] : max
  }, null)
  return largest
}
