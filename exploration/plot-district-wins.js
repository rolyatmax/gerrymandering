import Sketch from 'sketch-js'
import * as d3 from 'd3'
import sortBy from 'lodash/sortBy'
import yo from 'yo-yo'
import { abbreviateNum } from './helpers'

const tieColor = [150, 66, 189]

export default function plotDistricts (settings) {
  const sketch = Sketch.create({
    container: settings.container,
    autostart: false,
    autoclear: false
  })

  const tooltipContainer = yo`<div class="tooltip"></div>`
  settings.container.appendChild(tooltipContainer)

  sketch.canvas.style.opacity = settings.districtWinsOpacity / 100

  let lastSelectedDistrict = null

  return { render, canvas: sketch.canvas }

  function render (districts, districtTotals) {
    sketch.start()
    sketch.draw = () => render(districts, districtTotals)

    sketch.clear()

    const selectedDistrict = getSelectedDistrict(districts)

    districts.forEach(d => {
      const polygons = d.geometry.type === 'Polygon' ? [d.geometry.coordinates] : d.geometry.coordinates

      const partyCounts = districtTotals[d.properties['NAMELSAD'] || d.properties['NAME']]
      if (!partyCounts) { // This is due to some issue with district boundaries not appearing entirely
        console.warn('district missing from districtTotals')
        return
      }
      const color = getColor(partyCounts)
      const alpha = selectedDistrict === d ? 1 : 0.5

      for (let poly of polygons) {
        const points = poly[0].map(settings.projection)
        fillShape(sketch, points, `rgba(${color.join(', ')}, ${alpha})`)
      }
    })

    if (lastSelectedDistrict !== selectedDistrict) {
      tooltipContainer.innerHTML = ''
      if (selectedDistrict) {
        const tooltipContent = generateTooltip(selectedDistrict, districtTotals)
        tooltipContainer.appendChild(tooltipContent)
      }
    }
    lastSelectedDistrict = selectedDistrict
  }

  function generateTooltip (selectedDistrict, districtTotals) {
    const properties = selectedDistrict.properties
    const districtName = properties['NAMELSAD'] || properties['NAME']
    const partyTotals = districtTotals[districtName]

    return yo`
      <ul>
        <li>${districtName}</li>
        ${Object.keys(partyTotals).map(party => {
          const color = settings.colors[party]
          return yo`
            <li style="color: rgb(${color.join(',')});">
              ${abbreviateNum(partyTotals[party])}
            </li>
          `
        })}
      </ul>
    `
  }

  function getSelectedDistrict (districts) {
    const mousePosition = settings.projection.invert([sketch.mouse.x, sketch.mouse.y])
    for (let district of districts) {
      const geometry = district.geometry
      const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates
      for (let poly of polygons) {
        if (d3.polygonContains(poly[0], mousePosition)) return district
      }
    }
    return null
  }

  function getColor (counts) {
    if (!Object.keys(counts).length) throw new Error('no parties passed to getWinner')

    const rankedParties = sortBy(Object.keys(counts), (party) => -counts[party])

    const margin = counts[rankedParties[0]] - counts[rankedParties[1]]

    if (margin < counts[rankedParties[2]] * 0.25) {
      return tieColor
    }

    return settings.colors[rankedParties[0]]
  }
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
