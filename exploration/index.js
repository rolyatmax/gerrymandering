/* global fetch  */

import {GUI} from 'dat-gui'
import * as d3 from 'd3'
import plotVoterRegistration from './plot-voter-registration'
import plotDistricts from './plot-congressional-districts'

window.d3 = d3

Promise.all([
  fetch('data/nc-precincts.json').then(res => res.json()),
  fetch('data/nc-congressional-districts-2016.json').then(res => res.json())
]).then(start)

function start ([precincts, districts]) {
  const geojson = {
    type: 'FeatureCollection',
    features: precincts
  }
  const width = window.innerWidth
  const height = window.innerHeight
  const padding = 50
  const projection = d3.geoConicConformal()
    .rotate([79, -33 - 45 / 60])
    .fitExtent([[padding, padding], [width - padding, height - padding]], geojson)

  const settings = {
    countDivisor: 4,
    alpha: 3,
    democrat: true,
    libertarian: true,
    republican: true,
    unaffiliated: true,
    container: document.querySelector('.container'),
    projection: projection
  }

  const redrawVoterReg = plotVoterRegistration(settings, precincts)
  const redrawDistricts = plotDistricts(settings, districts)
  const redrawFns = [redrawVoterReg, redrawDistricts]

  function redraw () {
    redrawFns.forEach(fn => fn())
  }

  const gui = new GUI()
  gui.add(settings, 'countDivisor', 1, 1000).onFinishChange(redraw)
  gui.add(settings, 'alpha', 0, 100).onFinishChange(redraw)
  gui.add(settings, 'democrat').onFinishChange(redraw)
  gui.add(settings, 'republican').onFinishChange(redraw)
  gui.add(settings, 'libertarian').onFinishChange(redraw)
  gui.add(settings, 'unaffiliated').onFinishChange(redraw)
  gui.add({ redraw }, 'redraw')

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
