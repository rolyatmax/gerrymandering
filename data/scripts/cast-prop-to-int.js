const argv = require('minimist')(process.argv.slice(2))
const get = require('lodash/get')
const set = require('lodash/set')

function help () {
  console.log('usage: node cast-prop-to-int.js JSON_FILE --props=PROPS [--path-to-list=PATH_TO_LIST] [--dry]')
  console.log('    - JSON_FILE is a json file')
  console.log('    - PATH_TO_LIST is an optional path to a list to map over in the JSON object (this is useful for iterating over geojson features, for example)')
  console.log(`    - PROPS is a list of comma-separated properties to use for generating the dots (may use dot notation for nested properties, e.g. 'prop.subprop'`)
  console.log('outputs csv-formatted list of points with longitude, latitude, and property')
  process.exit()
}

if (argv.help || !argv._.length || !argv.props) {
  help()
}

const jsonFilePath = argv._[0]
const props = argv.props.split(',')
const pathToList = argv['path-to-list']

const json = require(jsonFilePath)
const list = pathToList ? get(json, pathToList) : [json]
for (let item of list) {
  for (let propPath of props) {
    const val = get(item, propPath)
    if (argv.dry && val === undefined) console.log(`Warning: property ${propPath} is undefined`)
    set(item, propPath, parseInt(val, 10))
  }
}

if (!argv.dry) process.stdout.write(JSON.stringify(json))
