import React from 'react'
import ZoomMap from './ZoomMap'
import * as d3 from 'd3'
import chroma from 'chroma-js'
import quadInOut from 'eases/quad-in-out'
import './Map.css'

export default class Map extends React.PureComponent {
  drawMap (projection, [width, height]) {
    const { tracts, demographic } = this.props
    this.ctx.canvas.height = height
    this.ctx.canvas.width = width
    const path = d3.geoPath(projection).context(this.ctx)
    tracts.features.forEach((feat) => {
      this.ctx.beginPath()
      this.ctx.fillStyle = getColor(feat.properties, demographic)
      this.ctx.strokeStyle = `rgb(60, 60, 60)`
      this.ctx.lineWidth = 0.1
      path(feat)
      if (demographic) {
        this.ctx.fill()
      } else {
        this.ctx.stroke()
      }
    })
  }

  render () {
    const { tracts, focus, zoomLevel, districts } = this.props

    return (
      <ZoomMap
        draw={this.drawMap.bind(this)}
        geoJSON={tracts}
        focus={focus}
        zoomLevel={zoomLevel}
        transitionEasing={quadInOut}
        transitionDuration={800}>
        {({ projection, dimensions }) => {
          const svgStyle = {
            width: `${dimensions.width}px`,
            height: `${dimensions.height}px`
          }
          const svgPath = d3.geoPath(projection)
          return (
            <div>
              <canvas ref={(el) => { this.ctx = el && el.getContext('2d') }} />
              <svg width={dimensions.width} height={dimensions.height} style={svgStyle}>
                {districts.features.map(feat => {
                  return <path d={svgPath(feat)} className='district' key={feat.properties.NAMELSAD} />
                })}
              </svg>
            </div>
          )
        }}
      </ZoomMap>
    )
  }
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
