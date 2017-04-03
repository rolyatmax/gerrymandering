import React from 'react'
import ZoomMap from './ZoomMap'
import * as d3 from 'd3'
import chroma from 'chroma-js'
import quadInOut from 'eases/quad-in-out'
import classnames from 'classnames'
import './Map.css'

export default class MapContainer extends React.PureComponent {
  render () {
    const { tracts, focus, zoomLevel } = this.props
    return (
      <ZoomMap
        geoJSON={tracts}
        focus={focus}
        zoomLevel={zoomLevel}
        transitionEasing={quadInOut}
        transitionDuration={800}
        {...this.props}>
        {Map}
      </ZoomMap>
    )
  }
}

MapContainer.propTypes = {
  demographic: React.PropTypes.string.isRequired,
  tracts: React.PropTypes.object.isRequired,
  districts: React.PropTypes.object.isRequired,
  focus: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,
  zoomLevel: React.PropTypes.number.isRequired,
  showDistricts: React.PropTypes.bool.isRequired,
  highlightedDistricts: React.PropTypes.arrayOf(React.PropTypes.string).isRequired
}

class Map extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      hoveredDistrict: null
    }
  }

  setHoveredDistrict (districtID) {
    this.setState({
      hoveredDistrict: districtID
    })
  }

  componentDidMount () {
    this.drawMap()
  }

  componentDidUpdate (prevProps) {
    if (this.props.projection && this.props.projection !== prevProps.projection) {
      this.drawMap()
    }
  }

  drawMap () {
    const canvas = this.ctx.canvas
    const { tracts, demographic, projection, dimensions } = this.props
    const [width, height] = dimensions
    canvas.height = height
    canvas.width = width
    const path = d3.geoPath(projection).context(this.ctx)
    tracts.features.forEach((feat) => {
      this.ctx.beginPath()
      this.ctx.fillStyle = getColor(feat.properties, demographic)
      path(feat)
      this.ctx.fill()
    })
  }

  render () {
    const { projection, dimensions, districts, showDistricts, highlightedDistricts } = this.props
    const [width, height] = dimensions

    let orderedFeatures = districts.features.slice()
    highlightedDistricts.forEach(id => {
      orderedFeatures = findByIDAndMoveToEnd(orderedFeatures, id)
    })

    if (this.state.hoveredDistrict) {
      orderedFeatures = findByIDAndMoveToEnd(orderedFeatures, this.state.hoveredDistrict)
    }

    const svgStyle = {
      width: `${width}px`,
      height: `${height}px`
    }
    const svgPath = d3.geoPath(projection)
    return (
      <div>
        <canvas ref={(el) => { this.ctx = el && el.getContext('2d') }} />
        <svg width={width} height={height} style={svgStyle}>
          {orderedFeatures.map(feat => {
            const isHighlighted = highlightedDistricts.includes(feat.properties.id)
            const className = classnames('district', {
              hidden: !showDistricts,
              faded: highlightedDistricts.length && !isHighlighted,
              highlighted: isHighlighted,
              hovered: this.state.hoveredDistrict === feat.properties.id
            })
            return (
              <path
                d={svgPath(feat)}
                className={className}
                key={feat.properties.id} // turn all these into IDs
                onMouseEnter={() => this.setHoveredDistrict(feat.properties.id)}
                onMouseLeave={() => this.setHoveredDistrict(null)} />
            )
          })}
        </svg>
      </div>
    )
  }
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

function findByIDAndMoveToEnd (list, id) {
  list = list.slice()
  const idx = list.findIndex(feat => feat.properties.id === id)
  const toMove = list.splice(idx, 1)[0]
  list.push(toMove)
  return list
}
