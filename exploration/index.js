/* global fetch */

import {GUI} from 'dat-gui'
import Sketch from 'sketch-js'
import * as d3 from 'd3'
import extent from 'geojson-extent'
import lerp from 'lerp'

const container = document.querySelector('.container')

window.d3 = d3

const colors = {
  democrat: [0, 0, 250],
  republican: [250, 0, 0],
  libertarian: [0, 250, 0],
  unaffiliated: [241, 244, 66]
}

fetch('data/nc-precincts.json').then(res => res.json()).then(start)

function start (precincts) {
  const settings = {
    countDivisor: 100,
    alpha: 22,
    democrat: true,
    libertarian: true,
    republican: true,
    unaffiliated: true
  }

  const gui = new GUI()
  gui.add(settings, 'countDivisor', 1, 1000).onFinishChange(reset)
  gui.add(settings, 'alpha', 0, 100).onFinishChange(reset)
  gui.add(settings, 'democrat').onFinishChange(reset)
  gui.add(settings, 'republican').onFinishChange(reset)
  gui.add(settings, 'libertarian').onFinishChange(reset)
  gui.add(settings, 'unaffiliated').onFinishChange(reset)
  gui.add({ reset }, 'reset')

  function reset () {
    sketch.reset()
    sketch.start()
  }

  const affiliationTotals = precincts.reduce((totals, precinct) => {
    const registration = precinct.properties.partyRegistration
    Object.keys(registration).forEach(party => {
      totals[party] = totals[party] || 0
      totals[party] += registration[party]
    })
    return totals
  }, {})

  console.log(affiliationTotals)

  const sketch = Sketch.create({
    container: container,
    setup () {
      this.reset()
    },

    resize () {
      this.reset()
    },

    reset () {
      const { height, width } = this.canvas
      this.center = [width / 2 | 0, height / 2 | 0]
      const geojson = {
        type: 'FeatureCollection',
        features: precincts
      }
      this.projection = d3.geoConicConformal()
        .rotate([79, -33 - 45 / 60])
        .fitExtent([[50, 50], [width, height]], geojson)
      this.curLine = []
      this.boundaries = []
    },

    draw () {
      precincts.forEach(this.drawPrecinct.bind(this))

      this.boundaries.forEach((line, i) => {
        const color = [250, 250, 100]
        fillShape(this, line, `rgba(${color.join(', ')}, 0.2)`)
      })
      if (this.dragging && this.curLine.length) {
        drawLine(this, this.curLine, '#333')
      }
      this.stop() // stop the animation for now
    },

    drawPrecinct (precinct) {
      const { partyRegistration } = precinct.properties
      // drawCircle(this, position, 1, 'rgba(20,20,20,0.1)')
      for (let party in partyRegistration) {
        if (!settings[party]) continue
        const count = Math.ceil(partyRegistration[party] / settings.countDivisor)
        const color = `rgba(${colors[party].join(', ')}, ${settings.alpha / 100})`
        generateRandomPointsInPolygon(this, precinct, count).forEach(pt => {
          const position = this.projection(pt)
          drawCircle(this, position, 1, color)
        })
      }
    },

    mousedown () {
      this.curLine = []
    },

    mouseup () {
      if (this.curLine.length > 1) {
        const line = this.curLine.concat([this.curLine[0]])
        this.boundaries.push(line)
      }
      this.curLine = []
    },

    mousemove () {
      if (!this.dragging) return
      const lastPt = this.curLine[this.curLine.length - 1]
      if (lastPt && this.mouse.x === lastPt[0] && this.mouse.y === lastPt[1]) return
      this.curLine.push([this.mouse.x, this.mouse.y])
    }
  })
  window.sketch = sketch
}

function drawCircle (ctx, position, radius, color) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(position[0], position[1], radius, 0, Math.PI * 2)
  ctx.fill()
}

function fillShape (ctx, points, color) {
  const start = points[0]
  ctx.fillStyle = color
  ctx.lineWidth = 0
  ctx.beginPath()
  ctx.moveTo(start[0], start[1])
  points.slice(1).forEach(pt => ctx.lineTo(pt[0], pt[1]))
  ctx.fill()
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
      console.log('uh oh - we might have an infinite loop', geoObject)
      const position = ctx.projection(geoObject.properties.centroid)
      drawCircle(ctx, position, 35, '#222')
      // debugger
      break
    }
    i += 1
  }
  return points
}

function getLargestPolygon (coords) {
  return coords.reduce((max, poly) => {
    if (!max) return poly
    var cur = d3.polygonArea(max[0])
    var next = d3.polygonArea(poly[0])
    return next > cur ? poly : max
  }, null)
}
