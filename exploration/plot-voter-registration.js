/* global requestAnimationFrame */

import Sketch from 'sketch-js'
import * as d3 from 'd3'

export default function plotVoterRegistration (settings) {
  const sketch = window.sketch = Sketch.create({
    container: settings.container,
    autostart: false,
    autoclear: false
  })

  return { render, canvas: sketch.canvas }

  function render (points) {
    sketch.clear()
    requestAnimationFrame(() => {
      console.log('drawing')
      let visiblePoints = filterInvisiblePoints(points)
      // draw all at the same time so one party doesn't completely cover another
      visiblePoints = d3.shuffle(visiblePoints)

      visiblePoints.forEach(({ location, party }) => {
        if (!settings[party]) return
        const position = settings.projection(location)
        const color = `rgba(${settings.colors[party].join(', ')}, ${settings.alpha / 100})`
        drawCircle(sketch, position, 1, color)
      })
    })
  }

  function filterInvisiblePoints (pts) {
    return pts.filter(({ location }) => {
      const [x, y] = settings.projection(location)
      return x > 0 && y > 0 && x < sketch.width && y < sketch.height
    })
  }
}

function drawCircle (ctx, position, radius, color) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(position[0], position[1], radius, 0, Math.PI * 2)
  ctx.fill()
}
