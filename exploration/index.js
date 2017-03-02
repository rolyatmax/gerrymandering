/* global fetch  */

import {GUI} from 'dat-gui'
import * as d3 from 'd3'
import generatePoints from './generate-points'
import plotVoterRegistration from './plot-voter-registration'
import plotDistricts from './plot-congressional-districts'
import calculateRatios from './calculate-district-ratios'

window.d3 = d3

const STATE = 'nc'

const states = {
  fl: {
    precincts: 'fl-precincts.json',
    districts: 'fl-congressional-districts-2015-simplified.json'
  },
  nc: {
    precincts: 'nc-precincts.json',
    districts: 'nc-congressional-districts-2015-simplified.json'
  },
  al: {
    precincts: 'al-precincts.json',
    districts: 'al-congressional-districts-2015-simplified.json'
  }
}

const filenames = states[STATE]

Promise.all([
  fetch(`data/${filenames.precincts}`).then(res => res.json()),
  fetch(`data/${filenames.districts}`).then(res => res.json())
]).then(start)

function start ([precincts, districts]) {
  const scale = 8000
  const translate = [723, 691]
  const settings = {
    countDivisor: 100,
    alpha: 30,
    democrat: true,
    libertarian: true,
    republican: true,
    unaffiliated: true,
    container: document.querySelector('.container'),
    scale: scale,
    projection: getProjection(scale, translate),
    translateX: translate[0],
    translateY: translate[1]
  }
  window.settings = settings
  window.districts = districts

  const points = generatePoints(settings, precincts)
  const drawVoterReg = plotVoterRegistration(settings, points)
  const drawDistricts = plotDistricts(settings, districts, points)
  const renderDistrictRatios = calculateRatios(settings, districts, points)
  const drawFns = [drawVoterReg, drawDistricts, renderDistrictRatios]

  draw()
  function draw () {
    drawFns.forEach(fn => fn())
  }

  function getProjection (scale, translate) {
    return d3.geoConicConformal()
      .rotate([79, -33 - 45 / 60])
      .fitExtent([[100, 200], [window.innerWidth - 100, window.innerHeight - 100]], {
        type: 'FeatureCollection',
        features: precincts
      })
      // .scale(scale)
      // .translate(translate)
  }

  function onChange () {
    const translate = [settings.translateX, settings.translateY]
    settings.projection = getProjection(settings.scale, translate)
    draw()
  }

  const gui = new GUI()
  gui.add(settings, 'alpha', 0, 100).onFinishChange(onChange)
  gui.add(settings, 'scale', 8000, 30000).onFinishChange(onChange)
  gui.add(settings, 'translateX', -1000, 2000).onFinishChange(onChange)
  gui.add(settings, 'translateY', -1000, 2000).onFinishChange(onChange)
  gui.add(settings, 'democrat').onFinishChange(onChange)
  gui.add(settings, 'republican').onFinishChange(onChange)
  gui.add(settings, 'libertarian').onFinishChange(onChange)
  gui.add(settings, 'unaffiliated').onFinishChange(onChange)
  gui.add({ redraw () { draw() } }, 'redraw')

  const affiliationTotals = precincts.reduce((totals, precinct) => {
    const registration = precinct.properties.partyRegistration
    Object.keys(registration).forEach(party => {
      totals[party] = totals[party] || 0
      totals[party] += registration[party]
    })
    return totals
  }, {})

  console.log(affiliationTotals)
}
