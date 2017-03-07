/* global fetch  */

import {GUI} from 'dat-gui'
import * as d3 from 'd3'
import generatePoints from './generate-points'
import plotVoterRegistration from './plot-voter-registration'
import plotDistricts from './plot-congressional-districts'
import calculateDistrictWins from './calculate-district-wins'
import renderDistrictWinsTable from './render-district-wins-table'
import plotDistrictWins from './plot-district-wins'

window.d3 = d3

const STATE = 'nc'

const states = {
  fl: {
    precincts: 'fl-precincts.json',
    districts: [
      { name: 'US Congress 2015', filename: 'fl-congressional-districts-2015-simplified.json' }
    ]
  },
  'nc': {
    precincts: 'nc-precincts.json',
    districts: [
      { name: 'US Congress 2013', filename: 'nc-congressional-districts-2013-simplified.json' },
      { name: 'US Congress 2015', filename: 'nc-congressional-districts-2015-simplified.json' },
      { name: 'NC State House 2010', filename: 'nc-state-house-districts-2010-simplified.json' },
      { name: 'NC State House 2015', filename: 'nc-state-house-districts-2015-simplified.json' }
    ]
  },
  al: {
    precincts: 'al-precincts.json',
    districts: [
      { name: 'US Congress 2015', filename: 'al-congressional-districts-2015-simplified.json' }
    ]
  }
}

const stateSettings = states[STATE]
const precinctRequest = fetch(`data/${stateSettings.precincts}`).then(res => res.json())
const districtsRequests = stateSettings.districts
  .map((d, i) => fetch(`data/${d.filename}`)
    .then(res => res.json())
    .then(districtData => ({
      data: districtData,
      name: stateSettings.districts[i].name
    }))
  )

Promise.all([precinctRequest, ...districtsRequests]).then(start)

function start ([precincts, ...districts]) {
  const scale = 8000
  const translate = [723, 691]
  const settings = {
    countPerDot: 15, // 15
    calculationSampleRate: 15, // 15
    alpha: 10, // 8
    district: 0,
    democrat: true,
    libertarian: true,
    republican: true,
    unaffiliated: true,
    districtWinsOpacity: 10,
    container: document.querySelector('.container'),
    scale: scale,
    projection: getProjection(scale, translate),
    translateX: translate[0],
    translateY: translate[1],
    colors: {
      democrat: [0, 0, 250],
      republican: [250, 0, 0],
      libertarian: [0, 250, 0],
      unaffiliated: [200, 0, 200]
    }
  }

  let points = generatePoints(settings, precincts)
  const voterReg = plotVoterRegistration(settings)
  const voterDistricts = plotDistricts(settings)
  let districtTotals = calculateDistrictWins(settings, districts[settings.district].data, points)
  const districtWinsTable = renderDistrictWinsTable(settings)
  const districtWins = plotDistrictWins(settings)

  window.settings = settings
  window.districts = districts
  window.points = points

  voterReg.render(points)
  voterDistricts.render(districts[settings.district].data)
  districtWins.render(districts[settings.district].data, districtTotals)
  districtWinsTable.render(districts[settings.district].name, districtTotals, precincts)

  function getProjection (scale, translate) {
    return d3.geoConicConformal()
      .rotate([79, -33 - 45 / 60])
      .fitExtent([[100, 100], [window.innerWidth - 100, window.innerHeight - 100]], {
        type: 'FeatureCollection',
        features: precincts
      })
      // .scale(scale)
      // .translate(translate)
  }

  // function updatePerspective () {
  //   const translate = [settings.translateX, settings.translateY]
  //   settings.projection = getProjection(settings.scale, translate)
  // }

  function onChangeVoterPlot () {
    voterReg.render(points)
  }

  function onChangeDistricts () {
    districtTotals = calculateDistrictWins(settings, districts[settings.district].data, points, precincts)
    voterDistricts.render(districts[settings.district].data)
    districtWins.render(districts[settings.district].data, districtTotals)
    districtWinsTable.render(districts[settings.district].name, districtTotals, precincts)
  }

  function onChangeDistrictWinsOpacity () {
    districtWins.canvas.style.opacity = settings.districtWinsOpacity / 100
  }

  const districtMap = {}
  districts.forEach((d, i) => { districtMap[d.name] = i })

  const gui = new GUI()
  gui.add(settings, 'alpha', 0, 100).onFinishChange(onChangeVoterPlot)
  // gui.add(settings, 'calculationSampleRate', 0, 100).step(1).onFinishChange(onChangeDistricts)
  // gui.add(settings, 'scale', 8000, 30000).onFinishChange(onChange)
  // gui.add(settings, 'translateX', -1000, 2000).onFinishChange(onChange)
  // gui.add(settings, 'translateY', -1000, 2000).onFinishChange(onChange)
  gui.add(settings, 'democrat').onFinishChange(onChangeVoterPlot)
  gui.add(settings, 'republican').onFinishChange(onChangeVoterPlot)
  gui.add(settings, 'libertarian').onFinishChange(onChangeVoterPlot)
  gui.add(settings, 'unaffiliated').onFinishChange(onChangeVoterPlot)
  gui.add(settings, 'districtWinsOpacity', 0, 100).onFinishChange(onChangeDistrictWinsOpacity)
  gui.add(settings, 'district', districtMap).onFinishChange(onChangeDistricts)
}
