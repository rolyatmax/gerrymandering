import * as d3 from 'd3'

const cache = new Map()

export default function calculateRatios (settings, districts, points) {
  cache.set(points, cache.get(points) || new Map())
  const cachedTotals = cache.get(points).get(districts)

  const start = performance.now()
  const districtTotals = cachedTotals || calculateDistrictTotals(settings, points, districts)
  cache.get(points).set(districts, districtTotals)
  console.log('calculate district totals performance:', performance.now() - start)

  return districtTotals
}

function calculateDistrictTotals (settings, points, districts) {
  const districtTotals = {}
  const sampleSize = 100 / settings.calculationSampleRate
  for (let j = 0; j < points.length; j += sampleSize) {
    const p = points[j | 0]
    for (let i = 0; i < districts.length; i++) {
      const district = districts[i]
      if (isPointInDistrict(district, p.location)) {
        const districtName = district.properties['NAMELSAD'] || district.properties['NAME']
        districtTotals[districtName] = districtTotals[districtName] || {}
        districtTotals[districtName][p.party] = districtTotals[districtName][p.party] || 0
        districtTotals[districtName][p.party] += 1
        break
      }
    }
  }

  Object.values(districtTotals).forEach((district) => {
    for (let party in district) {
      district[party] *= settings.countPerDot
      district[party] /= settings.calculationSampleRate / 100
      district[party] = (district[party] | 0) || 0
    }
  })
  return districtTotals
}

function isPointInDistrict (district, point) {
  if (district.geometry.type === 'Polygon') {
    return d3.polygonContains(district.geometry.coordinates[0], point)
  }
  for (let poly of district.geometry.coordinates) {
    if (d3.polygonContains(poly[0], point)) {
      return true
    }
  }
  console.warn('ACK!', district.properties.NAME)
  return false
}
