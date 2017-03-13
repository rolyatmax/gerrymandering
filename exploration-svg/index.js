/* global fetch  */

import React from 'react'
import ReactDOM from 'react-dom'
import * as d3 from 'd3'
import App from './components/app'

window.d3 = d3

const stateDataPaths = {
  precincts: 'nc-precincts.json',
  districts: [
    { name: 'US Congress 2010', filename: 'nc-congressional-districts-2010-simplified.json' },
    { name: 'US Congress 2013', filename: 'nc-congressional-districts-2013-simplified.json' },
    { name: 'US Congress 2015', filename: 'nc-congressional-districts-2015-simplified.json' }
  ],
  totals: [
    { name: 'US Congress 2010', filename: 'district-totals/nc-congressional-districts-2010-totals.csv' },
    { name: 'US Congress 2013', filename: 'district-totals/nc-congressional-districts-2013-totals.csv' },
    { name: 'US Congress 2015', filename: 'district-totals/nc-congressional-districts-2015-totals.csv' }
  ]
}

const precinctRequest = fetch(`data/${stateDataPaths.precincts}`).then(res => res.json())
const districtsRequests = createRequests(stateDataPaths.districts, (res) => res.json())
const totalsRequests = createRequests(stateDataPaths.totals, (res) => res.text().then(text => d3.csvParse(text)))

function createRequests (resources, parse = (val) => val) {
  return resources
    .map((d, i) => fetch(`data/${d.filename}`)
      .then(parse)
      .then(data => ({
        data: data,
        name: resources[i].name
      }))
    )
}

Promise.all([precinctRequest, ...districtsRequests, ...totalsRequests]).then(start)

function start ([precincts, ...rest]) {
  const districts = rest.splice(0, districtsRequests.length)
  const totals = rest.splice(0, totalsRequests.length)
  if (rest.length) throw new Error('WHOA - WAIT - THIS ISNT WORKING LIKE YOU THINK IT SHOULD')

  ReactDOM.render(
    <App districts={districts} totals={totals} precincts={precincts} />,
    document.querySelector('.container')
  )
}
