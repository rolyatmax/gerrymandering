const argv = require('minimist')(process.argv.slice(2))
const keyBy = require('lodash/keyBy')
const zipObject = require('lodash/zipObject')

if (argv.help) {
  help()
}

function help () {
  console.log('usage: node merge-tracts-with-demo.js --tracts=[TRACTS GEOJSON] [DEMOGRAPHIC FILES...] [--dry]')
  console.log('    - TRACTS GEOJSON should be a geojson file of census tracts')
  console.log('    - DEMOGRAPHIC FILES should be a census data api json response')
  console.log('    - DRY does a dry run giving helpful warning output')
  console.log('outputs geojson of tracts with demographic data stored as properties')
  process.exit()
}

const demographicFiles = argv._.slice()
const tractsFile = argv.tracts

const tracts = require(tractsFile)

// transform the demographics list of rows into a list of objects to make them easier to work with
const demographics = demographicFiles.map(path => require(path)).map(demo => {
  // create keyby'd object for demographics
  const header = demo.splice(0, 1)[0]
  return demo.map(row => zipObject(header, row))
}).map(demoObjs => keyBy(demoObjs, getTractID))

tracts.features.forEach(({ properties }) => {
  demographics.forEach(demoByTracts => {
    const demoData = demoByTracts[getTractID(properties)]
    if (!demoData && argv.dry) {
      console.warn(`tract ${properties.TRACT}, county ${properties.COUNTY} not found in a demographics file`)
    }
    Object.keys(demoData).forEach(prop => {
      if (properties[prop.toUpperCase()] === undefined && properties[prop] === undefined) {
        properties[prop] = demoData[prop]
      }
    })
  })
})

if (!argv.dry) process.stdout.write(JSON.stringify(tracts))

function getTractID (properties) {
  const county = properties.county || properties.COUNTY
  const tract = properties.tract || properties.TRACT
  return `${county}|${tract}`
}
