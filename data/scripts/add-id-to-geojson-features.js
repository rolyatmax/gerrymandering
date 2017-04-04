const argv = require('minimist')(process.argv.slice(2))

if (argv.help) {
  help()
}

function help () {
  console.log('usage: node add-id-to-geojson-features.js GEOJSON FILE [--dry]')
  console.log('    - GEOJSON FILE should be a geojson file you want')
  console.log('    - DRY does a dry run giving helpful warning output')
  console.log('outputs geojson with renamed properties')
  console.log('it is recommended you run this with --dry first')
  process.exit()
}

const geojsonPath = argv._[0]
if (!geojsonPath) help()

// edit this function
function getID (props) {
  // guessing the state abbreviatino based on the geojson filename
  const pathBits = geojsonPath.split('/')
  const stateAbbreviation = pathBits[pathBits.length - 1].slice(0, 2).toUpperCase()
  if (argv.dry) console.log('Using state abbreviation:', stateAbbreviation)
  const districtNum = props.NAMELSAD.replace('Congressional District ', '')
  return `${stateAbbreviation}-${districtNum}`
}

const geojson = require(geojsonPath)

geojson.features.forEach((feat) => {
  const id = getID(feat.properties)
  feat.properties.id = id
  if (argv.dry) console.log('id:', id)
})

if (!argv.dry) process.stdout.write(JSON.stringify(geojson))
