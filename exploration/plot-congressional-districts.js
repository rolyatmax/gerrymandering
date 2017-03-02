import Sketch from 'sketch-js'

export default function plotDistricts (settings, districts, points) {
  const sketch = Sketch.create({
    container: settings.container,
    autostart: false,
    autoclear: false
  })

  return draw

  function draw () {
    sketch.clear()
    districts.forEach(d => drawDistrict(sketch, d.geometry))
  }

  function drawDistrict (ctx, geometry) {
    const coords = geometry.coordinates[0]
    const points = coords.map(settings.projection)
    drawLine(ctx, points, 'rgba(50, 50, 50, 0.5)')
  }
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
