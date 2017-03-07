import sortBy from 'lodash/sortBy'
import yo from 'yo-yo'

export default function renderDistrictWinsTable (settings) {
  return { render }

  function render (mapName, districtTotals, precincts) {
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
      if (name.includes('Congressional District ')) {
        return parseInt(name.split('Congressional District ')[1], 10)
      }
      return name
    })
    districtNames.forEach(dName => {
      const counts = districtTotals[dName]
      const winner = getWinner(counts)
      districtsWon[winner] = districtsWon[winner] || 0
      districtsWon[winner] += 1
    })

    const existing = settings.container.querySelector('.district-ratios')
    if (existing) settings.container.removeChild(existing)
    settings.container.appendChild(yo`
      <div class="district-ratios">
        <h3>${mapName}</h3>
        <ul>
          <li class="header">
            <span class="district-name"></span>
            <span class="count">Rep</span>
            <span class="count">Dem</span>
            <span class="count">Lib</span>
            <span class="count">None</span>
          </li>
          <li>
            <span class="district-name">Districts Won</span>
            <span class="count">${districtsWon.republican || 0}</span>
            <span class="count">${districtsWon.democrat || 0}</span>
            <span class="count">${districtsWon.libertarian || 0}</span>
            <span class="count">${districtsWon.unaffiliated || 0}</span>
          </li>
        </ul>
        <ul class="highlight">
          <li style="color: red;">For Sampling Validation:</li>
          <li>
            <span class="district-name">Sampled Totals</span>
            <span class="count">${abbreviateNum(sampledTotals.republican || 0)}</span>
            <span class="count">${abbreviateNum(sampledTotals.democrat || 0)}</span>
            <span class="count">${abbreviateNum(sampledTotals.libertarian || 0)}</span>
            <span class="count">${abbreviateNum(sampledTotals.unaffiliated || 0)}</span>
          </li>
          <li>
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

function getWinner (parties) {
  if (!Object.keys(parties).length) throw new Error('no parties passed to getWinner')
  let winner = null
  for (let party in parties) {
    if (!winner || parties[party] > winner.count) {
      winner = { party, count: parties[party] }
    }
  }
  return winner.party
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
