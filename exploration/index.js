/* global fetch  */

import {GUI} from 'dat-gui'
import Sketch from 'sketch-js'
import * as d3 from 'd3'
import plotVoterRegistration from './dots'

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
    countDivisor: 500,
    alpha: 40,
    democrat: true,
    libertarian: true,
    republican: true,
    unaffiliated: true,
    container: document.querySelector('.container'),
    projection: projection
  }

  const redraw = plotVoterRegistration(settings, precincts)

  const districtSketch = Sketch.create({
    container: settings.container,
    autostart: false,
    autoclear: false
  })

  districts.forEach(d => drawDistrict(districtSketch, d.geometry))

  function drawDistrict (ctx, geometry) {
    const coords = geometry.coordinates[0]
    const points = coords.map(projection)
    drawLine(ctx, points, 'rgba(50, 50, 50, 0.5)')
  }

  window.districts = districts

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

function drawLine (ctx, points, color) {
  const start = points[0]
  ctx.strokeStyle = color
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(start[0], start[1])
  points.slice(1).forEach(pt => ctx.lineTo(pt[0], pt[1]))
  ctx.stroke()

  ctx.save()
  const lastPt = points[points.length - 1]
  ctx.beginPath()
  ctx.setLineDash([15, 15])
  ctx.moveTo(lastPt[0], lastPt[1])
  ctx.lineTo(start[0], start[1])
  ctx.stroke()
  ctx.restore()
}
