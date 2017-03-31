import React from 'react'
import ZoomMap from './ZoomMap'
import * as d3 from 'd3'
import chroma from 'chroma-js'
import quadInOut from 'eases/quad-in-out'
import './Map.css'

export default function Map ({ tracts, districts, showDistricts, demographic, focus, zoomLevel }) {
  function drawMap (ctx, projection) {
    const path = d3.geoPath(projection).context(ctx)
    tracts.features.forEach((feat) => {
      ctx.beginPath()
      ctx.fillStyle = getColor(feat.properties, demographic)
      ctx.strokeStyle = `rgb(60, 60, 60)`
      ctx.lineWidth = 0.1
      path(feat)
      if (demographic) {
        ctx.fill()
      } else {
        ctx.stroke()
      }
    })

    if (!showDistricts) return

    let svg = ctx.canvas.parentElement.querySelector('svg')
    const svgPath = d3.geoPath(projection)
    if (!svg) {
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      ctx.canvas.parentElement.appendChild(svg)
      svg.style.position = 'absolute'
      svg.style.top = 0
    }
    svg.innerHTML = ''
    svg.style['pointer-events'] = 'none'
    svg.style.width = ctx.canvas.width + 'px'
    svg.style.height = ctx.canvas.height + 'px'
    svg.setAttribute('width', ctx.canvas.width)
    svg.setAttribute('height', ctx.canvas.height)
    districts.features.forEach(feat => {
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      p.setAttribute('d', svgPath(feat))
      p.setAttribute('stroke', 'white')
      p.setAttribute('stroke-width', 1)
      p.setAttribute('fill', 'transparent')
      svg.appendChild(p)
    })
  }

  return (
    <ZoomMap
      draw={drawMap}
      geoJSON={tracts}
      focus={focus}
      zoomLevel={zoomLevel}
      transitionEasing={quadInOut}
      transitionDuration={800} />
  )
}

Map.propTypes = {
  demographic: React.PropTypes.string.isRequired,
  tracts: React.PropTypes.object.isRequired,
  districts: React.PropTypes.object.isRequired,
  focus: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,
  zoomLevel: React.PropTypes.number.isRequired
}

const colorMap = chroma.scale([[108, 131, 181], [115, 174, 128]]).mode('lab')
function getColor (properties, demographic) {
  const values = getValuesForDimension(properties, demographic)
  const total = Object.keys(values).reduce((tot, dim) => parseInt(values[dim], 10) + tot, 0)
  const whiteCount = parseInt(properties['race:white'], 10)
  const nonWhiteCount = total - whiteCount
  const hispanicCount = parseInt(properties['ethnicity:hispanic'], 10)

  let color = [180, 180, 180]
  if (total) {
    const leftHandSideDegree = demographic === 'race' ? nonWhiteCount / total : demographic === 'ethnicity' ? hispanicCount / total : 0
    color = colorMap(leftHandSideDegree).rgb()
  }

  const area = properties.CENSUSAREA
  const opacity = Math.max(0, Math.min(1, Math.pow(total / (area * 800), 0.3)))
  color.push(opacity)
  return `rgba(${color.join(',')})`
}

function getValuesForDimension (counts, dimension) {
  const values = {}
  for (let dim in counts) {
    const [dimName, val] = dim.split(':')
    if (dimName === dimension) {
      values[val] = counts[dim]
    }
  }
  return values
}
