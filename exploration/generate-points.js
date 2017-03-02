import * as d3 from 'd3'
import extent from 'geojson-extent'
import lerp from 'lerp'

export default function generatePoints (settings, precincts) {
  const points = precincts.reduce((points, precinct) => {
    return points.concat(generatePrecinctPoints(precinct))
  }, [])

  return points

  function generatePrecinctPoints (precinct) {
    const { partyRegistration } = precinct.properties
    let pts = []
    for (let party in partyRegistration) {
      const count = Math.ceil(partyRegistration[party] / settings.countDivisor)
      pts = pts.concat(generateRandomPointsInPolygon(precinct, count).map(location => {
        return { location, party }
      }))
    }
    return pts
  }

  function generateRandomPointsInPolygon (geoObject, count) {
    const polygon = getLargestPolygon(geoObject.geometry)
    const [longA, latA, longB, latB] = extent(geoObject)
    let i = 0
    const points = []
    while (points.length < count) {
      const randPoint = [
        lerp(longA, longB, Math.random()),
        lerp(latA, latB, Math.random())
      ]
      if (d3.polygonContains(polygon, randPoint)) {
        points.push(randPoint)
      }
      // protect against infinite loops
      if (count * 30 < i) {
        console.log('uh oh - we might have an infinite loop', geoObject.properties.name)
        break
      }
      i += 1
    }
    return points
  }
}

function getLargestPolygon (geometry) {
  if (geometry.type === 'Polygon') return geometry.coordinates[0]
  return geometry.coordinates.reduce((max, poly) => {
    if (!max) return poly[0]
    var cur = d3.polygonArea(max)
    var next = d3.polygonArea(poly[0])
    return next > cur ? poly[0] : max
  }, null)
}
