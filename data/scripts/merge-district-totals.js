const promisify = require('promisify-node')
const fs = promisify('fs')
const keyBy = require('lodash/keyBy')
const parse = require('csv-parse/lib/sync')

if (process.argv[2] === '--help') help()

function help () {
  console.log('usage: node merge-district-totals.js [TOTALS FILES...]')
  console.log('    - TOTALS FILES should be a space-separated list of csv files to merge')
  console.log('outputs merged csv-formatted list of districts with aggregate counts for each metrics type')
  process.exit()
}

const totalsFiles = process.argv.slice(2)

if (!totalsFiles.length) help()

const promises = totalsFiles.map(filename => fs.readFile(filename, 'utf8').then(f => parse(f)))
Promise.all(promises).then((files) => {
  files = files.map(f => csvToObj(f, 'district-name'))
  const totals = files.reduce((final, totalsByDistrict) => {
    for (let district in totalsByDistrict) {
      final[district] = final[district] || {}
      for (let dim in totalsByDistrict[district]) {
        final[district][dim] = totalsByDistrict[district][dim]
      }
    }
    return final
  }, {})

  // get rid of district-name key
  for (let district in totals) {
    delete totals[district]['district-name']
  }

  writeData(totals)
}).catch((err) => console.error(err))

function writeData (districtTotals) {
  const districtObjs = Object.keys(districtTotals).map(districtName => ({
    name: districtName,
    counts: districtTotals[districtName]
  }))
  const uniqueValues = getUniqueValues(districtObjs, d => Object.keys(d.counts))
  process.stdout.write(`district-name,${uniqueValues.join(',')}\n`)
  districtObjs.forEach(d => {
    process.stdout.write(`"${d.name}",${uniqueValues.map(v => d.counts[v] || 0).join(',')}\n`)
  })
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

function csvToObj (rows, keyName) {
  const headers = rows[0]
  const keyIndex = headers.indexOf(keyName)
  if (keyIndex < 0) throw new Error(`key name ${keyName} not found in csv header`)
  const collection = rows.slice(1).map(row => {
    const obj = {}
    row.forEach((val, i) => {
      const header = headers[i]
      obj[header] = val
    })
    return obj
  })
  return keyBy(collection, keyName)
}
