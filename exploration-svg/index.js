/* global fetch  */

import {GUI} from 'dat-gui'
import * as d3 from 'd3'
import renderDistricts from './render-districts'

window.d3 = d3

const mapContainer = document.createElement('div')
document.querySelector('.container').appendChild(mapContainer)

const stateDataPaths = {
  precincts: 'nc-precincts.json',
  districts: [
    { name: 'US Congress 2010', filename: 'nc-congressional-districts-2010-simplified.json' },
    { name: 'US Congress 2013', filename: 'nc-congressional-districts-2013-simplified.json' },
    { name: 'US Congress 2015', filename: 'nc-congressional-districts-2015-simplified.json' }
  ],
  totals: [
    // { name: 'US Congress 2010', filename: 'district-totals/nc-congressional-districts-2015-simplified.json' },
    { name: 'US Congress 2013', filename: 'district-totals/nc-congressional-districts-2013-totals.csv' },
    { name: 'US Congress 2015', filename: 'district-totals/nc-congressional-districts-2015-totals.csv' }
  ]
}

const precinctRequest = fetch(`data/${stateDataPaths.precincts}`).then(res => res.json())
const districtsRequests = createRequests(stateDataPaths.districts, (res) => res.json())
const totalsRequests = createRequests(stateDataPaths.totals, (res) => res.text())

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

  const projection = d3.geoConicConformal()
    .rotate([79, -33 - 45 / 60])
    .fitExtent([[100, 100], [window.innerWidth - 100, window.innerHeight - 100]], {
      type: 'FeatureCollection',
      features: precincts
    })

  const settings = {
    district: 0,
    container: mapContainer,
    projection: projection,
    colors: {
      democrat: [61, 94, 156],
      republican: [195, 35, 44],
      libertarian: [80, 220, 80],
      unaffiliated: [200, 20, 200]
    }
  }

  window.settings = settings
  window.districts = districts

  render()

  function render () {
    renderDistricts(settings, districts, totals)
  }

  const districtMap = {}
  districts.forEach((d, i) => { districtMap[d.name] = i })

  const gui = new GUI()
  gui.add(settings, 'district', districtMap).onFinishChange(render)
}
