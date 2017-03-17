// turn a list of features into a properly-formatted geojson feature collection

const input = process.argv[2]
const features = require(input)

const geojson = `{"type":"FeatureCollection","features":${JSON.stringify(features)}}`

process.stdout.write(geojson)
