import Sketch from 'sketch-js'

export default function plotDistricts (settings) {
  const sketch = Sketch.create({
    container: settings.container,
    autostart: false,
    autoclear: false
  })

  return { render, canvas: sketch.canvas }

  function render (districts) {
    sketch.clear()
    districts.forEach(d => drawDistrict(sketch, d.geometry))
  }

  function drawDistrict (ctx, geometry) {
    const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates
    for (let poly of polygons) {
      const points = poly[0].map(settings.projection)
      drawLine(ctx, points, 'rgba(50, 50, 50, 0.5)')
    }
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
}
