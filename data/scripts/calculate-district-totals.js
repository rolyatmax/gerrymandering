const linebyline = require('linebyline')
const d3 = require('d3')

if (process.argv[2] === '--help') help()

function help () {
  console.log('usage: node calculate-district-totals.js [POINTS FILE] [DISTRICTS FILE] [POINTS RESOLUTION] [SAMPLE SIZE]')
  console.log('    - POINTS FILE should be a csv')
  console.log('    - SAMPLE SIZE is an integer that indicates that every Nth row should be counted (default is 1)')
  console.log('    - DISTRICTS FILE should be a json list of geojson features - i know, none of this makes sense, sorry')
  console.log('    - POINTS RESOLUTION is an integer representing the count-per-point resolution (default is 1)')
  console.log('outputs csv-formatted list of districts with aggregate counts for each value in the POINTS FILE')
  process.exit()
}

const DISTRICT_NAME_KEY = 'NAMELSAD'

let pointsFile = process.argv[2]
let districtsFile = process.argv[3]
const pointResolution = parseInt(process.argv[4], 10) || 1
const sampleSize = parseInt(process.argv[5], 10) || 1

if (!pointsFile || !districtsFile || !pointResolution) help()
if (pointsFile[0] !== '.') pointsFile = `./${pointsFile}`

// prob don't do this?
if (districtsFile[0] !== '.') districtsFile = `./${districtsFile}`
const districts = require(districtsFile)

const districtTotals = {}

let pastFirstLine = false
let lineCount = 0

const rl = linebyline(pointsFile)
rl.on('line', processLine).on('close', () => writeData(districtTotals))

function processLine (line) {
  if (!pastFirstLine) {
    pastFirstLine = true
    return
  }

  lineCount += 1
  if (lineCount % sampleSize !== 0) return

  // if (lineCount % 100 === 0) console.log(lineCount)
  const [lon, lat, value] = line.split(',') // please let there be no commas in the data 😳
  for (let district of districts) {
    if (isPointInDistrict(district, [lon, lat])) {
      const districtName = district.properties[DISTRICT_NAME_KEY]
      districtTotals[districtName] = districtTotals[districtName] || {}
      districtTotals[districtName][value] = districtTotals[districtName][value] || 0
      districtTotals[districtName][value] += 1
      break
    }
  }
}

function writeData (districtTotals) {
  Object.keys(districtTotals).forEach((key) => {
    const district = districtTotals[key]
    for (let value in district) {
      district[value] *= pointResolution
      district[value] /= 1 / sampleSize
      district[value] = (district[value] | 0) || 0
    }
  })
  const districtObjs = Object.keys(districtTotals).map(districtName => ({
    name: districtName,
    counts: districtTotals[districtName]
  }))

  const uniqueValues = getUniqueValues(districtObjs, d => Object.keys(d.counts))
  process.stdout.write(`districtName,${uniqueValues.join(',')}\n`)
  districtObjs.forEach(d => {
    process.stdout.write(`"${d.name}",${uniqueValues.map(v => d.counts[v] || 0).join(',')}\n`)
  })
  process.exit()
}

function isPointInDistrict (district, point) {
  if (district.geometry.type === 'Polygon') {
    return d3.polygonContains(district.geometry.coordinates[0], point)
  }
  for (let poly of district.geometry.coordinates) {
    if (d3.polygonContains(poly[0], point)) {
      return true
    }
  }
  return false
}

function getUniqueValues (collection, fn) {
  const uniques = new Set()
  collection.forEach(item => {
    let values = fn(item)
    values = Array.isArray(values) ? values : [values]
    values.forEach(v => uniques.add(v))
  })
  return Array.from(uniques)
}
