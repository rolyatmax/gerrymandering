const argv = require('minimist')(process.argv.slice(2))
const get = require('lodash/get')

if (argv.help) {
  help()
}

function help () {
  console.log('usage: node sum-geojson-props.js GEOJSON_FILE --props=PROPS --prop-name=PROP_NAME [--dry]')
  console.log('    - GEOJSON_FILE should be a geojson feature collection')
  console.log('    - PROPS should be a comma-separated list of feature properties you want to sum')
  console.log('    - PROP_NAME should be the prop name for the summed values')
  console.log('    - DRY does a dry run giving helpful warning output')
  console.log('outputs geojson with summed properties')
  console.log('it is recommended you run this with --dry first')
  process.exit()
}

const geojsonPath = argv._[0]
const propsList = argv.props
const propName = argv['prop-name']
if (!geojsonPath || !propsList || !propName) help()

const propsToSum = propsList.split(',')

// edit this function
function sumProps (properties) {
  let sum = 0
  for (let prop of propsToSum) {
    const val = get(properties, prop)
    if (argv.dry && !Number.isFinite(val)) console.log(`warning: property ${prop} is ${val} of type ${typeof val} and should be a number, defaulting to 0`)
    sum += Number.isFinite(val) ? val : 0
  }
  return sum
}

const geojson = require(geojsonPath)

geojson.features.forEach((feat) => {
  const sum = sumProps(feat.properties)
  if (argv.dry && !Number.isFinite(sum)) console.log(`warning: resulting sum is not a number: ${sum}`)
  if (argv.dry && feat.properties[propName]) console.log(`warning: prop name ${propName} already exists`)
  feat.properties[propName] = sum
})

if (!argv.dry) process.stdout.write(JSON.stringify(geojson))
