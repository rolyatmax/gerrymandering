import Sketch from 'sketch-js'

export default function plotDistricts (settings) {
  const sketch = Sketch.create({
    container: settings.container,
    autostart: false,
    autoclear: false
  })

  sketch.canvas.style.opacity = settings.districtWinsOpacity / 100

  return { render, canvas: sketch.canvas }

  function render (districts, districtTotals) {
    sketch.clear()
    districts.forEach(d => {
      const polygons = d.geometry.type === 'Polygon' ? [d.geometry.coordinates] : d.geometry.coordinates

      const partyCounts = districtTotals[d.properties['NAMELSAD'] || d.properties['NAME']]
      if (!partyCounts) { // This is due to some issue with district boundaries not appearing entirely
        console.warn('district missing from districtTotals')
        return
      }
      const winner = getWinner(partyCounts)
      const color = settings.colors[winner]
      for (let poly of polygons) {
        const points = poly[0].map(settings.projection)
        fillShape(sketch, points, `rgb(${color.join(', ')})`)
      }
    })
  }
}

function getWinner (parties) {
  if (!Object.keys(parties).length) throw new Error('no parties passed to getWinner')
  let winner = null
  for (let party in parties) {
    if (!winner || parties[party] > winner.count) {
      winner = { party, count: parties[party] }
    }
  }
  return winner.party
}

function fillShape (ctx, points, color) {
  const start = points[0]
  ctx.lineWidth = 1
  ctx.fillStyle = color
  ctx.strokeStyle = 'rgba(20, 20, 20, 0.8)'
  ctx.beginPath()
  ctx.moveTo(start[0], start[1])
  points.slice(1).forEach(pt => ctx.lineTo(pt[0], pt[1]))
  ctx.fill()
  ctx.stroke()
}
