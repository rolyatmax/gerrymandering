const argv = require('minimist')(process.argv.slice(2))
const fs = require('fs')
const Parallel = require('paralleljs')

function help () {
  console.log('usage: node calculate-totals-for-features.js GEOJSON_FILE POINTS_FILE [--resolution=POINTS_RESOLUTION] [--sample-size=SAMPLE_SIZE]')
  console.log('    - GEOJSON_FILE should be a geojson feature collection where each feature has an `id` property in its properties')
  console.log('    - POINTS_FILE should be a csv')
  console.log('    - SAMPLE_SIZE is an integer that indicates that every Nth row should be counted (optional, default is 1)')
  console.log('    - POINTS_RESOLUTION is an integer representing the count-per-point resolution (optional, default is 1)')
  console.log('outputs geojson with aggregate counts for each value in the POINTS_FILE added to the feature properties')
  process.exit()
}

const BATCH_COUNT = 8

if (argv.help) help()

let geojsonFile = argv._[0]
let pointsFile = argv._[1]
const pointResolution = parseInt(argv['resolution'], 10) || 1
const sampleSize = parseInt(argv['sample-size'], 10) || 1

if (!pointsFile || !geojsonFile || !pointResolution) help()
if (pointsFile[0] !== '.') pointsFile = `./${pointsFile}`

// prob don't do this?
if (geojsonFile[0] !== '.') geojsonFile = `./${geojsonFile}`
const geojson = require(geojsonFile)

fs.readFile(pointsFile, 'utf8', (err, pointsCSV) => {
  if (err) throw err
  main(pointsCSV)
})

function main (pointsCSV) {
  const rows = pointsCSV.slice(1).split('\n')

  const sampled = []

  for (let i = 0; i < rows.length; i += sampleSize) {
    sampled.push(rows[i])
  }

  const promises = divideIntoBatches(sampled, BATCH_COUNT).map(processBatch)

  Promise.all(promises).then(combineBatchesAndWrite).catch(err => { throw new Error(err) })
}

function divideIntoBatches (list, batchCount) {
  list = list.slice()
  const itemsPerBatch = list.length / batchCount
  const batches = []
  while (list.length) {
    batches.push(list.splice(0, itemsPerBatch))
  }
  return batches
}

function processBatch (batch) {
  const p = new Parallel([geojson.features, batch, argv])
  return p.spawn(([features, lines, argv]) => {
    const d3 = require('d3')
    const extent = require('geojson-extent')
    const totals = {}

    // calculate extents up front to use when determining if a point is in a feature
    const extents = {}
    for (let feature of features) {
      const featureID = feature.properties.id
      extents[featureID] = extent(feature)
    }

    for (let line of lines) {
      processLine(line)
    }

    function processLine (line) {
      if (!line) return
      let [lon, lat, value] = line.split(',') // please let there be no commas in the data 😳
      if (!value && argv.dry) console.log(`something's wrong: value is undefined for line:`, line, typeof line, line.length)
      value = value.replace(/"/g, '') // strip out any quotation marks
      for (let feature of features) {
        const featureID = feature.properties.id
        const featureExtent = extents[featureID]
        if (isPointInFeature(feature, featureExtent, [lon, lat])) {
          totals[featureID] = totals[featureID] || {}
          totals[featureID][value] = totals[featureID][value] || 0
          totals[featureID][value] += 1
          break
        }
      }
    }

    function isPointInFeature (feature, featureExtent, point) {
      const [longA, latA, longB, latB] = featureExtent
      if (point[0] < longA || point[0] > longB || point[1] < latA || point[1] > latB) {
        return false
      }
      if (feature.geometry.type === 'Polygon') {
        return d3.polygonContains(feature.geometry.coordinates[0], point)
      }
      for (let poly of feature.geometry.coordinates) {
        if (d3.polygonContains(poly[0], point)) {
          return true
        }
      }
      return false
    }

    return totals
  })
}

function combineBatchesAndWrite (batches) {
  // combine the aggregates from each batch
  const totals = batches.reduce((totals, featureTotals) => {
    for (let featureID in featureTotals) {
      totals[featureID] = totals[featureID] || {}
      for (let dimension in featureTotals[featureID]) {
        totals[featureID][dimension] = totals[featureID][dimension] || 0
        totals[featureID][dimension] += featureTotals[featureID][dimension]
      }
    }
    return totals
  }, {})

  // scale up by point resolution * sample size
  Object.keys(totals).forEach((key) => {
    const feature = totals[key]
    for (let value in feature) {
      feature[value] *= pointResolution
      feature[value] *= sampleSize
      feature[value] = (feature[value] | 0) || 0
    }
  })

  geojson.features.forEach(feat => {
    const newProperties = totals[feat.properties.id]
    Object.assign(feat.properties, newProperties)
  })

  if (!argv.dry) process.stdout.write(JSON.stringify(geojson))
}
