import * as d3 from 'd3'
import extent from 'geojson-extent'
import lerp from 'lerp'

export default function generatePoints (settings, precincts) {
  const start = performance.now()
  const points = []

  for (let i = 0; i < precincts.length; i++) {
    const precinct = precincts[i]
    const polygon = getLargestPolygon(precinct.geometry)
    const [longA, latA, longB, latB] = extent(precinct)
    const { partyRegistration } = precinct.properties
    for (let party in partyRegistration) {
      let count = partyRegistration[party] / settings.countPerDot
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
            location: randPoint,
            party: party
          })
          ptsInPolygon += 1
        }
        // protect against infinite loops
        if (count * 20 < attempts) {
          console.log('uh oh - we might have an infinite loop', precinct.properties.name)
          break
        }
        attempts += 1
      }
    }
  }

  console.log('generatePoints performance:', performance.now() - start)

  return points

  // because polygonContains is so expensive, let's try to speed this up by
  // selecting only a few points within the polygon, and then distribute dots
  // in a radius around them????????????????
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
