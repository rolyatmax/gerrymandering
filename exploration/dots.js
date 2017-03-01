/* global requestAnimationFrame */

import Sketch from 'sketch-js'
import * as d3 from 'd3'
import extent from 'geojson-extent'
import lerp from 'lerp'

const colors = {
  democrat: [0, 0, 250],
  republican: [250, 0, 0],
  libertarian: [0, 250, 0],
  unaffiliated: [241, 244, 66]
}

export default function plotVoterRegistration (settings, precincts) {
  const dotSketch = window.dotSketch = Sketch.create({
    container: settings.container,
    autostart: false,
    autoclear: false
  })

  redraw()

  return redraw

  function redraw () {
    dotSketch.clear()
    requestAnimationFrame(draw)
  }

  function draw () {
    console.log('drawing')
    precincts.forEach(drawPrecinct)
  }

  function drawPrecinct (precinct) {
    const { partyRegistration } = precinct.properties
    // drawCircle(dotSketch, position, 1, 'rgba(20,20,20,0.1)')
    let points = []
    for (let party in partyRegistration) {
      if (!settings[party]) continue
      const count = Math.ceil(partyRegistration[party] / settings.countDivisor)
      const color = `rgba(${colors[party].join(', ')}, ${settings.alpha / 100})`
      points = points.concat(generateRandomPointsInPolygon(dotSketch, precinct, count).map(pt => {
        const position = settings.projection(pt)
        return { position, color }
      }))
    }
    // draw all at the same time so one party doesn't completely cover another
    d3.shuffle(points).forEach(({ position, color }) => drawCircle(dotSketch, position, 1, color))
  }

  function generateRandomPointsInPolygon (ctx, geoObject, count) {
    const polygon = getLargestPolygon(geoObject.geometry.coordinates)
    const [longA, latA, longB, latB] = extent(geoObject)
    let i = 0
    const points = []
    while (points.length < count) {
      const randPoint = [
        lerp(longA, longB, Math.random()),
        lerp(latA, latB, Math.random())
      ]
      if (d3.polygonContains(polygon, randPoint)) {
        points.push(randPoint)
      }
      // protect against infinite loops
      if (count * 100 < i) {
        // console.log('uh oh - we might have an infinite loop', geoObject)
        const position = settings.projection(geoObject.properties.centroid)
        drawCircle(ctx, position, 35, '#222')
        break
      }
      i += 1
    }
    return points
  }
}

function drawCircle (ctx, position, radius, color) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(position[0], position[1], radius, 0, Math.PI * 2)
  ctx.fill()
}

function getLargestPolygon (coords) {
  return coords.reduce((max, poly) => {
    if (!max) return poly
    var cur = d3.polygonArea(max[0])
    var next = d3.polygonArea(poly[0])
    return next > cur ? poly : max
  }, null)
}
