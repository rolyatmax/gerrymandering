const argv = require('minimist')(process.argv.slice(2))
const fromPairs = require('lodash/fromPairs')

if (argv.help) {
  help()
}

function help () {
  console.log('usage: node rename-geojson-props.js GEOJSON FILE -c CONFIG [--strip] [--dry]')
  console.log('    - GEOJSON FILE should be a geojson file you want')
  console.log('    - CONFIG is a space-separated list of key=value pairs - you can pass in as many as you want, each requires "-c"')
  console.log('    - STRIP removes all other properties not included in the config')
  console.log('    - DRY does a dry run giving helpful warning output')
  console.log('outputs geojson with renamed properties')
  console.log('it is recommended you run this with --dry first')
  process.exit()
}

const geojsonPath = argv._[0]
if (!geojsonPath) help()

const config = Array.isArray(argv.c) ? argv.c : [argv.c]
let propMapping = config.map(str => str.split('='))

if (argv.dry) {
  console.warn('Renaming the following properties:')
  propMapping.forEach(([oldProp, newProp]) => console.log(`    ${oldProp} -> ${newProp}`))
}

propMapping = fromPairs(propMapping)

const geojson = require(geojsonPath)

geojson.features.forEach((feat) => {
  const newProperties = argv.strip ? {} : feat.properties
  Object.keys(propMapping).forEach((oldProp) => {
    const newProp = propMapping[oldProp]

    if (!feat.properties[oldProp] && argv.dry) {
      console.warn(`skipping property: ${oldProp} not found in feature properties`)
    }

    if (newProperties[newProp] && argv.dry) {
      console.warn(`writing over property: ${newProp} found in feature properties`)
    }

    newProperties[newProp] = feat.properties[oldProp]
    delete feat.properties[oldProp]
  })
  feat.properties = newProperties
})

if (!argv.dry) process.stdout.write(JSON.stringify(geojson))
