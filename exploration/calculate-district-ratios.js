import * as d3 from 'd3'
import sortBy from 'lodash/sortBy'
import yo from 'yo-yo'

const cache = new Map()

export default function calculateRatios (settings) {
  return function render (districts, points, precincts) {
    cache.set(points, cache.get(points) || new Map())
    const cachedTotals = cache.get(points).get(districts)

    const start = performance.now()
    const districtTotals = cachedTotals || calculateDistrictTotals(settings, points, districts)
    cache.get(points).set(districts, districtTotals)
    console.log('calculate district totals performance:', performance.now() - start)

    const affiliationTotals = calculateAffiliationTotals(precincts)
    const sampledTotals = Object.values(districtTotals).reduce((memo, district) => {
      for (let party in district) {
        memo[party] = memo[party] || 0
        memo[party] += district[party]
      }
      return memo
    }, {})

    const districtsWon = {}
    const districtNames = sortBy(Object.keys(districtTotals), (name) => {
      return parseInt(name.split('Congressional District ')[1], 10)
    })
    const districtEls = districtNames.map(dName => {
      const counts = districtTotals[dName]
      const winner = counts.republican > counts.democrat ? 'republican' : 'democrat'
      districtsWon[winner] = districtsWon[winner] || 0
      districtsWon[winner] += 1
      const countEls = ['republican', 'democrat', 'libertarian', 'unaffiliated'].map(party => {
        let className = `count ${party}`
        let style
        if (party === winner) {
          className += ' winner'
          style = `color: rgb(${settings.colors[party].join(', ')});`
        }
        return yo`
          <span class="${className}" style="${style || ''}">${abbreviateNum(counts[party] || 0)}</span>
        `
      })

      return yo`
        <li>
          <span class="district-name">${dName}</span>
          ${countEls}
        </li>
      `
    })

    const existing = settings.container.querySelector('.district-ratios')
    if (existing) settings.container.removeChild(existing)
    settings.container.appendChild(yo`
      <div class="district-ratios">
        <ul>
          <li class="header">
            <span class="district-name">Districts</span>
            <span class="count">Rep</span>
            <span class="count">Dem</span>
            <span class="count">Lib</span>
            <span class="count">None</span>
          </li>
          ${districtEls}
          <li class="total">
            <span class="district-name">Sampled Totals</span>
            <span class="count">${abbreviateNum(sampledTotals.republican || 0)}</span>
            <span class="count">${abbreviateNum(sampledTotals.democrat || 0)}</span>
            <span class="count">${abbreviateNum(sampledTotals.libertarian || 0)}</span>
            <span class="count">${abbreviateNum(sampledTotals.unaffiliated || 0)}</span>
          </li>
          <li class="total">
            <span class="district-name">Actual Totals</span>
            <span class="count">${abbreviateNum(affiliationTotals.republican || 0)}</span>
            <span class="count">${abbreviateNum(affiliationTotals.democrat || 0)}</span>
            <span class="count">${abbreviateNum(affiliationTotals.libertarian || 0)}</span>
            <span class="count">${abbreviateNum(affiliationTotals.unaffiliated || 0)}</span>
          </li>
        </ul>
      </div>
    `)
  }
}

function calculateDistrictTotals (settings, points, districts) {
  const districtTotals = {}
  const sampleSize = 100 / settings.calculationSampleRate
  for (let j = 0; j < points.length; j += sampleSize) {
    const p = points[j | 0]
    for (let i = 0; i < districts.length; i++) {
      const district = districts[i]
      const polygon = district.geometry.coordinates[0]
      if (d3.polygonContains(polygon, p.location)) {
        const districtName = district.properties['NAMELSAD']
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

function calculateAffiliationTotals (precincts) {
  return precincts.reduce((totals, precinct) => {
    const registration = precinct.properties.partyRegistration
    Object.keys(registration).forEach(party => {
      totals[party] = totals[party] || 0
      totals[party] += registration[party]
    })
    return totals
  }, {})
}

function abbreviateNum (number) {
  const abbreviations = {
    1000000000: 'B',
    1000000: 'M',
    1000: 'K'
  }
  const limits = Object.keys(abbreviations).map(num => parseInt(num, 10)).sort((a, b) => b - a)
  for (let i = 0; i < limits.length; i++) {
    const limit = limits[i]
    if (number >= limit) {
      const shortened = number / limit
      const decimalPlaces = (shortened | 0) < 100 ? 1 : 0
      return shortened.toFixed(decimalPlaces) + abbreviations[limit]
    }
  }
  return `${number}`
}
