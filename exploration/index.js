/* global fetch  */

import {GUI} from 'dat-gui'
import * as d3 from 'd3'
import generatePoints from './generate-points'
import plotVoterRegistration from './plot-voter-registration'
import plotDistricts from './plot-congressional-districts'

window.d3 = d3

Promise.all([
  fetch('data/nc-precincts.json').then(res => res.json()),
  fetch('data/nc-congressional-districts-2013-simplified.json').then(res => res.json())
]).then(start)

function start ([precincts, districts]) {
  const scale = 8000
  const translate = [723, 691]
  const settings = {
    countDivisor: 5,
    alpha: 4,
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
  const drawFns = [drawVoterReg, drawDistricts]

  draw()
  function draw () {
    drawFns.forEach(fn => fn())
  }

  function getProjection (scale, translate) {
    return d3.geoConicConformal()
      .rotate([79, -33 - 45 / 60])
      .fitSize([window.innerWidth, window.innerHeight], {
        type: 'FeatureCollection',
        features: precincts
      })
      .scale(scale)
      .translate(translate)
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
